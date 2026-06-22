# 访问统计

网站托管在 **Cloudflare Pages**：https://board-docs-frontend.pages.dev/

统计工具：**Cloudflare Web Analytics**（免费，不用 Cookie）。

---

## 老师做什么

1. 登录 https://dash.cloudflare.com
2. **Web Analytics** → 添加站点 `board-docs-frontend.pages.dev`
3. 把 **Beacon Token** 发给学生

**到此为止。** 不用改代码，不用配环境变量，不用重新部署。

---

## 学生做什么

1. 把 token 写进 `src/layouts/Layout.astro`（已完成）
2. 推 `main`，等 Cloudflare 自动部署

---

## 怎么验收

**学生**（不需要 Cloudflare 密码）：

1. 打开 https://board-docs-frontend.pages.dev/
2. 看网页源代码，搜 `beacon.min.js` → 有 = 脚本生效
   - **Mac（Chrome / Safari）**：`⌥⌘U`（Option + Command + U）
   - **Windows / Linux**：`Ctrl+U`
   - 或：页面空白处右键 →「查看网页源代码」
3. 可选：打开开发者工具 → **Network** → 刷新，看有没有 `cloudflareinsights.com` 请求
   - **Mac（Chrome）**：`⌥⌘I`（Option + Command + I）
   - **Windows / Linux**：`F12` 或 `Ctrl+Shift+I`

**老师**（需要自己的 Cloudflare 账号）：

1. 登录 https://dash.cloudflare.com → **Web Analytics**
2. 选 `board-docs-frontend.pages.dev`
3. 数据可能几小时后才出现，不是实时的

学生要看数据 → 老师邀请 Member，或老师截图。

---

## 谁能看到什么

| 谁 | 能看什么 |
| --- | --- |
| **学生** | 网页源代码里有没有统计脚本；Network 里有没有上报请求 |
| **老师** | 访问量、访客数、热门页面、地区分布、页面加载速度 |
