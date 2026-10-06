# Series and Chaining / 系列与串联

Use this reference when an article needs more than one body image. Most publish-grade articles need 2–6 figures. Readers feel quality when the set reads as one system — one world, one argument, one visual language — not as N unrelated pictures. Chaining means two things at once: continuity across images (inter-image) and a readable throughline within each image (intra-image).

## Two Kinds of Chaining

### Intra-image chaining / 图内串联

One copper carrier trace threads anchor → action → result inside a single image. Multiple relations link into one path: the reader follows a copper trace from the source component, through the worker's action station, to the outcome. Labels mark each stop; the worker moves along the trace, not beside it.

Accept: one copper carrier trace with 2–4 labeled stations; worker touches trace, relay, chip, or test point at the focal point; start/change/result visible in one scene.

Reject: equal-weight components with no path; worker standing beside a pretty arrangement; labels scattered without route logic.

### Inter-image chaining / 图间串联

The set shares a world, worker identity, palette, label style, and a progressing throughline. Image 2 advances the same argument — "same article, next beat" — not "new poster."

Accept: same worker family, label container style, high-angle camera, and PCB world; throughline state progresses image to image.

Reject: image 3 looks like a different style guide; each image repeats the same scene; the set could be reordered without losing meaning.

## Continuity Dimensions

Plan what STAYS constant vs what CHANGES per image.

**Stays constant / 保持不变:** worker identity (same soldering-cap head, PCB body, arm style, LED-dot expression rule); PCB material and palette (green solder mask, copper gold, quiet gray, signal blue carrier; evidence amber, signal coral, growth cyan used consistently); label style (one container type: silkscreen, chip nameplate, trace tag, test-point marker, or sentence strip); high-angle aerial camera; carrier-trace language (smooth copper trace, same width/curve); metaphor world (AI training board, sensor network, debug station, clock tree, or power domain — do not switch mid-set).

**Changes per image / 每张变化:** specific relation from `references/relationship-grammar.md`; scene focus (new action station, component cluster, or state board); worker action (new physical verb); throughline state (broken → soldered, dim → lit, scattered → routed, blocked → flowing); labels (new short labels per relation; shared motif labels may return).

## Series Roles

Assign each image a narrative role: opening → build → turn → resolution.

| Role | 角色 | Job |
|------|------|-----|
| Opening / 开场 | Frame question or world | Anchor tension, broken trace, unanswered state |
| Build / 展开 | Explain mechanism | Worker routing, soldering, sensing, switching |
| Turn / 转折 | Tension or contrast | Fault, probe, boundary, reframing |
| Resolution / 收束 | Payoff | Delivered signal, confirmed trace, breathing room |

**Recommended patterns:**

| Length | Pattern | Example rhythm |
|--------|---------|----------------|
| 2 | Opening+Build → Resolution, or Opening → Resolution | 问题 → 结果; 断路 → 通路 |
| 3 | Opening → Build/Turn → Resolution | 开场 → 动作 → 收束 |
| 4 | Opening → Build → Turn → Resolution | 信号 → 路由 → 校验 → 交付 |
| 6 | Opening → Build A → Build B → Turn A → Turn B → Resolution | 问题 → 拆解 → 连接 → 阻力 → 校验 → 收束 |

When the article allows, include at least one human-domain image (art, life, psychology) — do not make every image a product workflow.

## The Throughline Trace / 主路径串联

One continuous copper carrier trace runs across the whole set. Image N ends where image N+1 begins. The trace is the article's argument made visible.

**Handoff rules:** end state of image N = start state of image N+1 (trace position, component state, worker posture). State the handoff in the series plan. Worker and trace progress together; do not reset to idle unless the article explicitly resets.

**State progression axis** — pick one and advance each image:

| Axis | Start | End |
|------|-------|-----|
| Trace condition | broken, blocked, dim, jagged | soldered, flowing, lit, smooth |
| Signal clarity | noisy, scattered, weak | focused, routed, strong |
| Boundary | flooded, merged, shorted | separated, filtered, clean |
| Evidence | unverified pile | flagged, confirmed reading |

Labels should reflect current state (e.g., 断路 → 探测 → 修复 → 确认).

## Motif & Callback / 原元素串联

A recurring small primitive or label returns across the set and pays off in the final image — the "原元素串联" feeling. Pick one prop from `references/primitives.md` (test point, error flag, empty socket, gauge reading, status badge, LED indicator). Introduce early, transform mid-set, return transformed in resolution. Keep same PCB material and label style; change state only.

**Per-image relation vs set motif:** relation comes from `references/relationship-grammar.md` (what one figure explains); motif is the recurring primitive tying figures together. One image = one relation; the whole set = one motif arc.

Example: copper carrier trace (throughline) + error flag (motif) un-lit in image 2, red in image 3 (fault found), green in image 4 (fault confirmed fixed).

## Series Planning Template

```text
article throughline:
set length:
shared world / worker / palette / label style:
per image:
  - anchor:
  - relation (from relationship-grammar):
  - worker + action:
  - scene / primitives:
  - throughline state:
  - labels:
continuity checklist:
```

Add per-image `role` (opening / build / turn / resolution) when planning. Checklist items: same worker identity; same label container style; same high-angle camera and world; throughline progresses (image N end = image N+1 start); motif introduced and pays off; no redundant images; at least one human-domain image when the article allows.

## Avoid

- Same scene repeated with only label swaps
- Disconnected styles between images
- Redundant images that restate the same relation
- A set that is just one idea × N (no progression, no turn)
- Throughline that does not progress
- Engineering components forced into art/life articles without reason
- Switching worker families without narrative cause

## Accept / Regenerate — Series Coherence

### Accept

- The set reads as one system in under ten seconds of scrolling.
- Shared world, worker identity, palette, and label style are visible across all images.
- Each image has a distinct relation and role; none are redundant.
- The throughline trace or state axis progresses; image N end = image N+1 start.
- A recurring motif appears, transforms, and pays off in resolution.
- Intra-image chaining is clear: one carrier path per image, worker on the path.
- The set would weaken if any image were removed or reordered without reason.

### Regenerate

- Images look like different style guides or prompts.
- Throughline does not progress; every image shows the same state.
- The set is one idea repeated N times with cosmetic variation.
- Worker resets to decorative standing; label style jumps between containers.
- Motif is introduced but never pays off; reordering images does not change meaning.
- Cross-image handoff is broken.

### Repair moves

If the set feels disconnected:

```text
Regenerate the series plan first. Lock shared world, worker family, palette, and label style. State the throughline axis and per-image throughline state. Ensure image N end = image N+1 start before regenerating individual images.
```

If the throughline does not progress:

```text
Regenerate with an explicit state axis (broken→soldered, dim→lit, blocked→flowing, scattered→routed). Each image must show a different throughline state on the copper carrier trace and matching labels.
```

If motif never pays off:

```text
Regenerate the resolution image so the recurring primitive returns in its transformed state. The reader should recognize the motif from image 1 or 2.
```
