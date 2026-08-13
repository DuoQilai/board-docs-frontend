# 访问统计

网站托管在 **Cloudflare Pages**：https://board-docs-frontend.pages.dev/

统计工具：**Cloudflare Web Analytics**（免费，不用 Cookie）。

---

## Cloudflare 管理员做什么

1. 登录托管该项目的 Cloudflare 账号
2. 进入 **Workers & Pages** → `board-docs-frontend`
3. 打开 **Metrics**，在 **Web Analytics** 下选择 **Enable**
4. 重新部署项目；Cloudflare 会在下一次部署时自动注入统计脚本

仓库中不要再手动添加 `beacon.min.js`，也不需要配置 Beacon Token 或
`PUBLIC_CF_WEB_ANALYTICS_TOKEN`。同一页面只保留 Cloudflare Pages 自动注入的一套脚本。

---

## 开发者做什么

正常提交代码并触发一次生产部署即可，不需要维护 Analytics 代码或环境变量。

---

## 怎么验收

**学生**（不需要 Cloudflare 密码）：

1. 打开 https://board-docs-frontend.pages.dev/
2. 看网页源代码，搜 `beacon.min.js` → 应该恰好出现一次
   - **Mac（Chrome / Safari）**：`⌥⌘U`（Option + Command + U）
   - **Windows / Linux**：`Ctrl+U`
   - 或：页面空白处右键 →「查看网页源代码」
3. 可选：打开开发者工具 → **Network** → 刷新，确认存在 `beacon.min.js` 和 `/cdn-cgi/rum` 请求
   - **Mac（Chrome）**：`⌥⌘I`（Option + Command + I）
   - **Windows / Linux**：`F12` 或 `Ctrl+Shift+I`

**Cloudflare 管理员**：

1. 登录 https://dash.cloudflare.com → **Web Analytics**
2. 选择与当前 Pages 项目关联的 Analytics 站点
3. 确认网页源代码里的 `data-cf-beacon` token 与该站点一致
4. 数据可能延迟几分钟出现；测试时关闭广告拦截器，并避免只查看已排除机器人的访问

其他成员要看数据 → 管理员邀请 Member，或由管理员提供截图。

---

## 谁能看到什么

| 谁 | 能看什么 |
| --- | --- |
| **学生** | 网页源代码里有没有统计脚本；Network 里有没有上报请求 |
| **Cloudflare 管理员** | 访问量、访客数、热门页面、地区分布、页面加载速度 |
