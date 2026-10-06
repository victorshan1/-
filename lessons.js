#!/usr/bin/env node
/**
 * Circuit Workers Evolution Engine (lessons.js v1.1)
 *
 * Dual-layer evolution system — the "second layer" that complements
 * check_prompt.py's deterministic rules. While check_prompt.py catches
 * known failures with zero-cost regex, lessons.js learns from each
 * generation result (QA pass/fail) and adjusts pattern weights over time.
 *
 * Evolution coach design:
 *   - Seed lessons with weights
 *   - Each generation triggers evolve()
 *   - Pass → weight +1, Fail → weight -1 (with four-quadrant logic)
 *   - Auto-promotion: candidate → soft_rule → hard_rule
 *   - Auto-retirement: weight ≤ 0 → retired
 *
 * The four-quadrant logic (richer than Arena Trader's single-axis):
 *   For positive patterns (should be present):
 *     present + pass → +1  (pattern confirmed useful)
 *     present + fail → -1  (pattern not sufficient alone)
 *     absent  + pass → -1  (pattern maybe unnecessary)
 *     absent  + fail → +2  (pattern was needed!)
 *
 *   For negative patterns (should not be present):
 *     present + pass → -1  (pattern maybe harmless)
 *     present + fail → +2  (pattern confirmed harmful!)
 *     absent  + pass → +1  (absence confirmed good)
 *     absent  + fail → -1  (absence not the issue)
 *
 * Usage (CLI):
 *   node scripts/lessons.js review                              # view all lessons
 *   node scripts/lessons.js top                                # top-weight lessons
 *   node scripts/lessons.js evolve --prompt "..." --pass       # record a pass
 *   node scripts/lessons.js evolve --prompt "..." --fail       # record a fail
 *   node scripts/lessons.js evolve --prompt "..." --qa-file result.json
 *   node scripts/lessons.js add --pattern "..." --desc "..."    # add candidate
 *   node scripts/lessons.js export                             # export as markdown
 *   node scripts/lessons.js stats                               # show evolution stats
 *
 * Usage (as module):
 *   const lessons = require('./lessons.js');
 *   lessons.evolve(promptText, qaPassed);
 *   const summary = lessons.review();
 */

"use strict";

const fs = require("fs");
const path = require("path");

// ─── Constants ───────────────────────────────────────────────────────────────

// v2.5: Evolution data lives in USER directory, not skill directory.
// This survives `clawhub update` / reinstall — local evolution is never lost.
// The skill-directory data/lessons.json is now a read-only SEED template.
const os = require("os");

const SEED_PATH = path.join(__dirname, "data", "lessons.json");

function getUserDataPath() {
  // Allow override via env var (for testing or custom locations)
  if (process.env.LESSONS_DATA_PATH) return process.env.LESSONS_DATA_PATH;
  // User home directory: ~/.circuit-workers/lessons.json
  // Windows: %USERPROFILE%\.circuit-workers\lessons.json
  return path.join(os.homedir(), ".circuit-workers", "lessons.json");
}

let DATA_PATH = getUserDataPath();

const PROMOTION_THRESHOLDS = {
  candidate_to_soft: 5,
  soft_to_hard: 10,
  retire_below: 1, // weight <= 0 triggers retirement, but we check < 1
};

const STATUS_ORDER = {
  hard_rule: 4,
  soft_rule: 3,
  candidate: 2,
  retired: 0,
};

// ─── Data I/O ───────────────────────────────────────────────────────────────

function loadData() {
  // v2.5: If user data doesn't exist yet, bootstrap from seed template
  if (!fs.existsSync(DATA_PATH)) {
    const userDir = path.dirname(DATA_PATH);
    // Ensure user directory exists
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    // Copy seed lessons.json to user directory (first run)
    if (fs.existsSync(SEED_PATH)) {
      const seedContent = fs.readFileSync(SEED_PATH, "utf-8");
      const seedData = JSON.parse(seedContent);
      // Reset stats for fresh start — seed data carries lessons but not usage stats
      seedData.stats = {
        total_generations: 0,
        total_pass: 0,
        total_fail: 0,
        total_promotions: 0,
        total_retirements: 0,
      };
      seedData.last_updated = new Date().toISOString();
      fs.writeFileSync(DATA_PATH, JSON.stringify(seedData, null, 2) + "\n", "utf-8");
    } else {
      console.error(`Error: neither user data (${DATA_PATH}) nor seed template (${SEED_PATH}) found.`);
      process.exit(2);
    }
  }
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
}

