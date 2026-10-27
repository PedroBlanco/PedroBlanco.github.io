#!/usr/bin/env python3
"""Read-only PDF preflight; outputs aggregate signals only, not names or page text.

The output DOES NOT constitute a rights assessment or clearance of personal data.
Requires pypdf. Designed for a public CI log without accidental PII extraction.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import sys
from pypdf import PdfReader

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("path", nargs="?", default="CROQUETAS2024.pdf")
    parser.add_argument("--inventory", default="prototype/src/data/media-review.json")
    args = parser.parse_args()
    root = Path.cwd()
    pdf_path = (root / args.path).resolve()
    if pdf_path != (root / "CROQUETAS2024.pdf").resolve():
        raise RuntimeError("This audit is explicitly scoped to CROQUETAS2024.pdf")
    data = json.loads((root / args.inventory).read_text(encoding="utf-8"))
    entry = next(x for x in data["entries"] if x["path"] == args.path)
    raw = pdf_path.read_bytes()
    git_sha = hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\x00" + raw).hexdigest()
    if git_sha != entry["gitBlobSha"] or len(raw) != entry["bytes"]:
        raise RuntimeError("Source PDF changed; manual review and new inventory required")
    reader = PdfReader(str(pdf_path), strict=False)
    if reader.is_encrypted:
        try:
            reader.decrypt("")
        except Exception:
            print(json.dumps({"status":"encrypted_not_inspectable","bytes":len(raw),"gitBlobMatch":True}))
            raise RuntimeError("Encrypted PDF not inspectable")
    metadata = reader.metadata
    metadata_present = []
    if metadata:
        for field in ["/Title","/Author","/Subject","/Creator","/Producer","/CreationDate","/ModDate","/Keywords"]:
            if metadata.get(field):
                metadata_present.append(field.removeprefix("/"))
    page_count = len(reader.pages)
    text_chars = 0
    no_text_pages = 0
    images = 0
    annots = 0
    uri_links = 0
    extracted_text = []
    extraction_errors = 0
    for page in reader.pages:
        try:
            txt = page.extract_text() or ""
            text_chars += len(txt)
            if len(txt.strip()) < 30:
                no_text_pages += 1
            extracted_text.append(txt)
        except Exception:
            extraction_errors += 1
        try:
            resources=page.get("/Resources")
            if resources:
                resources=resources.get_object()
                xobjs=resources.get("/XObject")
                if xobjs:
                    for obj in xobjs.get_object().values():
                        if obj.get_object().get("/Subtype") == "/Image":
                            images += 1
        except Exception:
            pass
        try:
            annotations=page.get("/Annots")
            if annotations:
                for ref in annotations:
                    annots += 1
                    a=ref.get_object()
                    action=a.get("/A")
                    if action and action.get_object().get("/URI"):
                        uri_links += 1
        except Exception:
            pass
    corpus="\n".join(extracted_text)
    personal_patterns={
        "email-like":r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}",
        "dni-like":r"\b[0-9]{8}[A-Za-z]\b",
        "iban-like":r"\bES[0-9]{2}(?:[\s-]?[0-9]{4}){5}\b",
    }
    indicators={key:len(re.findall(regex,corpus,re.I)) for key,regex in personal_patterns.items()}
    rights_phrases=["creative commons","cc by","copyright","derechos reservados","licencia","autorización de reproducción","©"]
    rights_mentions={word:bool(re.search(re.escape(word),corpus,re.I)) for word in rights_phrases}
    report={
        "filename":args.path,
        "bytes":len(raw),
        "gitBlobMatch":True,
        "sha256":hashlib.sha256(raw).hexdigest(),
        "pageCount":page_count,
        "extractableTextCharacters":text_chars,
        "pagesWithLittleOrNoExtractableText":no_text_pages,
        "textExtractionErrors":extraction_errors,
        "embeddedImageXObjectReferences":images,
        "annotations":annots,
        "externalLinkAnnotations":uri_links,
        "metadataFieldsPresent":metadata_present,
        "patternMatchCounts_NotPersonalDataClearance":indicators,
        "rightsKeywordPresent_NotLicenseEvidence":rights_mentions,
        "clearance": "REQUIRES_HUMAN_PAGE_REVIEW_AND_RIGHTS_CONFIRMATION",
    }
    print(json.dumps(report,ensure_ascii=False,indent=2))
    if extraction_errors:
        raise RuntimeError("Some pages could not be text-extracted; keep file on hold")

if __name__=="__main__":
    try: main()
    except Exception as exc:
        print("PDF preflight failed:",type(exc).__name__,str(exc),file=sys.stderr)
        sys.exit(1)
