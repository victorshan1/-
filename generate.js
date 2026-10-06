#!/usr/bin/env node
/**
 * Circuit Workers Image Generator (v2.6.9 — platform-profile aware)
 *
 * v2.6.2 changes:
 *   - Platform profiles: --profile default|constrained (or plan field
 *     platform_profile). Constrained targets hosts whose image tool
 *     gateway-errors on English-majority prompts (field-validated
 *     2026-08-22: English openings fail 5/5; Chinese-anchored openings
 *     pass; length threshold drifts with load).
 *   - In constrained mode: auto-prepends the Chinese scene anchor
 *     一张电路板微缩景观插画： when missing, compresses the prompt to
 *     a defensive budget, and retries with progressively smaller
 *     budgets (500→300→200) if the image call fails.
 *   - --dry-run: prints the final post-transform prompt and exits
 *     without calling the image API (free pipeline testing).
 *   - Default profile behavior is UNCHANGED (single attempt, no
 *     transformation) — the defense only arms where needed.
 *
 * v2.6 changes:
 *   - Runtime Mode Detection: Mode A (z-ai), B (host delegation),
 *     C-Programmatic (Python/SVG), C-Degraded (structured fallback).
 *   - check_prompt.js now has 11 checks (added label-count, coverage,
 *     label-language).
 *   - Mode C-Programmatic is a first-class path, not a fallback.
 *
 * v2.1 changes:
 *   - check_prompt.py → check_prompt.js (pure JS, zero Python dependency)
 *   - auto-qa default OFF (was ON). Use --auto-qa to enable.
 *   - evolution engine silent (writes lessons.json, prints one line).
 *   - --quiet mode: minimal console output (default). --verbose for details.
 *   - Net cost reduction: ~40-50% fewer tokens in conversation context.
 *
 * v2.0 (evolution engine): lessons.js evolve() after QA.
 * v1.9 (auto-qa): --auto-qa flag for end-to-end VLM QA.
 * v1.7 (check_prompt): Pass 0 deterministic pre-generation gate.
 * v1.4 (security): execFileSync, size whitelist, path normalization.
 *
 * Usage:
 *   node generate.js --plan ./my-plan.json --output ./out.png
 *   node generate.js --prompt "A soldering-cap robot..." --output ./out.png
 *   node generate.js --prompt "..." --output ./out.png --auto-qa --verbose
 *
 * Planning JSON format (minimal):
 *   { "source_anchor": "...", "final_prompt": "...", "output_path": "./out.png" }
 */

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { runChecks } = require("./check_prompt.js");

// --- security: size whitelist ---
const ALLOWED_SIZES = [
  "1024x1024", "768x1344", "864x1152",
  "1344x768", "1152x864", "1440x720",
];

const TIER_DEFAULTS = {
  lite: { size: "1024x1024" },
  standard: { size: "1024x1024" },
  full: { size: "1344x768" },
};
// Note: retries param removed in v2.1 — z-ai image API typically succeeds
// on first call or fails (504 timeout). Retry logic added complexity without
// value. If you need retries, wrap generate.js in a shell loop.

function validateSize(size) {
  if (!ALLOWED_SIZES.includes(size)) {
    console.error(`Error: invalid size "${size}". Allowed: ${ALLOWED_SIZES.join(", ")}`);
    process.exit(1);
  }
  return size;
}

function normalizeOutputPath(rawPath) {
  if (!rawPath || typeof rawPath !== "string") {
    console.error("Error: output path is required");
    process.exit(1);
  }
  if (rawPath.includes("\0")) {
    console.error("Error: output path contains null bytes");
    process.exit(1);
  }
  const resolved = path.resolve(rawPath);
  if (!resolved.endsWith(".png")) {
    console.error("Error: output path must end with .png");
    process.exit(1);
  }
  return resolved;
}

