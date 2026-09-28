# RuyiSDK Examples

将测试文档仓库中的 RISC-V 开发板示例渲染为网页，按板子浏览和检索。

https://boards.ruyisdk.org/

## 自动同步

每天 12:00（北京时间）自动更新 `board-docs` 和 `ros2-course` 两个子模块，仅接受快进更新，测试与 build 验证通过后推送到 `main` 并触发 Cloudflare Pages 重新部署。ROS2 课程使用 [GitHub 镜像](https://github.com/DuoQilai/ROS2_RISCV)，发布新内容前需先同步镜像。

## 技术栈

Astro 6 + React + TypeScript + Tailwind CSS v4。托管于 Cloudflare Pages。


## Course sources

Course metadata under `board-docs/<board>/courses/<course>/metadata.yml` points to a catalog inside the `ros2-course` submodule, for example `catalog: course_support/k3_com260_kit/catalog.yml`. The catalog stores the course title, ordered chapters, document URLs for each edition and language, `introduction_source`, and edition environments. Chapter and lab mappings stay explicit because several later theory chapters share one lab. The submodule provides the catalog, documents and media from the GitHub mirror at `https://github.com/DuoQilai/ROS2_RISCV`; the source repository link continues to point to Gitee.

Initialize the versions recorded by the frontend before starting development or building:

```sh
git submodule update --init board-docs ros2-course
```

Run `pnpm dev:only --host 127.0.0.1 --port 4321` for local preview, or `pnpm build`. Astro reads the catalog and documents from the same checked-out course commit, generates course routes and navigation, and copies referenced media into generated assets. Catalog-backed courses do not fetch the network or read uncommitted course edits during startup/build. Their document URLs must match the submodule repository and its configured branch (or checked-out commit). Missing submodules, catalogs or source files stop startup/build; stale documents are not used as a fallback. Existing inline chapter metadata keeps its per-repository GitHub/Gitee fetching behavior and does not require the course submodule. When both formats exist, the catalog takes precedence over inline fields.

For the initial migration, deploy merge-based upstream synchronization on the course mirror main branch before merging the catalogs into its master branch. The mirror then preserves GitHub-only catalogs while merging Gitee updates and stops on conflicts. The catalogs can be contributed to Gitee with a later course update. Keep inline metadata alongside the catalog reference until the frontend with catalog support has been deployed; older frontends still need those fields. After the course and board-docs changes are merged, align both frontend submodule revisions with the published upstream commits and verify the build. The temporary inline fields can then be removed. Future chapter updates only need to change the course catalog.

The scheduled updater retains a recorded commit when the remote branch is behind it and stops on divergent history. After a squash or rebase merge, review and record the published submodule commit manually before resuming automatic updates.

To publish new chapters, publish their documents and catalog entries on GitHub, either directly or through Gitee synchronization. While the catalogs are maintained only on GitHub, add the entries there after synchronizing new upstream chapters. Update the frontend with `bash scripts/update-content-submodules.sh ros2-course`, run `node --test scripts/*.test.mjs` and `pnpm build`, review and commit the submodule revision, and deploy. No board-docs or frontend source edits are needed for new chapters: the catalog, previous/next links and homepage course news follow the course catalog automatically. Restart the development server after updating the submodule. `.cache/courses/` and `public/course-assets/` are generated and ignored by Git; do not edit or commit them. The generated cache records the resolved catalogs and course documents together.
