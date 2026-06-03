# 🧬 Molecule Studio 分子工作室

**Molecule Studio** 是一个基于 **React + Three.js + PubChem + 大模型接口** 构建的 3D 化学分子可视化与智能查询系统。系统支持标准化学检索、自然语言查询、三维分子结构渲染、原子交互查看、分子信息摘要、PubChem 数据溯源以及基础教学辅助功能。

本项目的目标不是只做一个简单的分子搜索网页，而是构建一个面向学习、展示和轻量科研辅助场景的“智能分子工作室”：用户可以用英文名称、中文常见名、分子式、SMILES，甚至自然语言描述来搜索化合物，并在网页端实时查看对应的三维分子结构。

---

## ✨ 当前已实现功能

### 1. 标准分子搜索

系统支持多种输入方式：

- 英文化学名称：`Aspirin`、`Caffeine`、`Amoxicillin`
- 常见中文名称：`阿司匹林`、`咖啡因`、`阿莫西林`
- 分子式：`H2O`、`C8H10N4O2`、`C16H19N3O5S`
- SMILES 字符串：例如 `CCO`

搜索流程会自动判断输入类型，并通过 PubChem PUG REST API 获取对应化合物的 CID 和结构数据。

### 2. 示例分子快捷入口

标准搜索区域已内置常见示例分子快捷按钮：

- 水
- 乙醇
- 咖啡因
- 阿司匹林
- 阿莫西林
- 葡萄糖
- 苯

用户点击按钮即可快速加载分子结构，适合课堂演示、项目展示和系统功能测试。

### 3. 自然语言查询

系统支持自然语言描述，例如：

```text
显示咖啡因分子
绘制阿司匹林结构
帮我看看阿莫西林
显示水分子
```

自然语言查询采用“双层解析机制”：

1. **本地规则识别**：优先识别常见中文/英文分子别名，例如“阿司匹林 → aspirin”。
2. **大模型解析**：调用 OpenAI 兼容接口，将自然语言转换为英文分子名、分子式或 SMILES。

为了避免大模型返回错误 SMILES 或错误分子式导致 PubChem `HTTP 400`，系统不会只依赖单个解析结果，而是会构造多个候选项并逐个尝试，直到找到可用结构。

### 4. PubChem 分子数据获取

系统通过 PubChem PUG REST API 获取分子数据。当前搜索逻辑为：

1. 根据输入类型查询 PubChem CID。
2. 优先请求 3D 分子结构。
3. 如果没有 3D 构象，则回退到 2D 结构。
4. 从 PubChem 原始记录中解析原子、化学键、坐标和分子属性。

系统现在已修复早期“阿莫西林只显示一个球”的问题。原因是 PubChem 的坐标通常位于：

```text
compoundData.coords[0].conformers[0]
```

而不是 `compoundData.atoms.coords`。当前版本已经正确解析 PubChem 的 conformer 坐标，因此复杂分子可以正常展开显示。

### 5. 3D 分子可视化

三维渲染基于 Three.js 实现，当前支持：

- CPK 元素配色
- 原子球体显示
- 化学键圆柱体显示
- 鼠标左键拖拽旋转
- 鼠标右键拖拽平移
- 滚轮缩放
- 点击原子查看详细信息
- 自动根据分子尺寸调整相机距离
- 渲染资源释放，减少重复搜索导致的内存/显存累积

### 6. 原子标签与编号显示

右侧“显示控制”中支持：

- 显示元素标签，例如 `C`、`O`、`N`
- 显示原子编号，例如 `#12`

开启后，3D 模型中对应原子上方会显示标签。该功能适合小分子教学讲解、结构识别和局部原子说明。

### 7. 分子信息面板

右侧信息面板目前包含：

- 分子式
- 分子量
- 原子总数
- 化学键总数
- 结构摘要
- PubChem CID
- IUPAC 名称
- PubChem 原始页面链接
- SMILES 字符串
- 选中原子详情

点击 3D 模型中的某个原子后，可以查看：

- 元素符号
- 原子序数
- 原子质量
- 原子 ID
- 电荷信息
- 三维坐标

### 8. 友好错误提示

系统对常见错误进行了用户友好化处理，不再只显示生硬的 `HTTP 400`。例如当搜索失败时，会提示：

- 优先尝试英文通用名
- 中文名称可使用常见写法
- 分子式可能对应多个同分异构体
- SMILES 需要确认括号、键符号和大小写
- 检查网络是否可以访问 PubChem

---

## 🧠 系统工作原理

### 整体流程

