# RuyiSDK Examples

将测试文档仓库中的 RISC-V 开发板示例渲染为网页，按板子浏览和检索。

https://board-docs-frontend.pages.dev/

## 自动同步

每天 12:00（北京时间）自动拉取[测试文档仓库](https://github.com/ruyisdk/board-docs)最新内容，build 验证通过后推送到 `main` 并触发 Cloudflare Pages 重新部署。

## 技术栈

Astro 6 + React + TypeScript + Tailwind CSS v4。托管于 Cloudflare Pages。
