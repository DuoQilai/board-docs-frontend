# RuyiSDK Examples — 实施计划

> 基于 `design.md` 的技术实施计划；工作仓库：**本仓库** `ruyisdk-examples-frontend`  
> **不修改** `support-matrix-frontend`（matrix 零改动）；该仓库仅以 **submodule 只读参考** 引入。

---

## 0. 与 `design.md` 的对应关系

| 设计要点 | 实施含义 |
| --- | --- |
| 独立站点、独立部署 | 在本仓库内从零搭建 Astro 站点，路由与构建只属于本仓库 |
| 技术栈复用 matrix | Astro + React + TypeScript + Tailwind CSS v4 + shadcn/ui + pnpm；参照 `./support-matrix-frontend/src/` 的写法，**不 import 其运行时代码** |
| 示例内容独立仓库 | Markdown/图在 **内容仓库**（当前可参考 `DuoQilai/test-doc`，日后可迁 `ruyisdk/*`）；本仓库用 submodule 或构建时拉取 |
| 两种找法 | 首页：**示例卡片** + **按板子筛选**（左树 / 顶栏芯片，见下） |
| Fedora 式布局 | 顶栏搜索 + 左侧 Vendor → SoC → Board 树形筛选 + 右侧示例卡片网格 |
| 详情页 | 顶部元信息 + Markdown 正文 + 底部「支持的板子」 |
| 双语 | `README.md` / `README_en.md`；站点路由可做 `/` 与 `/zh-CN/`（与 matrix 习惯一致即可） |

---

## 1. 仓库结构（目标）

```text
ruyisdk-examples-frontend/
  design.md
  plan.md
  support-matrix-frontend/     # git submodule，只读参考，不提交对其的修改
  <content-submodule>/         # 例：test-doc 或 sdk-examples，见 §6
  src/
    components/                # ExampleSidebar、ExampleCard、Layout…
    lib/                       # examples.ts 等
    pages/                     # index、[slug]、zh-CN/…
  astro.config.mjs
  package.json
  ...
```

---

## 2. 示例内容与 Frontmatter

与 `design.md` §4、§5 一致：每个示例为目录，内含 `README.md`、`README_en.md`。

**Frontmatter**（可与设计一致用中文键；解析时在代码里映射为内部类型）：

```yaml
---
标题: Hello World
分类: 入门
支持的板子:
  - Milk-V Duo
  - VisionFive 2
  - LicheePi4A
更新日期: 2026-03-20
---
```

**分类枚举**（设计 §5）：入门、跑分、硬件、网络、图形、音视频（实现层可用英文 slug：`getting-started`、`benchmark`、`hardware`、`network`、`graphics`、`multimedia` 做路由与筛选）。

---

## 3. 数据层

**`src/lib/examples.ts`**（新建）

- 定义 `ExampleMeta`（标题、分类、支持的板子、更新日期、slug 等）
- `getAllExamples()`：扫描内容 submodule 下各子目录
- `getExampleBySlug(slug)`：元数据 + 正文路径
- `getExampleMarkdown(slug, lang)`：`zh` → `README.md`，`en` → `README_en.md`
- Frontmatter 解析：沿用 matrix 常见做法（`---` 块 + YAML），键名兼容中文

可选：**`src/lib/boards.ts`** — 从元数据聚合「所有出现过的板子」，供左侧树排序；若需 **Vendor → SoC → Board** 层级，需约定映射表（JSON 或 frontmatter 扩展字段），**待定**（见 `design.md` §9）。

---

## 4. 页面与路由（独立站点）

站点首页即「示例总览」（对应设计里的首屏），建议路由示例：

| 路由 | 说明 |
| --- | --- |
| `/` | 顶栏搜索 + 左树筛选 + 右卡片网格 |
| `/[example]/` 或 `/examples/[example]/` | 示例详情（选一种 URL 方案，保持全站一致） |
| `/zh-CN/` … | 中文界面与中文示例正文默认语言 |

