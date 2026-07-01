# RuyiSDK Examples

将 `ruyisdk/board-docs` 中的 RISC-V 开发板示例文档渲染为网页，按板子浏览和检索。

https://board-docs-frontend.pages.dev/

## 本地开发

```bash
git clone --recurse-submodules https://github.com/DuoQilai/board-docs-frontend.git
cd board-docs-frontend
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # 生产构建
```

## 自动同步

每天 12:00（北京时间）自动拉取 [ruyisdk/board-docs](https://github.com/ruyisdk/board-docs) 最新内容，build 验证通过后推送到 `main` 并触发 Cloudflare Pages 重新部署。

手动触发：[Actions → Sync board-docs Submodule → Run workflow](https://github.com/DuoQilai/board-docs-frontend/actions/workflows/update-submodule.yml)

## 技术栈

Astro 6 + React + TypeScript + Tailwind CSS v4。托管于 Cloudflare Pages。
