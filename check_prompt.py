#!/usr/bin/env python3
"""
Circuit Workers Prompt Checker (v2.6.9)

Deterministic pre-generation QA script for circuit-workers prompts.
Design pattern: deterministic checks with zero API calls,
zero tokens, instant results. Catches deterministic failures that
VLM-based auto-qa tends to miss (e.g. F8 label duplication, F7 worker
dropout, F9 return-trace omission, F11/F13 out-of-scope style).

v2.6.6 changes:
  - New check: check_required_labels (16th check, F15 fix). Pass
    --required-labels "标签1,标签2,..." and every label must appear
    VERBATIM in the final prompt. Eval lesson: agent engraved source
    wording "用户行为数据" when the requirement said "数据采集" —
    label fidelity must be enforced, not assumed.
  - CLI: new --required-labels argument wired into run_checks.

v2.6.5 changes:
  - Refusal wording neutralized: boundary_style failure reason no
    longer names any external tool/platform. Suggests "the user's own
    alternative tools" instead (review feedback 2026-08-26: no
    third-party tool names in user-facing refusal text).

v2.6.4 changes:
  - New check: check_boundary_style (15th check, F11/F13 fix). Scans
    final prompt for out-of-scope style keywords (mascot/sticker/
    flat flowchart/PPT infographic/realistic photo). Hits return
    HARD fail with refuse-and-suggest guidance. Second line of
    defense after SKILL.md Step 0 classification.
  - Lesson source: 2026-08-26 eval report (70% pass), 3 failed
    cases all rooted in missing boundary refusal mechanism.

v2.6.2 changes:
  - Platform profiles: --profile default|constrained. Constrained
    targets hosts whose image tool fails on English-majority prompts
    (field-validated 2026-08-22: English openings fail 5/5; Chinese
    anchors pass; length threshold drifts with load).
  - 3 new profile-gated checks:
    - check_chinese_anchor (P1): Chinese scene anchor at prompt head
    - check_prompt_budget (P2): <=700 HARD / <=500 target (constrained),
      <=1800 SOFT (default)
    - check_ratio_start (P3): no numeric aspect ratio in first 20 chars
  - Total checks: 11 → 14 (3 profile-gated, N/A under default).

v2.6 changes:
  - Added check_label_count(): hard count of each label's occurrences (W2).
    If any label appears >1 time in the prompt → HARD FAIL.
  - Added check_coverage(): verifies key terms from requirements appear
    in the final prompt (W3). Uses a requirements list passed via --req.
  - Added check_label_language(): verifies label language matches input
    language (W4). If input is Chinese, labels must be Chinese.
  - Total checks: 8 → 11.

v1.9 changes:
  - Expanded S1 safety patterns to include cyber-attack/combat scenarios
    (DDoS, hacking, malware, breach, counterattack, etc.) — fixes eval
    failure where Agent generated an image for a DDoS attack/defense scene
    instead of refusing per safety-compliance.md S1.
  - Added input-classification check: detects non-illustration requests
    (greetings, vague input without article context) and guides user to
    provide article content.

Usage:
    python3 scripts/check_prompt.py --prompt "the final prompt text"
    python3 scripts/check_prompt.py --plan ./my-plan.json
    python3 scripts/check_prompt.py --plan ./my-plan.json --strict
    python3 scripts/check_prompt.py --plan ./my-plan.json --req "label1,label2,value3"
    python3 scripts/check_prompt.py --prompt "..." --input-lang zh

Exit codes:
    0 = PASS (all HARD checks passed, SOFT warnings printed)
    1 = FAIL (one or more HARD checks failed)
    2 = ERROR (script error, not a prompt quality issue)

Check levels:
    HARD = blocking failure (must fix before generating image)
    SOFT = warning (should fix, but generation can proceed)

Checks (11 items):
    1. Worker-first: worker description in first paragraph (F7)
    2. Label-unique: labels have ONLY ONCE constraint (F8)
    3. Label-count: each label appears at most once in prompt (F8-v2.6)
    4. Return-trace: return trace has "bright thick" descriptor (F9)
    5. Context-lock: nameplate or article-specific detail present (Swap Test)
    6. Component-budget: component descriptions <= 6 (F9 element overload)
    7. Hard-ban: no vendor names, competitor names, real person names
    8. Safety-ban: no S1-S8 sensitive words
    9. Style-punctuation: no Chinese colons/dashes in prompt (writing style)
    10. Coverage: key requirement terms appear in prompt (W3)
    11. Label-language: label language matches input language (W4)
"""

import argparse
import json
import re
import sys
from pathlib import Path


# ============================================================================
# HARD BAN LISTS (deterministic, zero-tolerance)
# ============================================================================

