# Circuit Workers Lite / 蒸馏版 (v2.6.2)

把下面整段内容跟在你的出图需求后面，作为当前宿主 Agent 或本地工具的提示词规则。它是完整版 skill 的八条最高杠杆规则，适合不支持完整 Skill 加载的场景和较弱的模型。生成的 prompt 交给宿主平台的图像生成工具即可出及格线以上的 PCB 插图。

**注意：Lite 版不含完整安全边界检查。如果涉及暴力、色情、版权、政治敏感内容，请勿生成。**

---

你帮我把一篇文章的核心概念画成一张 PCB 电路板风格插图时，遵守下面八条规则。它们的优先级高于你的默认出图习惯。

一、**安全先行**：如果用户的请求描绘暴力、攻击、对抗、武器、战斗场景（包括网络安全攻防对抗），直接拒绝："本技能生成编辑性电路板插图，不覆盖暴力或攻防内容。请使用其他工具。"不要将暴力转译为电路隐喻。

二、Prompt 第一段先描述焊接帽机器人（soldering-cap robot），它在做什么动作，触碰什么元件。圆形银色焊接帽头部，小型绿色 PCB 身体，微小关节手臂。不画眼睛，不画人脸，不画人形身体。如果机器人不在第一段，图像模型会概率性丢弃它。

三、中文标签放在 prompt 最后一段，用列表格式，每个标签指明贴在哪个元件上。必须在末尾加两句约束："Each label appears ONLY ONCE. Do NOT render as background text." 如果不加这两句，图像模型会把标签重复渲染为大号背景文字。标签数量 3 到 7 个，不要超过 7 个。**每个标签在 prompt 全文中只能出现一次。**如果某个标签包含生僻字（如猹、爨、龘）或笔画极密的字，把这个字的铭牌在 prompt 里写成 "COMPLETELY BLANK AND EMPTY"（空白铭牌），出图后用本地字体工具把字刻上去——不要让模型反复重试画这种字，它是按印象画的，重试多少次都不保证对。

四、Prompt 中必须有一个铜牌（nameplate），刻上与本文相关的特定术语。这是 Swap Test 的防线——如果图能原样配到另一篇文章上，说明不够精确。铭牌内容必须来自文章本身的关键词，不能是通用词。

五、PCB 必须有 3D 立体感：凸起的芯片、可见的焊点、铜走线带金属光泽、绿色阻焊层。不是平面示意图，不是卡通画，不是 PPT 图标。色彩：PCB 绿、铜金、焊银、信号琥珀。

六、画面只有一个焦点模块，用琥珀色高亮，周围留安静区。不要所有元件等权重排列。构图 16:9 横向，边缘留白。

七、**标签语言与输入语言一致**：如果用户输入是中文，标签必须用中文（如"熔断开启"而非"CLOSED"）。如果用户输入是英文，标签用英文。

八、**受限生图宿主适配（v2.6.2）**：如果你的图像工具对英文主体的 prompt 秒级报错（网关错误/HTML 错误页），按三步处理：(1) prompt 开头加一句中文锚——"一张电路板微缩景观插画："，再接英文主体；(2) prompt 压到 500 字符以内，开头 20 字符内不要出现"16:9"这类数字比例（放正文或删掉，输出按 4:3 设计，需要 16:9 时出图后裁切）；(3) 若仍失败，逐级砍环境/光影/相机描写的句子（保留机器人句、标签块、ONLY ONCE 约束），砍到 300、200 字符各重试一次；还不行就放弃图像模型，改用本地 Python 绘图交付。注意：长度阈值随负载漂移，没有任何一个数字永远安全，靠的是逐级压缩重试，不是卡线。

两段对照，感受方向。

坏："A green PCB with some chips and copper traces. Labels: AI, 数据, 模型."

好："A small soldering-cap robot is routing a copper trace from a sensor chip to a processor on a green PCB. The robot has a round silver cap head with a single amber LED, a tiny green PCB body, and small jointed arms holding a signal probe. No eyes, no face. The PCB has 3D depth: raised chips, visible solder joints, gold-copper traces with sheen on green solder-mask. A copper nameplate reads 'AI评测闭环'. Mandatory Chinese labels: 传感器 on the input chip, 处理器 on the center chip, 评测 on the nameplate. Each label appears ONLY ONCE. Do NOT render as background text. 16:9 horizontal."

写完后自查一遍：安全是否通过，机器人是否在第一段，标签是否在末尾且有 ONLY ONCE 约束且无重复，是否有铭牌锁定到本文，是否有 3D 立体描述，是否只有一个焦点，标签语言是否匹配；若图像工具对英文 prompt 报错，是否已加中文锚并压缩长度。
