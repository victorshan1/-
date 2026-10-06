# Cost Control Strategy / 成本控制策略

> 讯飞 Skill 质量标准 #04：成本可控（COST EFFICIENT）— 模型选型合理，简单任务用 Lite/蒸馏模型。

## 核心原则

**"任务越简单，消耗越少"** — 不是所有配图都需要 22 步规划 + 3 轮 QA。标准请求走 Fast Channel（6 步、0 重试、单次 QA），复杂请求才走 Slow Channel（22 步、3 轮 QA）。

## 三级成本分层

| 成本层级 | 通道 | 步数 | 重试预算 | QA 次数 | 适用场景 | 估算 Token 消耗 |
|----------|------|------|----------|---------|----------|----------------|
| **Lite** | Fast Channel | 6 步 | 0 次 | 1 次 | 单图、标准关系、无精确数据 | ~2K tokens |
| **Standard** | Fast→Slow 升级 | 6→22 步 | 1 次 | 2 次 | Fast QA 失败后升级 | ~6K tokens |
| **Full** | Slow Channel | 22 步 | 2 次 | ≤3 次 | 多图系列、精确数据、复杂关系 | ~12K tokens |

## 成本控制机制

### 1. 通道选择（最大成本杠杆）

Fast Channel 的 6 步固定模板是成本控制的核心：
- **跳过** creative divergence（省 ~2K tokens 的 LLM 规划）
- **跳过** story-card / data-story / reference-informed 分支（省 ~1K tokens）
- **固定模板** 而非完整 planning JSON（省 ~3K tokens）
- **0 重试**：QA 失败直接升级，不原地重试（省 1 次图片生成 + 1 次 VLM 调用）

### 2. 图片尺寸控制

| 用途 | 尺寸 | 说明 |
|------|------|------|
| 规划预览（可选） | 1024×1024 | 快速验证构图，成本最低 |
| **默认输出** | 1344×768 | 16:9 最接近，正式配图 |
| 宽幅特写 | 1440×720 | 仅在文章需要宽幅时使用 |

不要对所有图都用最大尺寸。预览阶段可以用小尺寸验证，确认后再出正式大图。

### 3. QA 成本控制

| 通道 | QA 策略 | VLM 调用次数 |
|------|---------|-------------|
| Fast | 单次 QA，PASS 即结束；FAIL 则升级通道 | 1 次 |
| Slow | 最多 3 轮 QA，每轮失败后定向修复 | 1-3 次 |

**关键原则**：Fast Channel 不原地重试。QA 失败 = 请求需要完整流程 = 升级到 Slow。这避免了"在错误的模板上反复重试"的 token 浪费。

### 4. Prompt 长度控制

Fast Channel 的固定模板（worker first → scene middle → context lock → labels last）已经过验证，prompt 长度约 300-500 字。Slow Channel 的完整 prompt 可达 800-1200 字。

**不要为了"详细"而堆砌 prompt** — 精准比冗长更重要。每多 100 字的 prompt 不增加图片质量，但增加 token 消耗。

### 5. 系列图片成本控制

当文章需要多张配图时：
- **共享 planning**：一次规划所有图片的 world/worker/palette，避免每张图重新规划
- **复用 prompt 骨架**：系列图共享 prompt 结构，只改 action/labels
- **批量 QA**：系列图可以合并 QA（一次 VLM 调用检查多张图的一致性）

## 成本估算公式

```
总 Token ≈ (planning_steps × 200) + (prompt_chars × 1.5) + (qa_attempts × 500) + (image_generations × 0)
```

- planning_steps：Fast=6, Slow=22
- prompt_chars：Fast≈400, Slow≈1000
- qa_attempts：Fast=1, Slow=1-3
- image_generations：图片生成本身不消耗 LLM token，但消耗 API 调用配额

## 触发条件

### 自动走 Lite（Fast Channel）

当以下全部满足时：
1. 单张图片
2. 单一核心概念
3. 标准关系类型（pipeline / feedback / hierarchy / contrast）
4. 无精确数据值
5. 无系列一致性要求

### 必须走 Full（Slow Channel）

当以下任一满足时：
1. 多图系列
2. 精确数据值（图表、排名、指标）
3. 非标准关系（tension / divergence / boundary）
4. 新领域（首次遇到的 domain）
5. Fast Channel QA 失败升级

## 审核对齐

本策略对齐讯飞 Skill 质量标准 #04：
- ✅ 模型选型合理：Fast Channel 用最少步骤处理简单任务
- ✅ 简单任务用 Lite：标准请求走 6 步而非 22 步
- ✅ 成本可预估：Output Contract 包含 `cost_tier` 字段
- ✅ 无浪费：Fast Channel 0 重试，避免原地打转

注：当前 z-ai CLI 不支持 `--model` 参数选型（image/vision/chat 均无模型选择能力）。成本控制通过**步骤数、重试预算、QA 次数、prompt 长度、图片尺寸**五个维度实现，而非通过模型参数选型。若未来 CLI 支持模型选型，本策略应增加 `--model lite` 参数。
