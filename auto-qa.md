# Auto-QA / 自动质检闭环

Use this reference after image generation to automatically verify the output with a VLM tool, and retry if the image fails mandatory checks.

v1.8 introduces a **two-stage QA pipeline**: Pass 0 (deterministic script, zero cost) runs BEFORE image generation to catch predictable failures, and Pass 1 (VLM visual check) runs AFTER generation to catch contextual issues. This split follows the deterministic-check design pattern — deterministic checks that can be scripted should NOT waste VLM tokens.

## Two-Stage Pipeline / 两阶段质检

```
Stage 0 — Pre-generation (Pass 0): check_prompt.py
  Input:  final_prompt text
  Output: PASS/FAIL per check (8 items)
  Cost:   zero (no API calls)
  Action: FAIL → fix prompt, re-run Pass 0; PASS → proceed to generation

Stage 1 — Post-generation (Pass 1): VLM auto-qa
  Input:  generated image + QA prompt
  Output: PASS/FAIL per check (7 items)
  Cost:   1 VLM call per attempt
  Action: FAIL → targeted prompt adjustment, re-generate, re-run Pass 1
```

### Why Two Stages

The key insight from human-writing skill's `check_prose.py`: **VLM is bad at deterministic checks but good at contextual ones**. In our own experience:
- F8 (label duplication) was missed by VLM but is trivially caught by a regex checking for "ONLY ONCE"
- F7 (worker dropout) is missed by VLM but is caught by checking if worker appears in first paragraph
- F9 (return trace omission) is missed by VLM but is caught by checking for "bright thick"

By moving these to Pass 0 (zero-cost script), we save VLM tokens AND improve accuracy.

## Pass 0: check_prompt.py (Pre-generation)

### When to Run

Run `check_prompt.py` AFTER assembling the final prompt, BEFORE calling `image_generate`. This is a mandatory gate — never skip it.

### What It Checks (8 items)

| # | Check | Level | Failure It Prevents |
|---|-------|-------|---------------------|
| 1 | Worker description in first paragraph | HARD | F7: worker dropped by model |
| 2 | Labels have "ONLY ONCE" + "no background text" constraint | HARD | F8: labels duplicated as background text |
| 3 | Return trace has "bright thick" + "clearly visible" | HARD | F9: return trace omitted |
| 4 | Context lock present (nameplate or article-specific detail) | HARD | F1: Swap Test failure (generic image) |
| 5 | Component count <= 6 | SOFT | F9: element overload dropout |
| 6 | No vendor/competitor names | HARD | v1.4: desensitization violation |
| 7 | No S1-S8 sensitive words | HARD | Safety boundary violation |
| 8 | No banned Chinese punctuation | SOFT | Writing style consistency |

### Usage

```bash
# Check from planning JSON
python3 scripts/check_prompt.py --plan ./my-plan.json

# Check direct prompt
python3 scripts/check_prompt.py --prompt "A soldering-cap robot..."

# Strict mode (SOFT warnings become failures)
python3 scripts/check_prompt.py --plan ./my-plan.json --strict

# JSON output (for programmatic use)
python3 scripts/check_prompt.py --plan ./my-plan.json --json
```

### Pass 0 Flow

```
final_prompt assembled
       ↓
check_prompt.py --plan ./my-plan.json
       ↓
  ├── FAIL (HARD) → read failure_reasons → fix prompt → re-run Pass 0
  ├── FAIL (SOFT) → print warnings → proceed (unless --strict)
  └── PASS → proceed to image_generate
```

### Pass 0 Integration with generate.js

```bash
# generate.js auto-runs check_prompt.py before image generation
node scripts/generate.js --plan ./my-plan.json --output ./out.png --auto-qa
# 1. check_prompt.py runs first (Pass 0)
# 2. If PASS → z-ai image generates (Pass 1 input)
# 3. If --auto-qa → VLM check runs on output (Pass 1)
```

## Pass 1: VLM Auto-QA (Post-generation)

