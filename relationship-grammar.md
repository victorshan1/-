# Relationship Grammar / 关系语法

Every Circuit Workers image encodes at least one relationship. Choose the relationship before choosing the worker. Precision comes from rendering the exact relation, direction, condition, and state, not from adding generic wires.

## Relationship Families

### Connection / 连接
Two things must be linked so the reader sees a shared path, reference, or exchange.
Article signals: "connects", "links", "between A and B", "bridges", "relates to", "把 A 和 B 连起来", "中间那条线".
Visual encoding: copper carrier trace, bus bar, bridge connector, or solder bridge between two labeled components; the connection has a visible start, end, and contact point.
Worker family: Router / 走线工, Pipeline Builder / 管道工.
Precision ladder: wire between components -> labeled trace with direction -> routed path with source, target, medium, and reason tag.
Degrades into: a plain wire or trace with no reason to exist.

### Sequence & Handoff / 顺序·交接
One stage passes data, ownership, or attention to the next stage.
Article signals: "then", "after", "step", "handoff", "from X to Y", "交给", "下一步", "接力".
Visual encoding: components on a staged trace, each with a small state tag; a bridge connector or via shows what is handed over.
Worker family: Pipeline Builder / 管道工, Router / 走线工.
Precision ladder: left-to-right stages -> numbered stations -> visible handoff object plus owner labels and state change at each station.
Degrades into: a timeline with traces and no ownership change.

### Dependency / 依赖
One element cannot stand, move, or make sense without another.
Article signals: "depends on", "requires", "built on", "without X", "前提是", "依赖", "支撑".
Visual encoding: lower support bus, power rail, regulator feeding the dependent component, or load-bearing trace holding the dependent component in position.
Worker family: Trainer / 训练工, Router / 走线工.
Precision ladder: stacked components -> support bus with label -> visible load path, missing-power failure state, and dependency condition tag.
Degrades into: a vertical stack that only means "higher/lower".

### Causality & Trigger / 因果·触发
One event activates, releases, or produces another.
Article signals: "because", "therefore", "leads to", "when X happens", "causes", "触发", "导致", "一旦".
Visual encoding: relay coil, trigger gate, clock edge, or switch that visibly changes the next component's state.
Worker family: Switcher / 开关工, Clock Keeper / 时钟工.
Precision ladder: trace from cause to effect -> trigger component -> condition label, activation moment, before/after pair, and resulting state tag.
Degrades into: a causal trace that could also mean sequence.

### Feedback Loop / 反馈环
An output returns to influence the input; the loop may amplify or stabilize.
Article signals: "feedback", "loop", "reinforces", "self-correcting", "越...越...", "反过来", "闭环".
Visual encoding: circular carrier trace with a return via; reinforcing loops use growing signal tabs, balancing loops use a comparator, filter, or regulator.
Worker family: Debugger / 调试工, Metric Amplifier / 指标放大工.
Precision ladder: circle trace -> return path with reading -> labeled loop type, signal value, adjustment point, and output state.
Degrades into: a decorative circle trace.

### Contrast & Opposition / 对比·对立
Two positions, states, or readings must be compared in one frame.
Article signals: "but", "whereas", "instead", "A vs B", "on the other hand", "相比", "反而", "不是...而是".
Visual encoding: differential pair, comparator chip, paired test points, or opposing LED indicators sharing the same reference.
Worker family: Sensor / 传感工, Tradeoff Bridge / 权衡桥接工.
Precision ladder: two components -> paired modules -> same measuring reference, matched labels, contrast axis, and highlighted difference.
Degrades into: two unrelated component panels.

### Tradeoff & Balance / 权衡·取舍
Choosing more of one value means less, delay, risk, or cost elsewhere.
Article signals: "tradeoff", "cost", "give up", "balance", "priority", "取舍", "代价", "两难".
Visual encoding: bridge circuit, differential amplifier, trim pot, weight register, or a tilted comparator with removed and kept signal tags.
Worker family: Tradeoff Bridge / 权衡桥接工, Switcher / 开关工.
Precision ladder: comparator with two inputs -> weighted signals -> named values, cost tag, chosen side, and residual risk LED.
Degrades into: a balanced comparator that says only "decision".

### Hierarchy & Containment / 层级·包含
Parts live inside a whole, or smaller layers sit within larger structures.
Article signals: "inside", "contains", "part of", "layer", "system", "belongs to", "包含", "层级", "母体".
Visual encoding: nested shield cans, stacked PCB layers, transparent power domains, labeled sub-boards within a larger board.
Worker family: Trainer / 训练工, Pipeline Builder / 管道工.
Precision ladder: stacked boards -> nested domains -> part-whole labels, boundary depth, ownership tags, and one exposed cutaway.
Degrades into: an org chart or pile of boards.

### Transformation & State Change / 转化·状态迁移
Something becomes another state through a visible operation.
Article signals: "becomes", "turns into", "before/after", "from X to Y", "转化", "迁移", "修复后".
Visual encoding: before/after signal twins, converter gate, DAC/ADC, repair solder bridge, LED color shift, or carrier trace passing through a converter chip.
Worker family: Switcher / 开关工, Feature Hunter / 特征猎手.
Precision ladder: before and after -> conversion path -> input state, operation, output state, residue, and state labels.
Degrades into: a magic trace between two components.

