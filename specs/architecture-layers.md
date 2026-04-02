# OpenCode 项目结构分层分析

## 一句话结论

这个仓库最稳妥的描述不是“一个严格单核、单向依赖的分层系统”，而是：**两个并列核心（本地 `packages/opencode` 运行时、云端 `packages/console/core` 核心）+ 多个产品/接入端 + 一组共享支撑包 + 部署与分发层**。

也就是说，它**有明显的分层倾向**，但很多目录同时带有“产品切片”“运行时包装”“平台适配”的特征，不能机械地套成标准 Clean Architecture。

---

## 1. 仓库顶层结构

先看仓库根目录里的关键区域：

- `packages/`：主 monorepo 工作区，绝大多数产品、运行时、共享库都在这里。
- `infra/`：SST 基础设施编排，负责把 app / console / worker 等部署出去。
- `sdks/`：面向外部宿主的 SDK / 集成，这里当前主要是 `sdks/vscode`。
- `nix/`：Nix 打包与环境分发相关配置。
- `.opencode/`：项目自己的 agent、command、theme、tool 配置。
- `specs/`：设计说明和结构性文档。

从根 `package.json` 可以确认这是一个 **Bun + Turbo 的 monorepo**，workspace 覆盖 `packages/*`、`packages/console/*`、`packages/sdk/js`、`packages/slack`。

---

## 2. 推荐的分层视角

如果要按“从外到内 / 从产品到能力”的方式理解，我建议这样看：

```text
L1 产品与接入层
L2 应用入口与接口层
L3 核心业务与运行时层（双核心）
L4 共享支撑与平台适配层
L5 基础设施、部署与分发层
```

这个视角比“基建层 / 业务逻辑层 / 表现层”更贴近这个仓库，因为这里既有本地 CLI/TUI 系统，也有云端 console，还有桌面端、VS Code、Slack、文档站和 Cloudflare Worker。

---

## 3. L1：产品与接入层

这一层是最终用户直接接触到的产品壳、客户端或外部接入面。

### 3.1 主应用与桌面端

- `packages/app/`
  - 主应用 UI 壳。
  - `packages/app/package.json` 显示它依赖 `@opencode-ai/sdk`、`@opencode-ai/ui`、`@opencode-ai/util`。
  - `packages/app/src/index.ts` 暴露 `AppBaseProviders`、`AppInterface`、`ServerConnection`，说明它不是单页页面集合，而是可复用的应用入口壳。

- `packages/desktop/`
  - Tauri 桌面端。
  - `packages/desktop/package.json` 直接依赖 `@opencode-ai/app`。
  - `packages/desktop/src/index.tsx` 直接从 `@opencode-ai/app` 导入 `AppBaseProviders`、`AppInterface`、`ServerConnection`，说明桌面端是“原生壳 + 共享应用层”的组合。

- `packages/desktop-electron/`
  - Electron 桌面端。
  - `packages/desktop-electron/package.json` 同样依赖 `@opencode-ai/app`。
  - `packages/desktop-electron/src/renderer/index.tsx` 也直接从 `@opencode-ai/app` 导入应用壳能力，说明它和 Tauri 一样，本质上是另一套宿主壳。

### 3.2 云端产品面

- `packages/console/app/`
  - 面向用户的云端 console 产品入口。
  - 但它**不是纯前端**，后面会讲到它直接引用 `@opencode-ai/console-core` 的服务和数据层代码。

- `packages/enterprise/`
  - 企业产品面。
  - `packages/enterprise/package.json` 使用 `solid-start`、`hono`、`hono-openapi`，说明它是独立产品面，不只是静态站。

- `packages/web/`
  - 文档/官网站点。
  - `packages/web/package.json` 使用 Astro + Starlight，职责更偏内容与说明，而不是核心业务系统。

### 3.3 外部集成入口

- `sdks/vscode/`
  - VS Code 扩展。
  - 这是编辑器接入面，而不是核心运行时本体。

- `packages/slack/`
  - Slack 集成。
  - `packages/slack/package.json` 依赖 `@opencode-ai/sdk` 和 `@slack/bolt`，说明它通过 SDK 连接 OpenCode 能力，再投射到 Slack 场景里。

### 3.4 这一层的定位

这一层的共同点是：**它们不是系统能力的源头，而是把能力包装成用户可用的产品或集成入口。**

---

## 4. L2：应用入口与接口层

这一层负责把外部世界的输入转换成系统内部调用。它包括 CLI 入口、HTTP 入口、Worker 入口、SDK 包装和服务路由。

### 4.1 本地入口：`packages/opencode/src/index.ts`

`packages/opencode/src/index.ts` 是本地运行时最关键的入口之一：

- 使用 `yargs` 组织 CLI。
- 注册 `RunCommand`、`ServeCommand`、`McpCommand`、`AcpCommand`、`SessionCommand`、`PluginCommand` 等命令。
- 启动前还会处理日志、环境变量、数据库迁移。

