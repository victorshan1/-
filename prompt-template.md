# Prompt Template / 提示词模板

Use one image at a time.

## Channel Selection / 通道选择

Before planning, decide which channel to use:

- **Fast Channel** (`references/fast-channel.md`): 6-step workflow, fixed template, single QA pass. Best for standard concepts, single images, no exact data. ~1 minute.
- **Slow Channel** (full workflow below): 22-step workflow, full planning JSON, creative divergence, 3-attempt retry loop. Best for novel concepts, series, data-accurate requests. ~3-5 minutes.

If unsure, start fast. If fast channel QA fails, escalate to slow.

## Fast Channel Template

See `references/fast-channel.md` for the full 6-step workflow and the proven prompt structure (worker first, scene middle, context lock, labels last). That structure is battle-tested — it passed all 6 QA checks on the first attempt in example-4, while the unstructured version took 3 attempts.

## Slow Channel: Planning Template

```text
Use $circuit-workers. First plan, do not generate yet.

Source anchor:
{quote / paragraph / concept}

Return:
- reader takeaway
- domain and mood
- core action
- whether to use a Circuit Worker
- what breaks if removed
- worker family
- metaphor world
- composition
- label plan
- final generation prompt
- QA risks
```

## Slow Channel: Final Generation Prompt

```text
Generate one standalone 16:9 horizontal article illustration in the Circuit Workers style.

Article context:
{one sentence}

Source anchor:
{specific claim, sentence, or paragraph}

Reader takeaway:
{one sentence}

Domain and mood:
{AI/ML / engineering / business / product / education / science / finance / culture / personal essay / other; mood}

Core action:
{route / solder / sense / switch / encode / debug / shield / clock / power / bridge / filter / modulate / amplify / ground / calibrate / extract / tune / decode}

Circuit worker:
- use one soldering-cap robot worker, not a mascot.
- worker family: {Router / Sensor / Switcher / Trainer / Feature Hunter / Debugger / Pipeline Builder / Metric Amplifier / Tradeoff Bridge / Shield / Memory Keeper / Clock Keeper}.
- action: {physical verb}.
- object acted on: {copper trace / chip / relay / sensor / capacitor / comparator / shield can / crystal / LED array / bus bar / probe / display module}.
- relation clarified: {what the action explains}.
- what breaks if removed: {the relation becomes less clear}.
- appearance: round silver soldering-cap head, small rectangular green PCB body with visible trace patterns, tiny jointed arms with one domain-specific tool, one small semantic LED indicator.
- LED expression: blank by default, or one simple LED-dot state (one or two tiny colored dots on the cap face) when it encodes the worker's state — {off=standby / green=focus / amber=effort / red=alert / cyan=growth}; profile or three-quarter, facing the work, never cartoon eyes, never humanoid face, never mascot grin.
- scale: secondary to the idea, usually 8-18% of canvas height.

Metaphor world:
{domain-specific circuit world from domain-adaptation.md}

Composition:
- one focal module
- generous margins
- calm PCB-diorama depth with three-zone ambient light (warm amber focal, neutral active, cool background)
- a thick narrative carrier trace from source component through worker action point to result component, with direction arrows and station markers — this is the reader's eye path
- clear start/change/result or before/action/after
- labels on raised PCB nameplates (brass plates with engraved text) for primary labels; silkscreen for secondary labels
- complexity should match the article: use the simplest sufficient form, but allow complex multi-state scenes when route, label, and state coding stay clear
- if using aerial PCB-diorama mode: high-angle board view, raised components, smooth narrative carrier trace, beautiful readable nameplate labels arranged near components

Style:
- tactile PCB diorama, editorial circuit illustration, clean solder-and-copper quality
- three-zone ambient light: warm amber (3000K) on focal zone, neutral white along carrier trace, cool blue-gray (6000K) background; foreground sharp, background gentle blur; soft warm shadows never pure black
- restrained palette: PCB green, copper gold, solder silver, trace blue, signal amber, error red, growth cyan, plus one domain accent when needed
- no flat schematic look, no stock electronics icons, no fake dense text
- no generic cute robot face, no big cartoon eyes, no humanoid body
- expression is allowed only as a state signal (LED color: focus, effort, alert, growth, standby); no mascot glow aimed at the reader, no robot, avatar, silhouette, generic mascot, or sticker behavior
- relations should be staged as layered 3D PCB dioramas (component placement + trace routing + worker state), not flattened into PCB-textured schematic icons

Text:
Mandatory readable labels:
- include readable labels in the user's language
- for simple Chinese figures, use 3-6 short labels, usually 2-6 characters each
- for complex multi-state figures, add enough short labels to make states, paths, contrasts, and groups clear
- allow one readable sentence strip when it sharpens the takeaway
- primary labels on raised PCB nameplates (brass plates with engraved text and beveled edges) for highest readability; secondary labels as silkscreen prints, chip markings, pin labels, trace tags, test-point markers, or status badges
- do not leave labels blank unless the user explicitly requests post-production overlay
- do not generate dense fake text

Quality target:
publish-grade article body figure, clear in three seconds, visually memorable, elegant, domain-specific, not childish.
```

## Chinese-First Aerial PCB-Diorama Prompt Add-On

Append this block when the user asks for the newer polished style:

```text
Use high-angle aerial PCB-diorama composition: a miniature circuit-board scene with raised components, chips, relays, sensors, capacitors, LED arrays, bus bars, shield cans, or test-point stations. Let complexity match the article: simple ideas stay simple; complex relationships may use more states, paths, and components when the route remains legible. Use a smooth copper carrier trace as the main reader path if the concept has movement or transformation. Arrange Chinese labels as physical board elements: readable silkscreen prints, chip markings, pin labels, trace tags, test-point markers, or status badges. Avoid dense fake Chinese and avoid empty label placeholders unless post-production overlay is explicitly requested.
```

## Image Edit Prompt

```text
Use $circuit-workers to edit this image.

Keep:
- core idea
- PCB-diorama material
- soldering-cap robot worker identity (blank or one simple LED state)

Fix:
- make the worker perform the core action
- remove mascot behavior or decorative standing
- make labels shorter, clearer, and attached to the right components
- make the domain-specific tool clearer
- improve focal hierarchy and quiet space
```

## Execution / 执行命令

After the planning and prompt are finalized, generate the image:

### Option A: Direct CLI

```bash
z-ai image -p "{final_prompt}" -o "./output.png" -s 1344x768
```

- `-s 1344x768` is the closest supported size to 16:9.
- Other landscape sizes: `1152x864` (4:3), `1440x720` (2:1).

### Option B: Node.js Script (recommended)

Write your planning JSON using `scripts/plan-template.json` as the starting point, then:

```bash
node scripts/generate.js --plan ./my-plan.json --output ./output.png
```

The script:
1. Reads the planning JSON and extracts `final_prompt`.
2. Calls `z-ai image` with the closest 16:9 size.
3. Verifies the output and prints a generation summary.
4. Reminds you to run the QA checklist.

### Post-Generation

After generation:
1. Open the image and run `references/qa-checklist.md`.
2. Run the Swap Test: could this image illustrate a different article? If yes, regenerate.
3. If the image passes, record it using `references/prompt-records.md`.
