# RuyiSDK Examples 前端

这个项目把 `ruyisdk/board-docs` 里的开发板示例文档渲染成网页，方便按「板子 -> 示例」浏览和检索。

## 技术栈

Astro 6、React、TypeScript、Tailwind CSS v4、shadcn/ui。

## 快速开始

先准备环境：

- Node.js >= 22.12.0
- pnpm（可先执行 `corepack enable`）
- git（需要拉取子模块）

然后按顺序执行：

```bash
git clone --recurse-submodules <你的仓库 URL>
cd board-docs-frontend

# 如果你之前 clone 时没带 --recurse-submodules，再补这一步
git submodule update --init --recursive

pnpm install
pnpm dev
```

启动后默认访问 `http://localhost:3000`。

常用命令：

```bash
pnpm dev:only     # 直接启动，不做端口清理
PORT=3001 pnpm dev
pnpm build
pnpm preview
```

## 不同系统说明

- macOS：`pnpm dev` 和 `pnpm dev:only` 都可以直接用。
- Windows：优先用 `pnpm dev:only`。`pnpm dev` 依赖 bash，未安装 Git Bash 时可能失败。  
  - PowerShell 改端口：`$env:PORT=3001; pnpm dev:only`  
  - CMD 改端口：`set PORT=3001&& pnpm dev:only`
- Linux：`pnpm dev` 会尝试清理端口占用（优先用 `fuser`，没有就尝试 `lsof`）。如果都没有，改用 `pnpm dev:only` 即可。

## 目录结构（节选）

- `src/`：页面和组件代码
- `src/lib/data.ts`：读取并解析 `board-docs` 内容
- `board-docs/`：文档内容子模块（来源：`ruyisdk/board-docs`）
- `docs/`：设计和计划文档

## 内容组织与路由

站点支持两种内容布局：

- `board-docs/{board}/{example}/*.md`
- `board-docs/boards/{board}/{example}/*.md`

例如：

- `board-docs/LicheePi4A/Coremark/example_Coremark_LPi4A.md`

`templates/` 目录会被自动忽略，不会出现在页面和路由里。

主要路由：

- `/`
- `/boards/{board}/`
- `/boards/{board}/{example}/`

## 更新 `board-docs` 子模块

部署前建议先更新 `board-docs` 到最新提交，再构建站点。

```bash
cd board-docs
git fetch origin main
git pull --rebase origin main

cd ..
git add board-docs
git commit -m "chore: bump board-docs submodule"
```
