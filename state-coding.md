# State Coding / 状态编码

State coding carries exact status — degree, stage, outcome, quality — with no extra words. Where `references/primitives.md` supplies the nouns of a scene, state coding supplies its precision: how each primitive is drawn so its status reads instantly and consistently. Consistent encodings are what keep a complex multi-state scene readable instead of noisy, and reusing the same encoding for the same state across a series is what lets a reader trust the pictures.

Read this with `references/style-dna.md` for the palette and label rules, and with `references/primitives.md` for the objects these encodings attach to.

## Color Semantics / 色彩语义

Formalize the palette named in `style-dna.md`. Each color means one thing; reuse it that way across the set.

- **Solder Silver · 焊银** — structure and outline; the bones of the worker and joints.
- **PCB Green · 板绿** — neutral body / default state; the unremarked baseline of the board.
- **Quiet Gray · 静灰** — inactive, background, or done; what is present but not live.
- **Signal Blue · 信号蓝** — the live route, current flow, active reader path (also carrier trace color).
- **Evidence Amber · 证珀** — proof, attention, the thing to notice; effort, strain, debugging.
- **Signal Coral · 信号珊瑚红** — failure, cost, stop, the danger; error, broken trace, blocked path.
- **Growth Cyan · 生长青** — gain, healthy, improved, the positive change; relief, convergence, payoff.
- **Focus Accent · 焦点色** — the single most important point in the image; chosen per scene.

Rule: keep ≤ ~4 semantic colors active in one image. Use exactly one focus accent — never two points competing for the eye. Always pair color with form (thickness, texture, LED state); color reinforces status, it should never be the only thing carrying it.

## Path Encoding / 路径编码

How a copper carrier trace or bus reads at a glance.

- **Thickness** — importance or volume; a wider trace carries more weight or traffic.
- **Texture** — solid = certain / confirmed; dashed = tentative / proposed; dotted = broken or intermittent.
- **Color** — status, per Color Semantics above (signal blue live, signal coral failing, quiet gray done, copper gold focus accent).
- **Direction markers** — small silkscreen arrows or test-point markers show flow direction.
- **Width taper** — a trace that narrows along its length shows flow or volume reducing.
- **Broken vs mended** — a snapped trace with a solder bridge or jumper shows a failure that has been repaired.

## Elevation & Layering / 高度与层次

Depth carries priority without words.

- **Raised** — active, current, or priority; the component is lifted off the board surface (taller solder joints, standing chip).
- **Recessed** — background, inactive, or done; the component sits lower and quieter (flush mount, dim solder mask).
- **Stacked** — hierarchy; higher layers depend on or build from lower ones (chip-on-chip, daughterboard on motherboard).
- **Overlap** — a component lying over another reads as on top of, newer, or masking it (shield can over circuit area).

## Gate / Threshold States / 闸门与阈值状态

A relay or switch's posture is its verdict.

- **Open / 开** — pass; the signal flows through.
- **Ajar / 半开** — hold; conditional, partial, or pending.
- **Closed / 关** — blocked or not yet reached.
- **Locked / 锁** — reject; hard-stopped, sealed.
- Pair with a **status badge** (通过 / 搁置 / 拒绝) only when the posture alone could read as ambiguous.

## Edge & Surface States / 边缘与表面状态

The condition of a solder joint or board surface tells its history.

- **Crisp / 光洁** — new, clean, untouched; shiny silver dome, clean fillet.
- **Torn / 撕裂** — damaged, broken, or contested; cracked solder joint, lifted pad, jagged trace break.
- **Mended / 修复** — broken then repaired; solder bridge over gap, reworked joint, green flag.
- **Sealed / 封装** — closed off, protected, or final; conformal coating, shield can sealed.
- **Reflowed / 重熔** — worn from repeated handling; slightly different solder color, rounded edges.
- Surface: **clean / 干净** vs **marked / 标记** vs **stamped / 盖印** — unremarked, silkscreened, or officially verified.

## Light & Emphasis States / 光与强调状态

Where the LED glows, the eye goes.

- **Lit / 明亮** — present and legible; component with active LED or glow.
- **Dim / 暗淡** — present but secondary; recessed importance, standby state.
- **Spotlight / 聚光** — the focus accent; the one component pulled forward with brightest LED.
- **Shadowed / 投影** — cost, consequence, or footprint cast behind something; dark area under a raised chip.
- **Backlit / 透光** — a translucent board layer lit from behind to reveal hidden copper traces beneath.

