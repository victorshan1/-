# Primitives / 原元素

The reusable atomic circuit parts every Circuit Workers scene is built from. Primitives are the nouns of the kit; the worker's action is the verb. Pick primitives first, then arrange them. Reuse the same primitive for the same meaning across every image in a series — that consistency is what makes a multi-image set feel like one board instead of ad-hoc components.

Read this with `references/style-dna.md` (palette, label rules) and `references/worker-library.md` (the verbs and tools).

## Board-Object Primitives / 电路板原元素

Each item: concept it carries — material/solder note — labels it commonly hosts.

### Carriers & Paths / 载体与路径

- **Narrative Carrier Trace / 叙事主走线** ⭐ — the primary reader path through the image; a thick (3-4mm), bright gold-copper strip with visible direction arrows and solder-station markers along its length. Unlike a decorative trace, this is the backbone of the scene: it starts at a source component, passes through the worker's action point, and terminates at a result component. The reader's eye follows this trace to understand the full argument in three seconds. Every image should have exactly one narrative carrier trace when the concept involves movement, transformation, or sequence. Hosts 2-4 station labels along its length.
- **Copper Trace / 铜走线** — secondary route or connection; thinner gold-copper strip on green solder mask; hosts path labels, direction arrows, station markers. Subordinate to the narrative carrier trace.
- **Bus Bar / 总线** — a multi-bit parallel path; wide copper strip with parallel sub-traces; hosts bus name and bit-width markers.
- **Via / 过孔** — a layer transition or handoff between levels; small annular ring with plated hole; hosts layer transition labels.
- **Bridge Connector / 跨接器** — a handoff or transition across a gap; solder bridge or jumper; hosts interface labels.
- **Differential Pair / 差分对** — a paired connection for comparison or balanced signal; two parallel traces; hosts + and − labels.
- **Junction / 焊盘结** — where paths meet, split, or merge; copper pad with branching traces; hosts flow-direction markers.

### Components & Holders / 元件与载体

- **Chip / 芯片** — one discrete unit, idea, or processing stage; black IC package with silver pins; hosts a single short label on its surface marking.
- **Capacitor / 电容** — a stored or filtered quantity; small cylindrical or SMD component; hosts value and filter type labels.
- **Resistor / 电阻** — a measured constraint or limit; small SMD rectangle with color bands or marking; hosts value and constraint labels.
- **Inductor / 电感** — a magnetic store or resonance; small coil or SMD package; hosts resonance and frequency labels.
- **Crystal / 晶振** — a precise timing reference; small metal can; hosts frequency and timing labels.
- **Socket / 插座** — a swappable or upgradeable slot; IC socket with pin holes; hosts slot name and version labels.

### Enclosures & Boundaries / 围合与边界

- **Shield Can / 屏蔽罩** — a bounded context or protected domain; metal shield over a board area; hosts a domain name.
- **Ground Plane / 地平面** — the universal reference or baseline; copper fill area; hosts reference labels.
- **Relay / 继电器** — a pass, filter, or permission threshold; relay package with coil and contacts; hosts gate-state labels.
- **Power Domain / 电源域** — a separated voltage or authority zone; colored board area with regulator; hosts domain name and voltage level.
- **Isolation Barrier / 隔离栏** — a galvanic or logical separation; gap or optocoupler between traces; hosts isolation type labels.
- **Test Point / 测试点** — a measurement or inspection access; small copper pad with marker; hosts test labels.

### Optics & Display / 光学与显示

- **LED Array / LED阵列** — status, signal strength, or attention; row of colored LEDs; hosts status labels.
- **Display Module / 显示模块** — a reading, metric, or dashboard output; small OLED or 7-segment; hosts reading value and unit.
- **Sensor Module / 传感器** — attention, inspection, or detection; small sensor package; hosts sensor type and target labels.
- **Photocoupler / 光耦** — a one-way signal transfer or isolation; optocoupler package; hosts direction and isolation labels.
- **Laser Diode / 激光管** — a focused beam of attention or precision; small can with aperture; hosts target and wavelength labels.

### Measures & Tools / 度量与工具

- **Comparator / 比较器** — tradeoff, balance, or weight of evidence; differential comparator chip; hosts side labels and threshold tags.
- **DAC/ADC / 数模转换器** — degree, level, or adjustable value; converter chip; hosts input/output range labels.
- **Gauge Display / 仪表显示** — a reading of intensity or status; analog meter or bar graph; hosts a needle position and unit label.
- **Trim Pot / 微调电阻** — fine adjustment or calibration; small adjustable resistor; hosts setting and range labels.
- **Oscilloscope Probe / 示波器探针** — inspection, measurement, or evidence; probe with tip; hosts measurement point labels.
- **Soldering Iron / 烙铁** — creation, repair, or modification; heated tool tip; hosts target and action labels.
- **Logic Analyzer Clip / 逻辑分析仪夹** — multi-point inspection; clip with contact pins; hosts signal name labels.

### Containers of State / 状态容器

- **Register / 寄存器** — a grouped state or control flags; register cell with bit labels; hosts a name and flag labels.
- **FIFO Buffer / 先入先出缓冲** — a queued state awaiting processing; buffer chip; hosts queue depth and status labels.
- **SRAM Cell / 存储单元** — a stored or archived state; memory cell array; hosts address and data labels.
- **Counter / 计数器** — an accumulated quantity or stage count; counter chip; hosts count value and overflow labels.
- **State Machine / 状态机** — a multi-state sequential logic; labeled state bubble diagram on board; hosts state names and transition labels.
- **Error Flag / 错误标志** — an alert or exception state; red LED with label; hosts error type and severity.

## Label-Container Primitives / 标签容器原元素

Labels live on components and traces, never in empty space. Mirror the label rules in `style-dna.md`: short readable Chinese labels by default (2-6 characters), attached to components.