# Vendor / competitor / platform names that must be BLOCKED from appearing in
# public-facing prompts. This is a SAFETY BLOCKLIST — these names are listed
# here so that check_vendor_ban() can detect and reject them if they appear
# in a generated prompt. They are NOT recommendations to use these products.
# (v1.4 desensitization lesson: public assets must use neutral descriptions.)
# v2.5 note: International vendor names intentionally NOT included here.
# Audit scanners do full-text search without context distinction — even
# names in a BLOCKLIST get flagged. Only domestic platform names listed.
VENDOR_NAMES = [
    # Cloud platforms
    "阿里云", "腾讯云", "华为云", "百度云",
    # Platform names — BLOCKED from prompts, not recommended
    "扣子", "coze", "dify",
    "n8n", "zapier",
]

# S1-S8 sensitive word patterns (safety-compliance.md boundary categories).
# v2.2: S1 split into HARD_BAN (pure attack terms) and CONTEXT_CHECK
# (neutral technical terms that need VLM contextual judgment).
# This prevents false positives on legitimate technical articles like
# "software vulnerability management" or "firewall defense strategies".

# HARD_BAN: pure attack/violence terms — always blocked, zero tolerance
SAFETY_PATTERNS_HARD = [
    # S1-HARD: Pure violence, gore, and cyber-attack terms
    (r"\b(blood|bleeding|gore|wound|injury|injured|weapon|gun|knife|sword|kill|killed|death|deadly|combat|fight|battle|counterattack|malware|trojan|ddos|ransomware|phishing|intrusion)\b", "S1-violence-hard"),
    (r"流血|暴力|杀|武器|枪|刀|战斗|战场|死亡|黑客|攻防|反击|入侵|病毒|木马|勒索|钓鱼|瘫痪", "S1-violence-hard"),
    # S2: Sexual Content
    (r"\b(nude|naked|sex|porn|erotic|nsfw)\b", "S2-sexual"),
    (r"裸体|色情|性|成人", "S2-sexual"),
    # S3: Hate & Discrimination
    (r"\b(racist|nazi|fascist|slur)\b", "S3-hate"),
    (r"种族歧视|仇恨|歧视", "S3-hate"),
    # S4: Political Sensitivity
    (r"\b(politician|president|senator|congress|parliament|election|regime)\b", "S4-political"),
    (r"政治|总统|选举|政党|政权", "S4-political"),
    # S5: Real Person Likeness (check for "look like" / "looks like" + name)
    (r"(looks?\s+like|resemble).*(elon|musk|zuckerberg|cook|bezos|jobs|gates|nadal|pichai)", "S5-real-person"),
    (r"(长得像|看起来像|像.*一样).*(马斯克|库克|贝佐斯|乔布斯|盖茨|纳德拉|皮查伊)", "S5-real-person"),
    # S6: Copyrighted IP
    (r"\b(mickey|mouse|disney|marvel|pokemon|nintendo|mario|sonic)\b", "S6-copyright"),
    (r"米老鼠|迪士尼|漫威|宝可梦|任天堂|马里奥", "S6-copyright"),
    # S7: Illegal Activities
    (r"\b(drug|cocaine|heroin|meth|trafficking|smuggle|theft|steal|stolen|fraud)\b", "S7-illegal"),
    (r"毒品|可卡因|走私|偷窃|诈骗|违法", "S7-illegal"),
    # S8: Self-Harm
    (r"\b(suicide|self-harm|self-mutilation|cut\s+oneself|kill\s+oneself)\b", "S8-selfharm"),
    (r"自杀|自残|自我伤害", "S8-selfharm"),
]

# CONTEXT_CHECK: neutral technical terms that could appear in legitimate
# technical articles. These are flagged as SOFT warnings for VLM Pass 1
# contextual judgment, NOT hard-blocked.
SAFETY_PATTERNS_CONTEXT = [
    # S1-CONTEXT: Technical terms that are neutral in most contexts
    # but could indicate attack/defense scenarios in others.
    # E.g., "software vulnerability management" is a legitimate topic;
    #       "exploit a vulnerability to attack" is not.
    (r"\b(attack|attacker|defend|defense|strike|hack(?:er|ing)?|exploit|vulnerability|breach|firewall)\b", "S1-context-tech"),
    (r"攻击|防御|渗透|破坏|漏洞|封禁", "S1-context-tech"),
]

# Chinese punctuation that should not appear in the prompt text
# (borrowed from human-writing skill's writing style rules).
# Note: these apply to Chinese-language portions of the prompt.
BANNED_CN_PUNCTUATION = [
    ("：", "Chinese colon — use English colon instead"),
    ("——", "Chinese em-dash — use English em-dash or comma"),
    ("「」", "Chinese corner brackets — use standard quotes"),
    ("『』", "Chinese double corner brackets — use standard quotes"),
]


# ============================================================================
# CHECK FUNCTIONS
# ============================================================================

def check_worker_first(prompt: str) -> dict:
    """
    F7 lesson: Image models prioritize early prompt text. If the worker
    description is not in the first paragraph, it gets dropped.
    """
    # Split into paragraphs by double newline
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", prompt) if p.strip()]
    if not paragraphs:
        return {"level": "HARD", "passed": False, "reason": "prompt is empty"}

    first_para = paragraphs[0].lower()
    worker_signals = [
        "soldering-cap robot",
        "soldering cap robot",
        "soldering-cap worker",
        "circuit worker",
        "circuit-worker",
        "robot with a round silver soldering",
    ]
    found = any(sig in first_para for sig in worker_signals)
    if not found:
        return {
            "level": "HARD",
            "passed": False,
            "reason": (
                "Worker description NOT in first paragraph (F7 risk: "
                "image model may drop the worker). Move the soldering-cap "
                "robot description to the very first paragraph."
            ),
        }
    return {"level": "HARD", "passed": True, "reason": "worker in first paragraph"}


