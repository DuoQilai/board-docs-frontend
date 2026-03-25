# RuyiSDK Examples 前端

独立的「示例教程」站点，告诉开发者如何在 RISC-V 开发板上用 RuyiSDK 跑通示例程序。

与支持矩阵（[matrix.ruyisdk.org](https://matrix.ruyisdk.org/)）并列，数据上可互链，工程上不嵌套。

## 技术栈

Astro 6 + React + TypeScript + Tailwind CSS v4 + shadcn/ui — 与 support-matrix-frontend 同套技术栈。

## 快速开始

### 前置要求

- **Node.js**：`>= 22.12.0`（见 `package.json#engines`）
- **pnpm**：建议用 Corepack 管理（`corepack enable`）
- **git**：需要拉取子模块（`--recurse-submodules`）

### 安装与启动（开发）

```bash
# 克隆（含 submodule）
git clone --recurse-submodules https://github.com/your-org/ruyisdk-examples-frontend.git
cd ruyisdk-examples-frontend

# 如已克隆但忘了带 submodule（或 submodule 为空）
git submodule update --init --recursive

pnpm install

# 开发（默认 http://localhost:3000）
# 注意：该命令会尝试释放 3000 端口（会 kill 掉占用 3000 的进程），然后启动 Astro
pnpm dev

# 不想自动 kill 端口的话（直接启动 Astro dev）
pnpm dev:only

# 自定义端口（仍会 strictPort；若端口被占用会直接失败）
PORT=3001 pnpm dev

# 构建
pnpm build

# 本地预览生产构建
pnpm preview
```

### 常见问题

- **`pnpm dev` 提示找不到 `fuser`**：在部分 Linux 发行版上需要安装 `psmisc`（提供 `fuser`）；或者改用 `pnpm dev:only` 跳过自动释放端口逻辑。
- **3000 端口被占用**：项目配置了 `strictPort: true`，端口占用时不会自动换到 3001/3002；可用 `PORT=xxxx pnpm dev` 或先手动停止占用 3000 的进程。
- **页面没内容/板子列表为空**：确认 `test-doc/` 子模块已初始化并拉取（执行 `git submodule update --init --recursive`）。

## 目录结构

```text
docs/                     # 项目文档
  design.md               # 产品设计文档
  plan.md                 # Agent 开发计划
  learn.md                # 前端学习计划
src/
  components/             # React 组件（BoardCard、BoardSidebar 等）
  layouts/Layout.astro    # 页面外壳
  lib/data.ts             # 数据层：扫描 test-doc，解析板子和示例
  pages/                  # Astro 文件路由
    index.astro           # 首页：板子卡片网格 + 搜索
    boards/[board].astro  # 板子详情：示例列表
    boards/[board]/[example].astro  # 示例详情：Markdown 渲染
  styles/global.css       # 全局样式 + Tailwind 主题
test-doc/                 # 内容 submodule（板子 → 示例 Markdown）
support-matrix-frontend/  # submodule，只读参考
scripts/                  # 开发辅助脚本
```

## 内容模型

内容仓库 `test-doc/` 以板子为顶层目录，每块板子下有多个示例子目录：

```
test-doc/Duo_S/HelloWorld/example_HelloWorld_DuoS.md
test-doc/LicheePi4A/Coremark/example_Coremark_LPi4A.md
```

路由：`/` → `/boards/{board}/` → `/boards/{board}/{example}/`

详细设计见 [`docs/design.md`](docs/design.md)，开发计划见 [`docs/plan.md`](docs/plan.md)。
