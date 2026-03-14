import type { Agent } from '@agentbazaar/shared';
import { HomeContent } from '@/components/HomeContent';

async function getAgents(): Promise<Agent[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/agents`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const agents = await getAgents();
  return <HomeContent agents={agents} />;
}
