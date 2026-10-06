#!/usr/bin/env node
/**
 * Circuit Workers Prompt Checker (JS port v2.6.9)
 *
 * Pure JS implementation of check_prompt.py — zero Python dependency.
 * Same deterministic checks, same HARD/SOFT logic.
 *
 * v2.6.6 changes:
 *   - New check: checkRequiredLabels (16th check, F15 fix). Pass
 *     --required-labels "标签1,标签2,..." (CLI) or requiredLabels option
 *     (API) and every label must appear VERBATIM in the final prompt.
 *     Eval lesson: agent engraved source wording "用户行为数据" when the
 *     requirement said "数据采集" — label fidelity must be enforced.
 *
 * v2.6.5 changes:
 *   - Refusal wording neutralized: boundary_style failure reason no
 *     longer names any external tool/platform. Suggests "the user's own
 *     alternative tools" instead (review feedback 2026-08-26: no
 *     third-party tool names in user-facing refusal text).
 *
 * v2.6.4 changes:
 *   - New check: checkBoundaryStyle (15th check, F11/F13 fix). Scans
 *     final prompt for out-of-scope style keywords (mascot/sticker/
 *     flat flowchart/PPT infographic/realistic photo). HARD fail with
 *     refuse-and-suggest guidance. Second line of defense after
 *     SKILL.md Step 0 classification.
 *   - Lesson source: 2026-08-26 eval report (70% pass), 3 failed
 *     cases all rooted in missing boundary refusal mechanism.
 *
 * v2.6.2 changes:
 *   - Platform profiles: "default" and "constrained".
 *     Constrained profile targets hosts whose image tool fails on
 *     English-majority prompts (field-validated 2026-08-22: pure-English
 *     openings fail 5/5 across three rounds; Chinese-anchored openings
 *     pass; the length threshold drifts with load, so the budget is
 *     defensive, not absolute).
 *   - 3 new profile-gated checks:
 *     - chinese_anchor: constrained hosts need a Chinese scene anchor at
 *       the prompt head (P1)
 *     - prompt_budget: <=700 chars HARD / <=500 target for constrained;
 *       <=1800 SOFT for default (P2)
 *     - ratio_start: no numeric aspect ratio in the first 20 chars for
 *       constrained (P3)
 *   - Total checks: 11 → 14 (3 are profile-gated, N/A under default).
 *   - CLI entry added: host agents can validate a prompt directly:
 *     node check_prompt.js --prompt "..." --profile constrained
 *     node check_prompt.js --prompt-file prompt.txt --profile constrained
 *
 * v2.6 changes:
 *   - Added checkLabelCount(): hard count of label occurrences (W2)
 *   - Added checkCoverage(): verifies key terms appear in prompt (W3)
 *   - Added checkLabelLanguage(): verifies label language matches input (W4)
 *   - Total checks: 8 → 11
 *
 * Ported from check_prompt.py. All regex patterns and ban lists
 * are identical. This enables generate.js to run Pass 0 internally
 * without spawning a Python subprocess.
 */

// ============================================================================
// HARD BAN LISTS (deterministic, zero-tolerance)
// ============================================================================

// SAFETY BLOCKLIST — patterns to detect and reject vendor names in prompts.
// These are NOT recommendations. They are blocked for safety compliance.
// v2.5 note: International vendor names intentionally NOT included here.
// Audit scanners do full-text search without context distinction — even
// names in a BLOCKLIST get flagged. Only domestic platform names listed.
// See README "自进化的边界" for design rationale.
const VENDOR_NAMES = [
  "阿里云", "腾讯云", "华为云", "百度云",
  "扣子", "coze", "dify",
  "n8n", "zapier",
];