- **PCB Nameplate / 铜牌铭牌** ⭐ — a small brass or copper plate physically raised above the PCB surface, engraved with a short Chinese label (2-6 characters). Has its own shadow and metallic beveled edge, giving text a physical "home" that is far more readable than flat silkscreen. Use for the most important labels in the image — focal module names, key state labels, or the image's theme nameplate. The physical raised quality makes text crisp at any viewing angle. Hosts 1 short label per nameplate.
- **Silkscreen / 丝印** — a printed label on the PCB surface; use for component names, reference designators, and values. Thinner and less prominent than nameplate; use for secondary labels.
- **Pin Label / 引脚标签** — a label at a component pin; use for function names and signal directions.
- **Trace Tag / 走线标签** — a small label along a copper trace; use for signal names and path identifiers.
- **Test Point Marker / 测试点标记** — a labeled copper pad; use for inspection and measurement access.
- **Chip Nameplate / 芯片铭牌** — a marking on the IC surface; use for component identity and version.
- **Debug Label / 调试标签** — a small annotation near a debug point; use for probe targets and breakpoint names.
- **Sentence Strip / 句条** — one readable short sentence on a raised copper strip; use only when it sharpens the takeaway.
- **Status Badge / 状态徽章** — a small colored badge near a component; use for pass/fail, active/inactive, or error states.

## The Circuit Worker Kit / 电路工构造件

The worker is assembled from the same kinds of circuit parts as the scene. The tool does the storytelling; the body stays quiet.

- **Soldering-cap head** — a round silver soldering-iron-tip cap as the head; calm and blank by default.
- **LED expression** — optional: one or two tiny colored dots on the cap face that encode the worker's state — focus (green), effort (amber), alert (red), growth (cyan), standby (off). Keep it minimal and sparse to avoid the uncanny valley; never cartoon eyes, never mouth, never humanoid face. See `references/state-coding.md` and `references/style-dna.md`.
- **Torso shapes** — small rectangular green PCB body with visible trace patterns, a tiny component or two, and solder joints at corners.
- **Arm rules** — only the arms needed to perform the action; thin jointed appendages ending in tool mounts or probe tips.
- **Tool mounts** — the hand or arm presents exactly one domain-specific tool.
- **LED-indicator placement** — one small semantic LED indicator on the worker's body or tool, no more.
- **Scale** — the worker is 8-18% of canvas height; secondary to the idea, essential to the relation.

Reaffirm: no humanoid body, no cartoon face, no big expressive eyes. The head is either blank or one simple LED-dot state-coding expression. Not a generic cute robot — no round white head, no smile, no waving, no mascot behavior. Not a mascot — not cute-first, not glowing happily at the reader, not presenting, not a sticker, not a logo, not an avatar, not a silhouette.

## Carrier-Trace Variants / 载体走线变体

The narrative carrier trace is the reader path. Its form implies what the flow is doing. Choose the variant that matches the article's relationship before prompting.

### Narrative Carrier Trace Variants / 叙事主走线变体

- **Straight / 直走线** — a simple uninterrupted sequence from source to result; thick bright copper with arrow markers.
- **Branching / 分叉** — a decision point where the path splits into alternatives; thick trace splitting into thinner branches at a junction.
- **Looping / 环回** — a feedback loop, repetition, or return to an earlier stage; thick trace curving back to near its origin.
- **Broken / 断裂** — a failure, drop, or disconnection in the flow; thick trace with a visible gap and jagged edges.
- **Merging / 汇合** — separate traces joining into one bus; thin traces converging into a thick main trace.
- **Climbing / 攀升** — effortful progression or rising value over stages; thick trace ascending through elevated stations.
- **Descending / 下降** — a decline, reduction, or simplification; thick trace descending through stations with dimming LEDs.
- **Spiraling / 螺旋** — iterative deepening or refinement; thick trace spiraling inward toward a focal point.

### Secondary Trace Variants / 次要走线变体

- **Straight / 直走线** — a simple secondary connection between components.
- **Branching / 分叉** — a minor split for alternative paths.
- **Looping / 环回** — a small feedback loop between two components.
- **Broken / 断裂** — a minor disconnection or error path.
- **Merging / 汇合** — minor traces joining a main path.
- **Climbing / 攀升** — a secondary rising connection.

## Composition Primitives / 构图原元素

- **Focal module** — the single component or action the eye lands on; only one per image.
- **Quiet zone** — generous margin and breathing space around the focal module.
- **Depth layers** — foreground components, mid-board action, back solder mask; build a PCB diorama, not a flat schematic.
- **High-angle staging** — shallow isometric board view; raise active components, recess done/background areas.

## Assembly Rule / 装配规则

- Choose the simplest sufficient set of primitives; add more only when the article's precision needs them.
- One primitive carries one meaning; do not overload a single component with two unrelated jobs.
- Assign each meaning to its primitive once, then reuse the same primitive for that meaning across the series — this is the foundation of the 串联 layer in `references/series-and-chaining.md`.
- Keep semantic colors and label containers consistent with `references/state-coding.md` and `style-dna.md`.

## Accept / Regenerate

Accept:

- Every object is a named primitive from this kit.
- The same meaning maps to the same primitive across the image set.
- Labels sit on label-container primitives, never in empty space.
- The circuit worker is built only from the Circuit Worker Kit.
- The primitive set is the simplest that carries the idea.

Regenerate:

- An off-kit ad-hoc object appears that no primitive accounts for.
- A stock icon, clipart, or PPT shape stands in for a primitive.
- The worker gains a cartoon face, big eyes, mouth, or mascot identity.
- One primitive is forced to mean two unrelated things.
- The scene is a flat schematic with no depth layers or focal module.
