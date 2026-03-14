import { agentDb, validationDb } from './store';
import type { Agent, ValidationRecord } from '@agentbazaar/shared';

// Real ERC-8004 on-chain registration
// TX: 0x199ddff43da193587dfd57207006fb7fd71e28f30a1fe9b1402c8a6611ca6450
// Explorer: https://explorer.testnet3.goat.network/tx/0x199ddff43da193587dfd57207006fb7fd71e28f30a1fe9b1402c8a6611ca6450
const ERC8004_ID = '#178';
const ERC8004_TX = '0x199ddff43da193587dfd57207006fb7fd71e28f30a1fe9b1402c8a6611ca6450';
const MERCHANT_WALLET = '0xeA48CFCa16A03c68825Dc58E3192D293760563a7';

const seedAgents: Agent[] = [
  {
    id: 'agent-news-001',
    name: 'News Analyst',
    slug: 'news-analyst',
    description: '专业新闻分析 Agent，输入主题自动总结关键事件、提炼市场要点与风险提示，输出结构化分析报告。',
    erc8004Id: ERC8004_ID,
    walletAddress: MERCHANT_WALLET,
    price: '0.15',
    currency: 'USDC',
    skills: ['news_summary', 'market_brief', 'risk_points'],
    reputationScore: 4.8,
    reviewCount: 126,
    validated: true,
    callCount: 420,
    status: 'active',
    tags: ['News', 'Research', 'Market Analysis'],
    categories: ['analysis', 'news'],
  },
  {
    id: 'agent-screener-001',
    name: 'Project Screener',
    slug: 'project-screener',
    description: 'Web3 项目初筛 Agent，输入项目名/Token/合约地址，快速生成基础资料、风险评估与初步评分。',
    erc8004Id: ERC8004_ID,
    walletAddress: MERCHANT_WALLET,
    price: '0.20',
    currency: 'USDC',
    skills: ['project_screening', 'token_brief', 'risk_summary'],
    reputationScore: 4.6,
    reviewCount: 89,
    validated: true,
    callCount: 312,
    status: 'active',
    tags: ['Web3', 'Due Diligence', 'Token Analysis'],
    categories: ['screening', 'research'],
  },
  {
    id: 'agent-report-001',
    name: 'Report Writer',
    slug: 'report-writer',
    description: '专业研究报告 Agent，整合 News Analyst 或 Project Screener 的结果，生成结构完整的 Markdown 投研报告。',
    erc8004Id: ERC8004_ID,
    walletAddress: MERCHANT_WALLET,
    price: '0.25',
    currency: 'USDC',
    skills: ['markdown_report', 'investment_memo', 'summary_rewrite'],
    reputationScore: 4.9,
    reviewCount: 54,
    validated: true,
    callCount: 178,
    status: 'active',
    tags: ['Report', 'Investment', 'Research'],
    categories: ['writing', 'report'],
  },
];

const seedValidations: ValidationRecord[] = [
  {
    id: 'validation-erc8004',
    agentId: 'agent-news-001',
    validator: 'GOAT Testnet3',
    status: 'verified',
    message: `Registered on-chain via ERC-8004 · ID ${ERC8004_ID} · TX ${ERC8004_TX}`,
    createdAt: '2026-03-14T00:00:00Z',
  },
  {
    id: 'validation-erc8004-screener',
    agentId: 'agent-screener-001',
    validator: 'GOAT Testnet3',
    status: 'verified',
    message: `Registered on-chain via ERC-8004 · ID ${ERC8004_ID} · TX ${ERC8004_TX}`,
    createdAt: '2026-03-14T00:00:00Z',
  },
  {
    id: 'validation-erc8004-report',
    agentId: 'agent-report-001',
    validator: 'GOAT Testnet3',
    status: 'verified',
    message: `Registered on-chain via ERC-8004 · ID ${ERC8004_ID} · TX ${ERC8004_TX}`,
    createdAt: '2026-03-14T00:00:00Z',
  },
];

export function seedData(): void {
  seedAgents.forEach((agent) => agentDb.save(agent));
  seedValidations.forEach((record) => validationDb.save(record));
  console.log(`✅ Seeded ${seedAgents.length} agents and ${seedValidations.length} validation records`);
  console.log(`🪪 ERC-8004 Identity: ${ERC8004_ID} · TX: ${ERC8004_TX}`);
}
