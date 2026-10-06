# Rare Character Escape Channel / 生僻字逃生通道 (v2.6.1)

Image models paint characters from statistical impression, not from stroke data. Common characters survive this; rare or high-stroke characters collapse at the stroke level — 猹 renders as 观猴, 爨 loses entire radicals. Retrying with decomposition hints ("反犬旁 + 左木右旦, NOT 猴") only improves the odds and never guarantees correctness. Worse, VLM QA cannot catch this failure class: a VLM reads the EXPECTED text (reconstructed from the prompt context) rather than the actual pixels, and will report "strokes perfect" on a visibly corrupted glyph — observed twice in one session on the same image.

The fix is architectural, not probabilistic: **stop asking the model to paint the text**. Let the model paint a COMPLETELY BLANK physical nameplate — its strength is material, bevel, sheen, shadow. Then engrave the text programmatically with a real font file. A font file's glyphs are stroke-exact for any character, rare or not. The output is correct by construction, not by luck.

This is the same reification principle as Case F9: when the model cannot render an abstract requirement, shift it to something it can render, and handle the rest deterministically.

## When to Trigger

Route a label through the escape channel when ANY of these is true:

| # | Condition | Why |
|---|-----------|-----|
| 1 | The label contains rare characters (生僻字: 猹 爨 龘 彧 鬱 鸑 麤 …) | Model has near-zero training exposure; stroke-level collapse is expected, not exceptional |
| 2 | The label contains a dense, high-stroke character (≥14 strokes with many components) | Same mechanism as #1, milder probability curve |
| 3 | The same label has failed font-corruption QA 2 times in a row | A capability gap does not heal on retry; the remaining retry budget belongs elsewhere |

Do NOT trigger for normal labels (常用字, short English words): the escape channel costs one extra compositing pass, and the model paints normal labels correctly in one shot. Reserve the escape channel for confirmed capability gaps.

Brand-critical text (product names, event names) is a judgment call: if pixel-perfect text is a hard requirement from the user, route it through the escape channel even when the characters are common — deterministic beats probable.

## Pipeline (5 steps)

### Step 1: Generate with a blank nameplate

Write the image prompt as usual (worker-first, labels-last structure), but for the risky label describe the nameplate as:

> a raised brass nameplate that is COMPLETELY BLANK AND EMPTY — clean polished surface, no text, no engraving, no marks

Keep all other labels in the prompt normally; only the risky label moves to the blank nameplate. The model reliably renders a blank brass plate because "empty metal plate with sheen" is heavily represented in training data.

### Step 2: Locate the nameplate programmatically

Never trust VLM coordinates for this — measured bounding boxes from VLM carry large errors. Use `scripts/compose_label.py --locate`, which finds the brass plate by color segmentation plus row scanning (tolerates screw holes as small gaps):

```bash
python3 scripts/compose_label.py --locate ./board.png
# → {"bbox": [x1, y1, x2, y2], "width": ..., "height": ...}
```

If localization fails (exit code 3), the plate may not be blank/brass-toned — inspect the image and pass the bbox manually with `--bbox x1,y1,x2,y2`.

### Step 3: Engrave the text

```bash
python3 scripts/compose_label.py --compose ./board.png --text "观猹" --output ./final.png
```

Default style is `engraved` (dark-brown main glyph + bottom-right highlight = incised look on brass); `--style silkscreen` renders light-gold text with a dark drop shadow for labels placed directly on the green PCB surface. Font size auto-fits the plate (height × 0.62, shrunk further if the text would overflow the width). The script searches a cross-platform font fallback chain and accepts `--font /path/to/bold.ttf` to override.

### Step 4 (branch): Repair an already-corrupted label

If the image already exists with a corrupted label (model painted 猹 wrong, or an old image needs relabeling), do not regenerate the whole image. Erase the corrupted region with content-aware inpainting and engrave the correct text in one command:

```bash
python3 scripts/compose_label.py --repair ./broken.png \
  --bbox 120,340,540,420 --text "猹" --output ./fixed.png
```

Content-aware inpainting (TELEA) rebuilds the plate texture from surrounding pixels. Never patch with a flat color fill — the uniform rectangle reads as an obvious sticker against noisy brass texture.

### Step 5: Verify by human eye

Crop the label area at 2× zoom and check the strokes yourself. This checkpoint is mandatory and cannot be delegated to VLM QA — the VLM font blind spot (it reads expected text, not pixels) is the exact failure this channel exists to escape. The script prints the final label bbox to make the crop easy.

## Dependencies & Portability

- `--locate` / `--compose`: Python 3, Pillow, numpy. No network, no subprocess, no API keys — pure local file processing.
- `--repair`: additionally OpenCV (`cv2`). If cv2 is unavailable, the script exits with code 2 and a clear message; compose-only workflows are unaffected.
- Fonts: fallback chain covers common Linux / macOS / Windows CJK bold fonts; `--font` overrides.

## Failure Case

See `references/failure-patterns.md` **Case F10** for the full anatomy: five regeneration attempts on an app-launch illustration whose core label contained 猹, two false "strokes perfect" VLM verdicts, and the decisive experiment that motivated this channel — the same blank-plate + font-compositing approach produced a stroke-perfect label on the first try, at lower total cost than the retry loop it replaced.