这说明 `packages/opencode` 不只是一个“库”，而是完整的本地入口程序。

### 4.2 Worker / HTTP 入口

- `packages/function/src/api.ts`
  - 这是 Cloudflare Worker 入口。
  - 文件中可以直接看到 `new Hono()`、`DurableObject`、`share_create` / `share_sync` / `share_poll` 等接口。
  - 它更像一个独立产品能力入口，而不是通用基础库。

- `packages/console/function/src/auth.ts`
- `packages/console/function/src/log-processor.ts`
  - 这两个文件则是 console 体系下的专用 worker 入口。

### 4.3 Console 的页面 / 服务入口

- `packages/console/app/src/routes/*`
  - 这是 console 的页面路由与服务端路由层。
  - 通过实际搜索可以确认，多个 route 文件直接导入 `@opencode-ai/console-core/*`，例如：
    - `packages/console/app/src/routes/stripe/webhook.ts`
    - `packages/console/app/src/routes/bench/submission.ts`
    - `packages/console/app/src/routes/zen/util/handler.ts`

这意味着 `console/app` 是“产品前台 + server routes + 业务调用”的混合层，不适合简单定义为纯前端展示层。

### 4.4 SDK：接口契约 + 启动包装

- `packages/sdk/js/`
  - 对外暴露 `client`、`server`、`v2/client`、`v2/server`。
  - 它更适合被理解为 **访问契约层 / 包装层**。
  - 它很重要，但不能夸大成“整个系统唯一边界”，因为桌面端和 VS Code 等接入面并不只通过 SDK 才能接入系统。

---

## 5. L3：核心业务与运行时层

这一层是仓库真正的“能力核心”，但这里不是一个核心，而是**两个并列核心**。

## 5.1 本地核心：`packages/opencode/`

`packages/opencode` 是本地 CLI / TUI / 本地服务运行时核心。

从 `packages/opencode/package.json` 和源码目录可以看到它承担了很多核心职责：

- `src/cli/`：CLI 命令系统。
- `src/agent/`：agent 行为与交互逻辑。
- `src/session/`：会话、消息、线程、上下文。
- `src/tool/`：工具系统。
- `src/server/`：本地 HTTP 服务。
- `src/provider/`：模型提供方接入。
- `src/storage/`：本地数据库与存储。
- `src/lsp/`：语言服务相关能力。
- `src/project/`、`src/workspace/`、`src/permission/`：项目、工作区、权限等系统级能力。

这说明它不是“单纯业务层”，而是把**入口、运行时、能力模块、存储、协议接入**都聚合在同一个核心包里。

### 5.2 云端核心：`packages/console/core/`

`packages/console/core` 是 console 体系的云端核心。

从 `packages/console/core/package.json` 可以看到它依赖：

- `drizzle-orm`
- `postgres`
- `stripe`
- `@opencode-ai/console-mail`
- `@opencode-ai/console-resource`

它的职责更接近：

- 用户 / 工作区 / 标识体系
- 账单 / 订阅 / 支付处理
- 数据库 schema 与访问
- 云端资源和运营能力

所以如果从“业务中心”看，这个仓库有两个中心：

1. `packages/opencode`：本地 agent/runtime 核心。
2. `packages/console/core`：云端 console 核心。

这是理解仓库结构时最关键的一点。

---

## 6. L4：共享支撑与平台适配层

这一层的代码不直接代表某个产品，而是被多个产品或核心反复复用。

### 6.1 共享能力包

- `packages/ui/`
  - 共享 UI 组件、主题、context、hooks。
  - `packages/ui/package.json` 的导出里有 `./theme`、`./hooks`、`./context`、`./styles`，说明它是可被不同前端入口复用的 UI 能力层。

- `packages/util/`
  - 共享工具函数。
  - `packages/util/package.json` 很薄，说明它是基础型支撑包，而不是业务核心。

- `packages/plugin/`
  - 插件接口封装。
  - 导出 `.`、`./tool`、`./tui`，说明它负责定义扩展点，而不是直接承载产品业务。

- `packages/script/`
  - 构建脚本与辅助工具。

### 6.2 平台 / 环境适配

- `packages/console/resource/`
  - 很典型的运行时适配层。
  - `package.json` 里根据 `production` 切到 `resource.cloudflare.ts`，默认走 `resource.node.ts`。
  - 这说明它处理的是“同一能力在不同平台怎么落地”的问题。

- `packages/sdk/js/`
  - 某种意义上也带有适配层属性，因为它把外部宿主与本地/远端服务的交互方式包装成统一访问面。

---

## 7. L5：基础设施、部署与分发层

这一层不负责业务本身，而是负责把各个产品和服务装配成可运行系统。

### 7.1 基础设施编排：`infra/`

- `infra/app.ts`
  - 明确部署：
    - `packages/function/src/api.ts`
    - `packages/web`
    - `packages/app`

