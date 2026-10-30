#!/usr/bin/env python3
"""Read-only aggregate MP4 inspection. Never output source metadata VALUES, frames, audio or tags."""
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys

ROOT = Path.cwd()
NAME = "revista/2023-10-17_Revista_Enredados_Presentacion.mp4"

def safe_label(value):
    text = str(value or "").lower()
    return text if re.fullmatch(r"[a-z0-9_.+-]{1,36}", text) else "unknown"

def safe_number(value):
    try:
        number = float(value)
        if 0 <= number < 10**12 and number == number:
            return round(number, 3)
    except (ValueError, TypeError, OverflowError):
        pass
    return None

def fps(value):
    if not value or value in ("0/0", "N/A"):
        return None
    try:
        top, bottom = str(value).split("/")
        return safe_number(float(top) / float(bottom))
    except (ValueError, ZeroDivisionError, TypeError):
        return safe_number(value)

def main():
    if len(sys.argv) != 1:
        raise ValueError("Audit is restricted to the inventoried MP4")
    filename = ROOT / NAME
    info = filename.lstat()
    if not filename.is_file() or filename.is_symlink():
        raise ValueError("Unexpected MP4 file type")
    manifest = json.loads((ROOT / "prototype/src/data/media-review.json").read_text("utf-8"))
    entry = next(x for x in manifest["entries"] if x["path"] == NAME)
    if info.st_size != entry["bytes"]:
        raise ValueError("Video changed size from reviewed inventory")
    sha1 = hashlib.sha1(("blob " + str(info.st_size) + "\0").encode("ascii"))
    sha256 = hashlib.sha256()
    with filename.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            sha1.update(chunk)
            sha256.update(chunk)
    if sha1.hexdigest() != entry["gitBlobSha"]:
        raise ValueError("MP4 Git blob does not match reviewed source")
    probe = shutil.which("ffprobe")
    if not probe:
        raise RuntimeError("ffprobe is required")
    cmd = [probe, "-v", "error", "-show_format", "-show_streams",
           "-show_chapters", "-of", "json", str(filename)]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120, check=False)
    if result.returncode:
        raise ValueError("Video container could not be inspected")
    meta = json.loads(result.stdout)
    tracks = []
    for track in meta.get("streams", []):
        kind = safe_label(track.get("codec_type"))
        record = {"type":kind, "codec":safe_label(track.get("codec_name")),
                  "durationSeconds":safe_number(track.get("duration")),
                  "tagKeys":sorted(str(k)[:45] for k in track.get("tags", {}).keys())[:35]}
        if kind == "video":
            record.update({"width":track.get("width"),"height":track.get("height"),
                           "framesPerSecond":fps(track.get("avg_frame_rate")),
                           "pixelFormat":safe_label(track.get("pix_fmt")),
                           "frameCountReported":safe_number(track.get("nb_frames"))})
        if kind == "audio":
            record.update({"sampleRateHz":safe_number(track.get("sample_rate")),
                           "channels":track.get("channels")})
        tracks.append(record)
    fmt = meta.get("format", {})
    report = {
        "path": NAME, "bytes":info.st_size, "gitBlobMatch":True,
        "sha256":sha256.hexdigest(),
        "formatName":safe_label(str(fmt.get("format_name", "")).split(",")[0]),
        "durationSeconds":safe_number(fmt.get("duration")),
        "overallBitRateBitsPerSecond":safe_number(fmt.get("bit_rate")),
        "streamCount":len(tracks), "tracks":tracks,
        "chapterCount":len(meta.get("chapters", [])),
        "containerMetadataKeys":sorted(str(k)[:45] for k in fmt.get("tags", {}).keys())[:40],
        "containsVisualOrAudioPersonalData": "NOT_INSPECTED",
        "musicAndThirdPartyPermissions": "NOT_VERIFIED",
        "clearance": "REQUIRES_MANUAL_FRAME_AUDIO_RIGHTS_PRIVACY_REVIEW"
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("Video inspection failed:", type(exc).__name__, file=sys.stderr)
        sys.exit(1)
