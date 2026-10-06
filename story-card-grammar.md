# Story Card Grammar / 故事卡片语法

Turn stories, books, biographies, and cases into cards with protagonist, conflict, turning point, choice, consequence, and transformation.

## When to Use

Use story card grammar when the article is narrative: a biography, a case study, a historical event, a product origin story, or a personal experience with a clear arc.

Do not use for purely analytical or expository articles — those use data story scenes or article figures instead.

## Story Slots

### Protagonist / 主角
Who or what is the story about? Render as a named chip or module on the board.
- Label: the protagonist's name or role.
- State: initial condition (dim LED, idle trace, low power).

### Conflict / 冲突
What tension or problem drives the story? Render as a broken trace, red error flag, overloaded bus, or signal interference.
- Label: the conflict's nature.
- State: error, stress, or failure indicators.

### Turning Point / 转折
What event changes the direction? Render as a relay switching, a signal being routed differently, a clock edge, or a trigger activation.
- Label: the turning point's nature.
- State: transition indicators (amber LED, switching relay).

### Choice / 选择
What decision must be made? Render as a switch, comparator, or fork in the trace with two paths.
- Label: the options.
- State: open switch, pending comparator.

### Consequence / 后果
What results from the choice? Render as the selected trace path, the activated output, the resulting signal state.
- Label: the outcome.
- State: green or red LED indicating success or failure.

### Transformation / 转化
How has the protagonist changed? Render as a state change in the protagonist's chip: new LED color, upgraded component, or new trace connection.
- Label: the transformation.
- State: final state indicator (bright cyan LED, active trace).

## Card Layout

For story cards, use a sequential trace layout:

```
[Protagonist chip] → [Conflict break] → [Turning Point relay] → [Choice fork] → [Consequence output] → [Transformation upgrade]
```

The copper carrier trace connects all slots in sequence. The worker performs the action at the focal slot (usually the Turning Point or the Choice).

## Beat Labels

Use 4-8 beat labels for story cards, one per slot. Each label should be 2-6 characters in Chinese.

Examples:
- 起点 → 冲突 → 转折 → 选择 → 结果 → 蜕变
- 发现 → 瓶颈 → 突破 → 决策 → 落地 → 升级

## Worker Role in Stories

The worker in a story card is the narrator or the active agent at the focal beat. It does not appear at every slot — it appears where agency matters.

- At the Turning Point: the worker triggers the relay.
- At the Choice: the worker throws the switch.
- At the Transformation: the worker installs the upgrade.

At other slots, the components and traces tell the story without the worker.

## Motif Recurrence / 母题回环

A motif is a recurring primitive that evolves across the story arc, appearing at multiple slots in different states. The reader recognizes the same component returning transformed — this creates narrative coherence without extra labels.

### How Motif Works

Choose one primitive as the motif. It appears at the first slot in an initial state, disappears during conflict, and returns at the transformation slot in a changed state.

| Slot | Motif State | Visual Encoding |
|------|-------------|-----------------|
| Protagonist (initial) | dim, idle, low power | faint LED, cold solder joint |
| Conflict | broken, stressed, or absent | dark LED, broken trace, red flag |
| Transformation (final) | bright, active, upgraded | bright LED, clean trace, new connection |

### Motif Examples

- **LED Array**: dim at protagonist → dark during conflict → bright amber at transformation
- **Copper Trace**: complete at start → broken during conflict → re-soldered (by worker) at transformation
- **Chip**: idle at start → error state during conflict → upgraded package at transformation
- **Capacitor**: low charge at start → overloaded during conflict → fully charged at transformation

### Motif in Series

When a story spans multiple images (see `references/series-and-chaining.md`), the motif carries across images:

- Image 1: motif in initial state
- Image 2: motif under stress or broken
- Image 3: motif transformed or resolved

The reader recognizes the same component returning in a new state — this is what makes a series feel like one argument, not N unrelated pictures.

### Accept

- The motif is a named primitive from the kit, not an ad-hoc object.
- The motif's state change is visible without a label.
- The motif returns at the transformation — it does not disappear after the conflict.
- The same motif means the same thing across all images in a series.

### Regenerate

- No motif — every slot has different components with no recurrence.
- The motif appears but never changes state — it is decorative, not narrative.
- The motif changes state but the change is not visible without reading labels.
