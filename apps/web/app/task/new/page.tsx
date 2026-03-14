import { notFound } from 'next/navigation';
import type { Agent } from '@agentbazaar/shared';
import { NewTaskContent } from '@/components/NewTaskContent';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getAgent(id: string): Promise<Agent | null> {
  try {
    const res = await fetch(`${API_URL}/api/agents/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}

export default async function NewTaskPage({
  searchParams,
}: {
  searchParams: { agentId?: string; parentTaskId?: string };
}) {
  const agentId = searchParams.agentId;
  if (!agentId) notFound();

  const agent = await getAgent(agentId);
  if (!agent) notFound();

  return <NewTaskContent agent={agent} parentTaskId={searchParams.parentTaskId} />;
}
