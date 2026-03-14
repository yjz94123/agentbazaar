import crypto from 'node:crypto';
import { config } from '../config/env';

// GOAT Testnet3 constants
export const GOAT_CHAIN_ID = 48816;
export const GOAT_USDC_CONTRACT = '0x29d1ee93e9ecf6e50f309f498e40a6b42d352fa1';
export const GOAT_USDT_CONTRACT = '0xdce0af57e8f2ce957b3838cd2a2f3f3677965dd3';
export const USDC_DECIMALS = 6;

export type GoatOrderStatus =
  | 'CHECKOUT_VERIFIED'
  | 'PAYMENT_CONFIRMED'
  | 'INVOICED'
  | 'FAILED'
  | 'EXPIRED'
  | 'CANCELLED';

// Raw API response shape (actual GOAT x402 v2 format)
interface GoatOrderRaw {
  order_id: string;
  flow: string;
  token_symbol: string;
  accepts: Array<{
    payTo: string;
    amount: string;
    asset: string;
    network: string;
    maxTimeoutSeconds: number;
  }>;
  extensions?: {
    goatx402?: {
      expiresAt?: number;
      receiveType?: string;
    };
  };
}

// Normalized response used internally
export interface GoatOrderResponse {
  orderId: string;
  flow: string;
  payToAddress: string;
  amount: string;
  expirationTime: number;
}

export interface GoatOrderStatusResponse {
  order_id: string;
  status: GoatOrderStatus;
  dapp_order_id: string;
  amount_wei: string;
  tx_hash?: string | null;
  chain_id: number;
}

// Signature algorithm matching GOAT SDK exactly
function calculateSignature(params: Record<string, string>, secret: string): string {
  const filtered = { ...params };
  delete filtered.sign;

  const sortedKeys = Object.keys(filtered)
    .filter((k) => filtered[k] !== '')
    .sort();

  const signStr = sortedKeys.map((k) => `${k}=${filtered[k]}`).join('&');
  return crypto.createHmac('sha256', secret).update(signStr).digest('hex');
}

function signRequest(
  params: Record<string, unknown>,
  apiKey: string,
  apiSecret: string
): Record<string, string> {
  const strParams: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) {
      strParams[k] = String(v);
    }
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomUUID();
  strParams.api_key = apiKey;
  strParams.timestamp = timestamp;
  strParams.nonce = nonce;

  const sign = calculateSignature(strParams, apiSecret);

  return {
    'X-API-Key': apiKey,
    'X-Timestamp': timestamp,
    'X-Nonce': nonce,
    'X-Sign': sign,
    'Content-Type': 'application/json',
  };
}

const MIN_AMOUNT_WEI = 100000; // GOAT x402 minimum: 0.1 USDC

// Convert USDC decimal string to wei (6 decimals), clamped to minimum.
// Uses integer string arithmetic to avoid floating-point precision errors
// (e.g. parseFloat('0.15') * 1e6 === 150000.00000000003).
export function usdcToWei(amount: string): string {
  const [intPart = '0', fracPart = ''] = amount.split('.');
  // Pad or trim fractional part to exactly USDC_DECIMALS digits
  const paddedFrac = fracPart.padEnd(USDC_DECIMALS, '0').slice(0, USDC_DECIMALS);
  const wei = parseInt(intPart, 10) * (10 ** USDC_DECIMALS) + parseInt(paddedFrac, 10);
  return Math.max(wei, MIN_AMOUNT_WEI).toString();
}

const BASE_URL = config.goatx402ApiUrl;

export const goatx402Client = {
  async createOrder(params: {
    dappOrderId: string;
    fromAddress: string;
    amountWei: string;
    tokenSymbol?: string;
  }): Promise<GoatOrderResponse> {
    const body = {
      dapp_order_id: params.dappOrderId,
      chain_id: GOAT_CHAIN_ID,
      token_symbol: params.tokenSymbol ?? 'USDC',
      from_address: params.fromAddress,
      amount_wei: params.amountWei,
      merchant_id: config.goatx402MerchantId,
    };

    const headers = signRequest(body, config.goatx402ApiKey, config.goatx402ApiSecret);

    const res = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    // GOAT returns 402 on successful order creation
    if (res.status !== 402 && res.status !== 200 && res.status !== 201) {
      const text = await res.text();
      throw new Error(`GOAT x402 order creation failed: ${res.status} ${text}`);
    }

    const raw = await res.json() as GoatOrderRaw;
    const accept = raw.accepts?.[0];
    return {
      orderId: raw.order_id,
      flow: raw.flow,
      payToAddress: accept?.payTo ?? '',
      amount: accept?.amount ?? '0',
      expirationTime: raw.extensions?.goatx402?.expiresAt ?? 0,
    };
  },

  async getOrderStatus(goatOrderId: string): Promise<GoatOrderStatusResponse> {
    const headers = signRequest({}, config.goatx402ApiKey, config.goatx402ApiSecret);

    const res = await fetch(`${BASE_URL}/api/v1/orders/${goatOrderId}`, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GOAT x402 status check failed: ${res.status} ${text}`);
    }

    return res.json() as Promise<GoatOrderStatusResponse>;
  },

  isPaymentConfirmed(status: GoatOrderStatus): boolean {
    return status === 'PAYMENT_CONFIRMED' || status === 'INVOICED';
  },
};
