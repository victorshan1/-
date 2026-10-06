# Fast Channel / 快通道

Use this reference when the request is simple enough to skip the full 22-step workflow. The fast channel trades planning depth for speed, using a proven prompt structure that minimizes retries.

This is the "high freedom" channel per the 3-tier freedom methodology: give the direction and a template, do not prescribe every step.

## When to Use Fast Channel

All of these must be true:

- **Single image** — not a multi-image series
- **Single core concept** — one relationship, one main idea
- **Standard relationship** — pipeline, feedback, hierarchy, contrast, or tree/fan-out (not a novel hybrid)
- **No exact data** — no precise values, names, or categories that must be pixel-accurate
- **No series consistency** — does not need to match prior images in a set

If any condition is false, use the Slow Channel (full 22-step workflow in SKILL.md).

## Fast Channel Workflow (6 steps)

### Step 1: Intent (30 seconds)

Read the user's request. Extract:

- **audience**: who reads the article
- **feeling**: what they should feel
- **one sentence**: the single claim the image must convey

Do not write a full planning JSON. One sentence is enough.

### Step 2: Relationship (30 seconds)

Name the relationship type and direction. Pick from:

| Type | Direction | Encoding |
|------|-----------|----------|
| pipeline / sequence | left-to-right | linear traces, staged chips |
| feedback / loop | circular | return trace, glowing cyan |
| hierarchy / stack | bottom-to-top | stacked boards, header pins |
| contrast / comparison | side-by-side | differential pair, split bus |

If the relationship is novel or hybrid, escalate to Slow Channel.

If the input is classical Chinese text (易经/道德经/庄子/论语/文论), check `references/classical-chinese-adaptation.md` for the right relationship type and concept mapping before proceeding. Classical cosmological relationships (emanation, cyclic order, harmony convergence) may still fit Fast Channel if the concept is single and the mapping is clear.

### Step 3: Worker (30 seconds)

Pick a worker family and define its physical action:

- **family**: Router / Encoder / Builder / Shield / Sensor / Switcher / etc.
- **action verb**: soldering / routing / sensing / switching / bridging / shielding
- **touch point**: which component does the worker physically touch?

The worker MUST physically touch a component. "Standing beside" = decorative = fail.

### Step 4: Template Fill (1 minute)

Fill the proven prompt template below. This structure is battle-tested: it passed all 6 QA checks on the first attempt in example-4. The structure is the reason it works — do not rearrange.

**Fill with narrative, not checklist (v2.6.1 rule)**: when filling the scene block and the metaphor sentence, describe what the worker does and what happens along the trace as a small story ("the gear-CPU is the origin of the universe; six golden dragons swim along the traces toward the four quarters; the clock dome preserves what has rained down"), not as a feature list ("includes gear CPU, six dragons, clock dome"). Both pass the same Pass 0 checks, but the checklist fill produces visibly flatter images — validated side by side at 9/10 vs 4/10 richness. Write the story first, let the checks verify it after; never assemble the prompt from the check list.

### Step 5: Generate

```bash
z-ai image -p "{filled_template}" -o "./output.png" -s 1344x768
```

### Step 6: Auto-QA (single pass)

Run VLM check. Two outcomes:

- **PASS** → return image. Done.
- **FAIL** → **escalate to Slow Channel**. Do not retry in fast channel with ad-hoc adjustments; the fast channel template is already the optimized structure. If it failed, the request needs the full workflow (creative divergence, full planning, retry loop).

## Proven Prompt Template

This structure is the core of the fast channel. It encodes lessons from failure cases F1-F7. The order is not arbitrary — it is the structure that minimizes element loss.

```
[Worker block — first, most important, never dropped]
A small soldering-cap robot with a round silver soldering-iron cap head, rectangular green PCB body, and tiny jointed arms is {action_verb} the {component_name} with {tool}. The robot is the main focal point, positioned at the {position} of the scene. The robot's LED has one {led_state}.

[Narrative carrier trace block — the reader's eye path]
A thick bright narrative carrier trace (3-4mm wide, gold-copper) runs from {source_component} through the worker's action point to {result_component}, with visible direction arrows and solder-station markers along its length. This trace is the reader's path through the image.

[Scene block — middle, supports the worker]
{metaphor_world_sentence}. {component_1_description}. {component_2_description}. {component_3_description}. {component_4_description if needed}.

[Ambient light block — three-zone lighting for depth and warmth]
Warm amber light (3000K) illuminates the focal zone where the worker acts, making copper traces glow gold. Neutral white light along the carrier trace path. Cool blue-gray ambient light (6000K) fills the background and non-focal areas. Foreground components are sharp with warm shadows; background components have gentle blur. Soft warm shadows on the PCB surface, never pure black.

[Context lock block — prevents Swap Test failure]
{1-2 sentences that add specific, non-generic details tying the image to THIS article's context. Example: "A small copper nameplate reads 'Skill'." or "Three connector port shapes (USB, pin-header, edge-card) represent MCP, CLI, API."}

[Constraint block — last, ensures labels and style]
Mandatory Chinese labels on raised PCB nameplates (small brass plates physically raised above the PCB surface with engraved text and metallic beveled edges): {label_1} on {component_1}, {label_2} on {component_2}{, label_3 on component_3, label_4 on component_4}. All labels must be clearly visible and readable. The board surface is green solder-mask with gold-copper traces, silver solder joints, raised 3D components throughout. Tactile solder texture, copper sheen, clean editorial composition, generous margins. No flat schematic, no cartoon eyes, no humanoid face, no mascot sticker, no fake dense text, no stock PPT icons. Editorial, tactile, publish-grade, 16:9 horizontal.
```

### Why This Structure Works

| Block position | Block name | Why this position |
|----------------|-----------|-------------------|
| First | Worker block | Image models prioritize early prompt text. Worker first = worker never dropped (failure case F2, F7). |
| Middle | Scene block | Supports the worker with context. Mid-position is safe — not dropped, not dominant. |
| Middle-late | Context lock block | Specific details that make the Swap Test fail (image locked to THIS article). Must come before labels. |
| Last | Constraint block | Labels and style constraints are fragile (failure case F3). Last position = explicit and emphatic. The model treats final-sentence instructions as mandatory, not optional. |

### What NOT to Do

- Do NOT put labels in the first paragraph — they will be dropped (F3).
- **Return traces** must be described as "bright thick" and "clearly visible" — otherwise the model skips them (learned from example-5 attempt 1 failure).
- **Labels** must have explicit "ONLY ONCE" and "Do NOT render as background text" constraint — otherwise the model duplicates each label as large background text above the chips (learned from example-7 text overload failure).
- Do NOT put the worker in the last paragraph — it will be dropped (F7).
- Do NOT skip the context lock block — Swap Test will fail (F1).
- Do NOT add more than 4-5 component descriptions — the model drops elements when prompt is overloaded (F7).
- Do NOT retry in fast channel — escalate to slow channel instead.

## Fast Channel vs Slow Channel

| Dimension | Fast Channel | Slow Channel |
|-----------|--------------|--------------|
| Steps | 6 | 22 |
| Planning JSON | None (1-line intent) | Full (all fields) |
| Creative divergence | Skip (use closest standard metaphor) | Required (3+ candidates) |
| Prompt structure | Fixed template | Flexible, content-driven |
| QA | Single pass, escalate on fail | 3-attempt retry loop |
| Retry budget | 0 (escalate on fail) | 2 (3 total attempts) |
| Typical time | ~1 minute | ~3-5 minutes |
| Freedom level | High (direction + template) | Low (full step-by-step) |
| Best for | Standard concepts, single images | Novel concepts, series, data-accurate |