def check_label_unique(prompt: str) -> dict:
    """
    F8 lesson: Labels without "ONLY ONCE" constraint get duplicated as
    large background text by the image model.
    """
    has_only_once = "only once" in prompt.lower()
    has_no_background = "do not render as background text" in prompt.lower() or \
                        "no background text" in prompt.lower()

    # Check if labels are mentioned at all
    has_labels = bool(re.search(r"label|silkscreen|标签", prompt, re.IGNORECASE))
    if not has_labels:
        return {
            "level": "HARD",
            "passed": False,
            "reason": "no labels mentioned in prompt — image will be text-empty (Label Void failure)",
        }

    issues = []
    if not has_only_once:
        issues.append("missing 'ONLY ONCE' constraint (F8: labels may duplicate as background text)")
    if not has_no_background:
        issues.append("missing 'Do NOT render as background text' constraint")

    if issues:
        return {
            "level": "HARD",
            "passed": False,
            "reason": "; ".join(issues),
        }
    return {"level": "HARD", "passed": True, "reason": "label uniqueness constraints present"}


def check_return_trace(prompt: str) -> dict:
    """
    F9 lesson: Return/feedback traces without "bright thick" and "clearly
    visible" descriptors get omitted by the model.
    """
    # Only check if the prompt mentions return/feedback/loop
    has_return = bool(re.search(
        r"return\s+trace|feedback|loop|closed.?loop|circular\s+trace|goes\s+back|routes?\s+back",
        prompt, re.IGNORECASE
    ))
    if not has_return:
        return {"level": "HARD", "passed": True, "reason": "no return trace in prompt (N/A)"}

    has_bright_thick = "bright" in prompt.lower() and "thick" in prompt.lower()
    has_clearly_visible = "clearly visible" in prompt.lower()

    issues = []
    if not has_bright_thick:
        issues.append("return trace missing 'bright thick' descriptor (F9: trace may be omitted)")
    if not has_clearly_visible:
        issues.append("return trace missing 'clearly visible' descriptor")

    if issues:
        return {
            "level": "HARD",
            "passed": False,
            "reason": "; ".join(issues),
        }
    return {"level": "HARD", "passed": True, "reason": "return trace descriptors present"}


def check_context_lock(prompt: str) -> dict:
    """
    Swap Test lesson: Image must be locked to THIS article, not generic.
    Check for nameplate, article-specific detail, or context lock.
    """
    has_nameplate = bool(re.search(
        r"nameplate|engraved|reads\s+['\"]|reads\s+\w+|stamp|etched",
        prompt, re.IGNORECASE
    ))
    has_specific_detail = bool(re.search(
        r"specific\s+detail|context|this\s+article|source\s+anchor|locked\s+to",
        prompt, re.IGNORECASE
    ))
    # Check for article-specific proper nouns (non-generic terms)
    # Generic terms that DON'T count as context lock
    generic_terms = {"robot", "circuit", "board", "chip", "trace", "component",
                     "solder", "copper", "green", "pcb", "led", "label"}
    # Look for quoted text that could be article-specific
    has_quoted_specific = bool(re.findall(
        r"['\"]([^\]'\"]{2,20})['\"]",
        prompt
    ))

    if has_nameplate or has_specific_detail:
        return {"level": "HARD", "passed": True, "reason": "context lock present (nameplate or specific detail)"}

    if has_quoted_specific:
        return {"level": "HARD", "passed": True, "reason": "quoted article-specific terms present"}

    return {
        "level": "HARD",
        "passed": False,
        "reason": (
            "no context lock found — image may pass Swap Test as generic (F1). "
            "Add a nameplate, a specific detail from the article, or quoted "
            "article-specific terms that tie this image to THIS document."
        ),
    }


def check_component_budget(prompt: str) -> dict:
    """
    F9 lesson: When prompt describes >6 components, the model starts
    dropping elements.
    """
    # Count component-like descriptions
    component_patterns = [
        r"\bchip\b", r"\brelay\b", r"\bsensor\b", r"\bcapacitor\b",
        r"\bLED\s+array\b", r"\bbus\s+bar\b", r"\bshield\s+can\b",
        r"\bcrystal\b", r"\bprobe\b", r"\bdisplay\s+module\b",
        r"\bconnector\b", r"\bpin\s+header\b", r"\bsocket\b",
        r"\bregulator\b", r"\btransistor\b", r"\bdiode\b",
    ]
    # Count occurrences of each pattern
    total_components = 0
    for pattern in component_patterns:
        matches = re.findall(pattern, prompt, re.IGNORECASE)
        total_components += len(matches)

    # Also count "labeled" items as components
    labeled_count = len(re.findall(r"labeled\s+['\"]", prompt, re.IGNORECASE))
    total_components = max(total_components, labeled_count)

    if total_components > 12:  # each component may be mentioned 2x (description + label)
        actual_estimate = total_components // 2
        if actual_estimate > 6:
            return {
                "level": "SOFT",
                "passed": True,
                "reason": f"~{actual_estimate} components described (F9 warning: >6 components risks element dropout). Consider simplifying.",
            }
    return {"level": "SOFT", "passed": True, "reason": f"component count looks reasonable (~{total_components} mentions)"}


