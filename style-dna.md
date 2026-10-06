# Circuit Workers Style DNA / 电路工风格 DNA

Use this reference before final image generation.

Circuit Workers is a tactile PCB-diorama illustration system for article body images. Its identity comes from soldering-cap robots performing conceptual actions inside a clean editorial circuit-board scene.

## Chinese-First Default

When the user writes Chinese, plan and describe the image in Chinese. The default image must include readable Chinese labels, not empty label placeholders. For publish-critical wording, the model may use shorter labels and the final answer should note any text that may need manual overlay.

Default label rule:

- Use 3-6 short labels for simple figures.
- Use more labels when the article truly needs a multi-state, multi-path, comparison, or grouped diagram.
- Each Chinese label should usually be 2-6 characters.
- Attach labels to components, traces, pins, chips, pads, test points, or silkscreen areas.
- A single readable sentence strip is allowed when it clarifies the takeaway; do not use dense paragraphs, tiny fake text, or empty labels as the default.
- Use blank label containers only when the user explicitly asks for post-production overlay or editable text.

Good Chinese label containers:

- PCB nameplates (铜牌铭牌) — raised brass plates with engraved text, highest readability
- silkscreen prints on PCB surface
- component name markings
- pin function labels
- test-point markers
- chip nameplates
- trace tags along copper paths
- debug probe labels

Avoid floating captions, dense fake Chinese, and text-empty placeholder scenes.

## Core Look

- 16:9 horizontal by default.
- Green solder-mask PCB background, subtle solder texture and copper sheen.
- Electronic components, raised chips, copper traces, solder joints, clean editorial composition.
- Silver soldering-cap robots with small rectangular green PCB bodies, tiny jointed arms performing the action.
- Small semantic LED indicators on the worker or tool: signal green, alert amber, error red, growth cyan.
- Main colors stay restrained: PCB green, copper gold, solder silver, trace blue, signal amber, error red, growth cyan, plus one domain accent when needed.
- Use one circuit worker unless the concept truly needs a relationship between two workers.
- The worker is usually 8-18% of canvas height.
- The image should work inside an article column, not only as a poster.

## Ambient Light Strategy / 环境光策略

The circuit worker world is inherently industrial — green PCB, dark background, metallic components. Without deliberate ambient light design, images feel cold and flat. The ambient light strategy adds warmth, depth, and editorial quality, borrowing from paper-craft diorama lighting.

### Three-Zone Lighting

- **Focal Zone (warm amber)** — the focal module and the worker's action point receive warm amber light (3000K equivalent). This creates a "desk lamp" effect that draws the reader's eye to the most important part of the scene. Warm light makes copper traces glow gold and labels feel inviting.
- **Active Zone (neutral white)** — components along the narrative carrier trace between source and result receive neutral, balanced light. This keeps the reader path visible without competing with the focal zone.
- **Quiet Zone (cool blue-gray)** — background PCB areas, non-focal components, and empty solder mask receive cool blue-gray ambient light (6000K+). This creates depth by pushing background elements back and making foreground elements pop.

### Depth Layers

- **Foreground** — sharp, crisp focus, full detail, warm light. The worker and focal module live here.
- **Midground** — slight softening, neutral light. Secondary components and carrier trace segments.
- **Background** — gentle blur (not heavy bokeh), cool ambient. PCB texture, distant components, atmosphere.

### Shadow Rules

- Components cast soft, warm shadows on the PCB surface — not harsh, not invisible.
- Raised nameplates and chips have visible beveled edges with highlight + shadow.
- The narrative carrier trace has a subtle glow halo when it passes through the focal zone.
- Shadows are never pure black — use dark teal or dark warm gray for a tactile, non-digital feel.

### Reject

- Flat, uniform lighting — every component equally lit, no focal hierarchy.
- Pure white or pure blue lighting — feels clinical, not editorial.
- Heavy bokeh blur — loses the PCB-diorama tactile quality.
- No shadows at all — components look pasted on, not placed on the board.
- Glowing everywhere — when everything glows, nothing is focal.

## Aerial PCB-Diorama Mode

Use this mode when the user asks for "more beautiful", "more three-dimensional", "like the reference image", "high-angle", "PCB model", "立体", "高空视角", or "芯片视角".

Rules:

- Use a high-angle or shallow isometric PCB-board view.
- Build a miniature circuit-board diorama, not a flat schematic.
- Make every concept a tangible electronic part: chip, relay, sensor, capacitor, inductor, LED array, socket, bus bar, trace junction, crystal, or test point.
- Use one flowing copper carrier trace as the reader path when the image has a process or transformation.
- Let complexity match the article. Simple claims should stay simple; complex relationships may use more components, states, and traces when the labels, routes, and state coding stay clear.
- Make labels beautiful as components: silkscreen text, chip markings, pin labels, trace tags, test-point annotations.
- Include readable labels by default. Simple figures use a few short labels; complex figures may use more grouped labels and one sentence strip if readability remains high. Use blank label containers only as an explicit overlay mode.
- Let the circuit worker touch the carrier trace, sensor, relay, switch, capacitor, or bus. Do not let the worker stand beside the scene.

