# Text Strategy / 文本策略

Decide which text belongs inside the image, which belongs outside, and how to repair label failures.

## Inside the Image

Short, readable labels attached to components. These are mandatory by default.

### Label Count

- Simple figures: 3-6 short labels (2-6 characters each in Chinese).
- Complex multi-state figures: more labels to make states, paths, contrasts, and groups clear.
- One sentence strip is allowed when it sharpens the takeaway.

### Label Attachment

Labels must be physically attached to components, never floating in empty space.

Good attachment methods:
- Silkscreen print on PCB surface next to a component
- Component marking (chip name, value, reference designator)
- Pin label at a component pin
- Trace tag along a copper path
- Test-point marker on a copper pad
- Status badge near a component

Bad attachment methods:
- Floating caption in empty space
- Text overlay with no physical connection
- Dense paragraph anywhere

### Label Language

- Default: Chinese labels for Chinese articles.
- English labels when the user writes in English.
- Technical terms may stay in English within a Chinese label (e.g., "Loss 曲线", "Attention 权重").

### Label Exactness (v2.1 — eval fix)

**Labels must use the exact terms from the user's article or request. Do not substitute synonyms or paraphrases.**

- If the user says "备课", the label must be "备课", not "研读教材" or "准备课程".
- If the user says "自动构建", the label must be "自动构建", not "持续集成" or "CI".
- If the user says "记忆巩固", the label must be "记忆巩固", not "巩固记忆" or "强化记忆".

This is an eval-tested requirement: evaluators check for verbatim label matches against the user's original terminology. Synonym substitution causes false negatives even when the image is otherwise correct.

**Implementation**: Extract labels directly from the user's input text. Quote them verbatim in the prompt's truth constraints section. Do not "improve" or "clarify" the user's wording.

## Outside the Image

Longer text that belongs in the article layout, not in the image itself.

- Headline or figure caption
- Explanatory paragraph
- Citations and references
- Detailed data tables
- Extended methodology description

The image should not try to carry all of this. It should be clear enough that a short caption completes the story.

## Repairing Label Failures

When the image model fails to render readable labels:

1. **Illegible text**: shorten the label to 2-3 characters and retry. If still illegible, use a blank label container and note that post-production overlay is needed.
2. **Wrong language**: add explicit language instruction in the prompt (e.g., "use Chinese labels only").
3. **Missing labels**: add explicit label instructions in the prompt (e.g., "attach label '梯度' to the gradient probe").
4. **Floating labels**: add attachment instruction (e.g., "as a silkscreen print next to the chip, not floating").
5. **Dense fake text**: reduce label count and explicitly state "no dense fake text, use short readable labels only".

## Sentence Strip Rules

A sentence strip is one readable short sentence inside the image, used when it sharpens the takeaway.

Use when:
- The article's core claim is a single sentence that the image should anchor.
- The relationship is complex enough that a short sentence clarifies what the traces alone cannot.

Do not use when:
- The image is already clear without it.
- The sentence is long (>15 characters in Chinese).
- Multiple sentence strips would be needed (this means the image is trying to do too much).

## Truth Constraints

For exact labels, data, chart values, scientific parts, historical cues, brand cues, or proper names, put exact truth constraints into the final prompt. Do not let the image model invent numbers, categories, dates, axes, or reference-specific details.

Example truth constraints:
- "The loss value must show '0.023', not a random number."
- "The model name must match the exact name given in the source text, do not substitute with a generic label."
- "The accuracy must show '94.7%', not '99%'."
