"""Convert heavy PNG/JPG images in public/media to high-quality WebP.

- Keeps full sharpness: images are only downscaled when wider than MAX_W
  (2560px, enough for 2x retina at the site's widest image slot), quality 90.
- Writes a JPEG copy for social-share previews under public/media/share/.
- Rewrites references in src/data/snapshot/*.json and src/**/*.ts(x).
- Already-optimized files are skipped, so it is safe to re-run after adding
  new images (the dashboard upload flow runs it too).

Usage: python3 scripts/optimize-images.py
"""
import json, os, re, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MEDIA = ROOT / "public" / "media"
SHARE = MEDIA / "share"
MAX_W = 2560
SHARE_W = 1200
MIN_BYTES = 150_000  # leave small files (logos, icons) alone

converted = {}
for src in sorted(MEDIA.rglob("*")):
    if src.suffix.lower() not in (".png", ".jpg", ".jpeg") or SHARE in src.parents:
        continue
    if src.stat().st_size < MIN_BYTES:
        continue
    im = Image.open(src)
    has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
    im = im.convert("RGBA" if has_alpha else "RGB")
    w, h = im.size
    big = im.resize((MAX_W, round(h * MAX_W / w)), Image.LANCZOS) if w > MAX_W else im
    dst = src.with_suffix(".webp")
    big.save(dst, "WEBP", quality=90, method=6)

    rel = src.relative_to(MEDIA).with_suffix(".jpg")
    share = SHARE / rel
    share.parent.mkdir(parents=True, exist_ok=True)
    s = im.convert("RGB")
    if w > SHARE_W:
        s = s.resize((SHARE_W, round(h * SHARE_W / w)), Image.LANCZOS)
    s.save(share, "JPEG", quality=86, optimize=True, progressive=True)

    old = "/media/" + src.relative_to(MEDIA).as_posix()
    new = "/media/" + dst.relative_to(MEDIA).as_posix()
    converted[old] = new
    print(f"{old}: {src.stat().st_size // 1000}KB -> {dst.stat().st_size // 1000}KB ({w}px -> {big.size[0]}px)")
    src.unlink()

if converted:
    targets = list((ROOT / "src").rglob("*.json")) + list((ROOT / "src").rglob("*.ts")) + list((ROOT / "src").rglob("*.tsx"))
    for f in targets:
        t = f.read_text(encoding="utf8")
        n = t
        for old, new in converted.items():
            n = n.replace(old, new)
        if n != t:
            f.write_text(n, encoding="utf8")
print(f"converted {len(converted)} images")
