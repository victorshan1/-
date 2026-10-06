# Composition Modes / 构图模式

Use this reference when the content holds several beats and the question is whether to spread them across a series or hold them inside one dense image. The chaining layer in `references/series-and-chaining.md` already supports two moves: intra-image threading (one copper carrier trace, anchor → action → result) and inter-image chaining (a progressing set of figures). This reference adds the decision between those and a third option — a single image that carries MANY beats at once. Choosing the mode the content's own structure demands, instead of defaulting to a series or the flat "three chips on a trace," is part of precision. A logistics route that crosses the same bus four times reads better as ONE board than as four pictures.

Read this with `references/series-and-chaining.md` (when to chain across images), `references/primitives.md` (the kit these layouts are built from), and `references/state-coding.md` (the encoding that keeps many beats readable in one frame).

## Mode Decision: One Dense Image vs a Multi-Image Series

Pick the mode from the content, not from habit. Run these criteria before choosing primitives or planning a set.

| Signal | → One dense image / 单图多拍 | → Series / 串联 |
|--------|------------------------------|-----------------|
| Beats | 2–6 beats on ONE shared board, bus, or timeline | genuinely separate boards, domains, or time-jumps |
| Shared ground | every beat lives on one PCB, one system, one signal path | each beat needs its own board rebuilt |
| Reader value | the takeaway IS seeing all beats together at once | the reader is better paced one beat per scroll |
| Context | a single figure, a pull quote, a header card | a long article needing 2–6 paced body images |

Rule: when the beats share one board and the reader's takeaway is the simultaneity — four crossings on one bus, a whole system in one view, before and after in one glance — choose one dense image. When the beats are separate boards or the article needs paced scrolling, choose a series and defer to `references/series-and-chaining.md`. Do not default to either side; the content's own structure decides.

Multi-beat is not the same as the intra-image chaining already in `references/series-and-chaining.md`. Intra-image chaining threads the phases of ONE relation — anchor → action → result — along a single carrier trace, where each stop is a stage of the same idea. Multi-beat holds several DISTINCT events or positions that all belong to one board: four crossings, three domains, before and after. If the beats are phases of one action, use a plain threaded route; if they are separate happenings on shared board real-estate, use a multi-beat layout here.

## Single-Image Multi-Beat Layouts / 单图多拍构图

The key new capability. Each layout holds several beats in one frame. Readability comes from the same kit every time: number the beats, encode state with `references/state-coding.md`, give ONE focal beat the focus accent, and protect quiet zones. The layouts are built from the primitives in `references/primitives.md`; only the ARRANGEMENT is new.

### Threaded Route / 一线穿珠
One continuous copper carrier trace (`Copper Trace / 铜走线`) threads 2–6 numbered beats across a single board. The circuit worker walks the trace and touches it at the focal beat.
- Use for: a sequence of processing stages that share one board, where order matters and the whole arc is the point.
- Primitives: `Copper Trace / 铜走线`, number `Status Badge / 状态徽章`, optional `Bus Bar / 总线` underneath.
- Keep readable: number each stop with a small status badge on the silkscreen; dim the trace to quiet gray where it is done and keep it copper-gold where it is live; let ONE station carry the focus accent; leave breathing room between stations.

### Looping / Back-and-Forth Route / 往复穿行
A carrier trace that crosses the SAME component or bus several times — the repeated-crossing pattern. One board, one bus, one signal path; the trace folds back over it repeatedly.
- Use for: a multi-pass routing, iterative process, or argument that revisits the same node, whose meaning is the REPEATED crossing rather than four separate places.
- Primitives: `Copper Trace / 铜走线` in the `Looping / 环回` and `Climbing / 攀升` variants; the crossed feature as a `Bus Bar / 总线` or `Ground Plane / 地平面`; numbered crossing markers as `Test Point / 测试点`.
- Keep readable: put a numbered test-point marker on the feature at each crossing; vary direction with the carrier-trace variants; color the live route as the single focus accent against a neutral board; never let two crossings read as equal weight.

### Before → After in One Frame / 前后同框
A split or twin board holds the starting state and the ending state in one image, joined by a short carrier trace or a bridge connector across the seam.
- Use for: a transformation, repair, or contrast where the punchline is the change itself, seen in one glance.
- Primitives: one shared `Shield Can / 屏蔽罩` or a seam `Isolation Barrier / 隔离栏`; a connecting `Bridge Connector / 跨接器` or `Copper Trace / 铜走线` across the seam.
- Keep readable: one shared board or a clean seam; let state coding carry the change (broken → soldered, dim → lit, scattered → routed from `references/state-coding.md`) without extra text; the "after" side holds the focus accent.

