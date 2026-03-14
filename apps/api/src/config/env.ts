import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],

  // LLM
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
  modelName: process.env.MODEL_NAME || 'deepseek-chat',
  llmBaseUrl: process.env.LLM_BASE_URL || 'https://api.deepseek.com/v1',

  // x402
  x402Enabled: process.env.X402_ENABLED === 'true',
  x402Chain: process.env.X402_CHAIN || 'testnet',
  x402Token: process.env.X402_TOKEN || 'USDC',
  x402Receiver: process.env.X402_RECEIVER || '0xAgentBazaarPlatformWallet',

  // ERC-8004
  erc8004RpcUrl: process.env.ERC8004_RPC_URL || '',
  erc8004RegistryAddress: process.env.ERC8004_REGISTRY_ADDRESS || '',

  // GOAT x402
  goatx402ApiUrl: process.env.GOATX402_API_URL || 'https://x402-api-lx58aabp0r.testnet3.goat.network',
  goatx402MerchantId: process.env.GOATX402_MERCHANT_ID || 'leo',
  goatx402ApiKey: process.env.GOATX402_API_KEY || '',
  goatx402ApiSecret: process.env.GOATX402_API_SECRET || '',
};
