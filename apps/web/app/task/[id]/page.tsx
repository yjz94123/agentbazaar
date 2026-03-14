import { notFound } from 'next/navigation';
import type { Task, Agent, PaymentOrder } from '@agentbazaar/shared';
import { TaskResultContent } from '@/components/TaskResultContent';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getTask(id: string): Promise<Task | null> {
  try {
    const res = await fetch(`${API_URL}/api/tasks/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}

async function getAgent(id: string): Promise<Agent | null> {
  try {
    const res = await fetch(`${API_URL}/api/agents/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}

async function getPayment(orderId: string): Promise<PaymentOrder | null> {
  try {
    const res = await fetch(`${API_URL}/api/payments/${orderId}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}

export default async function TaskResultPage({ params }: { params: { id: string } }) {
  const task = await getTask(params.id);
  if (!task) notFound();
  const [agent, payment] = await Promise.all([
    getAgent(task.agentId),
    task.paymentOrderId ? getPayment(task.paymentOrderId) : Promise.resolve(null),
  ]);
  return <TaskResultContent task={task} agent={agent} txHash={payment?.txHash ?? null} />;
}
