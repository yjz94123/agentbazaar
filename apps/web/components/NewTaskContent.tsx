'use client';

import Link from 'next/link';
import type { Agent } from '@agentbazaar/shared';
import { useLang } from '@/contexts/LangContext';
import { TaskForm } from './TaskForm';
import { ValidationBadge } from './ValidationBadge';
import { PriceTag } from './PriceTag';
import { getAgentIcon, getAgentColor } from '@/lib/utils';

interface Props {
  agent: Agent;
  parentTaskId?: string;
}

export function NewTaskContent({ agent, parentTaskId }: Props) {
  const { t } = useLang();
  const icon = getAgentIcon(agent.id);
  const gradientColor = getAgentColor(agent.id);
  const taskTypes = t.taskTypes[agent.id] ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link href={`/agent/${agent.id}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors">
        {t.taskPage.backToAgent}
      </Link>

      {/* Agent Info Card */}
      <div className="glass-card rounded-2xl p-5 mb-6 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center text-2xl flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold text-white">{agent.name}</h2>
            <ValidationBadge validated={agent.validated} />
          </div>
          <p className="text-slate-400 text-sm truncate">{agent.description}</p>
        </div>
        <div className="flex-shrink-0">
          <PriceTag price={agent.price} currency={agent.currency} size="md" />
        </div>
      </div>

      {parentTaskId && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-sm text-violet-300">
          {t.taskPage.upstreamNotice}
          <span className="block text-violet-400/60 text-xs mt-1">parentTaskId: {parentTaskId}</span>
        </div>
      )}

      <TaskForm agent={agent} taskTypes={taskTypes} parentTaskId={parentTaskId} />
    </div>
  );
}