## VLM QA Prompt Template

Feed this prompt to the VLM tool along with the generated image:

```text
Analyze this PCB-style illustration and answer each question with PASS or FAIL + one-sentence reason.

1. Worker action: Is there a small soldering-cap robot physically performing an action (routing, sensing, switching, encoding, debugging, bridging, etc.)? Or is it decorative (standing beside the scene)?
2. Chinese labels: Are there readable Chinese labels attached to components? (not floating in empty space, not fake dense text)
3. PCB diorama: Does the image have 3D depth (raised components, solder joints, copper traces on green board)? Or is it a flat schematic?
4. Focal hierarchy: Is there one clear focal point with quiet zones around it? Or are all components equal-weight with no focus?
5. Style integrity: Does it look like a Circuit Workers image (green PCB, copper gold, solder silver, soldering-cap robot)? Or does it look like a generic circuit diagram / stock icon / cartoon?
6. Swap Test: Could this image illustrate a different article on the same topic without anyone noticing?
   - If YES (swappable) → result = FAIL (too generic, this is a problem)
   - If NO (locked to this document) → result = PASS (precise, this is the desired result)
   - IMPORTANT: swap_test PASS (not swappable) is GOOD. Do NOT include swap_test PASS in failure_reasons.
7. {custom_check}: {domain-specific or truth-constraint check from the planning JSON}

Return JSON:
{
  "overall": "PASS" | "FAIL",
  "checks": [
    { "name": "worker_action", "result": "PASS" | "FAIL", "reason": "..." },
    { "name": "chinese_labels", "result": "PASS" | "FAIL", "reason": "..." },
    ...
  ],
  "failure_reasons": ["list ONLY checks that FAILED (result=FAIL), excluding swap_test when result=PASS"],
  "suggested_fix": "one-sentence prompt adjustment if overall=FAIL, empty if PASS"
}
```

## Custom Check Injection

The `{custom_check}` slot is filled from the planning JSON's `qa_risks` field. Examples:

- For a feedback loop image: `"Is there a visible closed-loop path connecting the output back to the input?"`
- For a pipeline image: `"Are the stages in correct left-to-right order: {stage1} → {stage2} → {stage3}?"`
- For a data scene: `"Does the display show the exact value '{exact_value}', not a different number?"`
- For a story card: `"Are all {N} story beats present and in sequence?"`

## Pass / Fail Criteria

### PASS (return image to user)

All mandatory checks pass:
- worker_action: PASS
- chinese_labels: PASS (or N/A if user requested no labels)
- pcb_diorama: PASS
- focal_hierarchy: PASS
- style_integrity: PASS
- swap_test: FAIL (meaning the image is NOT swappable — this is the desired result)
- custom_check: PASS (if specified)

### FAIL (retry)

Any mandatory check fails. Read `failure_reasons` and `suggested_fix` from the VLM output, then adjust the prompt.

## Retry Prompt Adjustment Strategy

When retrying, do NOT rewrite the entire prompt. Make targeted adjustments based on which check failed:

| Failed Check | Prompt Adjustment |
|--------------|-------------------|
| worker_action | Add: "The worker MUST physically touch {component} with its {tool}. The worker is NOT standing beside the board." |
| chinese_labels | Add: "Chinese labels must be readable silkscreen prints attached to components. Required labels: {label_list}." |
| pcb_diorama | Add: "Use 3D depth: raised components, visible solder joints, copper traces with sheen on green solder mask. NOT a flat schematic." |
| focal_hierarchy | Add: "One focal module with {accent_color} accent. Surrounding components stay quieter. Generous quiet zones." |
| style_integrity | Add: "Style: green PCB, copper gold traces, solder silver joints, soldering-cap robot. NOT a flat diagram, NOT stock icons, NOT cartoon." |
| swap_test (PASS = swappable = bad) | Add content-specific particulars: "This image must show {specific_detail_from_source_anchor}, not a generic {topic} illustration." |
| custom_check | Add the specific constraint that was violated. |

