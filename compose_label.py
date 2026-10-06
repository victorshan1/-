#!/usr/bin/env python3
"""
Circuit Workers Label Compositor (v2.6.1 NEW)
=============================================

Deterministic label-text rendering for PCB nameplates - the rare-character
escape channel. The image model paints the PHYSICAL nameplate (blank brass
plate); this script engraves the TEXT with a real font file, so stroke-level
correctness is guaranteed for any character, rare or not.

Why this exists: image models paint characters from statistical impression.
Rare or high-stroke characters collapse at the stroke level, and VLM QA
cannot catch it (it reads the expected text, not the pixels). See
references/rare-char-compositing.md for the full pipeline and trigger rules.

Usage:
  # 1) Locate the blank brass nameplate (prints bbox as JSON)
  python3 scripts/compose_label.py --locate ./board.png

  # 2) Engrave text onto the nameplate (auto-locates when --bbox omitted)
  python3 scripts/compose_label.py --compose ./board.png \
      --text "label" --output ./final.png

  # 3) Repair a corrupted label region, then engrave the correct text
  python3 scripts/compose_label.py --repair ./broken.png \
      --bbox 120,340,540,420 --text "label" --output ./fixed.png

  Options:
    --style engraved|silkscreen   engraved: dark glyph + bottom-right highlight
                                  (brass nameplates, default)
                                  silkscreen: light-gold glyph + dark shadow
                                  (labels printed on the green PCB surface)
    --font /path/to/bold.ttf      override the font fallback chain
    --bbox x1,y1,x2,y2            manual bounding box (skips auto-locate)
    --gap N                       row-scan gap tolerance in px (default 12,
                                  tolerates screw holes in the plate)
    --min-width-frac F            minimum plate width as fraction of image
                                  width (default 0.08)

Dependencies: Python 3.8+, Pillow, numpy. OpenCV only needed for --repair.
No network calls, no subprocess, no API keys - pure local file processing.

Exit codes: 0 success / 1 usage or file error / 2 missing dependency /
3 nameplate localization failure.
"""

import argparse
import json
import os
import sys

# ---------------------------------------------------------------------------
# Brass/copper color gate - values validated on real generated boards.
# The R>G>B ordering is what separates copper-family colors from the green
# solder mask (G-dominant) and silver solder joints (R~G~B).
COPPER_R_MIN = 130
COPPER_G_MIN = 70
COPPER_G_MAX = 170
COPPER_B_MAX = 110

# Engraved look on brass: dark-brown main glyph, light highlight offset to
# the bottom-right simulates the catch-light on the incised groove wall.
ENGRAVED_MAIN = (72, 40, 18)
ENGRAVED_HIGHLIGHT = (235, 200, 150)
ENGRAVED_OFFSET = 2

# Silkscreen look on green mask: light-gold glyph with a dark drop shadow.
SILKSCREEN_MAIN = (230, 195, 140)
SILKSCREEN_SHADOW = (20, 30, 25)
SILKSCREEN_OFFSET = 1

# Font size = plate height * 0.62, shrunk further if text would overflow.
FONT_SIZE_RATIO = 0.62
MAX_WIDTH_FILL = 0.92

# Cross-platform CJK bold font fallback chain. First existing path wins;
# --font overrides the whole chain.
FONT_FALLBACK = [
    # Linux (primary, validated)
    "/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf",
    "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
    "/usr/share/fonts/truetype/chinese/SarasaMonoSC-Bold.ttf",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
    # macOS
    "/System/Library/Fonts/STHeiti Medium.ttc",
    "/System/Library/Fonts/PingFang.ttc",
    # Windows
    "C:\\Windows\\Fonts\\msyhbd.ttc",
    "C:\\Windows\\Fonts\\simhei.ttf",
]


def fail(code, message):
    print("ERROR: " + message, file=sys.stderr)
    sys.exit(code)


# ---------------------------------------------------------------------------
# Nameplate localization: copper-color segmentation + row scan.
# Never replaced by VLM coordinates - measured VLM bounding boxes carry
# large errors for this task.

