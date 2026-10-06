# Classical Chinese Adaptation / 古文适配

How to adapt circuit workers to classical Chinese texts: 《易经》《道德经》《庄子》《论语》《诗经》《文心雕龙》and similar philosophy, cosmology, poetics, and moral discourse. These texts carry cosmological, cyclical, and harmonic relationships that the standard modern domains (pipeline, feedback, hierarchy) do not cover.

Read this reference when the source anchor comes from classical Chinese literature, traditional philosophy, or cultural cosmology. Do not force AI/ML or business metaphors onto these texts.

## When to Use This Reference

Trigger when the input matches any of:

- Direct quotation from classical Chinese canon (经/子/集)
- Cosmological or metaphysical concepts (天地/阴阳/五行/道/德/理/气)
- Moral discourse framed in classical language (仁/义/礼/智/信/君子/小人)
- Poetic or aesthetic theory (神韵/气韵/风骨/境界)
- Historical narrative using classical Chinese phrasing

If uncertain, check: does the text speak in terms of modern systems (pipeline, platform, product)? If yes, use `domain-adaptation.md`. Does it speak in terms of cosmos, virtue, cycles, or harmony? If yes, use this reference.

## Core Relationship Types for Classical Texts

Standard `relationship-grammar.md` covers 12 modern relationships. Classical Chinese texts often need relationships that map onto ancient thought structures:

| Classical concept | Relationship type | Visual encoding |
|---|---|---|
| 创生 / cosmogenesis | emanation / 源流 | central source chip → radiating carrier traces → peripheral modules lighting up in sequence |
| 周期时序 / cyclic order | cyclic sequence | circular carrier trace with phase markers, each phase a distinct module |
| 天地感应 / heaven-earth resonance | vertical resonance | top-domain and bottom-domain boards connected by resonance inductors, signal travels both ways |
| 变化 / transformation | state transformation | converter gate on carrier trace, before/after signal twins with LED color shift |
| 太和归一 / harmony convergence | convergence to equilibrium | multiple traces merging into one stable bus, all LEDs settle to calm green |
| 阴阳消长 / waxing-waning | dynamic balance | differential pair with opposing signal strengths, one grows as the other shrinks |
| 取法 / modeling | derivation | template chip above, derivative chip below, carrier trace with "derive" tag |
| 修身为本 / cultivation | recursive grounding | self-referential loop that grounds back to a foundation bus |

These extend — not replace — the standard relationship families. When a classical text describes a simple sequence or contrast, still use the standard types. Reserve these for genuinely classical concepts.

## Concept Mapping Table

Map classical Chinese terms to circuit-worker visual language. Each mapping preserves the philosophical meaning while making it tangible on a PCB stage.

### Cosmology / 宇宙论

| Classical term | Circuit translation | Component type |
|---|---|---|
| 乾元 / primordial yang | primary power core, the first chip to light up | large central CPU with gold-copper energy traces radiating outward |
| 坤元 / receptive earth | ground plane, the stable substrate all components sit on | wide bottom ground bus, matte finish, quiet |
| 太极 / supreme ultimate | oscillating crystal at center, beating between two states | crystal oscillator with dual-phase output |
| 两仪 / two modes | differential pair, yin-yang signal twins | two traces of opposite phase sharing one reference |
| 四象 / four images | four-quadrant sensor array | four labeled modules around a central crystal |
| 八卦 / eight trigrams | eight-phase decoder ring | eight small modules in a ring, each with a trigram-pattern silkscreen |
| 六爻 / six lines | six-stage shift register | six labeled register cells on a carrier trace |
| 六龙 / six dragons | six-phase clock drivers on a circular trace | six dragon-sculpture reliefs on copper traces, each driving a phase module |

### Process / 流转

| Classical term | Circuit translation | Component type |
|---|---|---|
| 云行雨施 / cloud-rain diffusion | signal distribution network, spreading from center to edges | radiating traces with distribution taps, condenser beads |
| 品物流形 / things taking form | multi-node activation, components lighting up as they receive signal | peripheral modules turning on one by one along carrier |
| 保合太和 / maintaining harmony | closed-loop regulator settling to equilibrium | feedback regulator with calm green LED, all traces balanced |
| 万国咸宁 / universal peace | all modules stable, all LEDs calm green | full-board steady-state, no alerts |
| 生生 / ceaseless generation | self-renewing cycle, output feeds back to input | circular carrier with growth-cyan return trace |

### Virtue / 伦理

| Classical term | Circuit translation | Component type |
|---|---|---|
| 仁 / humaneness | warm current source feeding all branches | current source with warm-white LED, multiple distribution traces |
| 义 / righteousness | threshold gate, only passes correct signals | comparator with clear threshold, reject/accept LEDs |
| 礼 / ritual propriety | clock and timing controller, everything in order | clock crystal with phase-synced modules |
| 智 / wisdom | signal processor / decoder, extracts meaning | DSP chip with input bus and decoded output |
| 信 / trust | stable reference voltage, everything calibrates to it | voltage reference diode, calibration probe |