function parseArgs() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--plan" || argv[i] === "-f") args.plan = argv[++i];
    else if (argv[i] === "--prompt" || argv[i] === "-p") args.prompt = argv[++i];
    else if (argv[i] === "--output" || argv[i] === "-o") args.output = argv[++i];
    else if (argv[i] === "--size" || argv[i] === "-s") args.size = argv[++i];
    else if (argv[i] === "--tier" || argv[i] === "-t") args.tier = argv[++i];
    else if (argv[i] === "--auto-qa" || argv[i] === "--qa") args.autoQa = true;
    else if (argv[i] === "--skip-check" || argv[i] === "--no-check") args.skipCheck = true;
    else if (argv[i] === "--verbose" || argv[i] === "-v") args.verbose = true;
    else if (argv[i] === "--quiet" || argv[i] === "-q") args.quiet = true;
    else if (argv[i] === "--profile") { if (argv[i + 1] !== undefined) args.profile = argv[++i]; }
    else if (argv[i] === "--dry-run") args.dryRun = true;
    else if (argv[i] === "--help" || argv[i] === "-h") args.help = true;
  }
  return args;
}

function printHelp() {
  console.log(`
Circuit Workers Image Generator (v2.6.9)

Usage:
  node generate.js --plan <plan.json> --output <image.png>
  node generate.js --prompt "<prompt text>" --output <image.png>

Options:
  --plan, -f     Path to planning JSON (must contain final_prompt)
  --prompt, -p   Direct prompt text (overrides plan)
  --output, -o   Output image path (must end with .png)
  --size, -s     Image size (default: tier-based)
  --tier, -t     Cost tier: lite | standard | full (default: standard)
  --profile      Platform profile: default | constrained (default: default)
                 constrained = host image tool gateway-errors on
                 English-majority prompts. Auto-prepends Chinese anchor,
                 compresses prompt to defensive budget, retries with
                 smaller budgets on failure (500→300→200).
  --dry-run      Print the final post-transform prompt and exit (no API call)
  --auto-qa      Run VLM QA after generation (default: OFF — saves ~35 credits)
  --skip-check   Bypass Pass 0 (DEBUG ONLY)
  --verbose, -v  Show detailed output (default: quiet)
  --quiet, -q    Minimal output (default behavior)
  --help, -h     Show this help
`);
}

// --- v2.6.2: constrained-host prompt transforms ---

// Field-validated anchor: a short Chinese scene opener routes the prompt
// to the working image backend on constrained hosts.
const ZH_ANCHOR = "一张电路板微缩景观插画：";

function ensureChineseAnchor(prompt, profile) {
  if (profile !== "constrained") return prompt;
  const head = prompt.slice(0, 12);
  const cjkCount = (head.match(/[\u4e00-\u9fff]/g) || []).length;
  if (cjkCount >= 2) return prompt;
  return ZH_ANCHOR + prompt;
}

// Deterministic sentence-level compression for constrained budgets.
// PROTECTED sentences always survive: worker/robot presence, CJK label
// text, ONLY ONCE constraint, nameplates. Everything else (environment,
// lighting, camera style) is sacrificial, dropped from the END backward.
const PROTECTED_SENTENCE_RE = /robot|worker|soldering|nameplate|ONLY ONCE|[\u4e00-\u9fff]/i;

function compressForConstrained(prompt, budget) {
  if (prompt.length <= budget) return prompt;
  const sentences = prompt.split(/(?<=[.!?\u3002\uff01\uff1f])\s+/);
  // Drop the LAST unprotected sentence, then second-to-last, etc.,
  // until under budget — minimal-loss compression.
  const dropSet = new Set();
  let currentLen = prompt.length;
  for (let i = sentences.length - 1; i >= 0 && currentLen > budget; i--) {
    if (PROTECTED_SENTENCE_RE.test(sentences[i])) continue;
    dropSet.add(i);
    currentLen -= sentences[i].length + 1;
  }
  return sentences.filter((_, i) => !dropSet.has(i)).join(" ");
}

