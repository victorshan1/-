# QA Checklist / 质量检查清单

Acceptance and regeneration rules for Circuit Workers images.

## Mandatory Checks

### Asset Routing
- [ ] The image's role is clear: article figure, story card, data scene, center illustration, or explainer.
- [ ] The final container and display ratio are decided (default: 16:9 horizontal).
- [ ] Text ownership is decided: what is inside the image vs outside.
- [ ] Truth constraints are specified for any exact values, names, or categories.
- [ ] No other tool should own this job (if a spreadsheet or document tool is better, route accordingly).

### Worker Validity
- [ ] The worker physically performs the core action (does not stand beside the scene).
- [ ] The worker's LED expression encodes a meaningful state, or is blank (not decorative).
- [ ] The worker carries one domain-specific tool.
- [ ] The worker is 8-18% of canvas height (secondary to the idea, essential to the relation).
- [ ] Removing the worker would weaken the image's ability to show the relationship.

### Relationship Precision
- [ ] The primary relationship is named before the worker was chosen.
- [ ] The relationship's direction, condition, and state are visible in components, not only labels.
- [ ] The visual encoding is specific enough that replacing it with a plain trace would lose meaning.
- [ ] The relationship does not collapse into a generic left-to-right trace.

### Style DNA
- [ ] PCB green solder-mask background with copper-gold traces.
- [ ] Soldering-cap robot with round silver cap head, green PCB body, tiny jointed arms.
- [ ] No cartoon eyes, no humanoid face, no mascot behavior, no generic cute robot.
- [ ] Tactile solder texture, copper sheen, clean editorial composition.
- [ ] Depth layers: foreground action, mid-board components, back solder mask.
- [ ] Not a flat circuit schematic with PCB texture.

### Labels
- [ ] 3-6 short labels for simple figures; more for complex multi-state figures.
- [ ] Labels attached to components, traces, pins, chips, or pads (not floating).
- [ ] Chinese labels for Chinese articles; English for English.
- [ ] No dense fake text; no empty label placeholders (unless post-production overlay requested).
- [ ] One sentence strip only when it sharpens the takeaway.

### Composition
- [ ] One focal module.
- [ ] Generous quiet zones around the focal module.
- [ ] Clear start/change/result or before/action/after.
- [ ] Complexity matches the article (simplest sufficient form).

### Truth
- [ ] Exact numbers, names, categories, and values are correct.
- [ ] No invented data on displays, labels, or components.
- [ ] Reference-specific details (brand names, model numbers, scientific terms) are accurate.

## Swap Test

- [ ] If this image were placed on a different article about the same topic, would anyone notice?
- [ ] If yes → the image is too generic. Regenerate with tighter source-anchor fit.
- [ ] The image must be locked to its specific document.

## Failure Pattern Scan

Check against `references/failure-patterns.md`:

- [ ] Not a decorative worker.
- [ ] Not a generic schematic.
- [ ] Not template-locked.
- [ ] Not data beauty (wrong data).
- [ ] Not text overload.
- [ ] Not label void.
- [ ] Not mascot drift.
- [ ] Not a wrong-owner task.
- [ ] Not flat trace disease.
- [ ] Not over-engineered.

## Domain Check

- [ ] The components, traces, and tools belong to the article's domain.
- [ ] Engineering props are not forced into art, culture, or emotional essays.
- [ ] The palette accent matches the domain.
- [ ] At least one non-engineering domain is represented in portfolio/showcase images.

## Series Consistency (When Part of a Set)

- [ ] Throughline trace connects all images.
- [ ] Worker family, palette, and label style are consistent.
- [ ] Worker LED state progresses meaningfully.
- [ ] No image is redundant.
- [ ] Motif from early images pays off in later images.

## Verdict

- **Accept**: all mandatory checks pass, Swap Test fails (image is locked to its document), no failure patterns detected.
- **Regenerate**: any mandatory check fails, Swap Test passes (image is too generic), or any failure pattern is detected.