## Retry Budget

- **Attempt 1**: Original prompt from planning.
- **Attempt 2**: Original prompt + targeted adjustment from failure reasons.
- **Attempt 3**: Original prompt + all accumulated adjustments + simplify (reduce component count, reduce labels, focus on one relationship).
- **After Attempt 3**: If still failing, return the best attempt (highest PASS count) with a failure report listing remaining issues. Do not loop indefinitely.

## Failure Report

If all 3 attempts fail, return:

```text
QA Failure Report:
- image_path: {path}
- best_attempt: {attempt_number}
- passing_checks: {list of passing check names}
- failing_checks: {list of failing check names + reasons}
- suggested_manual_fix: {what a human should do to fix it}
```

This report goes into the `prompt-records.md` entry for this image, so the skill learns from failures across uses.

## Tool Invocation Examples

### On AstronClaw (platform built-in tools)

```
# Step 1: Generate image
image_generate(prompt={final_prompt}, size="1344x768") → image_url

# Step 2: VLM check
vision(image=download(image_url), prompt={qa_prompt}) → verdict_json

# Step 3: If FAIL, adjust prompt and goto Step 1
```

### In Output Contract

Add these fields to the planning output:

```text
auto_qa:
- qa_prompt: {the VLM QA prompt with custom_check filled in}
- attempt_1: {result: PASS/FAIL, failing_checks: [...]}
- attempt_2: {result: PASS/FAIL, failing_checks: [...], adjustments: "..."}  (if retry needed)
- attempt_3: {result: PASS/FAIL, failing_checks: [...], adjustments: "..."}  (if retry needed)
- final_verdict: PASS | FAIL_WITH_REPORT
- failure_report: {if FAIL_WITH_REPORT, the failure report text}
```

## VLM Fallback: Deterministic Visual Assertions (v2.2 — eval fix)

When VLM (Pass 1) is unavailable, fails, or times out, do NOT simply say "please check manually." Instead, run **deterministic visual assertions** — zero-cost checks that inspect the generated image file without a VLM:

### Available Deterministic Checks

| Check | Method | What It Catches |
|-------|--------|----------------|
| File exists + non-trivial size | `fs.existsSync` + `fs.statSync().size > 10KB` | Empty/failed generation |
| Image dimensions = 16:9 (or specified size) | `sharp` or `Pillow` metadata read | Wrong aspect ratio |
| Color palette contains PCB green | Sample center pixels, check for green dominance | Style drift (non-PCB output) |
| Not a solid color / has variation | Histogram check (std dev > threshold) | Blank/flat image |

### Fallback QA Verdict

When VLM is unavailable, return this structured verdict:

```text
QA verdict: FALLBACK (VLM unavailable)
deterministic_checks:
  - file_exists: PASS
  - file_size: {size}KB
  - dimensions: {width}x{height} ({ratio})
  - palette_check: {PASS/FAIL — contains PCB green}
  - variation_check: {PASS/FAIL — has visual content}
overall: PASS (deterministic checks only — VLM contextual check skipped)
note: VLM Pass 1 unavailable. Recommend manual review for label accuracy and worker action.
```

### When to Use Fallback

- VLM API key not configured
- VLM call times out (after 60s)
- VLM returns malformed/unparseable output
- Cost tier = lite (skip VLM by design)

### What Fallback Does NOT Replace

The fallback catches **structural** failures (blank image, wrong size, no green) but cannot judge **semantic** quality (is the worker doing the right action? are labels correct?). Always recommend VLM Pass 1 when available.

Accept the skill flow if:
- Auto-QA runs after every image generation.
- VLM check covers all mandatory checks + custom check.
- Retry budget is respected (max 3 attempts).
- Failure report is generated when all attempts fail.
- Results are recorded in prompt-records.

Regenerate the skill flow if:
- Auto-QA is skipped.
- VLM check does not cover mandatory checks.
- Retry loop runs indefinitely.
- No failure report when all attempts fail.