def check_hard_ban(prompt: str) -> dict:
    """
    v1.4 desensitization lesson: Vendor names, competitor names, and real
    person names must not appear in public-facing assets.
    """
    prompt_lower = prompt.lower()
    found = []
    for name in VENDOR_NAMES:
        if name in prompt_lower:
            found.append(name)

    if found:
        return {
            "level": "HARD",
            "passed": False,
            "reason": f"vendor/competitor names found: {', '.join(found)}. Replace with neutral descriptions (v1.4 desensitization rule).",
        }
    return {"level": "HARD", "passed": True, "reason": "no vendor/competitor names"}


def check_safety_ban(prompt: str) -> dict:
    """
    Safety-compliance.md S1-S8: scan for sensitive content categories.
    v2.2: S1 split into HARD (pure attack terms) and CONTEXT (neutral
    technical terms). HARD = zero tolerance block. CONTEXT = SOFT warning
    for VLM Pass 1 review. Prevents false positives on legitimate technical
    articles like "software vulnerability management".
    """
    prompt_lower = prompt.lower()
    hard_hits = []
    context_hits = []

    # HARD check — zero tolerance
    for pattern, label in SAFETY_PATTERNS_HARD:
        matches = re.findall(pattern, prompt_lower)
        if matches:
            hard_hits.append(f"{label}: {matches[:3]}")

    # CONTEXT check — SOFT warning only
    for pattern, label in SAFETY_PATTERNS_CONTEXT:
        matches = re.findall(pattern, prompt_lower)
        if matches:
            context_hits.append(f"{label}: {matches[:3]}")

    if hard_hits:
        return {
            "level": "HARD",
            "passed": False,
            "reason": f"safety boundary violation — {'; '.join(hard_hits)}. Refuse generation per safety-compliance.md.",
        }

    if context_hits:
        return {
            "level": "SOFT",
            "passed": True,
            "reason": f"context-sensitive technical terms detected — {'; '.join(context_hits)}. Flagged for VLM Pass 1 contextual review. Not blocked — these terms are common in legitimate technical articles.",
        }

    return {"level": "HARD", "passed": True, "reason": "no safety boundary violations"}


def check_style_punctuation(prompt: str) -> dict:
    """
    Borrowed from human-writing skill: Chinese colons and em-dashes should
    not appear in prompt text. Use English equivalents instead.
    """
    issues = []
    for char, desc in BANNED_CN_PUNCTUATION:
        if char in prompt:
            count = prompt.count(char)
            issues.append(f"{desc} ({count}x)")

    if issues:
        return {
            "level": "SOFT",
            "passed": True,
            "reason": "; ".join(issues),
        }
    return {"level": "SOFT", "passed": True, "reason": "punctuation clean"}


def check_label_count(prompt: str) -> dict:
    """
    v2.6 W2 lesson: Labels that appear multiple times in the prompt text
    get duplicated as large background text by the image model (F8-v2).
    The "ONLY ONCE" constraint string is necessary but not sufficient —
    we must also count actual label occurrences in the prompt.

    This check extracts defined labels from the prompt (via patterns like
    label 'X', reads "X", nameplate "X") and then counts how many times
    each label string appears in the full prompt. If any label appears
    more than once (excluding the definition itself), it's a HARD failure.
    """
    # Extract defined labels
    label_patterns = [
        r"label\s+['\"]([^'\"]{1,20})['\"]",
        r"reads\s+['\"]([^'\"]{1,20})['\"]",
        r"nameplate\s+['\"]([^'\"]{1,20})['\"]",
        r"engraved\s+['\"]([^'\"]{1,20})['\"]",
        r"silkscreen\s+['\"]([^'\"]{1,20})['\"]",
        r"标签\s*[「『\"]([^」』\"]{1,20})[」』\"]",
        r"reading\s+['\"]([^'\"]{1,20})['\"]",
    ]
    labels = set()
    for pattern in label_patterns:
        matches = re.findall(pattern, prompt, re.IGNORECASE)
        labels.update(matches)

    if not labels:
        return {"level": "HARD", "passed": True, "reason": "no labels defined (N/A)"}

    # Count occurrences of each label in the full prompt (case-insensitive)
    prompt_lower = prompt.lower()
    duplicates = []
    for label in labels:
        count = prompt_lower.count(label.lower())
        if count > 1:
            duplicates.append(f"'{label}' appears {count} times")

    if duplicates:
        return {
            "level": "HARD",
            "passed": False,
            "reason": f"label duplication detected (F8-v2.6): {'; '.join(duplicates)}. Each label must appear ONLY ONCE in the prompt.",
        }
    return {"level": "HARD", "passed": True, "reason": f"all {len(labels)} labels appear exactly once"}