function saveData(data) {
  data.last_updated = new Date().toISOString();
  // v2.3: P1-1 fix — atomic write via temp file + rename
  // Prevents corrupted lessons.json if process is killed mid-write
  const content = JSON.stringify(data, null, 2) + "\n";
  const tmpPath = DATA_PATH + ".tmp";
  fs.writeFileSync(tmpPath, content, "utf-8");
  fs.renameSync(tmpPath, DATA_PATH);
}

// ─── Pattern Detection ──────────────────────────────────────────────────────

/**
 * Detect whether a lesson's pattern is present in the prompt text.
 * Returns true if pattern is present, false if absent, null if undetectable.
 */
function detectPattern(prompt, lesson) {
  if (!prompt || typeof prompt !== "string") return null;

  const promptLower = prompt.toLowerCase();

  switch (lesson.detect_type) {
    case "keyword": {
      if (!lesson.detect_pattern) return null;
      const keywords = lesson.detect_pattern
        .split("|")
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean);
      return keywords.some((k) => promptLower.includes(k));
    }

    case "first_paragraph_keyword": {
      if (!lesson.detect_pattern) return null;
      const paragraphs = prompt.split(/\n\s*\n/).filter(Boolean);
      const firstPara = (paragraphs[0] || prompt).toLowerCase();
      const keywords = lesson.detect_pattern
        .split("|")
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean);
      return keywords.some((k) => firstPara.includes(k));
    }

    case "regex": {
      if (!lesson.detect_pattern) return null;
      try {
        return new RegExp(lesson.detect_pattern, "i").test(prompt);
      } catch {
        return null;
      }
    }

    case "manual":
      // Cannot auto-detect; skip in evolution
      return null;

    default:
      return null;
  }
}

// ─── Evolution Logic ────────────────────────────────────────────────────────

/**
 * Core evolution function. Called after each generation + QA cycle.
 *
 * @param {string} prompt - The final prompt text used for generation
 * @param {boolean} qaPassed - Whether QA passed (true) or failed (false)
 * @param {object} [options] - Optional: { dryRun: false, verbose: true }
 * @returns {object} Evolution report
 */