def locate_nameplate(image, gap_tol=12, min_width_frac=0.08):
    """Find the blank brass nameplate.

    Returns (x1, y1, x2, y2) or None. Strategy: build a copper-color mask,
    scan rows for horizontal runs (gaps up to gap_tol are bridged to
    tolerate screw holes), grow each seed into a vertical band, then keep
    bands with a plate-like shape (minimum height, wide aspect ratio) and
    pick the largest by area. A long trace may match the color gate, but
    it fails the shape filter; a trace crossing the plate does not matter
    because coverage is measured over the seed's own x-range.
    """
    import numpy as np

    arr = np.asarray(image.convert("RGB"), dtype=int)
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    mask = (
        (r > COPPER_R_MIN)
        & (g > COPPER_G_MIN)
        & (g < COPPER_G_MAX)
        & (b < COPPER_B_MAX)
        & (r > g)
        & (g > b)
    )
    height, width = mask.shape
    min_width = int(width * min_width_frac)
    min_height = max(4, int(height * 0.02))

    def widest_run(row_idx):
        """Widest contiguous run in one row, bridging gaps <= gap_tol."""
        idx = np.flatnonzero(row_idx)
        if idx.size == 0:
            return None
        best_start, best_end = idx[0], idx[0]
        start = prev = idx[0]
        for i in idx[1:]:
            if i - prev <= gap_tol + 1:
                prev = i
            else:
                if prev - start > best_end - best_start:
                    best_start, best_end = start, prev
                start = prev = i
        if prev - start > best_end - best_start:
            best_start, best_end = start, prev
        return int(best_start), int(best_end)

    # Collect vertical bands. A wide horizontal trace also wins the width
    # contest, so width alone cannot pick the plate - filter candidates by
    # plate-like shape (minimum height, wide aspect ratio) and score by area.
    claimed = np.zeros(height, dtype=bool)
    bands = []  # (area, x1, y1, x2, y2)
    for y in range(height):
        if claimed[y]:
            continue
        run = widest_run(mask[y])
        if run is None:
            continue
        xs, xe = run
        if xe - xs < min_width:
            continue

        def coverage(yc):
            return mask[yc, xs:xe + 1].mean()

        top = y
        while top > 0 and coverage(top - 1) >= 0.6:
            top -= 1
        bottom = y
        while bottom < height - 1 and coverage(bottom + 1) >= 0.6:
            bottom += 1
        claimed[top:bottom + 1] = True

        band_h = bottom - top + 1
        band_w = xe - xs + 1
        if band_h >= min_height and band_w / band_h >= 1.5:
            bands.append((band_w * band_h, xs, top, xe, bottom))

    if not bands:
        return None
    _, x1, y1, x2, y2 = max(bands)
    return x1, y1, x2, y2


def parse_bbox(text):
    try:
        x1, y1, x2, y2 = (int(v.strip()) for v in text.split(","))
    except ValueError:
        fail(1, "--bbox must be x1,y1,x2,y2 integers, got: " + text)
    if x2 <= x1 or y2 <= y1:
        fail(1, "--bbox is degenerate (x2<=x1 or y2<=y1): " + text)
    return x1, y1, x2, y2


# ---------------------------------------------------------------------------
# Font resolution

def resolve_font_path(override):
    candidates = [override] if override else FONT_FALLBACK
    for path in candidates:
        if path and os.path.isfile(path):
            return path
    fail(
        1,
        "no CJK font found. Pass --font /path/to/bold.ttf "
        "(tried: " + ", ".join(p for p in candidates if p) + ")",
    )


# ---------------------------------------------------------------------------
# Text rendering

def render_label(image, text, bbox, style="engraved", font_path=None):
    """Engrave text into bbox on a copy of image. Returns (image, font_size)."""
    from PIL import Image, ImageDraw, ImageFont

    x1, y1, x2, y2 = bbox
    plate_w, plate_h = x2 - x1 + 1, y2 - y1 + 1

    # Auto-fit: start from height ratio, shrink if the text would overflow.
    size = max(8, int(plate_h * FONT_SIZE_RATIO))
    font = ImageFont.truetype(font_path, size)
    l, t, rr, bb = font.getbbox(text)
    text_w = rr - l
    if text_w > plate_w * MAX_WIDTH_FILL:
        size = max(8, int(size * plate_w * MAX_WIDTH_FILL / text_w))
        font = ImageFont.truetype(font_path, size)
        l, t, rr, bb = font.getbbox(text)

    tw, th = rr - l, bb - t
    cx = x1 + plate_w / 2.0
    cy = y1 + plate_h / 2.0
    origin_x = cx - tw / 2.0 - l
    origin_y = cy - th / 2.0 - t

    out = image.copy()
    if out.mode not in ("RGB", "RGBA"):
        out = out.convert("RGB")
    draw = ImageDraw.Draw(out)

    if style == "silkscreen":
        draw.text((origin_x + SILKSCREEN_OFFSET, origin_y + SILKSCREEN_OFFSET),
                  text, font=font, fill=SILKSCREEN_SHADOW)
        draw.text((origin_x, origin_y), text, font=font, fill=SILKSCREEN_MAIN)
    else:  # engraved - highlight first, main glyph covers all but the fringe
        draw.text((origin_x + ENGRAVED_OFFSET, origin_y + ENGRAVED_OFFSET),
                  text, font=font, fill=ENGRAVED_HIGHLIGHT)
        draw.text((origin_x, origin_y), text, font=font, fill=ENGRAVED_MAIN)

    return out, size


