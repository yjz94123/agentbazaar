import type {
  Agent,
  Task,
  PaymentOrder,
  Review,
  ReputationData,
  PaymentRequiredResponse,
} from '@agentbazaar/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Session ID for identifying users (localStorage persisted)
export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem('agentbazaar_session');
  if (!id) {
    id = `session-${Math.random().toString(36).slice(2)}-${Date.now()}`;
    localStorage.setItem('agentbazaar_session', id);
  }
  return id;
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': typeof window !== 'undefined' ? getSessionId() : '',
      ...options?.headers,
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok && res.status !== 402) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return { ...data, _status: res.status } as T;
}

// ==================== Agents ====================
export const agentsApi = {
  async getAll(): Promise<Agent[]> {
    const res = await request<{ success: boolean; data: Agent[] }>('/api/agents');
    return res.data;
  },

  async getById(id: string): Promise<Agent> {
    const res = await request<{ success: boolean; data: Agent }>(`/api/agents/${id}`);
    return res.data;
  },

  async getReputation(id: string): Promise<ReputationData> {
    const res = await request<{ success: boolean; data: ReputationData }>(`/api/agents/${id}/reputation`);
    return res.data;
  },
};

// ==================== Tasks ====================
export interface CreateTaskResponse {
  _status: number;
  // 402 response
  code?: string;
  orderId?: string;
  taskId?: string;
  amount?: string;
  currency?: string;
  chain?: string;
  message?: string;
  // 200 response
  success?: boolean;
  data?: {
    taskId: string;
    status: string;
    result: unknown;
  };
}

export const tasksApi = {
  async create(params: {
    agentId: string;
    taskType: string;
    input: string;
    parentTaskId?: string;
    orderId?: string;
  }): Promise<CreateTaskResponse> {
    const headers: Record<string, string> = {};
    if (params.orderId) {
      headers['x-order-id'] = params.orderId;
    }

    const res = await fetch(`${API_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': getSessionId(),
        ...headers,
      },
      body: JSON.stringify({
        agentId: params.agentId,
        taskType: params.taskType,
        input: params.input,
        parentTaskId: params.parentTaskId,
        sessionId: getSessionId(),
      }),
    });

    const data = await res.json();
    return { ...data, _status: res.status };
  },

  async getById(id: string): Promise<Task> {
    const res = await request<{ success: boolean; data: Task }>(`/api/tasks/${id}`);
    return res.data;
  },
};

// ==================== Payments ====================
export const paymentsApi = {
  async getById(orderId: string): Promise<PaymentOrder> {
    const res = await request<{ success: boolean; data: PaymentOrder }>(`/api/payments/${orderId}`);
    return res.data;
  },

  async initiateGoat(orderId: string, fromAddress: string): Promise<{ payToAddress: string; goatOrderId: string; amountWei: string }> {
    const res = await request<{ success: boolean; data: { payToAddress: string; goatOrderId: string; amountWei: string } }>(
      `/api/payments/${orderId}/initiate-goat`,
      { method: 'POST', body: JSON.stringify({ fromAddress }) }
    );
    return res.data;
  },

  async verifyGoat(orderId: string): Promise<{ confirmed: boolean; txHash: string | null; goatStatus: string }> {
    const res = await request<{ success: boolean; data: { confirmed: boolean; txHash: string | null; goatStatus: string } }>(
      `/api/payments/${orderId}/verify-goat`
    );
    return res.data;
  },
};

// ==================== Reviews ====================
export const reviewsApi = {
  async create(data: {
    taskId: string;
    agentId: string;
    rating: number;
    helpful: boolean;
    accurate: boolean;
    comment: string;
  }): Promise<Review> {
    const res = await request<{ success: boolean; data: Review }>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async getByAgentId(agentId: string): Promise<Review[]> {
    const res = await request<{ success: boolean; data: Review[] }>(`/api/reviews/agent/${agentId}`);
    return res.data;
  },
};