function evolve(prompt, qaPassed, options = {}) {
  const data = loadData();
  const dryRun = options.dryRun || false;
  const verbose = options.verbose || false;
  const qaText = options.qaText || null; // v2.3: raw VLM output for per-check attribution

  // v2.3: P0-1 fix — parse failed checks from VLM output for targeted attribution
  // Instead of +2 to ALL absent positive patterns, only +2 to patterns mapped
  // to the specific checks that failed.
  const failedChecks = (!qaPassed && qaText) ? parseFailedChecks(qaText) : [];
  const targetedLessonIds = new Set();
  if (failedChecks.length > 0) {
    for (const checkName of failedChecks) {
      const mapped = CHECK_TO_LESSON_MAP[checkName.toLowerCase()];
      if (mapped) {
        mapped.forEach((id) => targetedLessonIds.add(id));
      }
    }
  }

  const changes = [];
  const promotions = [];
  const retirements = [];

  // Update global stats
  data.stats.total_generations++;
  if (qaPassed) {
    data.stats.total_pass++;
  } else {
    data.stats.total_fail++;
  }

  // Evaluate each lesson
  for (const lesson of data.lessons) {
    if (lesson.status === "retired") continue;

    const present = detectPattern(prompt, lesson);
    if (present === null) continue; // can't auto-detect, skip

    const isPositive = lesson.pattern_type === "positive";
    let delta = 0;

    // Four-quadrant logic
    if (isPositive) {
      // Positive pattern (should be present)
      if (present && qaPassed) {
        // present + pass → confirmed useful
        delta = +1;
        lesson.pass_count++;
      } else if (present && !qaPassed) {
        // present + fail → not sufficient alone
        delta = -1;
        lesson.fail_count++;
      } else if (!present && qaPassed) {
        // absent + pass → maybe unnecessary
        delta = -1;
      } else if (!present && !qaPassed) {
        // absent + fail → was needed!
        // v2.3: P0-1 fix — only +2 if this lesson is mapped to a failed check.
        // If we have no failed-check data (no qaText), fall back to old global +2.
        if (failedChecks.length > 0) {
          // Targeted: only +2 if mapped to a failed check
          delta = targetedLessonIds.has(lesson.id) ? +2 : 0;
        } else {
          // No per-check data — old behavior
          delta = +2;
        }
        if (delta !== 0) lesson.fail_count++;
      }
    } else {
      // Negative pattern (should NOT be present)
      if (present && qaPassed) {
        // present + pass → maybe harmless
        delta = -1;
        lesson.pass_count++;
      } else if (present && !qaPassed) {
        // present + fail → confirmed harmful!
        delta = +2;
        lesson.fail_count++;
      } else if (!present && qaPassed) {
        // absent + pass → confirmed good
        delta = +1;
        lesson.pass_count++;
      } else if (!present && !qaPassed) {
        // absent + fail → absence not the issue
        delta = -1;
      }
    }

    if (delta !== 0) {
      const oldWeight = lesson.weight;
      lesson.weight += delta;
      lesson.last_evolved = new Date().toISOString();

      const oldStatus = lesson.status;
      checkPromotion(lesson);

      changes.push({
        id: lesson.id,
        pattern: lesson.pattern,
        present: present,
        qaPassed: qaPassed,
        delta: delta,
        oldWeight: oldWeight,
        newWeight: lesson.weight,
        statusChanged: oldStatus !== lesson.status,
        oldStatus: oldStatus,
        newStatus: lesson.status,
      });

      if (oldStatus !== lesson.status) {
        if (lesson.status === "retired") {
          retirements.push(lesson);
          data.stats.total_retirements++;
        } else {
          promotions.push(lesson);
          data.stats.total_promotions++;
        }
      }
    }
  }

  if (!dryRun) {
    saveData(data);
  }

  const report = {
    qaPassed: qaPassed,
    totalChanges: changes.length,
    changes: changes,
    promotions: promotions.map((l) => ({
      id: l.id,
      pattern: l.pattern,
      oldStatus: changes.find((c) => c.id === l.id)?.oldStatus,
      newStatus: l.status,
      weight: l.weight,
    })),
    retirements: retirements.map((l) => ({
      id: l.id,
      pattern: l.pattern,
      oldStatus: changes.find((c) => c.id === l.id)?.oldStatus,
      weight: l.weight,
    })),
    stats: data.stats,
  };

  if (verbose) {
    printEvolutionReport(report);
  }

  return report;
}

/**
 * Check if a lesson should be promoted or retired based on weight.
 */
function checkPromotion(lesson) {
  if (lesson.weight <= 0) {
    lesson.status = "retired";
    return;
  }

  if (lesson.status === "candidate" && lesson.weight >= PROMOTION_THRESHOLDS.candidate_to_soft) {
    lesson.status = "soft_rule";
  } else if (lesson.status === "soft_rule" && lesson.weight >= PROMOTION_THRESHOLDS.soft_to_hard) {
    lesson.status = "hard_rule";
  }
}

// ─── CLI Commands ───────────────────────────────────────────────────────────

/**
 * review — display all lessons with weights, status, pass/fail counts.
 */
