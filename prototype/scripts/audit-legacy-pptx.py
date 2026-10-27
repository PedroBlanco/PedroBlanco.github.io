#!/usr/bin/env python3
"""Aggregate-only, read-only PPTX preflight. Does not print slide, note or metadata values."""
import hashlib
import json
import re
import stat
import sys
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile, BadZipFile

ROOT = Path.cwd()
NAME = "NEXUM2024.pptx"
MAX_TOTAL = 600 * 1024 * 1024
MAX_ENTRY = 200 * 1024 * 1024
XML_LIMIT = 12 * 1024 * 1024
SLIDE = re.compile(r"ppt/slides/slide[0-9]+\.xml$")
NOTES = re.compile(r"ppt/notesSlides/notesSlide[0-9]+\.xml$")
COMMENT = re.compile(r"ppt/comments/.+\.xml$")
REL = re.compile(r".+\.rels$")
PATTERNS = {
    "email_like": r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}",
    "dni_like": r"\b[0-9]{8}[A-Za-z]\b",
    "iban_like": r"\bES[0-9]{2}(?:[\s-]?[0-9]{4}){5}\b",
}
PROPERTY_TAGS = {"creator", "lastModifiedBy", "title", "subject", "keywords", "description"}

def main():
    if len(sys.argv) != 1:
        raise ValueError("Only approved PPTX location supported")
    file = ROOT / NAME
    manifest = json.loads((ROOT / "prototype/src/data/media-review.json").read_text("utf8"))
    entry = next(e for e in manifest["entries"] if e["path"] == NAME)
    raw = file.read_bytes()
    if len(raw) != entry["bytes"]:
        raise ValueError("PPTX length changed since review inventory")
    sha = hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest()
    if sha != entry["gitBlobSha"]:
        raise ValueError("PPTX Git blob hash mismatch")
    entries, uncompressed = [], 0
    slides, notes, comments = [], [], []
    media = 0
    media_bytes = 0
    embedded = 0
    embedded_bytes = 0
    external_links = 0
    active_content = 0
    hidden_slides = 0
    text_chars = 0
    little_text = 0
    slide_content = []
    metadata_fields = []
    with ZipFile(file) as z:
        if z.testzip() is not None:
            raise ValueError("PPTX ZIP entry checksum mismatch")
        seen = set()
        for info in z.infolist():
            name = info.filename
            if (name.startswith("/") or "\\" in name or ".." in name.split("/") or
                    name in seen or (info.flag_bits & 1)):
                raise ValueError("Unsafe or encrypted PPTX ZIP entry")
            if stat.S_ISLNK(info.external_attr >> 16):
                raise ValueError("Symbolic link in PPTX")
            seen.add(name)
            if info.file_size > MAX_ENTRY:
                raise ValueError("Oversized PPTX ZIP member")
            uncompressed += info.file_size
            if uncompressed > MAX_TOTAL:
                raise ValueError("PPTX extracted data exceeds review limit")
            entries.append(name)
            if SLIDE.fullmatch(name):
                slides.append(name)
            elif NOTES.fullmatch(name):
                notes.append(name)
            elif COMMENT.fullmatch(name):
                comments.append(name)
            if name.startswith("ppt/media/") and not info.is_dir():
                media += 1
                media_bytes += info.file_size
            if name.startswith("ppt/embeddings/") and not info.is_dir():
                embedded += 1
                embedded_bytes += info.file_size
            if "activeX/" in name or name.endswith(("vbaProject.bin", ".exe", ".js", ".hta")):
                active_content += 1
            if name.startswith("ppt/") and (SLIDE.fullmatch(name) or NOTES.fullmatch(name) or COMMENT.fullmatch(name)):
                if info.file_size > XML_LIMIT:
                    raise ValueError("Oversized slide/note/comment XML")
                root = ET.fromstring(z.read(info))
                texts = [n.text or "" for n in root.iter() if n.tag.endswith("}t")]
                content = "\n".join(texts)
                slide_content.append(content)
                if SLIDE.fullmatch(name):
                    text_chars += len(content)
                    if len(content.strip()) < 30:
                        little_text += 1
                    if root.attrib.get("show", "").lower() in ("0", "false"):
                        hidden_slides += 1
            if REL.fullmatch(name):
                if info.file_size > XML_LIMIT:
                    raise ValueError("Oversized relation XML")
                root = ET.fromstring(z.read(info))
                external_links += sum(1 for x in root.iter() if x.attrib.get("TargetMode") == "External")
            if name == "docProps/core.xml":
                if info.file_size > XML_LIMIT:
                    raise ValueError("Oversized metadata XML")
                core = ET.fromstring(z.read(info))
                metadata_fields = sorted({t.tag.rsplit("}", 1)[-1] for t in core.iter()
                                          if t.tag.rsplit("}", 1)[-1] in PROPERTY_TAGS and (t.text or "").strip()})
    all_text = "\n".join(slide_content)
    matches = {k: len(re.findall(pattern, all_text, re.I)) for k, pattern in PATTERNS.items()}
    rights = any(word in all_text.lower() for word in ("creative commons", "derechos reservados", "licencia", "copyright"))
    report = {
        "filename": NAME, "sizeBytes": len(raw), "gitBlobMatch": True,
        "sha256": hashlib.sha256(raw).hexdigest(),
        "zipEntries": len(entries), "uncompressedBytes": uncompressed,
        "slides": len(slides), "hiddenSlides": hidden_slides,
        "slidesWithLittleExtractableText": little_text, "slideTextCharacters": text_chars,
        "noteFiles": len(notes), "commentFiles": len(comments),
        "embeddedObjects": embedded, "embeddedBytes": embedded_bytes,
        "mediaFiles": media, "mediaBytes": media_bytes,
        "externalRelationshipTargets": external_links,
        "activeContentIndicators": active_content,
        "presentCoreMetadataFields": metadata_fields,
        "textPatternMatchCounts_NotPrivacyClearance": matches,
        "licenseKeywordMention_NotRightsEvidence": rights,
        "clearance": "HUMAN_SLIDE_NOTES_RIGHTS_PRIVACY_REVIEW_REQUIRED",
    }
    print(json.dumps(report, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, BadZipFile, ET.ParseError, KeyError, StopIteration) as e:
        print("PPTX preflight failed:", type(e).__name__, file=sys.stderr)
        sys.exit(1)