### Boundary, Filter & Threshold / 边界·过滤·门槛
Some signals are allowed through, held back, attenuated, or transformed at an edge.
Article signals: "boundary", "filter", "threshold", "permission", "approval", "拒绝", "门槛", "筛选", "进入条件".
Visual encoding: relay, filter capacitor, shield can, comparator threshold, power domain boundary, or isolation barrier with pass/fail LEDs.
Worker family: Shield / 屏蔽工, Switcher / 开关工.
Precision ladder: barrier between sides -> relay with pass/fail -> named rule, blocked signals, admitted signals, and relay state.
Degrades into: a barrier that does not explain the rule.

### Divergence & Convergence / 分流·汇聚
One source splits into paths, or many sources merge into one outcome.
Article signals: "branches", "splits", "many paths", "converges", "synthesizes", "分流", "汇聚", "归一".
Visual encoding: forked copper carrier, bus manifold, merge connector, differential pair, or grouped traces becoming one bus.
Worker family: Router / 走线工, Pipeline Builder / 管道工.
Precision ladder: branching traces -> labeled route split -> criteria at fork, path states, merged output, and grouped label set.
Degrades into: a tree diagram with no rule for branching or merging.

### Tension & Equilibrium / 张力·均衡
Forces hold each other in place; the relation is unresolved but stable or negotiated.
Article signals: "tension", "between", "held together", "not resolved", "dynamic balance", "拉扯", "僵持", "均衡".
Visual encoding: differential pair with opposing signals, counterweight traces, suspended bridge circuit, or balanced comparator around one focal component.
Worker family: Tradeoff Bridge / 权衡桥接工, Shield / 屏蔽工.
Precision ladder: opposing sides -> visible force traces -> force labels, anchor point, equilibrium state, and what would break if one side wins.
Degrades into: two traces pointing at each other.

## Relationship × Worker Quick Map

| Relation | Recommended worker family | Key tool |
| --- | --- | --- |
| Connection / 连接 | Router / 走线工 | copper carrier trace |
| Sequence & Handoff / 顺序·交接 | Pipeline Builder / 管道工 | pipe connector |
| Dependency / 依赖 | Trainer / 训练工 | support bus |
| Causality & Trigger / 因果·触发 | Switcher / 开关工 | relay |
| Feedback Loop / 反馈环 | Debugger / 调试工 | feedback trace |
| Contrast & Opposition / 对比·对立 | Sensor / 传感工 | differential probe |
| Tradeoff & Balance / 权衡·取舍 | Tradeoff Bridge / 权衡桥接工 | bridge circuit |
| Hierarchy & Containment / 层级·包含 | Trainer / 训练工 | layer stack |
| Transformation & State Change / 转化·状态迁移 | Switcher / 开关工 | converter gate |
| Boundary, Filter & Threshold / 边界·过滤·门槛 | Shield / 屏蔽工 | filter capacitor |
| Divergence & Convergence / 分流·汇聚 | Router / 走线工 | bus manifold |
| Tension & Equilibrium / 张力·均衡 | Tradeoff Bridge / 权衡桥接工 | differential pair |

## Precision Moves

- Direction markers: use small trace arrows, via labels, or signal-direction triangles; avoid giant arrows.
- Condition tags: attach "if / unless / after / except / 当..." tags to relays, comparators, or thresholds.
- Before/after twins: show both states when the article claims transformation, repair, loss, or maturity.
- Counterweight traces: make tradeoffs physical with weighted signal lines, removed components, or tilted comparators.
- Broken-vs-repaired trace: show failure and repair on the same carrier when the claim is about recovery.
- Relay states: mark open, closed, half-open, rejected, filtered, or converted.
- Reinforcing-vs-balancing loop arrows: use growing signal indicators for reinforcing loops and filters, regulators, or comparators for balancing loops.
- Primary/secondary layering: keep the main relation on the copper carrier; put side relations in quiet ground-plane layers, amber evidence LEDs, red error flags, or cyan growth indicators.

## Composing Multiple Relations

When an article nests 2-3 relations, render the primary relation as the main trace, the secondary as state coding, and the tertiary as a grouped label set. Keep one focal module.

Use `references/state-coding.md` for pass/fail, before/after, stable/unstable, hidden/visible, and risk/reward states. Use `references/primitives.md` for trace/bus, relay, comparator, sensor, shield, layer, LED, and probe primitives.

Do not give every relation equal visual weight. If every relation gets its own trace system, the image becomes a schematic dump.

## Accept / Regenerate

Accept if:

- The primary relation is named before the worker is chosen.
- Direction, condition, and state are visible in components, not only in labels.
- The worker physically performs the relation: routes, bridges, senses, switches, encodes, debugs, shields, calibrates, or amplifies.
- The visual encoding is specific enough that replacing it with a plain trace would lose meaning.
- Secondary relations are coded quietly and do not compete with the focal module.
- Labels are attached to relationship components: trace tags, relay rules, comparator weights, sensor labels, shield names, or signal tags.

Regenerate if:

- The relationship collapses into a left-to-right trace.
- Sequence, causality, and dependency are visually indistinguishable.
- Contrast becomes two unrelated component panels.
- Feedback becomes a decorative loop trace.
- Tension resolves into a winner when the article says it is held in balance.
- The worker stands beside the relationship instead of routing, switching, sensing, or regulating it.