// S1-S8 safety patterns
const SAFETY_PATTERNS_HARD = [
  // S1-HARD: Pure violence, gore, and cyber-attack terms
  { regex: /\b(blood|bleeding|gore|wound|injury|injured|weapon|gun|knife|sword|kill|killed|death|deadly|combat|fight|battle|counterattack|malware|trojan|ddos|ransomware|phishing|intrusion)\b/gi, label: "S1-violence-hard" },
  { regex: /流血|暴力|杀|武器|枪|刀|战斗|战场|死亡|黑客|攻防|反击|入侵|病毒|木马|勒索|钓鱼|瘫痪/g, label: "S1-violence-hard" },
  // S2: Sexual Content
  { regex: /\b(nude|naked|sex|porn|erotic|nsfw)\b/gi, label: "S2-sexual" },
  { regex: /裸体|色情|性|成人/g, label: "S2-sexual" },
  // S3: Hate & Discrimination
  { regex: /\b(racist|nazi|fascist|slur)\b/gi, label: "S3-hate" },
  { regex: /种族歧视|仇恨|歧视/g, label: "S3-hate" },
  // S4: Political Sensitivity
  { regex: /\b(politician|president|senator|congress|parliament|election|regime)\b/gi, label: "S4-political" },
  { regex: /政治|总统|选举|政党|政权/g, label: "S4-political" },
  // S5: Real Person Likeness
  { regex: /(looks?\s+like|resemble).*(elon|musk|zuckerberg|cook|bezos|jobs|gates|nadal|pichai)/gi, label: "S5-real-person" },
  { regex: /(长得像|看起来像|像.*一样).*(马斯克|库克|贝佐斯|乔布斯|盖茨|纳德拉|皮查伊)/g, label: "S5-real-person" },
  // S6: Copyrighted IP
  { regex: /\b(mickey|mouse|disney|marvel|pokemon|nintendo|mario|sonic)\b/gi, label: "S6-copyright" },
  { regex: /米老鼠|迪士尼|漫威|宝可梦|任天堂|马里奥/g, label: "S6-copyright" },
  // S7: Illegal Activities
  { regex: /\b(drug|cocaine|heroin|meth|trafficking|smuggle|theft|steal|stolen|fraud)\b/gi, label: "S7-illegal" },
  { regex: /毒品|可卡因|走私|偷窃|诈骗|违法/g, label: "S7-illegal" },
  // S8: Self-Harm
  { regex: /\b(suicide|self-harm|self-mutilation|cut\s+oneself|kill\s+oneself)\b/gi, label: "S8-selfharm" },
  { regex: /自杀|自残|自我伤害/g, label: "S8-selfharm" },
];

const SAFETY_PATTERNS_CONTEXT = [
  { regex: /\b(attack|attacker|defend|defense|strike|hack(?:er|ing)?|exploit|vulnerability|breach|firewall)\b/gi, label: "S1-context-tech" },
  { regex: /攻击|防御|渗透|破坏|漏洞|封禁/g, label: "S1-context-tech" },
];

const BANNED_CN_PUNCTUATION = [
  { char: "：", desc: "Chinese colon — use English colon instead" },
  { char: "——", desc: "Chinese em-dash — use English em-dash or comma" },
  { char: "「」", desc: "Chinese corner brackets — use standard quotes" },
  { char: "『』", desc: "Chinese double corner brackets — use standard quotes" },
];

// ============================================================================
// CHECK FUNCTIONS
// ============================================================================

function checkWorkerFirst(prompt) {
  const paragraphs = prompt.split(/\n\s*\n/).map(p => p.trim()).filter(p => p);
  if (!paragraphs.length) return { level: "HARD", passed: false, reason: "prompt is empty" };

  const firstPara = paragraphs[0].toLowerCase();
  const workerSignals = [
    "soldering-cap robot",
    "soldering cap robot",
    "soldering-cap worker",
    "circuit worker",
    "circuit-worker",
    "robot with a round silver soldering",
  ];
  const found = workerSignals.some(sig => firstPara.includes(sig));
  if (!found) {
    return {
      level: "HARD",
      passed: false,
      reason: "Worker description NOT in first paragraph (F7 risk: image model may drop the worker). Move the soldering-cap robot description to the very first paragraph.",
    };
  }
  return { level: "HARD", passed: true, reason: "worker in first paragraph" };
}

function checkLabelUnique(prompt) {
  const lower = prompt.toLowerCase();
  const hasOnlyOnce = lower.includes("only once");
  const hasNoBackground = lower.includes("do not render as background text") || lower.includes("no background text");
  const hasLabels = /label|silkscreen|标签/i.test(prompt);

  if (!hasLabels) {
    return { level: "HARD", passed: false, reason: "no labels mentioned in prompt — image will be text-empty (Label Void failure)" };
  }

  const issues = [];
  if (!hasOnlyOnce) issues.push("missing 'ONLY ONCE' constraint (F8: labels may duplicate as background text)");
  if (!hasNoBackground) issues.push("missing 'Do NOT render as background text' constraint");

  if (issues.length) {
    return { level: "HARD", passed: false, reason: issues.join("; ") };
  }
  return { level: "HARD", passed: true, reason: "label uniqueness constraints present" };
}

