import { notFound } from 'next/navigation';
import type { Agent } from '@agentbazaar/shared';
import { AgentDetailContent } from '@/components/AgentDetailContent';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getAgent(id: string): Promise<Agent | null> {
  try {
    const res = await fetch(`${API_URL}/api/agents/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data ?? null;
  } catch {
    return null;
  }
}

export default async function AgentDetailPage({ params }: { params: { id: string } }) {
  const agent = await getAgent(params.id);
  if (!agent) notFound();
  return <AgentDetailContent agent={agent} />;
}