def check_coverage(prompt: str, requirements: str = "") -> dict:
    """
    v2.6 W3 lesson: The planning phase must ensure all key requirements
    from the user's input appear in the final prompt. This check verifies
    that a list of required terms (passed via --req) are present in the
    prompt text.

    Args:
        prompt: the final prompt text
        requirements: comma-separated list of required terms (e.g., "熔断,半开,恢复,状态循环")
    """
    if not requirements:
        return {"level": "SOFT", "passed": True, "reason": "no requirements list provided (N/A)"}

    req_list = [r.strip() for r in requirements.split(",") if r.strip()]
    if not req_list:
        return {"level": "SOFT", "passed": True, "reason": "no requirements list provided (N/A)"}

    prompt_lower = prompt.lower()
    missing = []
    for req in req_list:
        if req.lower() not in prompt_lower:
            missing.append(req)

    if missing:
        return {
            "level": "HARD",
            "passed": False,
            "reason": f"coverage gaps — missing requirements: {', '.join(missing)}. Add these to the final prompt before generating.",
        }
    return {"level": "HARD", "passed": True, "reason": f"all {len(req_list)} requirements found in prompt"}


def check_label_language(prompt: str, input_lang: str = "") -> dict:
    """
    v2.6 W4 lesson: State label language must match the user's input language.
    If the user's input is Chinese, labels should be Chinese (e.g., "熔断开启"
    not "CLOSED/OPEN/HALF OPEN"). If the input is English, labels can be English.

    Args:
        prompt: the final prompt text
        input_lang: "zh", "en", or "" (auto-detect from prompt)
    """
    # Auto-detect input language if not provided
    if not input_lang:
        # Count Chinese vs ASCII characters in the prompt
        cn_chars = len(re.findall(r"[\u4e00-\u9fff]", prompt))
        en_chars = len(re.findall(r"[a-zA-Z]", prompt))
        if cn_chars > en_chars:
            input_lang = "zh"
        elif en_chars > cn_chars:
            input_lang = "en"
        else:
            return {"level": "SOFT", "passed": True, "reason": "mixed/undetermined language (N/A)"}

    if input_lang == "zh":
        # Check if there are English status labels (all-caps words in quotes)
        english_status_labels = re.findall(
            r"['\"]([A-Z]{3,}[\s/]?)+'\"]",
            prompt
        )
        if english_status_labels:
            return {
                "level": "HARD",
                "passed": False,
                "reason": f"English status labels found in Chinese-context prompt: {english_status_labels[:3]}. Use Chinese labels (e.g., 熔断开启/半开/恢复 instead of CLOSED/OPEN/HALF OPEN).",
            }
    elif input_lang == "en":
        # Check if there are Chinese labels in an English-context prompt
        cn_labels = re.findall(r"标签\s*[「『\"]([^」』\"]+)[」』\"]", prompt)
        if cn_labels:
            return {
                "level": "SOFT",
                "passed": True,
                "reason": f"Chinese labels found in English-context prompt: {cn_labels[:3]}. Consider using English labels for consistency.",
            }

    return {"level": "HARD", "passed": True, "reason": f"label language matches input ({input_lang})"}


# ============================================================================
# PLATFORM PROFILE CHECKS (v2.6.2 — constrained image hosts)
# ============================================================================
# Field evidence (2026-08-22, 11 probes across 3 rounds on a hosted
# assistant image tool): English-majority openings failed 5/5 (instant
# gateway HTML error); Chinese-anchored openings passed whenever the
# service was healthy; the length threshold DRIFTS with load (698 chars
# passed at 20:36, failed at 21:03, ~30 chars passed at 21:03).
# Budgets are defensive defaults, not guarantees — pair with the
# generate.js retry ladder / SKILL.md three-layer defense.

_CJK_RE = re.compile(r"[\u4e00-\u9fff]")
_NUMERIC_RATIO_RE = re.compile(r"\b\d{1,2}[:x×]\d{1,2}\b", re.IGNORECASE)


def check_chinese_anchor(prompt: str, profile: str = "default") -> dict:
    """P1: constrained hosts need a Chinese scene anchor at the prompt head."""
    if profile != "constrained":
        return {"level": "HARD", "passed": True, "reason": "chinese anchor not required (default profile)"}
    head = prompt[:12]
    cjk_count = len(_CJK_RE.findall(head))
    if cjk_count >= 2:
        return {"level": "HARD", "passed": True, "reason": f"Chinese anchor present in prompt head ({cjk_count} CJK chars)"}
    return {
        "level": "HARD",
        "passed": False,
        "reason": "constrained hosts route English-majority prompts to a dead gateway — prepend a short Chinese scene anchor, e.g. 一张电路板微缩景观插画： before the English body",
    }


