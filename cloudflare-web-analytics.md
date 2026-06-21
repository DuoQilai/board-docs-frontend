# 访问统计：向维护者索取 Cloudflare Beacon Token

**前提：** 线上站为 `https://board-docs-frontend.pages.dev/`，响应头含 `server: cloudflare`。按此推断托管在 Cloudflare Pages。若实际改由中科院或其他自建服务器对外，本文不适用，需另定统计方案。

## 维护者要做的事

1. 登录 https://dash.cloudflare.com（须为能管理该站的人）
2. 左侧 **Web Analytics** → **Add a site**
3. 站点填 `board-docs-frontend.pages.dev`
4. 复制页面上的 **Beacon Token**（一长串字母数字）
5. 把 token 发给前端开发同学

## 维护者不需要做

收到 token 之后，在前端仓库加统计脚本、配置环境变量、重新部署——**由学生/前端开发完成，维护者不必操作。**

环境变量名（供开发用，维护者可忽略）：`PUBLIC_CF_WEB_ANALYTICS_TOKEN`

## 若站改托管到中科院自建服务器

- Cloudflare **Pages 控制台**那套环境变量配置不再适用
- Cloudflare **Web Analytics** 仍可在任意网页嵌 beacon 脚本上报（不依赖 Pages），但 token 申请、脚本注入、构建环境要在自建部署流程里重做
- 部署方式未确认前，先问清维护者再选方案
