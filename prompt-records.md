# Prompt Records / 提示词记录

Record public/reusable prompts, truth constraints, output paths, rejected attempts, and QA results.

## Record Template

```text
prompt record:
- date: {YYYY-MM-DD}
- source anchor: {the article sentence or paragraph}
- asset role: {article figure / story card / data scene / center illustration / explainer}
- intent: {audience · feeling · author stance · one sentence to keep}
- relationship: {type and direction}
- worker family: {which worker was used}
- metaphor world: {which circuit world was chosen after divergence}
- truth constraints: {exact values, names, categories}
- reference cues: {visual/factual cues if applicable}
- final prompt: {the complete generation prompt}
- output path: {where the image was saved}
- rejected attempts: {why earlier attempts were rejected}
- QA result: {pass / fail with reason}
- swap test: {pass / fail — could this image illustrate a different article?}
```

## Why Record

- Track what works and what doesn't across multiple images.
- Build a portfolio of reusable patterns for common article types.
- Provide evidence of the skill's quality and precision for reviews and showcases.
- Avoid repeating the same creative divergence decisions without learning from past choices.

## When to Record

Record for:
- Public examples that will be shown in README, portfolio, or showcase.
- Reusable patterns that might be adapted for similar articles.
- Complex images that required multiple attempts (to capture what went wrong).
- Images with significant truth constraints (to verify accuracy).

Do not record for:
- Quick test images during development.
- One-off images that will not be reused or shown publicly.

---

## Case 1: EDD Feedback Loop / EDD 评测驱动飞轮

```text
prompt record:
- date: 2026-08-01
- source anchor: EDD 与模型训练的类比：训练数据→用户任务/生产案例/失败案例；目标函数→评估指标/发布门禁；参数更新→改模型/prompt/RAG/工具/流程；数据飞轮→使用智能体带来的数据飞轮
- asset role: article figure
- intent: AI应用开发者 · 恍然大悟 · Derrick主张AI应用开发应模仿模型训练 · "EDD的每个环节都对应模型训练的一个概念"
- relationship: feedback loop (用户数据 → 评测 → 改系统 → 发布 → 更多用户数据)
- worker family: Encoder / 编码工
- metaphor world: AI training board with LED array display, relay, feedback loop trace
- truth constraints: 标签必须用中文；飞轮方向必须是闭环
- reference cues: N/A (conceptual)
- final prompt: see assets/examples/example-1-edd-feedback-loop.json → final_prompt
- output path: assets/examples/example-1-edd-feedback-loop.png
- rejected attempts: none (first pass)
- QA result: PASS — worker physically encodes signals, 7 Chinese labels readable, feedback loop visible, Swap Test passes (image is locked to EDD concept)
- swap test: PASS — cannot illustrate a different article; the EDD-specific labels and feedback loop lock it to this concept
```

### Pattern: Feedback Loop with Worker Encoding

**Reusable for:** any concept that involves a cyclical improvement process (data flywheels, CI/CD loops, learning loops, OODA loops).

**Key moves:**
- Copper carrier trace forms a visible closed loop
- Worker physically bridges the gap between two stages (not standing beside)
- Focal accent on the "evaluation/encoding" stage
- Side path with dim red LED for the "failure mode" (e.g., overfitting)
- Cyan glow on the return path = "growth/flywheel active"

---

## Case 2: AI Platform CLI Four-Layer Pipeline / 某AI平台 CLI 四层架构

```text
prompt record:
- date: 2026-08-01
- source anchor: 某AI平台 CLI 四层架构：Agentic框架 → CLI → 专家Skill → 场景产出。核心理念是'原子模型能力交给Agent编排'
- asset role: article figure
- intent: AI平台使用者 · 层次清晰 · 该平台通过分层解耦实现灵活编排 · "从Agentic框架到场景产出，四层架构各司其职"
- relationship: sequence / pipeline (left-to-right, four stages)
- worker family: Router / 走线工
- metaphor world: mainboard with four pipeline stages connected by copper bus bars
- truth constraints: 四层顺序必须从左到右；标签必须用中文
- reference cues: N/A (conceptual)
- final prompt: see assets/examples/example-2-ai-platform-pipeline.json → final_prompt
- output path: assets/examples/example-2-ai-platform-pipeline.png
- rejected attempts: none (first pass)
- QA result: PASS — four chips left-to-right, worker routing between CLI and Skill, 5 Chinese labels readable, Swap Test passes
- swap test: PASS — the "Agentic框架/CLI/专家Skill/场景产出" labels lock it to this platform's concept
```

