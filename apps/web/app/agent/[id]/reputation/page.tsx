import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Agent, ReputationData } from '@agentbazaar/shared';
import { ReputationPanel } from '@/components/ReputationPanel';
import { getAgentIcon, getAgentColor } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getAgent(id: string): Promise<Agent | null> {
  try {
    const res = await fetch(`${API_URL}/api/agents/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}

async function getReputation(id: string): Promise<ReputationData | null> {
  try {
    const res = await fetch(`${API_URL}/api/agents/${id}/reputation`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}

export default async function ReputationPage({ params }: { params: { id: string } }) {
  const [agent, reputation] = await Promise.all([
    getAgent(params.id),
    getReputation(params.id),
  ]);

  if (!agent || !reputation) notFound();

  const icon = getAgentIcon(agent.id);
  const gradientColor = getAgentColor(agent.id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Back */}
      <Link href={`/agent/${agent.id}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors">
        ← Back to Agent
      </Link>

      {/* Agent Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center text-2xl flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
          <p className="text-slate-400 text-sm">Reputation & Verification History</p>
        </div>
      </div>

      <ReputationPanel data={reputation} />

      <div className="mt-8 text-center">
        <Link
          href={`/task/new?agentId=${agent.id}`}
          className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-violet-600 text-white font-semibold hover:opacity-90 transition-opacity"
        >
          Use This Agent →
        </Link>
      </div>
    </div>
  );
}
