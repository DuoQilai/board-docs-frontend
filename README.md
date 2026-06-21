# RuyiSDK Examples 前端

这个项目把 `ruyisdk/board-docs` 里的开发板示例文档渲染成网页，方便按「板子 -> 示例」浏览和检索。

## 在线地址

**https://board-docs-frontend.pages.dev/**

公开可访问。本地开发对照：`pnpm dev` → `http://localhost:3000`。

## 部署（当前已知）

本仓库**没有** Dockerfile、学校内网部署脚本等自建托管配置。

| 项 | 状态 |
| --- | --- |
| 线上域名 | `board-docs-frontend.pages.dev`（`.pages.dev` 为 Cloudflare Pages 常用域名） |
| HTTP 响应 | 访问线上地址可见 `server: cloudflare` |
| 代码仓库 | [DuoQilai/board-docs-frontend](https://github.com/DuoQilai/board-docs-frontend) |
| 自动发布 | `main` 推送后由托管方构建部署（具体账号与面板需维护者确认） |

**未核实项**（需问吴老师或仓库管理员）：是否另有中科院自建服务器、是否绑定自定义域名、Cloudflare 账号归属。

访问统计方案取决于实际托管方式——见仓库根目录 `cloudflare-web-analytics.md`（仅适用于当前 Cloudflare 托管情形；若改自建服务器需另定方案）。

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

GitHub Actions（`.github/workflows/update-submodule.yml`）每天自动拉取 [ruyisdk/board-docs](https://github.com/ruyisdk/board-docs) 最新提交：有更新则验证 `pnpm build` 通过后直接推送到 `main`，触发线上重新部署。

本地手动更新：

```bash
cd board-docs
git fetch origin main
git pull --rebase origin main

cd ..
git add board-docs
git commit -m "chore: bump board-docs submodule"
```

## 示例分类

示例 frontmatter 的 `status` 字段使用下列 slug（定义见 `src/lib/status-labels.ts`）：

| slug | 中文 |
| --- | --- |
| `basics` | 基础示例 |
| `peripheral` | 外设控制 |
| `communication` | 通信接口 |
| `network` | 网络通信 |
| `system` | 系统编程 |
| `multimedia` | 多媒体应用 |
| `computer-vision` | 计算机视觉 |
| `ai` | 人工智能 |
| `crypto` | 加密安全 |
| `compression` | 数据压缩 |
| `gui` | 图形界面 |
| `benchmark` | 性能测试 |

旧值 `application`、`others`、`good` 等会自动映射到新分类。