# ---------------------------------------------------------------------------
# Repair: content-aware inpainting of a corrupted label region.

def repair_region(image, bbox):
    """Erase the bbox region by rebuilding texture from surroundings.

    TELEA inpaint beats flat-color fill: a uniform rectangle reads as an
    obvious sticker against noisy brass texture.
    """
    try:
        import cv2
        import numpy as np
    except ImportError:
        fail(2, "--repair needs OpenCV (cv2). Install it, or erase the "
                 "region in any image editor and run --compose instead.")

    x1, y1, x2, y2 = bbox
    arr = np.asarray(image.convert("RGB"))[:, :, ::-1]  # RGB -> BGR
    mask = np.zeros(arr.shape[:2], dtype=np.uint8)
    mask[y1:y2 + 1, x1:x2 + 1] = 255
    arr = cv2.inpaint(arr, mask, 6, cv2.INPAINT_TELEA)
    from PIL import Image
    return Image.fromarray(arr[:, :, ::-1])  # BGR -> RGB


# ---------------------------------------------------------------------------
# CLI

def main():
    parser = argparse.ArgumentParser(
        description="Deterministic label compositor for PCB nameplates "
                    "(rare-character escape channel).")
    actions = parser.add_mutually_exclusive_group(required=True)
    actions.add_argument("--locate", metavar="IMAGE",
                         help="locate the blank brass nameplate, print bbox JSON")
    actions.add_argument("--compose", metavar="IMAGE",
                         help="engrave --text onto the nameplate")
    actions.add_argument("--repair", metavar="IMAGE",
                         help="inpaint a corrupted label region, then engrave "
                              "--text if given")
    parser.add_argument("--text", help="label text to engrave")
    parser.add_argument("--output", help="output image path (required for "
                                         "--compose / --repair)")
    parser.add_argument("--bbox", help="manual x1,y1,x2,y2 (skips auto-locate)")
    parser.add_argument("--style", choices=["engraved", "silkscreen"],
                        default="engraved")
    parser.add_argument("--font", help="override the font fallback chain")
    parser.add_argument("--gap", type=int, default=12,
                        help="row-scan gap tolerance px (default 12)")
    parser.add_argument("--min-width-frac", type=float, default=0.08,
                        help="min plate width as fraction of image width")
    args = parser.parse_args()

    action = "locate" if args.locate else ("compose" if args.compose else "repair")
    path = args.locate or args.compose or args.repair

    if not os.path.isfile(path):
        fail(1, "image not found: " + path)

    try:
        from PIL import Image
    except ImportError:
        fail(2, "Pillow is required. Install it first.")
    try:
        import numpy  # noqa: F401  (needed by locate/repair, not by pure compose)
    except ImportError:
        fail(2, "numpy is required. Install it first.")

    image = Image.open(path)

    # ---- locate ------------------------------------------------------------
    if action == "locate":
        bbox = locate_nameplate(image, args.gap, args.min_width_frac)
        if bbox is None:
            fail(3, "no blank brass nameplate found. The plate may not be "
                    "blank/brass-toned, or it is narrower than "
                    "--min-width-frac. Inspect the image and pass --bbox "
                    "manually to --compose.")
        x1, y1, x2, y2 = bbox
        print(json.dumps({
            "bbox": [x1, y1, x2, y2],
            "width": x2 - x1 + 1,
            "height": y2 - y1 + 1,
        }))
        return

    # ---- compose / repair share the output requirement ---------------------
    if not args.output:
        fail(1, "--output is required for --" + action)
    if action == "compose" and not (args.text or "").strip():
        fail(1, "--text is required for --compose")

    if args.bbox:
        bbox = parse_bbox(args.bbox)
    elif action == "repair":
        fail(1, "--repair needs --bbox (the corrupted label region)")
    else:
        bbox = locate_nameplate(image, args.gap, args.min_width_frac)
        if bbox is None:
            fail(3, "auto-locate failed. Inspect the image and pass --bbox "
                    "x1,y1,x2,y2 manually.")

    if action == "repair":
        image = repair_region(image, bbox)

    font_path = resolve_font_path(args.font)
    if (args.text or "").strip():
        image, font_size = render_label(image, args.text.strip(), bbox,
                                        args.style, font_path)
    else:
        font_size = None

    image.save(args.output)
    print(json.dumps({
        "output": args.output,
        "bbox": list(bbox),
        "style": args.style,
        "font": font_path,
        "font_size": font_size,
    }))


if __name__ == "__main__":
    main()