### Aesthetics / 文论

| Classical term | Circuit translation | Component type |
|---|---|---|
| 神韵 / spirit-resonance | resonance inductor tuning the whole board | large inductor with faint glow, board hums at correct frequency |
| 气韵 / qi-rhythm | carrier trace with visible signal flow animation | thick copper trace with flowing signal beads |
| 风骨 / wind-bone | structural support bus + signal carrier | rigid bus bar + flowing signal trace in parallel |
| 境界 / realm | layered PCB domains, each at a different depth | stacked transparent boards, signal ascends through layers |

## Visual Palette for Classical Chinese

Default circuit-workers uses green PCB + copper + solder silver. For classical Chinese texts, these palette accents enhance cultural resonance without breaking the PCB world:

| Element | Default | Classical accent |
|---|---|---|
| PCB substrate | green solder-mask | bronze-green or jade-green solder-mask |
| Copper traces | copper-gold | gold-gold or bronze-gold for main carrier |
| Silkscreen | white | ivory or warm cream |
| Accent LED | domain-specific | jade-cyan for harmony, gold-amber for virtue, deep-indigo for profundity |
| Component finish | standard | bronze-tinted for cosmology, jade-tinted for aesthetics |

Do not repaint the entire board. Use classical accents only on the main carrier trace, key nameplates, and focal modules. Background components stay standard green to maintain visual coherence with the circuit-workers style DNA.

## Label Rules for Classical Texts

Classical Chinese labels require special handling:

- **Label count**: 3-5 labels maximum for classical texts. Fewer is better. These texts are dense; the image must not become a text board.
- **Label content**: use the classical term itself (乾元, 六龙, 太和), not a modern paraphrase. The label IS the concept.
- **Label placement**: attach to the focal component for each concept. One label per concept, one component per label.
- **Forbidden**: do not embed full classical sentences or passages as silkscreen text. A line like "大哉乾元，万物资始" must become a label "乾元" on the power core, not a paragraph on the board.
- **Pinyin**: do not add pinyin. Classical readers read Chinese; non-classical readers will not benefit from pinyin on a PCB.

## Worker Family for Classical Texts

The circuit worker in classical Chinese scenes should use softer, more contemplative actions:

| Worker family | Classical action | Tool |
|---|---|---|
| Clock Keeper / 时钟工 | calibrating the phase clock, timing the cosmic cycle | crystal tuning probe |
| Memory Keeper / 记忆工 | encoding a lineage trace, preserving the Way | memory cell writer |
| Router / 走线工 | routing the emanation from source to all things | carrier trace stylus |
| Shield / 屏蔽工 | guarding the stable equilibrium against noise | ground plane anchor |
| Sensor / 传感工 | sensing the resonance between heaven and earth | resonance probe |

Avoid: Debugger (too modern/debugging connotation), Trainer (too machine-learning). The worker in a classical scene is a keeper of order, not a fixer of bugs.

## Example: 《周易·乾卦·彖传》

Source anchor: "大哉乾元，万物资始，乃统天。云行雨施，品物流形。大明终始，六位时成，时乘六龙以御天。乾道变化，各正性命，保合太和，乃利贞。首出庶物，万国咸宁。"

Translation plan:

- **Relationship**: emanation (cosmogenesis) → cyclic sequence → convergence to equilibrium
- **Worker**: Clock Keeper, calibrating a six-phase crystal clock
- **Board world**: bronze-green celestial PCB, gold carrier traces, jade-cyan LEDs
- **Composition**: central 乾元 power core → six-phase clock ring → cloud-rain distribution traces → peripheral 量物 modules → 太和 regulator at edge settling everything
- **Labels** (5 max): 乾元, 六龙, 云雨, 品物, 太和
- **Worker action**: the clock keeper is tuning the six-phase crystal, aligning all dragon-phase modules

This produces an image where:
- The Swap Test fails for any non-乾卦 article
- The worker is essential (removing it loses the "timing/alignment" meaning)
- Labels are minimal and meaningful
- The palette feels classical without abandoning PCB DNA

## Blending with Modern Domains

When a classical text is used to explain a modern concept (e.g., using 道法自然 to explain emergent AI behavior), blend this reference with `domain-adaptation.md`:

- Board world: from the modern domain (AI/ML, business, etc.)
- Accent components: classical Chinese terms as silkscreen labels on key modules
- Worker: from the modern domain
- Relationship: from the classical text if it provides the core metaphor

This keeps the image functional for a modern reader while honoring the classical source.

## Don't

- Do not put trigram patterns (☰☷) as decorative background. If 八卦 is a concept, make each trigram a labeled phase module.
- Do not make the PCB look like a Chinese painting. It is still a circuit board. The classical feel comes from concept mapping and subtle palette, not from painted motifs.
- Do not over-label. Classical texts are dense; the image must give breathing room.
- Do not use mystical glow effects. The "profound" feeling comes from depth, composition, and minimal labels, not from fog or aura.
- Do not force every classical concept through this reference. A simple "learning requires practice" from 论语 is just sequence + feedback — use standard relationships.