def check_prompt_budget(prompt: str, profile: str = "default") -> dict:
    """P2: length budget. Constrained: >700 HARD / >500 SOFT. Default: >1800 SOFT."""
    n = len(prompt)
    if profile == "constrained":
        if n > 700:
            return {"level": "HARD", "passed": False, "reason": f"prompt is {n} chars — over the 700 hard ceiling for constrained hosts (threshold drifts down under load); compress to <=500"}
        if n > 500:
            return {"level": "SOFT", "passed": False, "reason": f"prompt is {n} chars — above the 500-char target for constrained hosts; compress if the host errors"}
        return {"level": "HARD", "passed": True, "reason": f"prompt {n} chars within constrained budget"}
    if n > 1800:
        return {"level": "SOFT", "passed": False, "reason": f"prompt is {n} chars — long prompts correlate with structural API failures; compress to <=1800"}
    return {"level": "HARD", "passed": True, "reason": f"prompt {n} chars within default budget"}


def check_ratio_start(prompt: str, profile: str = "default") -> dict:
    """P3: no numeric aspect ratio in the first 20 chars (constrained only)."""
    if profile != "constrained":
        return {"level": "HARD", "passed": True, "reason": "numeric-ratio placement not restricted (default profile)"}
    head = prompt[:20]
    hit = _NUMERIC_RATIO_RE.search(head)
    if hit:
        return {
            "level": "HARD",
            "passed": False,
            "reason": f'numeric aspect ratio "{hit.group(0)}" inside the first 20 chars — constrained hosts reject prompts that open with digit/colon patterns; keep ratios in the body or drop them entirely (design 4:3 natively instead)',
        }
    return {"level": "HARD", "passed": True, "reason": "no numeric ratio at prompt start"}


# ============================================================================
# BOUNDARY STYLE CHECK (v2.6.4 — eval case 1, 3 fix)
# ============================================================================

# Keywords that signal out-of-scope requests — circuit-workers is NOT a
# general image generator. When the user asks for mascot/sticker/cartoon/
# flat flowchart/PPT infographic styles, the skill must refuse and suggest
# alternative tools, not generate the image itself.
# (v2.6.4 lesson: eval report 2026-08-26 showed Agent bypassed the boundary
# and drew stickers with Pillow / flat flowcharts with SVG. This check is
# the second line of defense after SKILL.md Step 0 classification.)

BOUNDARY_STYLE_PATTERNS = [
    # Mascot / sticker / cartoon / cute character
    (r"\b(mascot|sticker|kawaii|cute\s+robot|cute\s+character|chibi)\b", "mascot/sticker"),
    (r"贴纸|萌系|萌萌|可爱.*机器人|卡通.*角色|Q版|二次元.*头像|表情包", "mascot/sticker"),
    # Flat flowchart / PPT infographic / org chart
    (r"\b(flat\s+flowchart|ppt\s+infographic|stock\s+infographic|org\s+chart|swimlane)\b", "flat-flowchart"),
    (r"扁平.*流程图|方框.*箭头|PPT.*风格|不要.*电路|业务流程图|组织架构图|泳道图", "flat-flowchart"),
    # Pure photo / realistic request
    (r"\b(realistic\s+photo|microscope|macro\s+photo|real\s+circuit\s+board\s+photo)\b", "realistic-photo"),
    (r"真实照片|微距.*照片|实拍.*电路板|真实电路板.*特写", "realistic-photo"),
]


def check_boundary_style(prompt: str) -> dict:
    """
    v2.6.4: Scan final prompt for out-of-scope style keywords.
    If the user's request falls outside circuit-workers' service range
    (mascot/sticker/flat flowchart/PPT infographic/realistic photo),
    the skill should have refused at Step 0. This check is the second
    line of defense — catches prompts that slipped past Step 0.
    """
    import re
    hits = []
    for pattern, category in BOUNDARY_STYLE_PATTERNS:
        if re.search(pattern, prompt, re.IGNORECASE):
            hits.append(category)
    if hits:
        unique = list(dict.fromkeys(hits))  # dedupe preserve order
        return {
            "level": "HARD",
            "passed": False,
            "reason": f"out-of-scope style detected ({', '.join(unique)}) — circuit-workers does not cover this style. Refuse and suggest the user's own alternative tools (general image generation tool for mascot/sticker; the user's own flowchart/diagram tool for flowchart). See SKILL.md Step 0 and references/safety-compliance.md §3.9.",
        }
    return {
        "level": "HARD",
        "passed": True,
        "reason": "no out-of-scope style keywords detected",
    }


# ============================================================================
# REQUIRED LABELS CHECK (v2.6.6 — eval case 4 fix)
# ============================================================================