## Tab & Marker States / 标签与标记状态

How a silkscreen label, test-point marker, or status badge encodes membership and status.

- **Filled vs outline** — filled badge = active / complete; outline badge = pending / empty.
- **Checked vs flagged** — a check mark = done or passed; a flag = at-risk or to-review.
- **Grouped by color** — badges sharing a color belong to one path, state, or category.
- **Sequence** — badge order, row position, or a number shows where something falls in a series.

## Degree & Quantity / 程度与数量

Show amount and intensity with form, not numbers.

- **Size** — bigger component means more, or more important.
- **Count** — the number of chips, LEDs, or test points shows quantity.
- **Slider position** — where a trim-pot marker sits along its range shows the level.
- **Scale tilt** — a comparator's output lean shows which side outweighs.
- **Stack height** — a taller chip stack means more accumulated.
- **Gauge needle** — the gauge needle's angle shows intensity or fill.
- **Fill level** — how full a FIFO buffer or counter register is drawn shows quantity remaining or consumed.

## Worker Expression States / 操作员表情状态

The worker's LED dots are a state encoding too. One or two tiny colored dots on the soldering-cap face read the worker's relationship to the work — how hard, how sure, how settled — without any text. Use it only when that state matters; otherwise keep the cap blank (no visible LEDs).

- **Neutral / 平静** — no LED glow, blank silver cap; the default, when no state needs reading.
- **Effort / 吃力·专注** — amber LED pair, slightly intensified; the worker is straining or concentrating (e.g. soldering a fine-pitch joint, pulling a taut signal trace).
- **Focus / 凝神** — green LED, narrow and steady; careful inspection, calibrating, probing.
- **Strain / 受压** — red LED pair, slightly brighter; the work is heavy or going wrong (pairs with signal coral nearby, broken trace).
- **Relief / 舒展** — cyan LED, soft glow; a beat has resolved (pairs with signal blue or growth cyan, soldered trace).
- **Satisfaction / 落定** — green LED, calm and steady; the deliverable is done (e.g. after the status badge turns green).
- **Care / 照料** — amber LED, lowered and soft, facing the work; tenderness, in life/psychology scenes (shielding a fragile signal, grounding noise for a sensitive circuit).

Rules: one expression per worker; tiny LED dots only, no realistic features; profile or three-quarter, looking at the work, never head-on; in a series, progress the expression with the throughline (e.g. focus → strain → relief). If removing the LED changes nothing about the meaning, keep the worker blank-faced. The LED state must serve the state or relation — an amber LED while debugging a broken trace is state; a happy green glow aimed at the reader is mascot.

## Encoding Budget / 编码预算

Do not stack encodings until the scene screams.

- Pick the 1–2 encodings that carry the article's precision (e.g. path texture + one color, or elevation + a gauge).
- Everything else stays neutral — PCB green, quiet gray, crisp solder joints, flat lighting.
- If a scene needs a third encoding, ask whether the article truly requires it or whether the image is becoming a dashboard.
- One focus accent, always; the rest of the color budget is shared by the active encodings only.

Good examples:

- An article about debugging: use trace condition (broken vs soldered) and solder joint state. Leave LED colors neutral green.
- An article about tradeoffs: use signal strength (thick vs thin traces) and relay states. Leave solder joints all clean.
- An article about growth: use LED color progression (off → amber → green → cyan) and component activity. Leave trace conditions all active.

Bad examples:

- Every dimension is different: LED colors vary, traces break and glow, solder joints crack, signals clip — the reader cannot tell which encoding matters.
- Two dimensions encode the same meaning: both LED color and trace width show "strength" — redundant and confusing.

## Accept / Regenerate

Accept:

- Status reads in three seconds with no extra text.
- Each color, trace condition, or relay posture means one consistent thing across the set.
- The scene uses ≤ ~4 semantic colors and exactly one focus accent.
- Only the encodings that carry the article's point are active; the rest stay neutral.
- Broken, dim, or cracked states are used to mean something, never as decoration.
- Worker LED expression encodes the worker's own state; component LEDs encode the circuit's state; these are never confused.

Regenerate:

- Two points fight for the focus accent.
- Too many simultaneous encodings make the scene read as a dashboard.
- A color or trace condition is used decoratively with no assigned meaning.
- Status relies on unreadable tiny text instead of form, color, or posture.
- Encodings contradict each other (e.g. a "done" component lit brighter than the live one).
- Worker LED expression is mascot (aimed at reader, charming but meaningless) instead of state.
