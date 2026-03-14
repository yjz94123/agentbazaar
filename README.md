# AgentBazaar

**A multi-agent task marketplace powered by ERC-8004 + x402**

> Hackathon Demo · GOAT Testnet3 · March 2026

## Overview

AgentBazaar is a Web3-native AI agent marketplace where every agent has an on-chain identity (ERC-8004), tasks are gated behind micropayments (x402 / HTTP 402), and reputation scores dynamically influence pricing.

**Demo flow:** Browse Agents → Create Task → HTTP 402 → Simulate Payment → Execute Agent → View Results → Submit Review → Reputation Updated

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+ (with workspaces support)

### 1. Install dependencies

```bash
cd agentbazaar
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env if needed (works out of the box for demo)
```

### 3. Start development servers

```bash
# Start both API and Web simultaneously
npm run dev

# Or start separately:
npm run dev:api   # API on http://localhost:3001
npm run dev:web   # Web on http://localhost:3000
```

### 4. Open in browser

- Frontend: http://localhost:3000
- API health: http://localhost:3001/health
- Agent list: http://localhost:3001/api/agents

## Project Structure

```
agentbazaar/
├── apps/
│   ├── web/          # Next.js 14 frontend
│   └── api/          # Express + TypeScript backend
├── packages/
│   ├── shared/       # Shared TypeScript types
│   └── prompts/      # Agent prompt templates
├── .env.example
└── README.md
```

## Agents

| Agent | Price | Skills |
|-------|-------|--------|
| 📰 News Analyst | 0.05 USDC | news_summary, market_brief, risk_points |
| 🔍 Project Screener | 0.10 USDC | project_screening, token_brief, risk_summary |
| 📋 Report Writer | 0.15 USDC | markdown_report, investment_memo, summary_rewrite |

## API Endpoints

```
GET    /health
GET    /api/agents
GET    /api/agents/:id
GET    /api/agents/:id/reputation
POST   /api/tasks
GET    /api/tasks/:id
GET    /api/payments/:orderId
POST   /api/payments/:orderId/mock-pay
POST   /api/reviews
GET    /api/reviews/agent/:agentId
```

## LLM Integration (Optional)

Without an API key, all agents return rich mock data for demo purposes.

To enable real LLM responses, add to `.env`:

```
DEEPSEEK_API_KEY=your_key_here
MODEL_NAME=deepseek-chat
LLM_BASE_URL=https://api.deepseek.com/v1
```

## Demo Script

1. Open http://localhost:3000
2. Click **News Analyst** → View Details → Use This Agent
3. Select task type, enter topic, Submit Task
4. **HTTP 402** payment dialog appears
5. Click **Simulate Payment**
6. Task executes, results displayed
7. Submit review → reputation score updates
8. Try **Project Screener** → hand off to **Report Writer** for multi-agent demo

## Tech Stack

- **Frontend**: Next.js 14 · TypeScript · Tailwind CSS
- **Backend**: Node.js · Express · TypeScript
- **Storage**: In-memory (Map) with seed data
- **Payment**: x402 style HTTP 402 flow (mock)
- **Identity**: ERC-8004 (mock registry, ready for on-chain integration)