### Pattern: Linear Pipeline with Router Worker

**Reusable for:** any multi-stage process where one stage bridges to the next (data pipelines, CI/CD, request processing chains, organizational handoffs).

**Key moves:**
- Wide copper bus bar as the pipeline backbone
- One chip per stage, evenly spaced left-to-right
- Focal accent on the "bridge" layer (CLI) — amber LED
- Worker physically soldering the connection between two specific stages
- Direction arrows on the bus bar

---

## Case 3: Enterprise Agent Six-Step Flywheel / 企业Agent方法论 六步飞轮

```text
prompt record:
- date: 2026-08-01
- source anchor: 某企业Agent落地方法论六步链路：选准任务→说清任务→装备能力→稳定运行→业务价值→沉淀复用。第六步沉淀复用产生八大资产类型，形成飞轮效应
- asset role: article figure
- intent: 企业决策者 · 路径清晰 · 该方法论强调落地的系统性和资产化思维 · "六步链路从选场景到资产沉淀，飞轮效应是最终价值"
- relationship: sequence with feedback loop (six steps left-to-right, then loop back from step 6 to step 1)
- worker family: Router / 走线工 (acting as bridge builder)
- metaphor world: server rack with stacked boards, copper trace forming return loop
- truth constraints: 六步顺序必须从左到右；最后一步必须有飞轮回流；标签必须用中文
- reference cues: N/A (conceptual)
- final prompt: see assets/examples/example-3-enterprise-flywheel.json → final_prompt
- output path: assets/examples/example-3-enterprise-flywheel.png
- rejected attempts: none (first pass)
- QA result: PASS — six chips left-to-right, flywheel return loop visible, worker bridging step 6 to return path, 7 Chinese labels readable
- swap test: PASS — the methodology-specific six-step labels lock it to this framework
```

### Pattern: Multi-Step Pipeline with Flywheel Return

**Reusable for:** any methodology that ends with "asset accumulation" or "learning feeds back into the start" (OKR cycles, PDCA, continuous improvement, growth loops).

**Key moves:**
- Multi-stage pipeline (5-7 chips) as the base
- Last chip has cyan LED + flashing = "asset accumulation point"
- Worker physically builds a solder bridge from last chip to a return trace
- Return trace curves from right side back to left, glowing cyan
- Focal accent: growth cyan on step 6 + return path
- Steps 1-5 stay power green (active but not focal)

---

## Pattern: Education Knowledge Loop / 教育知识点回环

**Source**: 小语智研知识点流转六环节（备课→作业→分析→讲评→对比→导出）

**Key moves:**
- 6-chip pipeline as the base (green→amber→cyan LED progression)
- Bright thick cyan return trace from chip 6 back to chip 1 (must be described as "bright thick" and "clearly visible" — otherwise model skips it)
- Copper nameplate '知识点流转' locks to education context
- Router worker with signal probe touching inter-chip trace

**When to use**: Any educational pipeline with a feedback/closed-loop quality (learning cycle, content production loop, teaching-improvement loop).

---

## Pattern: Workplace Target Tree / 职场目标拆解树

**Source**: OKR 目标拆解（公司O → 部门KR → 个人任务）

**Key moves:**
- Tree topology: 1 root → 2 branches → 4 leaves (power of 2 branching)
- Root chip largest with blue LED (strategic), department chips medium with green LED (tactical), task nodes smallest with amber LED (operational)
- Copper nameplate 'OKR' locks to workplace context
- Mapper worker soldering trace between root and first branch
- Size + LED color encodes hierarchy level

**When to use**: Any tree/fan-out decomposition — OKR, org chart, work breakdown structure (WBS), decision tree.

---

## Pattern Summary

| Pattern | Worker | Relationship | When to Use |
|---------|--------|-------------|-------------|
| Feedback loop with encoder | Encoder | feedback loop | cyclical improvement processes |
| Linear pipeline with router | Router | sequence/pipeline | multi-stage left-to-right processes |
| Multi-step with flywheel return | Router (bridge builder) | sequence + feedback | methodologies ending in asset flywheel |
| Layered hierarchy stack | Builder | layered hierarchy | 4-layer architecture, stacked systems |
| Education knowledge loop | Router | sequence + feedback | educational/learning closed-loop processes |
| Workplace target tree | Mapper | tree/fan-out | OKR, org chart, WBS, decision tree |