### Radial / Clockwise Cycle / 环形循环
Beats arranged around a center and joined by a carrier trace that loops back to its start — a `Looping / 环回` trace closed into a ring.
- Use for: feedback loops, recurring processes, and anything that returns to where it began.
- Primitives: a `Looping / 环回` trace closed to a ring; a center `Chip / 芯片` for the focal beat or a quiet `Ground Plane / 地平面`; `Silkscreen / 丝印` markers around the orbit.
- Keep readable: place 3–5 beats clockwise on one orbit; number them so the entry point is obvious; keep the center as a quiet zone or hold the single focal beat there; a returning arrow badge marks it as a cycle, not a line.

### Nested Zoom / 嵌套缩放
The whole system sits in the frame, and one corner or inset magnifies a detail of it — an `Oscilloscope Probe / 示波器探针` or `Display Module / 显示模块` window opening onto a blown-up piece.
- Use for: a part-whole story where the reader must see the system AND one detail that explains it.
- Primitives: `Oscilloscope Probe / 示波器探针` or `Display Module / 显示模块`; a thin `Copper Trace / 铜走线` leader linking inset to whole.
- Keep readable: keep the whole as the main board and the zoom as a clearly framed inset; connect them with the leader trace; the inset holds the focus accent; do not zoom two things at once.

### Terrain / Map Holding a Whole System / 地形沙盘
One high-angle PCB diorama IS the stage; the beats are routes, positions, or domains placed on it. The board surface is the through-spine and every beat is a mark on the same ground.
- Use for: systems, networks, multi-site operations, or any content whose beats are all POINTS ON ONE BOARD — exactly the case where four separate images would be wrong.
- Primitives: `Depth layers` for the board; `Copper Trace / 铜走线` routes on its surface; `Chip Nameplate / 芯片铭牌` and `Test Point Marker / 测试点标记` to name domains and crossings.
- Keep readable: build the terrain from layered PCB; hold routes as copper traces on its surface; one route or one breach is the focus accent; the rest stays quiet.

### Cutaway with Layered Beats / 剖切分层
A single component sliced open to show its beats as layers, top-to-bottom or front-to-back — stacked board layers inside one package.
- Use for: a system, module, or process whose beats are its internal layers seen together.
- Primitives: layered `Via / 过孔` transitions inside one body; `Silkscreen / 丝印` on each layer; elevation from `references/state-coding.md`.
- Keep readable: one clean cut; number and name each layer on its silkscreen; use elevation (`Raised` active, `Recessed` done); the focal layer is the one lit or pulled forward.

## Packing Density Without Crowding / 密而不挤

This is why the style is loved: high information, but never crowded, never flat. A single dense image is only better than a series when it stays legible. Density survives crowding through five moves, all already in the kit:

- **Depth layering** — foreground action, mid-board components, back solder mask (`Depth layers` in `references/primitives.md`). Raise what is active, recess what is done. The 3D PCB diorama is what lets many beats coexist without colliding; a flat layout cannot hold them.
- **Grouping** — beats that belong together share one shield can, one bus bar, one domain color group; the eye reads clusters, not a wall of equal components.
- **One focal beat** — exactly one beat carries the focus accent (`Focus Accent · 焦点色`); every other beat stays quieter, in quiet gray, dim copper, or a thinner trace. Density without a dominant beat is a dashboard.
- **The route as through-spine** — a copper carrier trace threads the beats into one path, so the eye has a single route to follow instead of scanning.
- **Quiet zones** — generous margins and empty solder mask around the focal beat; dense does not mean full. Protect the quiet zone the way the article protects its key sentence.

Scale beats to the article, not to the canvas. Two or three beats stay generous; five or six need tighter grouping and a stronger single focal beat to avoid a dashboard. The encoding budget from `references/state-coding.md` still applies: pick the 1–2 encodings that carry the precision (numbering + one trace color, or elevation + a fault marker) and let everything else stay neutral.

## Worked Example — Four Transit Crossings in One Image / 单图案例

A logistics carrier that crosses the same hub four times reads as ONE board, not four images. This is the precise case for the looping route.

Composition:

