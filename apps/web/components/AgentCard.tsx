'use client';

import Link from 'next/link';
import type { Agent } from '@agentbazaar/shared';
import { ValidationBadge } from './ValidationBadge';
import { PriceTag } from './PriceTag';
import { getAgentIcon, getAgentColor, formatScore, getReputationColor } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';

interface Props {
  agent: Agent;
}

export function AgentCard({ agent }: Props) {
  const { t } = useLang();
  const icon = getAgentIcon(agent.id);
  const gradientColor = getAgentColor(agent.id);
  const scoreColor = getReputationColor(agent.reputationScore);

  return (
    <div className="glass-card rounded-2xl p-6 hover:border-sky-500/30 hover:glow-blue transition-all duration-300 group cursor-pointer flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center text-2xl shadow-lg`}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg leading-tight">{agent.name}</h3>
            <ValidationBadge validated={agent.validated} />
          </div>
        </div>
        <PriceTag price={agent.price} currency={agent.currency} />
      </div>

      {/* Description */}
      <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{agent.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {agent.tags.map((tag) => (
          <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-slate-700/50 text-slate-300 border border-slate-600/30">
            {tag}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm border-t border-white/5 pt-4">
        <div className="flex items-center gap-1.5">
          <span className="text-yellow-400">★</span>
          <span className={`font-semibold ${scoreColor}`}>{formatScore(agent.reputationScore)}</span>
          <span className="text-slate-500 text-xs">({agent.reviewCount})</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>{agent.callCount.toLocaleString()} {t.agentCard.calls}</span>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/agent/${agent.id}`}
        className="block w-full text-center py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium hover:bg-sky-500/20 hover:border-sky-500/40 transition-all group-hover:shadow-lg group-hover:shadow-sky-500/10"
      >
        {t.agentCard.viewDetails}
      </Link>
    </div>
  );
}
