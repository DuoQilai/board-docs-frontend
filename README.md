# RuyiSDK Examples

将测试文档仓库中的 RISC-V 开发板示例渲染为网页，按板子浏览和检索。

https://boards.ruyisdk.org/

## 自动同步

每天 12:00（北京时间）自动更新 `board-docs` 和 `ros2-course` 两个子模块，测试与 build 验证通过后推送到 `main` 并触发 Cloudflare Pages 重新部署。ROS2 课程使用 [GitHub 镜像](https://github.com/DuoQilai/ROS2_RISCV)，发布新内容前需先同步镜像。

## 技术栈

Astro 6 + React + TypeScript + Tailwind CSS v4。托管于 Cloudflare Pages。


## Course sources

Course metadata under `board-docs/<board>/courses/<course>/metadata.yml` points to a catalog inside the `ros2-course` submodule, for example `catalog: catalogs/CoM260_Kit.yml`. The catalog stores the course title, ordered chapters, document URLs for each edition and language, `introduction_source`, and edition environments. Chapter and lab mappings stay explicit because several later theory chapters share one lab. The submodule provides the catalog, documents and media from the GitHub mirror at `https://github.com/DuoQilai/ROS2_RISCV`; the source repository link continues to point to Gitee.

Initialize the versions recorded by the frontend before starting development or building:

```sh
git submodule update --init board-docs ros2-course
```

Run `pnpm dev:only --host 127.0.0.1 --port 4321` for local preview, or `pnpm build`. Astro reads the catalog and documents from the same checked-out course commit, generates course routes and navigation, and copies referenced media into generated assets. It does not fetch the network or read uncommitted course edits during startup/build. Document URLs must match the submodule repository and its configured branch (or checked-out commit). Missing submodules, catalogs or source files stop startup/build; stale documents are not used as a fallback. Existing inline chapter metadata remains supported during migration.

For the initial migration, publish the catalogs in the course mirror before switching board-docs to catalog references, then update both frontend submodules.

To publish new chapters, commit their documents and catalog entries together in the course repository, then sync the GitHub mirror. Update the frontend with `git submodule update --remote ros2-course`, run `node --test scripts/sync-courses.test.mjs` and `pnpm build`, review and commit the submodule revision, and deploy. No board-docs or frontend source edits are needed for new chapters: the catalog, previous/next links and homepage course news follow the course catalog automatically. Restart the development server after updating the submodule. `.cache/courses/` and `public/course-assets/` are generated and ignored by Git; do not edit or commit them. The generated cache records the resolved catalogs and course documents together.