- One high-angle PCB terrain diorama — raised copper pour regions and solder-mask channels as the stage, representing a logistics network.
- The central hub as a signal-blue bus bar (`Bus Bar / 总线` in signal blue 信号蓝) flowing across the board — the fixed transit node every routing pass returns to.
- The carrier route drawn over the bus bar FOUR times as a continuous copper-gold focus accent (焦点色, the single thing the eye must follow), folding back across the same signal line:
  - 一程西发 / first pass, heading west to the outbound depot;
  - 二程东返取货 / second pass, return east to pick up backlogged cargo;
  - 三程西行分流 / third pass west, dropping a decoy partial shipment to split demand;
  - 四程东转南下完成交付 / fourth pass east, then south to the final destination with the full load delivered.
- A quiet-gray congestion ring (`quiet gray · 静灰`) drawn as a closed trace around the carrier, representing capacity constraints, with the breach point marked in signal coral 信号珊瑚红 where the ring opens on the fourth pass — demand satisfied, constraint broken.
- The dispatcher — one soldering-cap worker — at the board edge, pointing along the route with a probe, with ONE simple LED state: focus (amber) through the first three passes, easing toward relief (cyan) at the final delivery. Profile view, looking at the work, never head-on, never a mascot.

Why one image beats four: all four beats share ONE board and the reader's takeaway IS seeing the repeated crossing of the same hub — simultaneity is the argument. Four separate images would each show one pass and lose that the carrier crossed the same transit node four times. Numbering (一 / 二 / 三 / 四) plus state coding (copper-gold live route, gray congestion ring, coral breach) keep every beat legible in one frame.

Do not draw: four separate boards; a flat 2D schematic with no PCB depth; two crossings sharing the copper accent so the route fragments; a busy miniature logistics map with no readable labels.

Palette check: signal blue bus (transit node) + quiet gray ring (capacity constraint) + signal coral breach (constraint broken) + one copper-gold focus accent (route) — three semantic colors plus the single focus accent, inside the budget from `references/state-coding.md`.

## When a Series Still Wins / 仍用串联

Choose `references/series-and-chaining.md` instead of a single dense image when:

- The beats are genuinely separate boards, domains, or time-jumps with no shared stage — forcing them onto one PCB would distort the content.
- The article is long and needs paced body images the reader scrolls through one beat at a time.
- Each beat deserves its own focal module and quiet zone; cramming them together would make focal beats compete.

When a series wins, still mine `references/variation-engine.md` to vary the frames within the shared world, and keep one throughline trace advancing across the set.

## Composition Planning Template / 构图规划模板

```text
mode decision:
  shared board (yes/no):
  number of beats:
  reader value (see-all-at-once vs paced scroll):
  chosen mode (one dense image / series):
layout (from this reference):
primitives (from primitives.md):
state coding (numbering + 1-2 encodings, from state-coding.md):
focal beat + focus accent:
quiet zones:
labels (status badges + short names):
why this mode beats the alternative:
```

## Avoid

- Forcing beats that belong to separate boards onto one PCB, or splitting beats that share one board across four images.
- Four equal-weight components with no focal beat, called "dense."
- A flat bus diagram or flat schematic with no depth — a multi-beat layout is still a 3D PCB diorama, never a PCB-textured chart icon.
- Two beats sharing the focus accent so neither can be read.
- A decorative carrier trace that does not actually thread the beats.
- Adding beats until the scene becomes a dashboard; if a third encoding is needed, ask whether the wrong mode was chosen.

## Accept / Regenerate — Single Dense Image

### Accept
- Every beat is legible and individually numbered or state-coded in one frame.
- Exactly one beat carries the focus accent; the rest stay quieter.
- Quiet zones survive around the focal beat; the image is dense, not full.
- A carrier trace, bus, or shared board threads the beats into one readable path.
- The scene is a 3D PCB diorama with depth layers, not a flat chart of equal cells.
- The mode choice matches the content's structure (shared board → one image; separate boards → series).

### Regenerate
- The image becomes a crowded dashboard of equal-weight components with no focal beat.
- It flattens into a PCB-textured chart icon or a flat icon grid (a flat timeline, a flat schematic with no depth, a flat pinout).
- Beats collide or share the focus accent so none of them can be read.
- Numbering or state coding is missing and the beats cannot be told apart.
- The reader would understand the content better with four separate images — a sign the wrong mode was chosen.