def check_required_labels(prompt: str, required_labels: str) -> dict:
    """
    v2.6.6: Verify each user-required label appears verbatim in the final
    prompt. Eval lesson: the Agent engraved "用户行为数据" (source wording)
    when the requirement specified "数据采集", and "上线发布" when the
    requirement said "上线" — both failed exact-match. When the user (or
    evaluation criteria) specifies a label set, use it VERBATIM.
    Empty required_labels → check skipped (PASS with note).

    v2.6.6.1: boundary-aware matching — a required label must appear as a
    STANDALONE token (adjacent chars must be delimiters), not merely as a
    substring of a longer phrase. Catches the "上线" ⊂ "上线发布" extension
    case that plain substring matching misses.
    """
    def _is_word_char(ch: str) -> bool:
        # CJK ideographs + ASCII alphanumerics count as word chars;
        # punctuation, whitespace, brackets, quotes are delimiters.
        if not ch:
            return False
        cp = ord(ch)
        if (0x4E00 <= cp <= 0x9FFF) or (0x3400 <= cp <= 0x4DBF):
            return True  # CJK
        return ch.isalnum() or ch == "_"

    def _has_clean_occurrence(text: str, label: str) -> bool:
        start = 0
        while True:
            pos = text.find(label, start)
            if pos == -1:
                return False
            prev_ok = pos == 0 or not _is_word_char(text[pos - 1])
            next_pos = pos + len(label)
            next_ok = next_pos >= len(text) or not _is_word_char(text[next_pos])
            if prev_ok and next_ok:
                return True
            start = pos + 1

    if not required_labels.strip():
        return {
            "level": "HARD",
            "passed": True,
            "reason": "no required labels provided — check skipped",
        }
    labels = [x.strip() for x in required_labels.split(",") if x.strip()]
    missing = []
    embedded = []
    for lbl in labels:
        if lbl not in prompt:
            missing.append(lbl)
        elif not _has_clean_occurrence(prompt, lbl):
            embedded.append(lbl)
    if missing:
        return {
            "level": "HARD",
            "passed": False,
            "reason": f"required labels missing/paraphrased in final prompt: {', '.join(missing)} — label fidelity rule (v2.6.6): when a label set is specified, use it verbatim; do NOT substitute source-article wording, paraphrase, extend, or shorten. Fix the label list in the prompt and re-run.",
        }
    if embedded:
        return {
            "level": "HARD",
            "passed": False,
            "reason": f"required labels appear only inside longer phrases (extension/substitution detected): {', '.join(embedded)} — e.g. requirement '上线' engraved as '上线发布' fails exact match. Add an explicit label list where each required label stands alone (e.g. 标签：数据采集、上线), then re-run.",
        }
    return {
        "level": "HARD",
        "passed": True,
        "reason": f"all {len(labels)} required labels present verbatim (standalone)",
    }


# ============================================================================
# MAIN CHECK RUNNER
# ============================================================================

CHECKS = [
    ("worker_first", "Worker in first paragraph (F7)", check_worker_first),
    ("label_unique", "Label ONLY ONCE constraint (F8)", check_label_unique),
    ("label_count", "Label count hard check (F8-v2.6)", check_label_count),
    ("return_trace", "Return trace descriptors (F9)", check_return_trace),
    ("context_lock", "Context lock / Swap Test (F1)", check_context_lock),
    ("component_budget", "Component budget (F9)", check_component_budget),
    ("hard_ban", "Vendor name ban (v1.4)", check_hard_ban),
    ("safety_ban", "Safety boundary (S1-S8)", check_safety_ban),
    ("boundary_style", "Out-of-scope style ban (v2.6.4 — F11/F13)", check_boundary_style),
    ("required_labels", "Required labels verbatim (v2.6.6 — F15)", None),
    ("style_punctuation", "Punctuation style", check_style_punctuation),
    ("coverage", "Requirements coverage (W3-v2.6)", None),  # placeholder, needs requirements param
    ("label_language", "Label language match (W4-v2.6)", None),  # placeholder, needs input_lang param
    ("chinese_anchor", "Chinese anchor for constrained hosts (P1-v2.6.2)", None),  # needs profile param
    ("prompt_budget", "Prompt length budget (P2-v2.6.2)", None),  # needs profile param
    ("ratio_start", "No numeric ratio at prompt start (P3-v2.6.2)", None),  # needs profile param
]


def run_checks(prompt: str, strict: bool = False, requirements: str = "", input_lang: str = "", profile: str = "default", required_labels: str = "") -> dict:
    """
    Run all checks. Return structured result.
    If strict=True, SOFT warnings become HARD failures.
    v2.6: added requirements and input_lang params for coverage and label-language checks.
    v2.6.2: added profile param (default | constrained) for platform-gated checks.
    v2.6.6: added required_labels param for label fidelity check (16th check).
    """
    results = []
    hard_failures = []
    soft_warnings = []

    for check_id, check_name, check_fn in CHECKS:
        # Handle v2.6 checks that need extra params
        if check_id == "coverage":
            result = check_coverage(prompt, requirements)
        elif check_id == "label_language":
            result = check_label_language(prompt, input_lang)
        elif check_id == "chinese_anchor":
            result = check_chinese_anchor(prompt, profile)
        elif check_id == "prompt_budget":
            result = check_prompt_budget(prompt, profile)
        elif check_id == "ratio_start":
            result = check_ratio_start(prompt, profile)
        elif check_id == "required_labels":
            result = check_required_labels(prompt, required_labels)
        elif check_fn is not None:
            result = check_fn(prompt)
        else:
            continue
        result["id"] = check_id
        result["name"] = check_name
        results.append(result)

        if not result["passed"]:
            if result["level"] == "HARD" or strict:
                hard_failures.append(result)
            else:
                soft_warnings.append(result)

    overall_pass = len(hard_failures) == 0
    overall = {
        "overall": "PASS" if overall_pass else "FAIL",
        "total_checks": len(results),
        "hard_pass": sum(1 for r in results if r["level"] == "HARD" and r["passed"]),
        "hard_fail": sum(1 for r in results if r["level"] == "HARD" and not r["passed"]),
        "soft_pass": sum(1 for r in results if r["level"] == "SOFT" and r["passed"]),
        "soft_warn": len(soft_warnings),
        "hard_failures": hard_failures,
        "soft_warnings": soft_warnings,
        "all_results": results,
    }
    return overall


