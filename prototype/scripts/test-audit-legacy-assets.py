#!/usr/bin/env python3
"""Synthetic, offline regression tests for audit-legacy-assets.py.

No real repository media is used, downloaded, shared, or published.
"""
import hashlib
import importlib.util
import io
import json
import struct
import tempfile
import unittest
import zipfile
import zlib
from pathlib import Path

MODULE = Path(__file__).with_name("audit-legacy-assets.py")
spec = importlib.util.spec_from_file_location("legacy_assets_preflight", MODULE)
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


def png_chunk(name: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + name + data + struct.pack(">I", zlib.crc32(name + data) & 0xffffffff)


def png() -> bytes:
    return (b"\x89PNG\r\n\x1a\n" + png_chunk(b"IHDR", struct.pack(">IIBBBBB", 3, 2, 8, 2, 0, 0, 0))
            + png_chunk(b"tEXt", b"Author\0never disclose name")
            + png_chunk(b"IDAT", zlib.compress(b"\0" + b"\0" * 9)) + png_chunk(b"IEND", b""))


def jpeg() -> bytes:
    def seg(marker, value):
        return b"\xff" + bytes([marker]) + struct.pack(">H", len(value) + 2) + value
    return b"\xff\xd8" + seg(0xE1, b"Exif\0\0secret") + seg(0xC0, b"\x08\x00\x05\x00\x07\x01\x01\x11\x00") + seg(0xDA, b"\x01\x01\x00\x00\x3f\x00") + b"\x00\xff\xd9"


def ods() -> bytes:
    b = io.BytesIO()
    with zipfile.ZipFile(b, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("mimetype", "application/vnd.oasis.opendocument.spreadsheet")
        z.writestr("META-INF/manifest.xml", '<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0"/>')
        z.writestr("meta.xml", '<office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"><secret>hidden identity</secret></office:document-meta>')
        z.writestr("content.xml", '''<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><table:table table:name="Classroom"><table:table-cell table:formula="of:=SUM(A1:A3)"/><a xlink:href="https://example.org/resource"/></table:table><table:table table:name="Hidden" table:visibility="collapse"/><other>private@example.test</other></office:document-content>''')
    return b.getvalue()


class AuditLegacyAssetsTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.manifest = self.root / "manifest.json"

    def seed(self, filename, payload, status="hold", decision="preserve-full"):
        path = self.root / filename
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(payload)
        blob = hashlib.sha1(b"blob " + str(len(payload)).encode() + b"\0" + payload).hexdigest()
        data = {"entries": [{"path": filename, "bytes": len(payload), "gitBlobSha": blob,
                             "status": status, "ownerDecision": decision}]}
        self.manifest.write_text(json.dumps(data), encoding="utf-8")
        return path

    def test_png_metadata_signals_do_not_disclose_metadata(self):
        self.seed("revista/img/sample.png", png())
        items = audit.run(self.root, self.manifest, None)
        self.assertEqual(len(items), 1)
        self.assertTrue(items[0]["technical"]["hasTextChunks"])
        self.assertEqual((items[0]["technical"]["width"], items[0]["technical"]["height"]), (3, 2))
        self.assertNotIn("never disclose", json.dumps(items))
        self.assertFalse(items[0]["approvedForPublication"])

    def test_jpeg_exif_and_dimensions(self):
        self.seed("revista/img/sample.jpg", jpeg())
        items = audit.run(self.root, self.manifest, None)
        self.assertTrue(items[0]["technical"]["hasExif"])
        self.assertEqual((items[0]["technical"]["width"], items[0]["technical"]["height"]), (7, 5))
        self.assertNotIn("secret", json.dumps(items))

    def test_ods_hidden_sheet_formula_link_and_personal_pattern(self):
        self.seed("revista/data.ods", ods())
        items = audit.run(self.root, self.manifest, None)
        technical = items[0]["technical"]
        self.assertEqual(technical["sheetCount"], 2)
        self.assertEqual(technical["hiddenSheetCount"], 1)
        self.assertEqual(technical["formulaAttributes"], 1)
        self.assertEqual(technical["externalHrefCount"], 1)
        self.assertTrue(technical["containsEmailLikeText"])
        self.assertFalse(technical["encryptedContent"])
        self.assertNotIn("private@example", json.dumps(items))

    def test_reject_hash_changed(self):
        path = self.seed("revista/data.ods", ods())
        path.write_bytes(path.read_bytes() + b"changed")
        with self.assertRaises(audit.AuditError):
            audit.run(self.root, self.manifest, None)

    def test_reference_only_not_eligible_for_analysis(self):
        self.seed("revista/img/sample.png", png(), status="retire", decision="reference-only")
        with self.assertRaises(audit.AuditError):
            audit.run(self.root, self.manifest, None)

    def test_broken_zip_fails(self):
        self.seed("revista/data.ods", b"invalid")
        with self.assertRaises(audit.AuditError):
            audit.run(self.root, self.manifest, None)

    def test_png_truncated_fails(self):
        self.seed("revista/img/sample.png", png()[:-8])
        with self.assertRaises(audit.AuditError):
            audit.run(self.root, self.manifest, None)

    def test_ods_unsafe_member_fails(self):
        b = io.BytesIO()
        with zipfile.ZipFile(b, "w") as z:
            z.writestr("mimetype", "application/vnd.oasis.opendocument.spreadsheet")
            z.writestr("../relative.txt", "invalid")
            z.writestr("content.xml", "<doc/>")
            z.writestr("META-INF/manifest.xml", "<manifest/>")
        self.seed("revista/data.ods", b.getvalue())
        with self.assertRaises(audit.AuditError):
            audit.run(self.root, self.manifest, None)


if __name__ == "__main__":
    unittest.main()