function review() {
  const data = loadData();
  const lines = [];

  lines.push("=".repeat(70));
  lines.push("Circuit Workers Evolution Engine — Lesson Review");
  lines.push("=".repeat(70));
  lines.push(
    `Generations: ${data.stats.total_generations} | ` +
      `Pass: ${data.stats.total_pass} | ` +
      `Fail: ${data.stats.total_fail} | ` +
      `Promotions: ${data.stats.total_promotions} | ` +
      `Retirements: ${data.stats.total_retirements}`
  );
  lines.push("-".repeat(70));

  // Sort by status priority (desc), then by weight (desc)
  const sorted = [...data.lessons].sort((a, b) => {
    const statusDiff = (STATUS_ORDER[b.status] || 0) - (STATUS_ORDER[a.status] || 0);
    if (statusDiff !== 0) return statusDiff;
    return b.weight - a.weight;
  });

  for (const l of sorted) {
    const statusTag = formatStatusTag(l.status);
    const detectTag = l.detect_type === "manual" ? "[manual]" : "[auto]";
    lines.push(`  ${statusTag} ${l.id.padEnd(12)} w:${String(l.weight).padEnd(3)} ${detectTag} ${l.pattern}`);
    lines.push(`         ${l.description}`);
    lines.push(
      `         pass:${l.pass_count}  fail:${l.fail_count}  ` +
        `type:${l.pattern_type}  category:${l.category}` +
        (l.enforced_by ? `  enforced_by:${l.enforced_by}` : "") +
        (l.last_evolved ? `  last_evolved:${l.last_evolved.slice(0, 10)}` : "")
    );
    if (l.notes) {
      lines.push(`         note: ${l.notes}`);
    }
    lines.push("");
  }

  lines.push("-".repeat(70));
  lines.push("Status: hard_rule = enforced by check_prompt.py, soft_rule = warning, candidate = under evaluation, retired = inactive");
  lines.push("=".repeat(70));

  return lines.join("\n");
}

/**
 * top — display the highest-weight lessons.
 */