- `infra/console.ts`
  - 明确部署：
    - `packages/console/function/src/auth.ts`
    - `packages/console/function/src/log-processor.ts`
    - `packages/console/app`
  - 同时还编排了 Planetscale、Stripe、KV、Secret 等基础资源。

- `infra/enterprise.ts`
  - 负责企业产品面的部署。

所以 `infra/` 更准确的名字其实是：**部署装配层**。

### 7.2 分发与环境打包

- `nix/`
  - Nix 打包和环境分发配置。

- `packages/containers/`
  - 容器镜像与构建相关目录。

- 根目录的安装脚本、发布脚本、workspace 配置
  - 这些共同构成“工程交付层”。

---

## 8. 这几个层之间怎么理解

可以把它理解成下面这个图：

```text
┌─────────────────────────────┐
│ 产品与接入层                │
│ app / desktop / electron    │
│ console/app / enterprise    │
│ web / slack / vscode        │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│ 应用入口与接口层            │
│ CLI / routes / worker / SDK │
└──────────────┬──────────────┘
               │
     ┌─────────▼─────────┐
     │ 双核心运行时层     │
     │ opencode          │
     │ console/core      │
     └─────────┬─────────┘
               │
┌──────────────▼──────────────┐
│ 共享支撑与平台适配层        │
│ ui / util / plugin /        │
│ script / console/resource   │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│ 部署与分发层                │
│ infra / nix / containers    │
└─────────────────────────────┘
```

但要注意：这不是严格依赖图，而是**认知分层图**。真实代码里存在跨层引用和产品切片交叉。

---

## 9. 哪些边界比较清晰，哪些边界是混合的

### 9.1 相对清晰的边界

- `packages/app` 与 `packages/desktop` / `packages/desktop-electron`
  - app 提供共享应用壳，桌面端提供宿主能力，这条边界相对清楚。

- `infra/` 与业务包
  - `infra/*.ts` 主要是部署和资源装配，职责比较明确。

- `packages/ui` / `packages/util`
  - 明显是横向共享包。

### 9.2 明显混合的边界

- `packages/opencode`
  - 同时承担 CLI、TUI、本地服务、工具系统、会话系统、存储等职责。
  - 它是核心没错，但不是“窄而纯”的核心。

- `packages/console/app`
  - 同时是产品前台和服务端路由容器。
  - 实际搜索已确认多个 route 文件直接导入 `@opencode-ai/console-core/*`。

- `packages/function`
  - 它是产品能力入口，不是通用基础层。

- `packages/sdk/js`
  - 既是对外契约，又带启动包装特征，不是纯 DTO / schema 包。

---

## 10. 如果硬要对照“基建层 / 业务逻辑层 / 表现层”

如果你更习惯传统三层法，也可以这样做一个近似映射：

### 基建层

- `infra/`
- `nix/`
- `packages/containers/`
- `packages/console/resource/`
- 部分 `packages/script/`

### 共享能力层

- `packages/ui/`
- `packages/util/`
- `packages/plugin/`
- `packages/sdk/js/`

### 业务逻辑层

- `packages/opencode/`
- `packages/console/core/`

### 接口 / 表现层

- `packages/app/`
- `packages/desktop/`
- `packages/desktop-electron/`
- `packages/console/app/`
- `packages/enterprise/`
- `packages/web/`
- `packages/slack/`
- `sdks/vscode/`
- `packages/function/`
- `packages/console/function/`

但这个映射只能帮助快速记忆，**不能**精确代表真实代码边界。

---

## 11. 最后给一个阅读顺序建议

如果要真正理解这个项目，我建议按下面顺序看：

1. `package.json`
   - 先确认 monorepo 结构和 workspace。
2. `packages/opencode/src/index.ts`
   - 理解本地 runtime 的总入口。
3. `packages/app/src/index.ts`
   - 理解共享应用壳是怎么暴露给桌面端的。
4. `packages/console/core/package.json` + `packages/console/app/src/routes/*`
   - 理解云端 console 的核心与前台是怎么耦合的。
5. `infra/app.ts`、`infra/console.ts`
   - 理解哪些包真正会被部署，部署成什么。
6. `packages/ui/`、`packages/util/`、`packages/plugin/`
   - 再看横向复用的能力层。

---

## 12. 结论

这个项目的核心不是“一个大前端 + 一个后端”，也不是“一个严格分层的单体”。

更准确的理解方式是：

- **本地核心**：`packages/opencode`
- **云端核心**：`packages/console/core`
- **产品与接入面**：`app`、桌面端、console、enterprise、web、Slack、VS Code
- **共享支撑**：`ui`、`util`、`plugin`、`script`、`console/resource`
- **部署与分发**：`infra`、`nix`、`containers`

所以如果要一句话概括：

> 这是一个围绕 OpenCode 能力构建的多入口 monorepo，采用“**双核心 + 多接入端 + 共享支撑包 + 部署装配层**”的结构，而不是严格单线分层架构。