Reject if it becomes:

- a flat circuit schematic
- equal-weight dashboard cards
- a grid of identical chips with no visual argument
- a busy motherboard photograph with no focal point
- a poster with PCB texture but no actionable circuit worker
- a pretty scene with no readable text

## Circuit Worker Rules

The worker:

- has a round silver soldering-cap head (like a tiny soldering iron tip)
- has a small rectangular green PCB body with visible trace patterns and a tiny component or two
- may have simple jointed arms only to perform the action
- carries one tool that matches the article domain
- is secondary to the idea but essential to the relation
- may wear one simple LED eye-expression when it encodes the worker's state; otherwise stays calm and blank-faced (no visible eyes)

The tool does the storytelling. The body and one quiet LED state carry the state.

### Simple Expressions (state, not decoration)

The worker may have a minimal LED eye-pair when it helps the reader read the worker's STATE — focus, effort, strain, relief, alert, or standby. The worker's whole job is state and connection, so a small LED indicator is a legitimate state-coding device, not mascot cuteness. A calm, no-LED worker is still fine and is the default when no state needs reading.

Rules for expressions:

- Render the eyes as one or two tiny colored dots on the soldering-cap face: green = active/focus, amber = effort/strain, red = alert/error, cyan = growth/relief, off = standby.
- Keep it minimal and sparse. No cartoon eyes, no pupils, no eyebrows, no mouth. The simplicity is exactly what avoids the uncanny valley and keeps the robot identity.
- Prefer profile or three-quarter views, with the worker facing its work, not staring at the reader. A face turned toward its task reads as state; a face turned flat at the camera reads as a mascot.
- One LED state per worker, matched to the article's beat. Across a series, let the LED state progress with the throughline state (e.g. amber during 调试, green at 交付).
- Still not a cute robot: tiny LED dots on a silver cap, not big cartoon eyes on a round face.
- Still not a mascot: the LED state must serve the state or relation. If removing the LED changes nothing about the meaning, keep the worker blank-faced.

## Not Generic Robot

This skill may learn from robot visual traditions: a recurring character must do the conceptual work. It must not copy generic robot mascot identities.

Do not use:

- round white head with big cartoon eyes
- humanoid body with arms and legs
- smiley face or expressive mouth
- cute posture or waving hand
- a small friendly robot repeated across every image
- generic robot composition replicas

The simple LED dot expressions allowed above are different from generic robots: they are tiny colored indicators on a soldering-cap head, never big cartoon eyes on a round face.

## Not Mascot

Do not make the circuit worker:

- cute-first
- expressive for charm rather than for state (a happy glow that says nothing about the work)
- waving, grinning, or presenting at the reader, or standing beside the board
- a sticker
- a logo character
- a generic office worker
- a humanoid, avatar, head icon, or silhouette

LED expression is allowed only as a state signal (see Simple Expressions). The line between "state" and "mascot" is simple: an amber LED while debugging a broken trace is state; a happy green glow aimed at the reader is mascot.

## Relationships As Dioramas, Not Schematic Icons

Circuit Workers carries a deep vocabulary of relationships and circuit structures (see `references/relationship-grammar.md`, `references/worker-library.md`, and `references/primitives.md`). That vocabulary is a list of relations to EXPRESS, not a set of schematic icons to PCB-ify.

Do not flatten a relationship into a small circuit-textured schematic symbol — a flat chip with pins, a flat trace with nodes, a flat resistor divider — sitting flat on the page. A reference board of PCB-textured schematic icons is fine as a catalog, but as an article image it is just a schematic with PCB grain.

Instead, stage the relation as a layered, three-dimensional PCB diorama:

- arrange the worker's components and traces so their physical placement IS the relation: stacked, nested, branched, merged, gated, switched, or looped.
- let a carrier trace, a bus, or a signal path guide the eye through the relation.
- let the worker's action and LED state perform and feel the relation.
- use real depth: foreground action, mid-board components, back solder mask; raised components for what is active, recessed areas for what is done.

This is why the style is loved: it carries schematic-level information density, but in a tactile 3D PCB world that is eye-catching, uncrowded, and readable in one glance. A flat icon grid loses exactly that. Use the schematic vocabulary to decide WHAT relation to show; use the 3D PCB diorama, the components, the trace routing, and the worker's state to decide HOW to show it.

## World-Class Quality Bar

Accept only if:

- the idea reads in three seconds
- the circuit worker physically routes, solders, senses, switches, encodes, debugs, shields, calibrates, amplifies, grounds, filters, or bridges something
- the composition has a clear focal module and generous quiet zones
- labels are short and attached to components, traces, pins, chips, or pads
- the domain feels specific, not generic chips pasted onto every article
- the image feels editorial, tactile, and publishable

Reject if:

- the worker is decorative
- the image looks like a flat circuit schematic
- it uses stock electronics icons
- it has fake dense text
- it is charming but unclear
- it is accurate but visually lifeless
