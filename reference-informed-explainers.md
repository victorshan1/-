# Reference-Informed Explainers / 参考驱动的说明图

Gather stable factual and visual cues for science, history, culture, brands, artifacts, and other visually specific topics before generating when accuracy matters.

## When to Use

Use reference-informed explainers when the article discusses a specific real-world entity that has distinctive visual characteristics: a scientific instrument, a historical artifact, a cultural landmark, a brand product, a biological species, or a geographic feature.

Do not use for purely abstract or conceptual topics — those use article figures instead.

## Reference Cue Collection

Before generating, gather stable visual and factual cues about the reference entity:

```text
reference entity:
- name:
- domain:
- distinctive visual features: {list 3-5 key visual characteristics}
- scale or size:
- key components or parts:
- color or material:
- common misconceptions to avoid:
```

These cues constrain the image so the reference entity is recognizable and accurate, not a generic approximation.

## Visual Cue Encoding

Translate reference cues into circuit-board primitives:

- Distinctive shape → specific component form (e.g., a telescope → a sensor array with a long probe tube)
- Key parts → named chips or modules on the board
- Color or material → palette accent or component texture
- Scale → relative component size on the board
- Common misconceptions → explicit "do not render" instructions in the prompt

## Truth Constraints for References

- Proper names must be correct (e.g., "Hubble", not "Space Telescope").
- Key parts must be present and labeled (e.g., "主镜", "副镜", "焦平面").
- Scale relationships must be preserved (e.g., primary mirror larger than secondary).
- Colors must match the real entity when identifiable (e.g., Hubble's silver tube, not gold).

## Accept / Regenerate

Accept if:
- The reference entity is recognizable from its distinctive visual cues.
- All named parts are present and labeled.
- No common misconceptions appear.

Regenerate if:
- The reference entity is generic or unrecognizable.
- Key parts are missing or misnamed.
- A common misconception is rendered instead of the correct version.
