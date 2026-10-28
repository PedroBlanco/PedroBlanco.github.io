#!/usr/bin/env python3
"""Read-only, privacy-minimising preflight for legacy PNG/JPEG and ODS assets.

This tool provides technical signals only; no rights, privacy or publication approval.
It never prints metadata values, worksheet cells, file contents or image pixels.
Run from any working directory:
  python prototype/scripts/audit-legacy-assets.py --all
  python prototype/scripts/audit-legacy-assets.py --path revista/img/Italica_246.jpg
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import struct
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

MAX_INPUT_BYTES = 100 * 1024 * 1024
MAX_ZIP_MEMBERS = 1000
MAX_ZIP_UNPACKED_BYTES = 50 * 1024 * 1024
MAX_XML_BYTES = 8 * 1024 * 1024
MAX_IMAGE_DIMENSION = 100000
NS_TABLE = "urn:oasis:names:tc:opendocument:xmlns:table:1.0"
NS_XLINK = "http://www.w3.org/1999/xlink"
EMAIL = re.compile(rb"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}")
IBAN = re.compile(rb"\bES\d{22}\b", re.I)
DNI = re.compile(rb"\b\d{8}[A-Z]\b", re.I)
URL = re.compile(rb"(?:https?://|file:/|ftp://)", re.I)
SUPPORTED = {".jpg", ".jpeg", ".png", ".ods"}


class AuditError(Exception):
    """Invalid, unsafe or unexpected source file."""


def blob_digest(path: Path) -> str:
    size = path.stat().st_size
    digest = hashlib.sha1(b"blob " + str(size).encode() + b"\0")
    with path.open("rb") as reader:
        for chunk in iter(lambda: reader.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def audit_png(path: Path) -> dict:
    indicators = {"hasExifChunk": False, "hasTextChunks": False, "hasIccProfile": False,
                  "animated": False, "trailingBytesAfterIend": False, "unknownChunks": 0}
    with path.open("rb") as f:
        if f.read(8) != b"\x89PNG\r\n\x1a\n":
            raise AuditError("Invalid PNG signature")
        width = height = None
        seen_end = False
        count = 0
        while True:
            header = f.read(8)
            if len(header) != 8:
                raise AuditError("Missing PNG IEND or truncated header")
            length, marker = struct.unpack(">I4s", header)
            count += 1
            if count > 100000 or length > MAX_INPUT_BYTES:
                raise AuditError("Unreasonable PNG chunk")
            if marker == b"IHDR":
                if width is not None or length != 13:
                    raise AuditError("Invalid PNG IHDR")
                part = f.read(13)
                if len(part) != 13:
                    raise AuditError("Truncated PNG IHDR")
                width, height = struct.unpack(">II", part[:8])
                if not (0 < width <= MAX_IMAGE_DIMENSION and 0 < height <= MAX_IMAGE_DIMENSION):
                    raise AuditError("Unreasonable PNG dimensions")
            else:
                f.seek(length, 1)
            if len(f.read(4)) != 4:
                raise AuditError("Truncated PNG checksum")
            if marker == b"eXIf":
                indicators["hasExifChunk"] = True
            elif marker in (b"tEXt", b"zTXt", b"iTXt"):
                indicators["hasTextChunks"] = True
            elif marker == b"iCCP":
                indicators["hasIccProfile"] = True
            elif marker == b"acTL":
                indicators["animated"] = True
            elif marker not in {b"IHDR", b"IDAT", b"IEND", b"PLTE", b"tRNS", b"gAMA", b"cHRM", b"sRGB", b"bKGD", b"pHYs", b"sBIT", b"hIST", b"sPLT", b"tIME"}:
                indicators["unknownChunks"] += 1
            if marker == b"IEND":
                seen_end = True
                indicators["trailingBytesAfterIend"] = bool(f.read(1))
                break
        if not seen_end or width is None:
            raise AuditError("Missing PNG structure")
    return {"format": "PNG", "width": width, "height": height, "chunkCount": count, **indicators}


def audit_jpeg(path: Path) -> dict:
    flags = {"hasExif": False, "hasXmp": False, "hasIccProfile": False,
             "hasComment": False, "hasPhotoshopMetadata": False, "hasApplicationMetadata": False}
    with path.open("rb") as f:
        if f.read(2) != b"\xff\xd8":
            raise AuditError("Invalid JPEG signature")
        width = height = None
        segments = 0
        seen_scan = False
        while True:
            byte = f.read(1)
            if not byte:
                break
            if byte != b"\xff":
                raise AuditError("Malformed JPEG header")
            marker = f.read(1)
            while marker == b"\xff":
                marker = f.read(1)
            if not marker:
                raise AuditError("Truncated JPEG marker")
            kind = marker[0]
            segments += 1
            if segments > 30000:
                raise AuditError("Unreasonable JPEG segment count")
            if kind == 0xD9:
                break
            if kind == 0xDA:
                seen_scan = True
                break
            if kind == 0xD8 or kind == 0x01 or 0xD0 <= kind <= 0xD7:
                continue
            header = f.read(2)
            if len(header) != 2:
                raise AuditError("Truncated JPEG segment length")
            length = int.from_bytes(header, "big")
            if length < 2 or length > 65535:
                raise AuditError("Invalid JPEG segment length")
            data = f.read(length - 2)
            if len(data) != length - 2:
                raise AuditError("Truncated JPEG segment")
            if kind in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
                if len(data) < 5:
                    raise AuditError("Invalid JPEG SOF segment")
                height, width = struct.unpack(">HH", data[1:5])
                if not (0 < width <= MAX_IMAGE_DIMENSION and 0 < height <= MAX_IMAGE_DIMENSION):
                    raise AuditError("Unreasonable JPEG dimensions")
            if kind == 0xE1:
                flags["hasExif"] |= data.startswith(b"Exif\0\0")
                flags["hasXmp"] |= b"xmp" in data[:80].lower()
            if kind == 0xE2:
                flags["hasIccProfile"] |= data.startswith(b"ICC_PROFILE\0")
            if kind == 0xED:
                flags["hasPhotoshopMetadata"] = True
            if 0xE0 <= kind <= 0xEF:
                flags["hasApplicationMetadata"] = True
            if kind == 0xFE:
                flags["hasComment"] = True
    if width is None or not seen_scan:
        raise AuditError("No JPEG dimensions or scan marker")
    return {"format": "JPEG", "width": width, "height": height, "headerSegments": segments, **flags}


def audit_ods(path: Path) -> dict:
    try:
        with zipfile.ZipFile(path) as zf:
            members = zf.infolist()
            if len(members) > MAX_ZIP_MEMBERS:
                raise AuditError("Too many ODS members")
            uncompressed = sum(x.file_size for x in members)
            if uncompressed > MAX_ZIP_UNPACKED_BYTES:
                raise AuditError("ODS exceeds decompression limit")
            unsafe_names = [x.filename for x in members if x.filename.startswith("/") or "\\" in x.filename or any(p in ("", ".", "..") for p in x.filename.rstrip("/").split("/"))]
            if unsafe_names:
                raise AuditError("Unsafe ODS ZIP member path")
            names = {x.filename for x in members}
            if "content.xml" not in names or "META-INF/manifest.xml" not in names:
                raise AuditError("ODS missing required XML/manifest")
            encrypted = any(bool(x.flag_bits & 1) for x in members)
            if "mimetype" in names:
                mime = zf.read("mimetype")
                if mime != b"application/vnd.oasis.opendocument.spreadsheet":
                    raise AuditError("Unexpected ODS mimetype")
            elif not any(x.filename.startswith("META-INF/") for x in members):
                raise AuditError("ODS missing mimetype and manifest")
            macro_paths = any(x.filename.startswith(("Basic/", "Scripts/", "script/")) for x in members)
            binary_objects = sum(x.filename.startswith(("Object ", "ObjectReplacements/", "Pictures/")) for x in members)
            xml = {}
            for key in ("content.xml", "styles.xml", "meta.xml", "settings.xml", "META-INF/manifest.xml"):
                if key in names:
                    info = zf.getinfo(key)
                    if info.file_size > MAX_XML_BYTES:
                        raise AuditError("ODS XML member too large")
                    xml[key] = zf.read(key)
            content = ET.fromstring(xml["content.xml"])
            manifest = ET.fromstring(xml["META-INF/manifest.xml"])
            encrypted |= any(node.tag.endswith("}encryption-data") for node in manifest.iter())
            table_tag = "{" + NS_TABLE + "}table"
            formula = "{" + NS_TABLE + "}formula"
            hidden = []
            sheets = 0
            formulas = 0
            links = 0
            for node in content.iter():
                if node.tag == table_tag:
                    sheets += 1
                    if node.get("{" + NS_TABLE + "}visibility") in ("collapse", "filter", "hidden") or node.get("{" + NS_TABLE + "}display") == "false":
                        hidden.append(sheets)
                if formula in node.attrib:
                    formulas += 1
                for name, value in node.attrib.items():
                    if name == "{" + NS_XLINK + "}href" and (URL.search(value.encode("utf-8", "ignore")) or value.startswith("../")):
                        links += 1
            # Output deliberately excludes any worksheet cell, title, author, metadata value or identifier.
            joined = b"\n".join(xml.values())
            return {"format": "ODS", "zipMembers": len(members), "unpackedBytes": uncompressed,
                    "sheetCount": sheets, "hiddenSheetCount": len(hidden), "formulaAttributes": formulas,
                    "externalHrefCount": links, "containsUrlLikeText": bool(URL.search(joined)),
                    "containsEmailLikeText": bool(EMAIL.search(joined)),
                    "containsSpanishIdLikeText": bool(DNI.search(joined) or IBAN.search(joined)),
                    "hasMetadataXml": "meta.xml" in names,
                    "embeddedObjectOrPictureParts": binary_objects,
                    "possibleMacros": macro_paths,
                    "encryptedContent": encrypted}
    except (zipfile.BadZipFile, ET.ParseError, RuntimeError, ValueError) as exc:
        raise AuditError("Invalid or unreadable ODS container/XML") from exc


def run(source: Path, manifest: Path, selected: str | None) -> list[dict]:
    document = json.loads(manifest.read_text(encoding="utf-8"))
    entries = [e for e in document["entries"] if e.get("ownerDecision") == "preserve-full" and
               e.get("status") == "hold" and Path(e["path"]).suffix.lower() in SUPPORTED]
    if selected:
        entries = [e for e in entries if e["path"] == selected]
        if not entries:
            raise AuditError("Selected path is absent or not an eligible hold/preserve-full asset")
    if not entries:
        raise AuditError("No eligible image or ODS entries")
    output = []
    root = source.resolve()
    for entry in entries:
        path = root.joinpath(*entry["path"].split("/"))
        if not path.is_file() or path.is_symlink() or root not in path.resolve().parents:
            raise AuditError("Missing or unsafe source file: " + entry["path"])
        length = path.stat().st_size
        if length > MAX_INPUT_BYTES or length != entry["bytes"] or blob_digest(path) != entry["gitBlobSha"]:
            raise AuditError("Source byte size/hash differs from inventory: " + entry["path"])
        suffix = path.suffix.lower()
        details = audit_png(path) if suffix == ".png" else audit_jpeg(path) if suffix in (".jpg", ".jpeg") else audit_ods(path)
        output.append({"path": entry["path"], "bytes": length, "gitBlobShaVerified": True,
                       "technical": details, "rightsVerified": False,
                       "privacyCleared": False, "approvedForPublication": False})
    return output


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--all", action="store_true", help="Audit all eligible image/ODS entries")
    group.add_argument("--path", help="Audit one repository-relative manifest path")
    root = Path(__file__).resolve().parents[2]
    parser.add_argument("--source", type=Path, default=root, help="Repository root (default: determined from script path)")
    parser.add_argument("--manifest", type=Path, default=root / "prototype/src/data/media-review.json")
    args = parser.parse_args()
    try:
        result = run(args.source, args.manifest, args.path)
    except (AuditError, OSError, KeyError, json.JSONDecodeError) as exc:
        print(json.dumps({"result": "blocked", "reason": str(exc)}, ensure_ascii=False), file=sys.stderr)
        return 1
    print(json.dumps({"result": "preflight-only", "entries": result}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
