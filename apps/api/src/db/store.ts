import type { Agent, Task, PaymentOrder, Review, ValidationRecord } from '@agentbazaar/shared';

// In-memory stores
export const agentStore = new Map<string, Agent>();
export const taskStore = new Map<string, Task>();
export const paymentOrderStore = new Map<string, PaymentOrder>();
export const reviewStore = new Map<string, Review>();
export const validationStore = new Map<string, ValidationRecord>();

// ==================== Agent CRUD ====================
export const agentDb = {
  findAll: (): Agent[] => Array.from(agentStore.values()),
  findById: (id: string): Agent | undefined => agentStore.get(id),
  findBySlug: (slug: string): Agent | undefined =>
    Array.from(agentStore.values()).find((a) => a.slug === slug),
  save: (agent: Agent): Agent => {
    agentStore.set(agent.id, agent);
    return agent;
  },
  update: (id: string, updates: Partial<Agent>): Agent | undefined => {
    const existing = agentStore.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    agentStore.set(id, updated);
    return updated;
  },
};

// ==================== Task CRUD ====================
export const taskDb = {
  findAll: (): Task[] => Array.from(taskStore.values()),
  findById: (id: string): Task | undefined => taskStore.get(id),
  save: (task: Task): Task => {
    taskStore.set(task.id, task);
    return task;
  },
  update: (id: string, updates: Partial<Task>): Task | undefined => {
    const existing = taskStore.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    taskStore.set(id, updated);
    return updated;
  },
};

// ==================== PaymentOrder CRUD ====================
export const paymentDb = {
  findAll: (): PaymentOrder[] => Array.from(paymentOrderStore.values()),
  findById: (id: string): PaymentOrder | undefined => paymentOrderStore.get(id),
  findByTaskId: (taskId: string): PaymentOrder | undefined =>
    Array.from(paymentOrderStore.values()).find((o) => o.taskId === taskId),
  save: (order: PaymentOrder): PaymentOrder => {
    paymentOrderStore.set(order.id, order);
    return order;
  },
  update: (id: string, updates: Partial<PaymentOrder>): PaymentOrder | undefined => {
    const existing = paymentOrderStore.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    paymentOrderStore.set(id, updated);
    return updated;
  },
};

// ==================== Review CRUD ====================
export const reviewDb = {
  findAll: (): Review[] => Array.from(reviewStore.values()),
  findById: (id: string): Review | undefined => reviewStore.get(id),
  findByAgentId: (agentId: string): Review[] =>
    Array.from(reviewStore.values()).filter((r) => r.agentId === agentId),
  findByTaskId: (taskId: string): Review | undefined =>
    Array.from(reviewStore.values()).find((r) => r.taskId === taskId),
  save: (review: Review): Review => {
    reviewStore.set(review.id, review);
    return review;
  },
};

// ==================== Validation CRUD ====================
export const validationDb = {
  findByAgentId: (agentId: string): ValidationRecord[] =>
    Array.from(validationStore.values()).filter((v) => v.agentId === agentId),
  save: (record: ValidationRecord): ValidationRecord => {
    validationStore.set(record.id, record);
    return record;
  },
};