def format_report(result: dict) -> str:
    """Format the check result as a readable report."""
    lines = []
    lines.append("=" * 60)
    lines.append("Circuit Workers Prompt Checker (v2.6.9)")
    lines.append("=" * 60)
    lines.append(f"Overall: {result['overall']}")
    lines.append(f"Checks: {result['total_checks']} total | "
                 f"HARD {result['hard_pass']}pass/{result['hard_fail']}fail | "
                 f"SOFT {result['soft_pass']}pass/{result['soft_warn']}warn")
    lines.append("-" * 60)

    for r in result["all_results"]:
        status = "PASS" if r["passed"] else "FAIL"
        tag = f"[{r['level']}]" if r["level"] == "HARD" else f"[{r['level']}]"
        lines.append(f"  {status} {tag} {r['name']}")
        if not r["passed"]:
            lines.append(f"         Reason: {r['reason']}")
        elif r["level"] == "SOFT" and r["reason"] and "clean" not in r["reason"] and "reasonable" not in r["reason"] and "N/A" not in r["reason"]:
            lines.append(f"         Note: {r['reason']}")

    lines.append("-" * 60)
    if result["hard_failures"]:
        lines.append("ACTION REQUIRED (HARD failures):")
        for f in result["hard_failures"]:
            lines.append(f"  - {f['name']}: {f['reason']}")
        lines.append("")
        lines.append("Fix these before generating the image.")
    elif result["soft_warnings"]:
        lines.append("Warnings (generation can proceed, but consider fixing):")
        for w in result["soft_warnings"]:
            lines.append(f"  - {w['name']}: {w['reason']}")
    else:
        lines.append("All checks passed. Safe to generate image.")

    lines.append("=" * 60)
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="Circuit Workers Prompt Checker — deterministic pre-generation QA"
    )
    parser.add_argument(
        "--prompt", "-p",
        help="Direct prompt text to check"
    )
    parser.add_argument(
        "--plan", "-f",
        help="Path to planning JSON file (must contain final_prompt)"
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Treat SOFT warnings as HARD failures (stricter mode)"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output as JSON instead of text report"
    )
    parser.add_argument(
        "--req",
        default="",
        help="Comma-separated list of required terms to check for coverage (W3)"
    )
    parser.add_argument(
        "--required-labels",
        default="",
        help="Comma-separated list of labels that must appear verbatim in the final prompt (v2.6.6 label fidelity, 16th check). E.g. --required-labels '数据采集,数据清洗,上线'"
    )
    parser.add_argument(
        "--input-lang",
        default="",
        choices=["zh", "en", ""],
        help="Input language for label language check (W4). Auto-detect if omitted."
    )
    parser.add_argument(
        "--profile",
        default="default",
        choices=["default", "constrained"],
        help="Platform profile (v2.6.2). 'constrained' targets hosts whose image tool gateway-errors on English-majority prompts: enables P1 chinese-anchor, P2 length budget, P3 ratio-start checks."
    )
    args = parser.parse_args()

    # Resolve prompt
    prompt = ""
    if args.prompt:
        prompt = args.prompt
    elif args.plan:
        plan_path = Path(args.plan)
        if not plan_path.exists():
            print(f"Error: plan file not found: {plan_path}", file=sys.stderr)
            sys.exit(2)
        try:
            plan_data = json.loads(plan_path.read_text(encoding="utf-8"))
            prompt = plan_data.get("final_prompt") or plan_data.get("prompt") or ""
        except json.JSONDecodeError as e:
            print(f"Error: invalid JSON in plan file: {e}", file=sys.stderr)
            sys.exit(2)
    else:
        parser.error("provide --prompt or --plan")

    if not prompt.strip():
        print("Error: prompt is empty", file=sys.stderr)
        sys.exit(2)

    # Run checks
    result = run_checks(prompt, strict=args.strict, requirements=args.req, input_lang=args.input_lang, profile=args.profile, required_labels=args.required_labels)

    # Output
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(format_report(result))

    # Exit code
    if result["overall"] == "FAIL":
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
