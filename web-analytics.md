# 访问统计 — 老师需要提供什么

网站要加访问量统计。老师按实际情况对号入座，把对应信息发给学生即可。

**老师不用改代码、不用配环境变量。** 学生收到信息后自己处理。

---

## 先确认：网站托管在哪？

线上地址：https://board-docs-frontend.pages.dev/

学生侧观察：域名是 `.pages.dev`，响应头有 `server: cloudflare` → **更像情况 A**。最终以老师说的为准。

---

## 情况 A：Cloudflare 托管（当前大概率）

### 老师提供

**Beacon Token**（一串字母数字）

### 怎么拿

1. 登录 https://dash.cloudflare.com
2. **Web Analytics** → **Add a site**
3. 站点填 `board-docs-frontend.pages.dev`
4. 复制 **Beacon Token**，发给学生

### 老师不用做

加脚本、配 `PUBLIC_CF_WEB_ANALYTICS_TOKEN`、重新部署 — 学生做。

---

## 情况 B：中科院 / 自建服务器托管

### 老师提供（尽量全发）

| 信息 | 示例 |
| --- | --- |
| 实际访问地址 | `http://xxx.cas.cn/...` |
| 怎么部署的 | nginx 静态文件 / 谁跑构建 / 从哪拉代码 |
| 统计想用啥 | Cloudflare / 学校指定工具 / 暂无要求 |

### 若仍用 Cloudflare 统计

照样开 Web Analytics，把 **Beacon Token** 给学生。  
区别：环境变量要在**自建部署流程**里配，不是 Cloudflare Pages 面板。

### 若用学校指定统计

告诉工具名 + 学生需要的那段配置（如统计 ID、脚本地址）。

---

## 学生收到后做什么

| 老师给的信息 | 学生下一步 |
| --- | --- |
| Beacon Token + 情况 A | 代码加脚本，Cloudflare Pages 配环境变量 |
| Beacon Token + 情况 B | 代码加脚本，在自建部署里配环境变量 |
| 学校指定工具 | 按该工具文档接入 |
| 部署方式说不清 | 先对齐托管，再定统计方案 |