function top(n = 5) {
  const data = loadData();
  const sorted = [...data.lessons]
    .filter((l) => l.status !== "retired")
    .sort((a, b) => b.weight - a.weight)
    .slice(0, n);

  const lines = [];
  lines.push("=".repeat(60));
  lines.push(`Top ${n} Lessons (by weight)`);
  lines.push("=".repeat(60));

  for (const l of sorted) {
    const statusTag = formatStatusTag(l.status);
    lines.push(`  ${statusTag} ${l.id.padEnd(12)} w:${l.weight}  ${l.pattern}`);
    lines.push(`         ${l.description}`);
    lines.push(`         pass:${l.pass_count}  fail:${l.fail_count}`);
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * add — add a new candidate lesson.
 */
function addLesson(pattern, description, options = {}) {
  const data = loadData();

  // Generate ID
  const existingL = data.lessons.filter((l) => l.id.startsWith("L")).length;
  const newId = `L${existingL + 1}`;

  const lesson = {
    id: newId,
    pattern: pattern,
    description: description,
    category: options.category || "strategy",
    pattern_type: options.type || "positive",
    detect_type: options.detectType || "keyword",
    detect_pattern: options.detectPattern || "",
    weight: 1,
    pass_count: 0,
    fail_count: 0,
    status: "candidate",
    source: "evolved",
    enforced_by: null,
    created_at: new Date().toISOString(),
    last_evolved: null,
  };

  if (options.notes) {
    lesson.notes = options.notes;
  }

  data.lessons.push(lesson);
  saveData(data);

  return `Added lesson ${newId}: ${pattern} (weight:1, status:candidate)`;
}

/**
 * export — export lessons as markdown reference document.
 */
function exportMarkdown() {
  const data = loadData();

  const lines = [];
  lines.push("# Evolution Engine — Lessons Export");
  lines.push("");
  lines.push(`> Generated: ${data.last_updated}`);
  lines.push(`> Generations: ${data.stats.total_generations} | Pass: ${data.stats.total_pass} | Fail: ${data.stats.total_fail}`);
  lines.push("");

  // Group by status
  const groups = {
    hard_rule: data.lessons.filter((l) => l.status === "hard_rule"),
    soft_rule: data.lessons.filter((l) => l.status === "soft_rule"),
    candidate: data.lessons.filter((l) => l.status === "candidate"),
    retired: data.lessons.filter((l) => l.status === "retired"),
  };

  for (const [status, lessons] of Object.entries(groups)) {
    if (lessons.length === 0) continue;
    lines.push(`## ${status.toUpperCase().replace("_", " ")} (${lessons.length})`);
    lines.push("");

    const sorted = lessons.sort((a, b) => b.weight - a.weight);
    for (const l of sorted) {
      lines.push(`### ${l.id}: ${l.pattern}`);
      lines.push("");
      lines.push(`- **Weight**: ${l.weight}`);
      lines.push(`- **Description**: ${l.description}`);
      lines.push(`- **Category**: ${l.category}`);
      lines.push(`- **Type**: ${l.pattern_type}`);
      lines.push(`- **Pass/Fail**: ${l.pass_count}/${l.fail_count}`);
      lines.push(`- **Source**: ${l.source}`);
      if (l.enforced_by) lines.push(`- **Enforced by**: ${l.enforced_by}`);
      if (l.detect_type !== "manual" && l.detect_pattern) {
        lines.push(`- **Detect**: ${l.detect_type} = \`${l.detect_pattern}\``);
      } else {
        lines.push(`- **Detect**: manual (not auto-detectable)`);
      }
      if (l.notes) lines.push(`- **Notes**: ${l.notes}`);
      lines.push("");
    }
  }

  return lines.join("\n");
}

/**
 * stats — show evolution statistics.
 */
function showStats() {
  const data = loadData();
  const lines = [];

  const byStatus = {};
  const byCategory = {};
  for (const l of data.lessons) {
    byStatus[l.status] = (byStatus[l.status] || 0) + 1;
    byCategory[l.category] = (byCategory[l.category] || 0) + 1;
  }

  lines.push("=".repeat(50));
  lines.push("Evolution Engine Statistics");
  lines.push("=".repeat(50));
  lines.push("");
  lines.push("Overall:");
  lines.push(`  Total lessons: ${data.lessons.length}`);
  lines.push(`  Total generations: ${data.stats.total_generations}`);
  lines.push(
    `  Pass rate: ${data.stats.total_generations > 0
      ? ((data.stats.total_pass / data.stats.total_generations) * 100).toFixed(1)
      : 0}%`
  );
  lines.push(`  Promotions: ${data.stats.total_promotions}`);
  lines.push(`  Retirements: ${data.stats.total_retirements}`);
  lines.push("");
  lines.push("By status:");
  for (const [s, c] of Object.entries(byStatus).sort((a, b) => b[1] - a[1])) {
    lines.push(`  ${s}: ${c}`);
  }
  lines.push("");
  lines.push("By category:");
  for (const [c, n] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    lines.push(`  ${c}: ${n}`);
  }
  lines.push("");
  lines.push(`Last updated: ${data.last_updated}`);
  lines.push(`Data path: ${DATA_PATH}`);
  lines.push("=".repeat(50));

  return lines.join("\n");
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatStatusTag(status) {
  switch (status) {
    case "hard_rule":
      return "[HARD]";
    case "soft_rule":
      return "[SOFT]";
    case "candidate":
      return "[CAND]";
    case "retired":
      return "[RETR]";
    default:
      return "[????]";
  }
}

function printEvolutionReport(report) {
  console.log("\n--- Evolution Report ---");
  console.log(`QA result: ${report.qaPassed ? "PASS" : "FAIL"}`);
  console.log(`Patterns evaluated: ${report.changes.length}`);

  for (const c of report.changes) {
    const arrow = c.delta > 0 ? "+" : "";
    const statusChange = c.statusChanged ? `  [${c.oldStatus} → ${c.newStatus}]` : "";
    console.log(
      `  ${c.id.padEnd(12)} present:${c.present ? "Y" : "N"}  ${arrow}${c.delta}  ` +
        `(w:${c.oldWeight}→${c.newWeight})${statusChange}`
    );
  }

  if (report.promotions.length > 0) {
    console.log("\nPromotions:");
    for (const p of report.promotions) {
      console.log(`  ${p.id}: ${p.oldStatus} → ${p.newStatus} (w:${p.weight})`);
    }
  }

  if (report.retirements.length > 0) {
    console.log("\nRetirements:");
    for (const r of report.retirements) {
      console.log(`  ${r.id}: retired (w:${r.weight})`);
    }
  }

  console.log("--- Evolution Complete ---\n");
}

/**
 * Parse QA result text to determine pass/fail.
 * The QA prompt asks for "PASS or FAIL with reasons".
 */
function parseQAResult(qaText) {
  if (!qaText || typeof qaText !== "string") return false;

  // v2.2: Try structured JSON first (preferred VLM output format)
  try {
    const jsonMatch = qaText.match(/\{[\s\S]*"overall"[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.overall) {
        return parsed.overall.toUpperCase() === "PASS";
      }
    }
  } catch {
    // JSON parse failed, fall through to text-based parsing
  }

  // v2.2: Parse per-check results for partial-credit attribution
  // Format: { "name": "...", "result": "PASS"|"FAIL" }
  const checkPattern = /"result"\s*:\s*"(pass|fail)"/gi;
  const results = [];
  let m;
  while ((m = checkPattern.exec(qaText)) !== null) {
    results.push(m[1].toLowerCase());
  }

  if (results.length > 0) {
    const passCount = results.filter((r) => r === "pass").length;
    const failCount = results.filter((r) => r === "fail").length;
    // If any check failed, overall = FAIL (conservative)
    return failCount === 0 && passCount > 0;
  }

  // Fallback: count PASS vs FAIL mentions in plain text
  const lower = qaText.toLowerCase();
  const passCount = (lower.match(/\bpass\b/g) || []).length;
  const failCount = (lower.match(/\bfail\b/g) || []).length;

  return passCount > failCount;
}

/**
 * v2.2: Extract failed check names from VLM output for targeted attribution.
 * Instead of +2 to ALL absent positive patterns, only +2 to patterns related
 * to the specific checks that failed.
 *
 * @param {string} qaText - VLM QA output text
 * @returns {string[]} - Array of failed check names (e.g., ["worker_action", "chinese_labels"])
 */
function parseFailedChecks(qaText) {
  if (!qaText || typeof qaText !== "string") return [];

  const failed = [];

  // Try structured JSON first
  try {
    const jsonMatch = qaText.match(/\{[\s\S]*"checks"[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed.checks)) {
        for (const check of parsed.checks) {
          if (check.result && check.result.toUpperCase() === "FAIL") {
            failed.push(check.name);
          }
        }
        return failed;
      }
    }
  } catch {
    // fall through
  }

  // Fallback: regex for "name: FAIL" patterns
  const failPattern = /["']?(\w+)["']?\s*[:=]\s*["']?(fail)["']?/gi;
  let m2;
  while ((m2 = failPattern.exec(qaText)) !== null) {
    failed.push(m2[1].toLowerCase());
  }

  return failed;
}

/**
 * v2.2: Map failed check names to lesson IDs for targeted attribution.
 * This addresses the "归因共线性" problem: instead of +2 to ALL absent
 * positive patterns on a FAIL, only +2 to patterns relevant to the
 * specific checks that failed.
 */
const CHECK_TO_LESSON_MAP = {
  worker_action: ["F7", "F1-context"],
  chinese_labels: ["F8", "E7-label", "L4", "F2", "F3"],
  pcb_diorama: [],
  focal_hierarchy: ["F9-plaque"],
  style_integrity: [],
  swap_test: ["F1-context"],
  custom_check: [],
};

// ─── CLI Entry Point ────────────────────────────────────────────────────────

function cli() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "review": {
      console.log(review());
      break;
    }

    case "top": {
      const n = parseInt(args[1]) || 5;
      console.log(top(n));
      break;
    }

    case "evolve": {
      let prompt = "";
      let qaPassed = null;
      let qaText = null; // v2.3: raw VLM output for per-check attribution

      for (let i = 1; i < args.length; i++) {
        if (args[i] === "--prompt" || args[i] === "-p") {
          prompt = args[++i];
        } else if (args[i] === "--pass") {
          qaPassed = true;
        } else if (args[i] === "--fail") {
          qaPassed = false;
        } else if (args[i] === "--qa-file") {
          const qaPath = args[++i];
          if (!fs.existsSync(qaPath)) {
            console.error(`Error: QA file not found: ${qaPath}`);
            process.exit(2);
          }
          qaText = fs.readFileSync(qaPath, "utf-8");
          qaPassed = parseQAResult(qaText);
        } else if (args[i] === "--qa-text") {
          qaText = args[++i];
          qaPassed = parseQAResult(qaText);
        } else if (args[i] === "--dry-run") {
          // will be handled in options
        } else if (args[i] === "--verbose" || args[i] === "-v") {
          // will be handled in options
        }
      }

      if (!prompt) {
        console.error("Error: --prompt is required for evolve");
        console.error("Usage: node lessons.js evolve --prompt \"...\" --pass");
        process.exit(2);
      }

      if (qaPassed === null) {
        console.error("Error: --pass, --fail, --qa-file, or --qa-text is required");
        process.exit(2);
      }

      const dryRun = args.includes("--dry-run");
      const verbose = args.includes("--verbose") || args.includes("-v");

      const report = evolve(prompt, qaPassed, { dryRun, verbose, qaText });
      if (!verbose) {
        // Print a brief summary even without verbose
        console.log(
          `Evolved: QA=${qaPassed ? "PASS" : "FAIL"}, ` +
            `${report.changes.length} patterns updated, ` +
            `${report.promotions.length} promotions, ` +
            `${report.retirements.length} retirements`
        );
      }
      break;
    }

    case "add": {
      let pattern = "";
      let desc = "";
      const opts = {};

      for (let i = 1; i < args.length; i++) {
        if (args[i] === "--pattern") {
          pattern = args[++i];
        } else if (args[i] === "--desc" || args[i] === "--description") {
          desc = args[++i];
        } else if (args[i] === "--category") {
          opts.category = args[++i];
        } else if (args[i] === "--type") {
          opts.type = args[++i];
        } else if (args[i] === "--detect-type") {
          opts.detectType = args[++i];
        } else if (args[i] === "--detect-pattern") {
          opts.detectPattern = args[++i];
        } else if (args[i] === "--notes") {
          opts.notes = args[++i];
        }
      }

      if (!pattern || !desc) {
        console.error("Error: --pattern and --desc are required for add");
        console.error('Usage: node lessons.js add --pattern "pattern_name" --desc "description"');
        process.exit(2);
      }

      console.log(addLesson(pattern, desc, opts));
      break;
    }

    case "export": {
      console.log(exportMarkdown());
      break;
    }

    case "stats": {
      console.log(showStats());
      break;
    }

    case "help":
    case "--help":
    case "-h": {
      console.log(`
Circuit Workers Evolution Engine (lessons.js v1.0)

Commands:
  review                          Display all lessons with weights and status
  top [n]                         Display top n lessons by weight (default: 5)
  evolve --prompt "..." --pass    Record a QA pass and evolve weights
  evolve --prompt "..." --fail    Record a QA failure and evolve weights
  evolve --prompt "..." --qa-file result.json   Parse QA result file
  add --pattern "..." --desc "..."               Add a new candidate lesson
  export                          Export lessons as markdown reference
  stats                           Show evolution statistics
  help                            Show this help

Options (evolve):
  --dry-run    Simulate without writing to lessons.json
  --verbose     Show detailed evolution report

Example:
  node scripts/lessons.js evolve --prompt "A soldering-cap robot..." --pass --verbose
  node scripts/lessons.js review
  node scripts/lessons.js top 10
`);
      break;
    }

    default: {
      console.error(`Unknown command: ${command || "(none)"}`);
      console.error("Run: node scripts/lessons.js help");
      process.exit(2);
    }
  }
}

// ─── Module Exports ─────────────────────────────────────────────────────────

module.exports = {
  evolve,
  review,
  top,
  addLesson,
  exportMarkdown,
  showStats,
  detectPattern,
  parseQAResult,
  parseFailedChecks,
  loadData,
  saveData,
  PROMOTION_THRESHOLDS,
  CHECK_TO_LESSON_MAP,
};

// Run CLI if invoked directly (not require'd)
if (require.main === module) {
  cli();
}
