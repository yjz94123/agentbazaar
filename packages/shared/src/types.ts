// ==================== Agent ====================
export interface Agent {
  id: string;
  name: string;
  slug: string;
  description: string;
  erc8004Id: string;
  walletAddress: string;
  price: string;
  currency: string;
  skills: string[];
  reputationScore: number;
  reviewCount: number;
  validated: boolean;
  callCount: number;
  status: 'active' | 'inactive';
  tags: string[];
  avatar?: string;
  endpoint?: string;
  categories?: string[];
}

// ==================== Task ====================
export type TaskStatus =
  | 'created'
  | 'payment_required'
  | 'paid'
  | 'processing'
  | 'completed'
  | 'failed';

export interface Task {
  id: string;
  agentId: string;
  userInput: string;
  taskType: string;
  price: string;
  currency: string;
  status: TaskStatus;
  paymentOrderId: string | null;
  parentTaskId: string | null;
  result: unknown | null;
  executionMs: number | null;
  sessionId: string;
  createdAt: string;
  completedAt: string | null;
}

// ==================== PaymentOrder ====================
export type PaymentStatus = 'pending' | 'paid' | 'confirmed' | 'failed';

export interface PaymentOrder {
  id: string;
  taskId: string;
  amount: string;
  currency: string;
  chain: string;
  status: PaymentStatus;
  txHash: string | null;
  createdAt: string;
  // GOAT x402 real payment fields
  goatOrderId: string | null;
  payToAddress: string | null;
  fromAddress: string | null;
  amountWei: string | null;
}

// ==================== Review ====================
export interface Review {
  id: string;
  taskId: string;
  agentId: string;
  reviewerAddress: string;
  rating: number;
  helpful: boolean;
  accurate: boolean;
  comment: string;
  createdAt: string;
}

// ==================== ValidationRecord ====================
export interface ValidationRecord {
  id: string;
  agentId: string;
  validator: string;
  status: 'verified' | 'pending' | 'rejected';
  message: string;
  createdAt: string;
}

// ==================== API Response Types ====================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaymentRequiredResponse {
  code: 'PAYMENT_REQUIRED';
  message: string;
  orderId: string;
  taskId: string;
  amount: string;
  currency: string;
  chain: string;
  // Real GOAT payment info (populated after initiate-payment)
  payToAddress?: string | null;
  goatOrderId?: string | null;
}

// ==================== News Analyst Result ====================
export interface NewsAnalystResult {
  title: string;
  summary: string;
  highlights: string[];
  risks: string[];
  conclusion: string;
}

// ==================== Project Screener Result ====================
export interface ProjectScreenerResult {
  projectName: string;
  overview: string;
  strengths: string[];
  risks: string[];
  score: number;
  recommendation: string;
}

// ==================== Report Writer Result ====================
export interface ReportWriterResult {
  title: string;
  markdown: string;
  summary: string;
  conclusion: string;
}

export type AgentResult = NewsAnalystResult | ProjectScreenerResult | ReportWriterResult;

// ==================== Reputation ====================
export interface ReputationData {
  agentId: string;
  reputationScore: number;
  reviewCount: number;
  positiveCount: number;
  helpfulRate: number;
  accurateRate: number;
  validated: boolean;
  lastValidatedAt: string | null;
  reviews: Review[];
  validationRecords: ValidationRecord[];
}