```text
用户输入
   ↓
输入类型判断 / 自然语言解析
   ↓
构造候选搜索项
   ↓
PubChem 查询 CID
   ↓
获取 3D/2D 分子结构记录
   ↓
解析原子、化学键、坐标和分子属性
   ↓
Three.js 渲染三维模型
   ↓
信息面板展示分子数据与交互结果
```

### 标准搜索流程

标准搜索主要由 `src/utils/pubchemApi.js` 负责。系统会自动判断输入类型：

- 如果包含 SMILES 特征符号，如 `= # [ ] ( )`，则按 SMILES 查询。
- 如果符合分子式格式，如 `C8H10N4O2`，则按分子式查询。
- 其他情况默认按化合物名称查询。

对应查询策略如下：

```text
name     → /compound/name/{query}/cids/JSON
formula  → /compound/fastformula/{query}/cids/JSON
smiles   → /compound/smiles/{query}/cids/JSON
```

拿到 CID 后，再请求：

```text
/compound/cid/{cid}/record/JSON?record_type=3d
```

如果 3D 结构不可用，则自动回退：

```text
/compound/cid/{cid}/record/JSON?record_type=2d
/compound/cid/{cid}/JSON
```

### 自然语言解析流程

自然语言处理主要由 `src/utils/nlpParser.js` 和 `src/components/NLPInput.jsx` 负责。

为了提高稳定性，系统采用两级策略：

#### 1. 本地规则解析

系统内置了常见分子别名表，例如：

```text
阿司匹林 → aspirin
咖啡因 → caffeine
阿莫西林 → amoxicillin
水分子 / 水 → water
乙醇 / 酒精 → ethanol
```

如果用户输入中包含这些关键词，系统会直接生成可靠候选项，不必完全依赖大模型。

#### 2. 大模型解析

如果启用了 AI 配置，系统会调用 OpenAI 兼容的 `chat/completions` 接口，要求模型返回 JSON：

```json
{
  "moleculeName": "English chemical name",
  "smiles": "valid SMILES if confident",
  "formula": "molecular formula if known"
}
```

系统会优先使用英文名称，并把模型返回的 SMILES、分子式、本地规则结果和原始输入都加入候选队列。之后逐个尝试 PubChem 搜索，避免单个错误解析结果导致整个查询失败。

### 3D 渲染流程

三维渲染主要由 `src/components/MoleculeViewer.jsx` 实现。

核心步骤如下：

1. 初始化 Three.js 场景、相机、光照和 WebGLRenderer。
2. 根据 PubChem 原子数据创建球体 Mesh。
3. 根据化学键数据创建圆柱体 Mesh。
4. 根据坐标计算分子包围盒，自动居中并调整相机。
5. 监听鼠标事件，实现旋转、平移、缩放和原子点击选择。
6. 当切换分子或显示标签时，释放旧模型资源并重新渲染。

元素颜色遵循 CPK 配色方案，相关配置位于：

```text
src/utils/elementColors.js
```

---

## 🏗️ 项目结构

```text
Molecule-Studio/
├── src/
│   ├── components/
│   │   ├── AIConfigPanel.jsx      # AI 接口配置面板
│   │   ├── SearchBar.jsx          # 标准搜索与示例分子快捷入口
│   │   ├── NLPInput.jsx           # 自然语言查询组件
│   │   ├── MoleculeViewer.jsx     # Three.js 3D 分子渲染核心
│   │   └── InfoPanel.jsx          # 分子信息、结构摘要与显示控制
│   ├── utils/
│   │   ├── pubchemApi.js          # PubChem API 查询与结构解析
│   │   ├── nlpParser.js           # 自然语言解析与候选生成
│   │   └── elementColors.js       # 元素颜色、半径和基础属性配置
│   ├── App.jsx                    # 应用主组件与状态管理
│   ├── main.jsx                   # React 入口文件
│   └── index.css                  # 全局样式
├── public/                        # 静态资源
├── package.json                   # 依赖与脚本
├── vite.config.js                 # Vite 配置
├── tailwind.config.js             # Tailwind CSS 配置
├── postcss.config.js              # PostCSS 配置
└── README.md                      # 项目说明文档
```

---

## 🛠️ 技术栈

### 前端框架

- React 18
- Vite
- Tailwind CSS

### 三维渲染

- Three.js
- WebGLRenderer
- CanvasTexture 标签贴图

### 数据与接口

- PubChem PUG REST API
- OpenAI 兼容 LLM API
- Axios
- localStorage 本地配置存储

---

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

浏览器打开：

```text
http://localhost:5173
```

### 3. 生产构建

```bash
npm run build
npm run preview
```

---

