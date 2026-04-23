# Eclipse WebView 支持方案（仅文档，不改代码）

本文档用于记录：在现有“VS Code WebView 才显示按钮并 `postMessage`”的基础上，未来如何**同时支持 Eclipse 内置 WebView**。

## 背景与目标

微信群需求口径（2026-04-15~04-23）可总结为：

- 该功能**只在 IDE 容器内生效**（VS Code WebView 或 Eclipse WebView）。
- 在 IDE 环境下，示例详情页右上角展示按钮「在 VS Code 中使用」，浏览器环境不展示。
- 点击按钮后，前端通过 WebView bridge 发送消息：

```js
vscode.postMessage({
  type: "copilot",
  url: "当前文档的原文URL",
  model: "开发板型号（比如 Lichee Pi 4A）",
  profile: "示例名称（比如 Coremark）",
});
```

当前仓库代码已经实现 **VS Code WebView** 分支（UA 包含 `Code/` 时展示按钮并 `postMessage`），但**尚未覆盖 Eclipse**。

## 设计原则

- **不影响浏览器用户**：浏览器环境不展示按钮、不触发任何 IDE 特有逻辑。
- **最小侵入**：保持现有 VS Code 行为不变，只在条件判断上扩展 “Eclipse 也算 IDE 环境”。
- **桥接协议尽量统一**：尽可能让 Eclipse WebView 端也提供 `vscode.postMessage`（或兼容 `acquireVsCodeApi().postMessage` 的形态），这样前端无需分叉大量逻辑。

## 方案概述

### 1) Eclipse 环境识别（UA 子串）

和 VS Code 的 `Code/` 类似，Eclipse 也需要一个**稳定的 UA 关键字**用于识别 Eclipse WebView。

- **当前占位关键字**：`placerhodelr`（仅占位，后续必须替换为真实 UA 特征）
- **最终逻辑建议**：
  - `isVSCodeWebView = navigator.userAgent.includes("Code/")`
  - `isEclipseWebView = navigator.userAgent.includes("<ECLIPSE_UA_KEYWORD>")`
  - `isIdeWebView = isVSCodeWebView || isEclipseWebView`
  - 按钮展示条件改为 `isIdeWebView`

#### 获取 Eclipse UA 的推荐方法

- 在 Eclipse 内置 WebView 打开任意页面，在 DevTools Console 执行 `navigator.userAgent` 并复制出来。
- 或由 Eclipse 端开发在 WebView 宿主侧打印 UA，并在对接时提供样例。

> 关键点：不要依赖过于“脆”的字段（比如某个版本号），优先选一个长期不变的产品标识子串。

### 2) WebView bridge 约定（推荐统一为 `vscode.postMessage`）

为了让前端复用现有 VS Code 分支，推荐 Eclipse 宿主注入对象满足以下之一：

#### 方案 A（推荐）：Eclipse 注入 `window.vscode.postMessage`

Eclipse 宿主向页面注入：

- `window.vscode = { postMessage: (payload) => void }`

这样前端只要沿用现有 fallback（优先 `acquireVsCodeApi()`，否则 `window.vscode`）即可复用。

#### 方案 B：Eclipse 注入自定义对象名（需要前端新增 fallback）

如果 Eclipse 端无法/不愿注入 `window.vscode`，可以注入：

- `window.eclipseWebview = { postMessage: (payload) => void }`（对象名仅示例）

则前端需要在取 bridge 的地方增加一个 fallback 分支（例如依次尝试 `acquireVsCodeApi()`、`window.vscode`、`window.eclipseWebview`）。

> 若要采用方案 B，必须先在此文档中把“对象名 + 方法名 + payload 约定”定死，避免前后端反复试错。

### 3) payload 字段与语义

保持与群聊一致：

- `type`: 固定 `"copilot"`
- `url`: 当前文档的“原文 URL”
  - 建议发送**绝对 URL**（便于宿主侧直接打开/转发）
  - 若站点为静态站，且“原文 URL”指向 repo 内路径，则在宿主侧再决定如何映射到远端仓库 URL
- `model`: 开发板型号（如 `Lichee Pi 4A`）
- `profile`: 示例名（如 `Coremark`）

## 联调与验收清单

- **浏览器**访问示例详情页：按钮不显示。
- **VS Code WebView** 访问示例详情页：按钮显示；点击后宿主侧收到 `type="copilot"` 消息，且 `url/model/profile` 正确。
- **Eclipse WebView** 访问示例详情页：
  - UA 命中 Eclipse 关键字时按钮显示；
  - 点击后宿主侧收到同样 payload；
  - 若 Eclipse bridge 与 VS Code 统一（方案 A），则前端改动应仅限于“识别条件扩展”。

## 风险点与决策记录（建议）

- **UA 识别可靠性**：必须拿到 Eclipse WebView 的实际 UA；若 UA 不稳定或无法区分浏览器，应改为“宿主注入标志位”识别（例如 `window.__RUYI_IDE_WEBVIEW__ = true`）。
- **跨域/URL 映射**：`url` 字段若要指向远端 GitHub/Gitee 原文，需要明确 base（例如仓库地址、分支、路径映射规则）。