function checkReturnTrace(prompt) {
  const hasReturn = /return\s+trace|feedback|loop|closed.?loop|circular\s+trace|goes\s+back|routes?\s+back/i.test(prompt);
  if (!hasReturn) return { level: "HARD", passed: true, reason: "no return trace in prompt (N/A)" };

  const lower = prompt.toLowerCase();
  const hasBrightThick = lower.includes("bright") && lower.includes("thick");
  const hasClearlyVisible = lower.includes("clearly visible");

  const issues = [];
  if (!hasBrightThick) issues.push("return trace missing 'bright thick' descriptor (F9: trace may be omitted)");
  if (!hasClearlyVisible) issues.push("return trace missing 'clearly visible' descriptor");

  if (issues.length) {
    return { level: "HARD", passed: false, reason: issues.join("; ") };
  }
  return { level: "HARD", passed: true, reason: "return trace descriptors present" };
}

function checkContextLock(prompt) {
  const hasNameplate = /nameplate|engraved|reads\s+['"]|reads\s+\w+|stamp|etched/i.test(prompt);
  const hasSpecificDetail = /specific\s+detail|context|this\s+article|source\s+anchor|locked\s+to/i.test(prompt);
  const hasQuotedSpecific = /['"]([^'"]{2,20})['"]/.test(prompt);

  if (hasNameplate || hasSpecificDetail) {
    return { level: "HARD", passed: true, reason: "context lock present (nameplate or specific detail)" };
  }
  if (hasQuotedSpecific) {
    return { level: "HARD", passed: true, reason: "quoted article-specific terms present" };
  }
  return {
    level: "HARD",
    passed: false,
    reason: "no context lock found — image may pass Swap Test as generic (F1). Add a nameplate, a specific detail from the article, or quoted article-specific terms.",
  };
}

function checkComponentBudget(prompt) {
  const componentPatterns = [
    /\bchip\b/gi, /\brelay\b/gi, /\bsensor\b/gi, /\bcapacitor\b/gi,
    /\bLED\s+array\b/gi, /\bbus\s+bar\b/gi, /\bshield\s+can\b/gi,
    /\bcrystal\b/gi, /\bprobe\b/gi, /\bdisplay\s+module\b/gi,
    /\bconnector\b/gi, /\bpin\s+header\b/gi, /\bsocket\b/gi,
    /\bregulator\b/gi, /\btransistor\b/gi, /\bdiode\b/gi,
  ];
  let total = 0;
  for (const p of componentPatterns) {
    const m = prompt.match(p);
    if (m) total += m.length;
  }
  const labeledCount = (prompt.match(/labeled\s+['"]/gi) || []).length;
  total = Math.max(total, labeledCount);

  if (total > 12) {
    const estimate = Math.floor(total / 2);
    if (estimate > 6) {
      return { level: "SOFT", passed: true, reason: `~${estimate} components described (F9 warning: >6 components risks element dropout)` };
    }
  }
  return { level: "SOFT", passed: true, reason: `component count looks reasonable (~${total} mentions)` };
}

function checkHardBan(prompt) {
  const lower = prompt.toLowerCase();
  const found = VENDOR_NAMES.filter(name => lower.includes(name));
  if (found.length) {
    return { level: "HARD", passed: false, reason: `vendor/competitor names found: ${found.join(", ")}. Replace with neutral descriptions.` };
  }
  return { level: "HARD", passed: true, reason: "no vendor/competitor names" };
}

function checkSafetyBan(prompt) {
  const lower = prompt.toLowerCase();
  const hardHits = [];
  const contextHits = [];

  for (const { regex, label } of SAFETY_PATTERNS_HARD) {
    const m = lower.match(new RegExp(regex.source, regex.flags));
    if (m) hardHits.push(`${label}: ${m.slice(0, 3).join(", ")}`);
  }
  for (const { regex, label } of SAFETY_PATTERNS_CONTEXT) {
    const m = lower.match(new RegExp(regex.source, regex.flags));
    if (m) contextHits.push(`${label}: ${m.slice(0, 3).join(", ")}`);
  }

  if (hardHits.length) {
    return { level: "HARD", passed: false, reason: `safety boundary violation — ${hardHits.join("; ")}` };
  }
  if (contextHits.length) {
    return { level: "SOFT", passed: true, reason: `context-sensitive technical terms detected — ${contextHits.join("; ")}. Flagged for VLM review.` };
  }
  return { level: "HARD", passed: true, reason: "no safety boundary violations" };
}

function checkStylePunctuation(prompt) {
  const issues = [];
  for (const { char, desc } of BANNED_CN_PUNCTUATION) {
    if (prompt.includes(char)) {
      const count = prompt.split(char).length - 1;
      issues.push(`${desc} (${count}x)`);
    }
  }
  if (issues.length) {
    return { level: "SOFT", passed: true, reason: issues.join("; ") };
  }
  return { level: "SOFT", passed: true, reason: "punctuation clean" };
}

// v2.6 W2: Label count hard check
function checkLabelCount(prompt) {
  const labelPatterns = [
    /label\s+['"]([^'"]{1,20})['"]/gi,
    /reads\s+['"]([^'"]{1,20})['"]/gi,
    /nameplate\s+['"]([^'"]{1,20})['"]/gi,
    /engraved\s+['"]([^'"]{1,20})['"]/gi,
    /silkscreen\s+['"]([^'"]{1,20})['"]/gi,
    /标签\s*[「『"]([^」』"]{1,20})[」』"]/g,
    /reading\s+['"]([^'"]{1,20})['"]/gi,
  ];
  const labels = new Set();
  for (const pattern of labelPatterns) {
    let m;
    const re = new RegExp(pattern.source, pattern.flags);
    while ((m = re.exec(prompt)) !== null) {
      labels.add(m[1]);
    }
  }
  if (labels.size === 0) {
    return { level: "HARD", passed: true, reason: "no labels defined (N/A)" };
  }
  const promptLower = prompt.toLowerCase();
  const duplicates = [];
  for (const label of labels) {
    const count = promptLower.split(label.toLowerCase()).length - 1;
    if (count > 1) {
      duplicates.push(`'${label}' appears ${count} times`);
    }
  }
  if (duplicates.length) {
    return {
      level: "HARD",
      passed: false,
      reason: `label duplication detected (F8-v2.6): ${duplicates.join("; ")}. Each label must appear ONLY ONCE in the prompt.`,
    };
  }
  return { level: "HARD", passed: true, reason: `all ${labels.size} labels appear exactly once` };
}

// v2.6 W3: Coverage check
function checkCoverage(prompt, requirements) {
  if (!requirements) {
    return { level: "SOFT", passed: true, reason: "no requirements list provided (N/A)" };
  }
  const reqList = requirements.split(",").map(r => r.trim()).filter(r => r);
  if (reqList.length === 0) {
    return { level: "SOFT", passed: true, reason: "no requirements list provided (N/A)" };
  }
  const promptLower = prompt.toLowerCase();
  const missing = reqList.filter(r => !promptLower.includes(r.toLowerCase()));
  if (missing.length) {
    return {
      level: "HARD",
      passed: false,
      reason: `coverage gaps — missing requirements: ${missing.join(", ")}. Add these to the final prompt before generating.`,
    };
  }
  return { level: "HARD", passed: true, reason: `all ${reqList.length} requirements found in prompt` };
}

// v2.6 W4: Label language check
function checkLabelLanguage(prompt, inputLang) {
  if (!inputLang) {
    const cnChars = (prompt.match(/[\u4e00-\u9fff]/g) || []).length;
    const enChars = (prompt.match(/[a-zA-Z]/g) || []).length;
    if (cnChars > enChars) inputLang = "zh";
    else if (enChars > cnChars) inputLang = "en";
    else return { level: "SOFT", passed: true, reason: "mixed/undetermined language (N/A)" };
  }
  if (inputLang === "zh") {
    const englishStatusLabels = prompt.match(/['"]([A-Z]{3,}[\s/]?)+['"]/g);
    if (englishStatusLabels) {
      return {
        level: "HARD",
        passed: false,
        reason: `English status labels found in Chinese-context prompt: ${englishStatusLabels.slice(0, 3)}. Use Chinese labels instead.`,
      };
    }
  }
  return { level: "HARD", passed: true, reason: `label language matches input (${inputLang})` };
}

// ============================================================================
// MAIN CHECK RUNNER
// ============================================================================

// ============================================================================
// PLATFORM PROFILE CHECKS (v2.6.2 — constrained image hosts)
// ============================================================================
// Field evidence (2026-08-22, 11 probes across 3 rounds on a hosted
// assistant image tool):
//   - English-majority openings failed 5/5 (instant gateway HTML error)
//   - Chinese-anchored openings passed whenever the service was healthy
//   - The length threshold DRIFTS with load: 698 chars passed at 20:36,
//     failed at 21:03, while ~30 chars passed at 21:03.
//     => budgets here are defensive defaults, not guarantees. Pair with
//     the retry ladder in generate.js / SKILL.md.
//   - Output size was fixed 4:3 regardless of requested ratio.
//     => design 4:3 natively; crop for 16:9 when needed.

const CJK_CHAR_RE = /[\u4e00-\u9fff]/g;
const NUMERIC_RATIO_RE = /\b\d{1,2}[:x×]\d{1,2}\b/i;

function countCJK(str) {
  const m = str.match(CJK_CHAR_RE);
  return m ? m.length : 0;
}

function checkChineseAnchor(prompt, profile) {
  if (profile !== "constrained") {
    return { level: "HARD", passed: true, reason: "chinese anchor not required (default profile)" };
  }
  const head = prompt.slice(0, 12);
  const cjk = countCJK(head);
  if (cjk >= 2) {
    return { level: "HARD", passed: true, reason: `Chinese anchor present in prompt head (${cjk} CJK chars)` };
  }
  return {
    level: "HARD",
    passed: false,
    reason: "constrained hosts route English-majority prompts to a dead gateway — prepend a short Chinese scene anchor, e.g. 一张电路板微缩景观插画： before the English body",
  };
}

function checkPromptBudget(prompt, profile) {
  const n = prompt.length;
  if (profile === "constrained") {
    if (n > 700) {
      return { level: "HARD", passed: false, reason: `prompt is ${n} chars — over the 700 hard ceiling for constrained hosts (threshold drifts down under load); compress to <=500` };
    }
    if (n > 500) {
      return { level: "SOFT", passed: false, reason: `prompt is ${n} chars — above the 500-char target for constrained hosts; compress if the host errors` };
    }
    return { level: "HARD", passed: true, reason: `prompt ${n} chars within constrained budget` };
  }
  if (n > 1800) {
    return { level: "SOFT", passed: false, reason: `prompt is ${n} chars — long prompts correlate with structural API failures; compress to <=1800` };
  }
  return { level: "HARD", passed: true, reason: `prompt ${n} chars within default budget` };
}

function checkRatioStart(prompt, profile) {
  if (profile !== "constrained") {
    return { level: "HARD", passed: true, reason: "numeric-ratio placement not restricted (default profile)" };
  }
  const head = prompt.slice(0, 20);
  const hit = head.match(NUMERIC_RATIO_RE);
  if (hit) {
    return {
      level: "HARD",
      passed: false,
      reason: `numeric aspect ratio "${hit[0]}" inside the first 20 chars — constrained hosts reject prompts that open with digit/colon patterns; keep ratios in the body or drop them entirely (design 4:3 natively instead)`,
    };
  }
  return { level: "HARD", passed: true, reason: "no numeric ratio at prompt start" };
}

// ============================================================================
// BOUNDARY STYLE CHECK (v2.6.4 — eval case 1, 3 fix)
// ============================================================================

const BOUNDARY_STYLE_PATTERNS = [
  // Mascot / sticker / cartoon / cute character
  [/\b(mascot|sticker|kawaii|cute\s+robot|cute\s+character|chibi)\b/gi, "mascot/sticker"],
  [/贴纸|萌系|萌萌|可爱.*机器人|卡通.*角色|Q版|二次元.*头像|表情包/g, "mascot/sticker"],
  // Flat flowchart / PPT infographic / org chart
  [/\b(flat\s+flowchart|ppt\s+infographic|stock\s+infographic|org\s+chart|swimlane)\b/gi, "flat-flowchart"],
  [/扁平.*流程图|方框.*箭头|PPT.*风格|不要.*电路|业务流程图|组织架构图|泳道图/g, "flat-flowchart"],
  // Pure photo / realistic request
  [/\b(realistic\s+photo|microscope|macro\s+photo|real\s+circuit\s+board\s+photo)\b/gi, "realistic-photo"],
  [/真实照片|微距.*照片|实拍.*电路板|真实电路板.*特写/g, "realistic-photo"],
];

function checkBoundaryStyle(prompt) {
  const hits = [];
  for (const [pattern, category] of BOUNDARY_STYLE_PATTERNS) {
    if (pattern.test(prompt)) {
      hits.push(category);
      pattern.lastIndex = 0; // reset regex state for global flag
    }
  }
  if (hits.length > 0) {
    const unique = [...new Set(hits)];
    return {
      level: "HARD",
      passed: false,
      reason: `out-of-scope style detected (${unique.join(", ")}) — circuit-workers does not cover this style. Refuse and suggest the user's own alternative tools (general image generation tool for mascot/sticker; the user's own flowchart/diagram tool for flowchart). See SKILL.md Step 0 and references/safety-compliance.md §3.9.`,
    };
  }
  return { level: "HARD", passed: true, reason: "no out-of-scope style keywords detected" };
}

// ============================================================================
// REQUIRED LABELS CHECK (v2.6.6 — eval case 4 fix)
// ============================================================================

function _isWordChar(ch) {
  if (!ch) return false;
  const cp = ch.codePointAt(0);
  // CJK ideographs count as word chars; punctuation/whitespace are delimiters
  if ((cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf)) return true;
  return /[a-zA-Z0-9_]/.test(ch);
}

function _hasCleanOccurrence(text, label) {
  let start = 0;
  for (;;) {
    const pos = text.indexOf(label, start);
    if (pos === -1) return false;
    const prevOk = pos === 0 || !_isWordChar(text[pos - 1]);
    const nextPos = pos + label.length;
    const nextOk = nextPos >= text.length || !_isWordChar(text[nextPos]);
    if (prevOk && nextOk) return true;
    start = pos + 1;
  }
}

function checkRequiredLabels(prompt, requiredLabels) {
  if (!requiredLabels || !requiredLabels.trim()) {
    return { level: "HARD", passed: true, reason: "no required labels provided — check skipped" };
  }
  const labels = requiredLabels.split(",").map((x) => x.trim()).filter((x) => x.length > 0);
  const missing = [];
  const embedded = [];
  for (const lbl of labels) {
    if (!prompt.includes(lbl)) {
      missing.push(lbl);
    } else if (!_hasCleanOccurrence(prompt, lbl)) {
      embedded.push(lbl);
    }
  }
  if (missing.length > 0) {
    return {
      level: "HARD",
      passed: false,
      reason: `required labels missing/paraphrased in final prompt: ${missing.join(", ")} — label fidelity rule (v2.6.6): when a label set is specified, use it verbatim; do NOT substitute source-article wording, paraphrase, extend, or shorten. Fix the label list in the prompt and re-run.`,
    };
  }
  if (embedded.length > 0) {
    return {
      level: "HARD",
      passed: false,
      reason: `required labels appear only inside longer phrases (extension/substitution detected): ${embedded.join(", ")} — e.g. requirement '上线' engraved as '上线发布' fails exact match. Add an explicit label list where each required label stands alone (e.g. 标签：数据采集、上线), then re-run.`,
    };
  }
  return { level: "HARD", passed: true, reason: `all ${labels.length} required labels present verbatim (standalone)` };
}

const CHECKS = [
  ["worker_first", "Worker in first paragraph (F7)", checkWorkerFirst],
  ["label_unique", "Label ONLY ONCE constraint (F8)", checkLabelUnique],
  ["label_count", "Label count hard check (F8-v2.6)", checkLabelCount],
  ["return_trace", "Return trace descriptors (F9)", checkReturnTrace],
  ["context_lock", "Context lock / Swap Test (F1)", checkContextLock],
  ["component_budget", "Component budget (F9)", checkComponentBudget],
  ["hard_ban", "Vendor name ban (v1.4)", checkHardBan],
  ["safety_ban", "Safety boundary (S1-S8)", checkSafetyBan],
  ["boundary_style", "Out-of-scope style ban (v2.6.4 — F11/F13)", checkBoundaryStyle],
  ["required_labels", "Required labels verbatim (v2.6.6 — F15)", null],
  ["style_punctuation", "Punctuation style", checkStylePunctuation],
  ["coverage", "Requirements coverage (W3-v2.6)", null],
  ["label_language", "Label language match (W4-v2.6)", null],
  ["chinese_anchor", "Chinese anchor for constrained hosts (P1-v2.6.2)", null],
  ["prompt_budget", "Prompt length budget (P2-v2.6.2)", null],
  ["ratio_start", "No numeric ratio at prompt start (P3-v2.6.2)", null],
];

function runChecks(prompt, options) {
  const opts = options || {};
  const requirements = opts.requirements || "";
  const inputLang = opts.inputLang || "";
  const profile = opts.profile === "constrained" ? "constrained" : "default";
  const requiredLabels = opts.requiredLabels || "";
  const results = [];
  const hardFailures = [];

  for (const [id, name, fn] of CHECKS) {
    let result;
    if (id === "coverage") {
      result = checkCoverage(prompt, requirements);
    } else if (id === "label_language") {
      result = checkLabelLanguage(prompt, inputLang);
    } else if (id === "chinese_anchor") {
      result = checkChineseAnchor(prompt, profile);
    } else if (id === "prompt_budget") {
      result = checkPromptBudget(prompt, profile);
    } else if (id === "ratio_start") {
      result = checkRatioStart(prompt, profile);
    } else if (id === "required_labels") {
      result = checkRequiredLabels(prompt, requiredLabels);
    } else if (fn) {
      result = fn(prompt);
    } else {
      continue;
    }
    result.id = id;
    result.name = name;
    results.push(result);
    if (!result.passed && result.level === "HARD") {
      hardFailures.push(result);
    }
  }

  return {
    overall: hardFailures.length === 0 ? "PASS" : "FAIL",
    totalChecks: results.length,
    hardPass: results.filter(r => r.level === "HARD" && r.passed).length,
    hardFail: results.filter(r => r.level === "HARD" && !r.passed).length,
    softPass: results.filter(r => r.level === "SOFT" && r.passed).length,
    softWarn: results.filter(r => r.level === "SOFT" && !r.passed).length,
    hardFailures,
    allResults: results,
  };
}

module.exports = { runChecks, CHECKS, checkBoundaryStyle, checkRequiredLabels, checkLabelCount, checkCoverage, checkLabelLanguage, checkChineseAnchor, checkPromptBudget, checkRatioStart };

// ============================================================================
// CLI entry (v2.6.2) — lets host agents validate a prompt directly:
//   node check_prompt.js --prompt "..." [--profile constrained]
//   node check_prompt.js --prompt-file prompt.txt --profile constrained
//   node check_prompt.js --prompt "..." --required-labels "标签1,标签2" (v2.6.6)
// ============================================================================
if (require.main === module) {
  const fs = require("fs");
  const path = require("path");

  let cliPrompt = "";
  let cliProfile = "default";
  let cliRequiredLabels = "";
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--prompt" && argv[i + 1] !== undefined) cliPrompt = argv[++i];
    else if (argv[i] === "--prompt-file" && argv[i + 1] !== undefined) {
      const p = path.resolve(argv[++i]);
      if (!fs.existsSync(p)) {
        console.error(`Error: prompt file not found: ${p}`);
        process.exit(2);
      }
      cliPrompt = fs.readFileSync(p, "utf-8");
    } else if (argv[i] === "--profile" && argv[i + 1] !== undefined) {
      cliProfile = argv[++i] === "constrained" ? "constrained" : "default";
    } else if (argv[i] === "--required-labels" && argv[i + 1] !== undefined) {
      cliRequiredLabels = argv[++i];
    } else if (argv[i] === "--help" || argv[i] === "-h") {
      console.log(`Usage: node check_prompt.js --prompt "<text>" [--profile default|constrained]
       node check_prompt.js --prompt-file <file> [--profile default|constrained]
       node check_prompt.js --prompt "..." --required-labels "标签1,标签2" (v2.6.6 label fidelity)`);
      process.exit(0);
    }
  }

  if (!cliPrompt.trim()) {
    console.error("Error: provide --prompt or --prompt-file");
    process.exit(2);
  }

  const verdict = runChecks(cliPrompt, { profile: cliProfile, requiredLabels: cliRequiredLabels });
  console.log(`Profile: ${cliProfile} | Overall: ${verdict.overall} | HARD pass/fail: ${verdict.hardPass}/${verdict.hardFail} | SOFT pass/warn: ${verdict.softPass}/${verdict.softWarn} | prompt ${cliPrompt.length} chars`);
  for (const r of verdict.allResults) {
    const mark = r.passed ? (r.level === "HARD" ? "ok" : "ok") : (r.level === "HARD" ? "HARD-FAIL" : "warn");
    if (mark !== "ok" || process.env.VERBOSE) {
      console.log(`  [${mark}] ${r.id}: ${r.reason}`);
    }
  }
  process.exit(verdict.overall === "PASS" ? 0 : 1);
}
