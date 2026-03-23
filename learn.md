# 前端学习计划

> 目标：能读懂 Agent 产出的 Astro + React + TypeScript + Tailwind 代码，能独立跑构建、定位问题、做验收判断。  
> 背景：系统 / C / C++ / Rust 扎实，无前端经验。

---

## 课程资源

| 缩写 | 课程 | 说明 |
|------|------|------|
| **FSO** | [Helsinki Full Stack Open](https://fullstackopen.com/) | 免费、自定进度、项目驱动；React + TypeScript + Node + 测试 + CI/CD + 容器，质量极高 |
| **CS142** | [Stanford CS142: Web Applications](https://web.stanford.edu/class/cs142/) | 经典全栈课，讲义精炼；HTML → CSS → JS → React → Node → 安全 |
| **CS571** | [UW-Madison CS571: Building UI](https://cs571.org/) | React + React Native + 设计思维 + 可用性评估；「设计与评估」部分独一无二 |
| **17-313** | [CMU 17-313: Foundations of Software Engineering](https://cmu-313.github.io/) | 软件工程过程 / 需求 / 架构 / 质量保障 / 开源贡献 |

---

## 学习顺序

### 第一阶段：Web 基础 — 建立心智模型

**目标**：理解浏览器拿到什么、渲染什么、JS 怎么参与。

| 顺序 | 内容 | 来源 |
|------|------|------|
| 1 | Fundamentals of Web apps | FSO Part 0 |
| 2 | HTML, CSS, JS Basics | CS142 Week 1–2（Intro → HTML → CSS → URLs → JS Basics → JS Programming） |
| 3 | DOM, Events, Intro to Front End | CS142 Week 3 |

你有 C/Rust 底子，JS 语法本身不难；重点是理解 **DOM 是什么、事件怎么绑定、浏览器怎么跑 JS**。  
FSO Part 0 只有一节，用来建立「浏览器 ↔ 服务器」全景。CS142 Week 1–3 的讲义很精炼，快速过一遍即可。

---

### 第二阶段：React — 你的项目的核心 UI 层

**目标**：能读懂 React 组件、理解 props/state/hooks、看懂 Agent 写的交互逻辑。

| 顺序 | 内容 | 来源 |
|------|------|------|
| 4 | Introduction to React | FSO Part 1 |
| 5 | Communicating with server（fetch / effect） | FSO Part 2 |
| 6 | React Basics → SPA → Responsive Web Design | CS142 Week 4 |
| 7 | Building Web Apps + Browser/Server Communication | CS142 Week 5 |

FSO Part 1–2 有大量动手练习，是主线。CS142 Week 4–5 讲义作为补充阅读，视角不同，能加深理解。

做完这一阶段，你就能看懂 `ExampleCard.tsx`、`ExampleSidebar.tsx` 这类 React 组件在做什么了。

---

### 第三阶段：TypeScript — 读代码的关键能力

**目标**：能读懂类型标注、接口定义、泛型签名。

| 顺序 | 内容 | 来源 |
|------|------|------|
| 8 | TypeScript | FSO Part 9 |

你写过 Rust trait + C++ template，TypeScript 的类型系统对你来说不陌生。FSO Part 9 直接在 React 项目里教 TS，刚好衔接上一阶段。

做完这一阶段后，`src/lib/examples.ts` 里的 `ExampleMeta` 接口、`getAllExamples()` 返回类型等，你都能直接读。

---

### 第四阶段：路由、样式、状态管理 — 把页面组织起来

**目标**：理解多页面路由、CSS 框架、全局状态。

| 顺序 | 内容 | 来源 |
|------|------|------|
| 9 | React router, custom hooks, styling app with CSS and webpack | FSO Part 7 |
| 10 | Advanced state management | FSO Part 6 |

Astro 的路由是文件系统式的（`src/pages/`），比 React Router 更简单，但理解 SPA 路由的概念仍然必要。FSO Part 7 还涉及 CSS 方案选型（Tailwind 属于其中一种思路）和 webpack 构建，帮你理解 `pnpm build` 背后在做什么。

---

### 第五阶段：设计思维与验收能力 — 你的核心角色

**目标**：建立「这个界面好不好」的评判框架，而不只是「能不能跑」。

| 顺序 | 内容 | 来源 |
|------|------|------|
| 11 | Design Thinking | CS571 Lecture 4 |
| 12 | Visual Design | CS571 Lecture 6 |
| 13 | Web Design（WIMP & Page Structure） | CS571 Lecture 8 |
| 14 | Interaction Design | CS571 Lecture 10 |
| 15 | Expert Evaluation（Cognitive Walkthrough + Heuristic Evaluation） | CS571 Lecture 12 |
| 16 | Accessibility | CS571 Lecture 14 |
| 17 | Usability Evaluation（Usability Testing） | CS571 Lecture 24 |

**这个阶段对你尤其重要**。你的角色是「提需求 + 验收」，不是「手写 CSS」。CS571 的设计与评估系列讲的是 **怎么判断一个界面是否好用、怎么系统地发现问题**。这些方法论 Agent 不会替你做——它写代码，你判断产品。

---

### 第六阶段：测试 + 构建 + 部署 — 质量保障闭环

**目标**：能看懂测试、能跑 CI、能排查构建失败。

| 顺序 | 内容 | 来源 |
|------|------|------|
| 18 | Testing React apps | FSO Part 5 |
| 19 | CI/CD | FSO Part 11 |
| 20 | Containers | FSO Part 12 |

你有 QEMU/GDB/Makefile 经验，Docker 和 CI 对你来说成本很低。FSO Part 11–12 讲 GitHub Actions + Docker，与 RuyiSDK 项目的部署流程直接相关。

---

### 第七阶段（可选）：服务端 + 数据库 — 扩展全栈视野

**目标**：如果项目日后需要后端（API、用户系统等），这里补齐。

| 顺序 | 内容 | 来源 |
|------|------|------|
| 21 | Programming a server with Node.js and Express | FSO Part 3 |
| 22 | Testing Express servers, user administration | FSO Part 4 |
| 23 | GraphQL | FSO Part 8 |
| 24 | Using relational databases | FSO Part 13 |
| 25 | Node.js + Express + Database | CS142 Week 6 |
| 26 | Sessions, Input, State Management | CS142 Week 7 |
| 27 | Web App Security | CS142 Week 8 |

当前 Examples 是纯静态站点，**不急学**。但你做过 C++ HTTP 服务（CppAIService）和 TCP/IP 协议栈，Node.js/Express 对你来说上手极快，日后需要时再按顺序过即可。

---

### 第八阶段（可选）：软件工程方法论

**目标**：开源协作、需求管理、架构决策。

| 顺序 | 内容 | 来源 |
|------|------|------|
| 28 | CMU 17-313 全课程 | 17-313 |

你已经在做开源贡献（RuyiSDK support-matrix PR），17-313 的开源项目贡献 + 需求分析 + 架构评审能让你从工程管理角度理解整个流程。**与前端技能无关，但与你的职业方向（系统 + 开源 + Agent 协作）高度相关**，适合作为独立学习线并行推进。

---

## 总结

| 阶段 | 关键词 | 与项目的关系 |
|------|--------|-------------|
| 1 | HTML / CSS / JS / DOM | 看懂页面结构 |
| 2 | React | 看懂组件代码 |
| 3 | TypeScript | 读懂类型与接口 |
| 4 | 路由 / 样式 / 状态 | 理解页面组织和构建 |
| **5** | **设计思维 / 可用性评估** | **验收核心能力** |
| 6 | 测试 / CI / 容器 | 质量保障 |
| 7 | Node / Express / DB | 可选，日后扩展 |
| 8 | 软件工程 | 可选，工程管理视角 |

**主线是 Full Stack Open**，它覆盖了阶段 1–4、6–7，质量极高且完全免费。  
**CS571 的设计评估讲座** 是独特补充，其他课程不教这个。  
**CS142** 作为快速参考讲义，不必完整跟课。  
**17-313** 独立于前端，按兴趣并行。
