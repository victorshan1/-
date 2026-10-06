# Layout Handoff / 布局交接

Hand a generated image to README, social-card, slide, article, or knowledge-base layouts without stuffing the image with outer-layout text.

## Handoff Context

When a Circuit Workers image will be placed in a specific layout, the image should not try to carry the outer-layout's responsibilities. The image carries the visual argument; the outer layout carries the framing.

## Handoff Template

```text
handoff:
- caption: {one-line caption for the outer layout}
- crop guidance: {none / crop top / crop bottom / crop margins}
- safe margin: {top: X%, bottom: X%, left: X%, right: X%}
- text ownership: {labels inside, headline/explanation outside}
- handoff owner: {article / slide / social card / README / knowledge base}
```

## Layout-Specific Rules

### Article Body Figure
- Image carries labels and one sentence strip (if needed).
- Article layout carries: figure number, caption, explanation paragraph.
- Safe margin: 5% on all sides for article column fitting.

### Social Card
- Image carries minimal labels (3-4 short labels).
- Card layout carries: headline, call-to-action, brand mark.
- Safe margin: 10% bottom for text overlay.

### Slide
- Image carries labels and focal argument.
- Slide layout carries: title, bullet points, speaker notes.
- Safe margin: 15% top for slide title, 10% bottom for footer.

### README / Knowledge Base
- Image carries labels and full visual argument.
- Document layout carries: heading, description, usage instructions.
- Safe margin: 5% on all sides.

## What Not to Put in the Image

Do not stuff these into the image — they belong to the outer layout:

- Figure number (e.g., "图1")
- Full caption paragraph
- Author attribution
- Copyright or license notice
- Navigation or UI elements
- Brand logos (unless the brand IS the subject of the illustration)

The image should be self-contained as a visual argument, and the outer layout should frame it appropriately.