// --- main ---
async function main() {
  const args = parseArgs();

  if (args.help) { printHelp(); process.exit(0); }

  // resolve prompt
  let prompt = "";
  let planData = null;

  if (args.prompt) {
    prompt = args.prompt;
  } else if (args.plan) {
    if (!fs.existsSync(args.plan)) {
      console.error(`Error: plan file not found: ${args.plan}`);
      process.exit(1);
    }
    planData = JSON.parse(fs.readFileSync(args.plan, "utf-8"));
    prompt = planData.final_prompt || planData.prompt || "";
    if (!prompt) {
      console.error("Error: plan file has no final_prompt or prompt field");
      process.exit(1);
    }
  } else {
    console.error("Error: provide --plan or --prompt");
    printHelp();
    process.exit(1);
  }

  const rawOutput = args.output || planData?.output_path || "./circuit-worker-output.png";
  const outputPath = normalizeOutputPath(rawOutput);

  const tier = args.tier || planData?.cost_tier || "standard";
  if (!TIER_DEFAULTS[tier]) {
    console.error(`Error: invalid tier "${tier}". Use: lite, standard, full`);
    process.exit(1);
  }
  const tierConfig = TIER_DEFAULTS[tier];
  const size = validateSize(args.size || tierConfig.size);

  const outputDir = path.dirname(outputPath);
  if (outputDir && !fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const verbose = args.verbose || false;

  // --- v2.6.2: platform profile resolution + constrained transforms ---
  const profile = (args.profile || planData?.platform_profile) === "constrained" ? "constrained" : "default";
  const originalPrompt = prompt;
  if (profile === "constrained") {
    prompt = ensureChineseAnchor(prompt, profile);
    prompt = compressForConstrained(prompt, 500);
  }

  if (verbose) {
    console.log("========================================");
    console.log("Circuit Workers Image Generator (v2.6.9)");
    console.log("========================================");
    console.log(`Source: ${args.prompt ? "direct prompt" : args.plan}`);
    if (planData?.source_anchor) console.log(`Source anchor: ${planData.source_anchor}`);
    console.log(`Output: ${outputPath}`);
    console.log(`Size: ${size}`);
    console.log(`Profile: ${profile}`);
    console.log(`Prompt length: ${prompt.length} chars (original ${originalPrompt.length})`);
    if (profile === "constrained" && prompt !== originalPrompt) {
      console.log(`Constrained transform applied: Chinese anchor / budget compression`);
    }
  }

  // --- v2.6.2: dry-run — print final prompt, no API call ---
  if (args.dryRun) {
    console.log(prompt);
    if (verbose) {
      console.log(`\n[dry-run] profile=${profile} len=${prompt.length} (original ${originalPrompt.length})`);
    }
    process.exit(0);
  }

  // --- Pass 0: check_prompt.js (deterministic, zero-cost, no Python) ---
  if (!args.skipCheck) {
    const checkResult = runChecks(prompt, { profile });

    if (verbose) {
      console.log("----------------------------------------");
      console.log("Pass 0: check_prompt.js (deterministic pre-check)");
      console.log(`Overall: ${checkResult.overall}`);
      console.log(`Checks: ${checkResult.totalChecks} total | HARD ${checkResult.hardPass}pass/${checkResult.hardFail}fail | SOFT ${checkResult.softPass}pass/${checkResult.softWarn}warn`);
      for (const r of checkResult.allResults) {
        const status = r.passed ? "PASS" : "FAIL";
        console.log(`  ${status} [${r.level}] ${r.name}`);
        if (!r.passed) console.log(`         Reason: ${r.reason}`);
      }
    }

    if (checkResult.overall === "FAIL") {
      if (!verbose) {
        console.error(`Pass 0 FAILED: ${checkResult.hardFailures.map(f => f.name).join(", ")}`);
      }
      console.error("Fix HARD failures before generating. Use --skip-check for debug.");
      process.exit(1);
    }
  }

  // --- Generate image (v2.6.2: retry ladder under constrained profile) ---
  // Default profile: single attempt (unchanged behavior).
  // Constrained profile: 500 → 300 → 200 char budgets. A failed image
  // call is cheap on constrained hosts (instant gateway error), so
  // retrying with a smaller prompt costs little and defends against
  // load-dependent length thresholds (field-validated drift).
  const budgets = profile === "constrained" ? [500, 300, 200] : [null];
  let generatedOk = false;
  let lastErr = null;

  for (const budget of budgets) {
    const attemptPrompt = budget === null ? prompt : compressForConstrained(prompt, budget);
    const cmdArgs = ["image", "-p", attemptPrompt, "-o", outputPath, "-s", size];

    try {
      execFileSync("z-ai", cmdArgs, { stdio: "pipe", timeout: 120000 });
      generatedOk = true;
      prompt = attemptPrompt; // downstream QA/evolution see what was actually sent
      break;
    } catch (err) {
      lastErr = err;
      if (budget !== null && budget !== budgets[budgets.length - 1]) {
        console.log(`Constrained profile: image call failed at budget ${budget}, compressing further...`);
      }
    }
  }

  if (!generatedOk) {
    console.error(`Generation failed: ${lastErr?.message || "unknown error"}`);
    if (lastErr?.stderr) console.error(`stderr: ${lastErr.stderr.toString()}`);
    if (profile === "constrained") {
      console.error(`Constrained profile exhausted the retry ladder (${budgets.join(" → ")}). ` +
        `Next step per SKILL.md: fall back to Mode C-Programmatic (Python) delivery.`);
    }
    process.exit(1);
  }

  try {

    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      const sizeKB = (stats.size / 1024).toFixed(1);

      if (verbose) {
        console.log(`\n--- Generation Summary ---`);
        if (planData) {
          console.log(`Source anchor: ${planData.source_anchor || "N/A"}`);
          console.log(`Worker family: ${planData.worker_decision?.worker_family || planData.worker_family || "N/A"}`);
        }
        console.log(`Output: ${outputPath} (${sizeKB} KB)`);
        console.log(`Size: ${size}`);
        console.log(`Cost tier: ${tier}`);
      } else {
        // quiet mode: one line
        console.log(`✓ generated: ${outputPath} (${sizeKB} KB, ${size})`);
      }

      // Auto-QA: only when --auto-qa is explicitly set (default: OFF)
      if (args.autoQa) {
        console.log("Running VLM QA...");
        const qaPrompt = `Check this PCB circuit-worker illustration. Answer: (1) Is there a soldering-cap robot performing an action? (2) Are required Chinese labels visible and each appears only once? (3) Is the style consistent with green PCB, copper traces, 3D components? (4) Any text overload or label duplication? Reply PASS or FAIL with reasons.`;
        try {
          const qaResult = execFileSync("z-ai", [
            "vision", "-p", qaPrompt, "-i", outputPath
          ], { stdio: "pipe", timeout: 60000, encoding: "utf-8" });

          // Parse QA result
          let qaPassed = /PASS/i.test(qaResult) && !/FAIL/i.test(qaResult.split('PASS')[0]);

          if (verbose) {
            console.log(qaResult.trim());
            console.log(`QA: ${qaPassed ? "PASS" : "FAIL"}`);
          } else {
            console.log(`QA: ${qaPassed ? "PASS" : "FAIL"}`);
          }

          // Evolution engine: silent — only writes to lessons.json
          try {
            const lessons = require("./lessons.js");
            lessons.evolve(prompt, qaPassed, { verbose: false, qaText: qaResult });
            // silent: no console output in quiet mode
          } catch (evoErr) {
            // evolution failure never blocks delivery
          }
        } catch (qaErr) {
          console.log(`QA: skipped (VLM error)`);
        }
      }
    } else {
      console.error("Error: output file not found after generation");
      process.exit(1);
    }
  } catch (err) {
    console.error(`Post-generation error: ${err.message}`);
    process.exit(1);
  }
}

main();