## 🔧 AI 配置说明

自然语言功能需要配置 OpenAI 兼容接口。系统默认使用 SiliconFlow 格式：

```text
API Base: https://api.siliconflow.cn/v1
模型示例: Qwen/Qwen2.5-7B-Instruct
```

用户可以在网页中的“AI 配置”面板填写：

- API Key
- API Base
- 模型名称

配置只保存在当前浏览器的 `localStorage`，不会提交到 GitHub 仓库。

也可以通过 `.env` 设置默认值：

```env
VITE_SILICON_API_KEY=your_api_key_here
VITE_SILICON_API_BASE=https://api.siliconflow.cn/v1
VITE_LLM_MODEL=Qwen/Qwen2.5-7B-Instruct
VITE_PUBCHEM_API_BASE=https://pubchem.ncbi.nlm.nih.gov/rest/pug
```

PubChem API 是公开接口，不需要 API Key。

---

## 📖 使用方式

### 标准搜索

输入以下内容之一：

```text
Aspirin
阿司匹林
Caffeine
咖啡因
H2O
CCO
```

点击“可视化”即可生成模型。

### 示例分子快捷入口

点击“水、乙醇、咖啡因、阿司匹林、阿莫西林、葡萄糖、苯”等按钮即可快速加载。

### 自然语言查询

输入：

```text
显示阿司匹林分子
帮我看看咖啡因结构
绘制阿莫西林
显示水分子
```

点击“解析”，系统会自动解析并加载分子结构。

### 三维交互

| 操作 | 功能 |
|---|---|
| 鼠标左键拖动 | 旋转分子 |
| 鼠标右键拖动 | 平移视图 |
| 鼠标滚轮 | 放大 / 缩小 |
| 点击原子 | 查看原子详情 |
| 显示元素标签 | 在模型上显示 C、O、N 等元素符号 |
| 显示原子编号 | 在模型上显示 PubChem 原子 ID |

---

## 🧩 关键模块说明

### `pubchemApi.js`

负责：

- 输入类型判断
- 中文常见名归一化
- PubChem CID 查询
- 3D/2D 结构记录获取
- 原子、化学键、坐标和属性解析
- API 错误信息整理

### `nlpParser.js`

负责：

- 本地自然语言规则解析
- 常见中文分子名称识别
- 大模型接口调用
- JSON 响应解析
- 搜索候选队列生成

### `MoleculeViewer.jsx`

负责：

- 初始化 Three.js 场景
- 渲染原子球体和化学键圆柱
- 生成元素标签和原子编号标签
- 处理旋转、缩放、平移和原子点击
- 清理旧模型资源，降低卡顿和内存占用

### `InfoPanel.jsx`

负责：

- 展示分子式、分子量、原子数、化学键数
- 展示结构摘要
- 展示 PubChem CID 和原始页面链接
- 展示 SMILES 字符串
- 展示选中原子详情
- 控制元素标签和原子编号显示

---

## 🐛 常见问题

### 1. 搜索失败或找不到化合物

可以尝试：

- 使用英文通用名，例如 `caffeine`
- 使用中文常见名，例如 `咖啡因`
- 使用 PubChem 中更常见的名称
- 检查 SMILES 是否完整正确
- 检查网络是否可以访问 PubChem

### 2. 自然语言解析不准确

大模型可能返回错误的 SMILES 或分子式。当前系统已经加入候选兜底机制，但如果仍然失败，建议直接使用标准搜索输入英文名称。

### 3. 分子式搜索结果不符合预期

同一个分子式可能对应多个同分异构体。分子式搜索默认取 PubChem 返回的第一个 CID，因此更推荐使用明确的英文名称或 PubChem CID。

### 4. 模型显示很卡

可以尝试：

- 关闭元素标签和原子编号
- 换成较小分子测试
- 使用支持 WebGL 的现代浏览器
- 避免同时打开多个重型网页

---

## 🔮 后续可扩展方向

- 搜索候选列表选择，而不是默认取第一个 CID
- 分子截图导出 PNG
- SMILES 一键复制
- 分子收藏夹和搜索历史
- 球棍模型 / 空间填充模型 / 线框模型切换
- 键长、键角和官能团识别
- 多分子对比视图
- 分子编辑与手绘结构输入
- 更完整的元素周期表支持

---

## 📝 License

本项目为开源项目，当前按 MIT License 使用。

---

## 🤝 贡献

欢迎提交 Issue 或 Pull Request 来改进功能、修复问题或补充更多分子可视化能力。

---

**Molecule Studio 分子工作室** —— 让分子结构查询、三维展示和智能解释变得更直观。