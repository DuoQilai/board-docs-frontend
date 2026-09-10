# RuyiSDK Examples

将测试文档仓库中的 RISC-V 开发板示例渲染为网页，按板子浏览和检索。

https://boards.ruyisdk.org/

## 自动同步

每天 12:00（北京时间）自动拉取[测试文档仓库](https://github.com/ruyisdk/board-docs)最新内容，build 验证通过后推送到 `main` 并触发 Cloudflare Pages 重新部署。

## 技术栈

Astro 6 + React + TypeScript + Tailwind CSS v4。托管于 Cloudflare Pages。


## Course sources

Course metadata under `board-docs/<board>/courses/<course>/metadata.yml` stores Gitee or GitHub document URLs for each edition and language, plus the remote README URL in `introduction_source`. The `editions` fields describe programming languages and runtime environments for the two-row textbook table. Astro fetches the selected branch on every development-server startup and production build, renders documents on local course routes, and copies referenced media into generated assets. Source failures stop startup/build; stale documents are not used as a fallback.

Run `pnpm dev:only --host 127.0.0.1 --port 4321` for local preview, or `pnpm build` to refresh and build. Restart the development server after changing a source document or URL. `.cache/courses/` and `public/course-assets/` are generated and ignored by Git; do not edit or commit them. Fetching requires Git and network access to the document host. ROS 2 documents use the GitHub mirror at `https://github.com/DuoQilai/ROS2_RISCV`; the source repository link continues to point to Gitee. Sync the mirror’s `master` branch from Gitee when publishing course updates, then rebuild the site. The generated document cache records the fetched commit.
