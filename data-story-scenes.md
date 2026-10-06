# Data Story Scenes / 数据故事场景

Preserve exact numbers while turning metrics, charts, and evidence into circuit scenes.

## When to Use

Use data story scenes when the article presents specific numbers, benchmarks, rankings, or evidence that must appear accurately in the image.

## Data Contract

Before generating, write the exact data contract:

```text
data contract:
- metric 1: {name} = {value} {unit}
- metric 2: {name} = {value} {unit}
- comparison: {A vs B with exact values}
- threshold: {name} = {value}
- trend: {increasing/decreasing/stable}
```

Every number in the data contract must appear in the image exactly as specified. Do not let the model round, approximate, or invent values.

## Encoding Data on a Circuit Board

### Single Values
Display on a 7-segment display module, OLED screen, or register readout. Attach a label identifying the metric.

### Comparisons
Use a differential pair or comparator chip with two labeled inputs and the output indicating which is greater.

### Trends
Use a carrier trace that rises, falls, or stays level. Attach trend direction labels and value markers at key points.

### Thresholds
Use a comparator with a threshold reference. The output LED indicates whether the signal is above or below threshold.

### Distributions
Use a row of LED bars or a histogram-style LED array. Each bar represents a bucket with a count label.

### Rankings
Use a stack of chips or registers with rank labels. The top chip is brightest, lower chips progressively dimmer.

## Display Modules

For data scenes, display modules are the primary label containers:

- **7-segment display**: for single numeric values. Maximum 4-5 digits for readability.
- **OLED screen**: for short text + number combinations (e.g., "Loss: 0.023").
- **Bar graph LED**: for proportional values or levels.
- **Register readout**: for multi-bit values with individual bit labels.

## Precision Rules

- Never invent a number. If the article says "94.7%", the image must show "94.7%", not "95%" or "99%".
- If the number is too long for a display module, use the most significant digits and note the full value in the caption.
- Percentages should include the % symbol. Values should include the unit.
- When comparing A vs B, both values must be visible simultaneously.

## Accept / Regenerate

Accept if:
- All numbers in the data contract appear correctly in the image.
- Display modules are readable (not tiny fake text).
- Labels identify what each number measures.

Regenerate if:
- Any number is wrong, rounded, or invented.
- Display modules are illegible.
- Labels are missing for data values.