**不在** matrix 的 `Layout.astro` 里加导航；若 matrix 侧加「示例教程」外链，属 **可选运营项**（`design.md` §6、§9）。

---

## 5. 组件

| 组件 | 职责 |
| --- | --- |
| `ExampleSidebar`（React） | 左侧树形筛选：Vendor → SoC → Board；交互可参考 Fedora BoardList / Accordion |
| `ExampleCard`（React） | 示例卡片：标题、分类、缩略信息 |
| 布局外壳 | 顶栏含站点标题「RuyiSDK Examples」+ **搜索框** |

详情页：展示 frontmatter 元信息、Markdown 渲染（remark-gfm、shiki 等与 matrix 对齐）、底部板卡列表。

---

## 6. 内容仓库集成

| 阶段 | 做法 |
| --- | --- |
| 当前 | 可将 `DuoQilai/test-doc` 或正式示例仓库加为 submodule，目录名如 `test-doc` 或 `sdk-examples` |
| glob | `import.meta.glob("/<submodule>/*/README.md", { query: "?raw", import: "default" })`，英文同理 `README_en.md` |
| 日后迁移 | 仅改 submodule URL 与路径常量，见 `design.md` 仓库划分表 |

若 submodule 拉取困难，**Phase 1** 可先用 `src/data/mock-examples` 或本地 fixtures 跑通 UI。

---

## 7. 实现顺序

### Phase 1：工程脚手架 + submodule

1. 在本仓库初始化 Astro 工程（pnpm、Tailwind v4、React、TypeScript、shadcn/ui）
2. `git submodule add`：`support-matrix-frontend`（只读参考）
3. 添加内容 submodule（或 mock 目录）并确认 `import.meta.glob` 可读

### Phase 2：数据层

4. 实现 `src/lib/examples.ts`（含 frontmatter 解析与中英键映射）
5. 单元级或脚本校验：能列出示例、读出正文

### Phase 3：首页（Fedora 式）

6. 顶栏搜索 + `ExampleSidebar` + `ExampleCard` 网格
7. 搜索过滤：示例名 + 板子名（`design.md` §10）

### Phase 4：详情与双语

8. 详情页路由 + Markdown 渲染 +「支持的板子」列表
9. `/zh-CN/` 路由与语言切换（与 `design.md` §8 一致）

### Phase 5：质量与部署

10. `pnpm build` 无报错；按需 Playwright e2e（首页、详情、语言）
11. CI（可选）：lint + build + e2e

---

## 8. 待定与阻塞（同步 `design.md` §9）

| 项 | 说明 |
| --- | --- |
| 独立站点域名 / 子域 | 部署时配置 |
| `ruyisdk/` 下正式内容仓库名 | 迁移时更新 submodule |
| matrix 是否加外链 | 非本仓库代码阻塞 |
| 第一个示例内容定稿 | 内容侧 |
| 示例是否关联上游代码仓库链接 | 产品决策 |
| 左侧树 Vendor/SoC/Board 数据来源 | 需板卡层级数据源或手工配置 |

---

## 9. 验收标准（独立站点）

- [ ] 本仓库 `pnpm build` 成功
- [ ] 首页呈现：搜索 + 左筛选 + 示例卡片网格（符合 `design.md` §3、§10）
- [ ] 可从卡片进入详情，Markdown 与「支持的板子」正确
- [ ] 中英文 README 可读、路由或语言切换可用
- [ ] **未** 对 `support-matrix-frontend` 子模块产生业务性修改（仅参考其工程习惯）

---

## 10. 与旧方案（matrix 内嵌 `/examples`）的差异说明

此前若计划在 **support-matrix-frontend** 内增加 `/examples`：**与当前 `design.md` 不一致**。已废弃该路径；一切开发在 **ruyisdk-examples-frontend** 完成，matrix 保持零改动。
