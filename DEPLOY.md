# AgentBazaar 部署文档

## 目录

- [架构概览](#架构概览)
- [环境要求](#环境要求)
- [本地开发](#本地开发)
- [生产部署方案](#生产部署方案)
  - [方案一：Railway（推荐）](#方案一railway推荐)
  - [方案二：Vercel + Railway 分离部署](#方案二vercel--railway-分离部署)
  - [方案三：Docker 自托管](#方案三docker-自托管)
- [环境变量说明](#环境变量说明)
- [部署后验证](#部署后验证)

---

## 架构概览

```
┌─────────────────┐         ┌─────────────────┐
│   Frontend      │ ──API── │    Backend      │
│   Next.js 14    │         │  Express + TS   │
│   Port: 3000    │         │   Port: 3001    │
└─────────────────┘         └─────────────────┘
                                     │
                          ┌──────────┴──────────┐
                          │                     │
                   ┌──────▼──────┐    ┌─────────▼──────┐
                   │  DeepSeek   │    │  GOAT x402 API  │
                   │   LLM API   │    │  (Testnet3)     │
                   └─────────────┘    └────────────────-┘
```

- **Frontend**: Next.js 14，静态/SSR 渲染，可部署到 Vercel / Cloudflare Pages
- **Backend**: Express TypeScript，无数据库（内存存储），可部署到 Railway / Render / 任意 VPS
- **存储**: 纯内存（重启清空），无需数据库

---

## 环境要求

| 工具 | 版本 |
|------|------|
| Node.js | >= 18.x |
| npm | >= 9.x |

---

## 本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/yjz94123/agentbazaar.git
cd agentbazaar

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env，填入真实的 API Key（见下方说明）

# 4. 启动开发服务器（前后端同时启动）
npm run dev
```

访问 http://localhost:3000 查看前端，http://localhost:3001/health 验证后端。

---

## 生产部署方案

### 方案一：Railway（推荐）

Railway 支持 monorepo，可以将前后端分别作为两个 Service 部署。

#### 步骤

**1. 注册并安装 Railway CLI**

```bash
npm install -g @railway/cli
railway login
```

**2. 创建项目**

```bash
railway init
```

**3. 部署后端（API）**

在 Railway 控制台：
- New Service → GitHub Repo → 选择 `agentbazaar`
- 设置 Root Directory: `apps/api`
- Build Command: `npm install && npm run build`
- Start Command: `npm run start`
- 添加环境变量（见下方列表）

**4. 部署前端（Web）**

- New Service → GitHub Repo → 选择 `agentbazaar`
- 设置 Root Directory: `apps/web`
- Build Command: `npm install && npm run build`
- Start Command: `npm run start`
- 添加环境变量：
  ```
  NEXT_PUBLIC_API_URL=https://<你的API域名>
  ```

**5. 配置域名**

Railway 会自动分配 `xxx.railway.app` 域名，也可绑定自定义域名。

---

### 方案二：Vercel + Railway 分离部署

#### 后端 → Railway

同上方"方案一"的步骤 3。

#### 前端 → Vercel

```bash
# 安装 Vercel CLI
npm install -g vercel

# 在 apps/web 目录下部署
cd apps/web
vercel --prod
```

Vercel 配置：
- Framework: Next.js（自动检测）
- Root Directory: `apps/web`
- Environment Variables:
  ```
  NEXT_PUBLIC_API_URL=https://<你的Railway API域名>
  ```

> **注意**：Vercel 部署 monorepo 时需在项目设置中指定 Root Directory 为 `apps/web`。

---

### 方案三：Docker 自托管

#### 后端 Dockerfile

在 `apps/api/` 创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine
WORKDIR /app

# 复制 monorepo 结构
COPY package*.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# 安装依赖并构建
RUN npm install
RUN cd apps/api && npm run build

EXPOSE 3001
CMD ["node", "apps/api/dist/server.js"]
```

#### 前端 Dockerfile

在 `apps/web/` 创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

RUN npm install
RUN cd apps/web && npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "apps/web/node_modules/.bin/next", "start", "apps/web", "-p", "3000"]
```

#### docker-compose.yml

```yaml
version: '3.8'
services:
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      PORT: 3001
      CORS_ORIGIN: http://localhost:3000
      DEEPSEEK_API_KEY: ${DEEPSEEK_API_KEY}
      GOATX402_API_URL: ${GOATX402_API_URL}
      GOATX402_MERCHANT_ID: ${GOATX402_MERCHANT_ID}
      GOATX402_API_KEY: ${GOATX402_API_KEY}
      GOATX402_API_SECRET: ${GOATX402_API_SECRET}

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://api:3001
    depends_on:
      - api
```

```bash
# 启动
docker-compose up -d
```

---

## 环境变量说明

### 后端（apps/api）必填项

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `NODE_ENV` | 运行环境 | `production` |
| `PORT` | 监听端口 | `3001` |
| `CORS_ORIGIN` | 允许的前端域名（逗号分隔多个） | `https://agentbazaar.vercel.app` |

### LLM（至少配置一个，否则使用 Mock 数据）

| 变量名 | 说明 |
|--------|------|
| `DEEPSEEK_API_KEY` | DeepSeek API Key（推荐，低成本） |
| `MODEL_NAME` | 模型名，如 `deepseek-chat` |
| `LLM_BASE_URL` | API 地址，如 `https://api.deepseek.com/v1` |
| `OPENAI_API_KEY` | OpenAI API Key（二选一） |

### GOAT x402 支付（生产必填）

| 变量名 | 说明 |
|--------|------|
| `GOATX402_API_URL` | `https://x402-api-lx58aabp0r.testnet3.goat.network` |
| `GOATX402_MERCHANT_ID` | 商户 ID（如 `leo`） |
| `GOATX402_API_KEY` | GOAT 平台 API Key |
| `GOATX402_API_SECRET` | GOAT 平台 API Secret（用于 HMAC 签名） |

### 前端（apps/web）

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `NEXT_PUBLIC_API_URL` | 后端 API 地址 | `https://agentbazaar-api.railway.app` |

---

## 部署后验证

### 1. 检查后端健康状态

```bash
curl https://<your-api-domain>/health
# 期望返回: {"status":"ok","timestamp":"..."}
```

### 2. 检查 Agent 列表

```bash
curl https://<your-api-domain>/api/agents
# 期望返回包含 3 个 Agent 的数组
```

### 3. 检查 ERC-8004 身份

```bash
curl https://<your-api-domain>/api/agents/agent-news-001/identity
# 期望返回 erc8004Id, walletAddress 等信息
```

### 4. 检查前端

访问 `https://<your-web-domain>` 应显示 AgentBazaar 主页，能看到 3 个 AI Agent 卡片。

---

## 常见问题

**Q: 重启后数据丢失？**
A: 正常，当前使用内存存储。重启会重新 seed 初始数据（3 个 Agent + 示例数据）。

**Q: LLM 不返回真实结果？**
A: 检查 `DEEPSEEK_API_KEY` 是否配置正确，未配置时自动 fallback 到 Mock 数据（格式相同但内容是模板）。

**Q: 支付流程报错？**
A: 检查 `GOATX402_API_KEY` / `GOATX402_API_SECRET` 是否正确，以及商户钱包是否在 GOAT Testnet3 上有余额。

**Q: CORS 错误？**
A: 确保后端 `CORS_ORIGIN` 环境变量包含前端实际域名（完整 URL，不含末尾斜杠）。
