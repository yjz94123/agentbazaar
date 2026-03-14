'use client';

import Link from 'next/link';
import type { Agent } from '@agentbazaar/shared';
import { useLang } from '@/contexts/LangContext';
import { ValidationBadge } from './ValidationBadge';
import { PriceTag } from './PriceTag';
import { getAgentIcon, getAgentColor, formatScore, formatAddress, getReputationColor, getReputationLabel } from '@/lib/utils';

interface Props {
  agent: Agent;
}

export function AgentDetailContent({ agent }: Props) {
  const { t } = useLang();
  const d = t.agentDetail;
  const icon = getAgentIcon(agent.id);
  const gradientColor = getAgentColor(agent.id);
  const scoreColor = getReputationColor(agent.reputationScore);

  const taskTypeMeta = t.taskTypeLabels;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors">
        {d.back}
      </Link>

      {/* Header Card */}
      <div className="glass-card rounded-2xl p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradientColor} flex items-center justify-center text-4xl shadow-xl flex-shrink-0`}>
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{agent.name}</h1>
                <ValidationBadge validated={agent.validated} size="md" />
              </div>
              <div className="text-right">
                <PriceTag price={agent.price} currency={agent.currency} size="lg" />
                <p className="text-xs text-slate-500 mt-1">{d.dynamicPricing}</p>
              </div>
            </div>
            <p className="text-slate-400 mt-4 leading-relaxed">{agent.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-4">{d.taskTypesTitle}</h2>
            <div className="space-y-3">
              {agent.skills.map((skill) => {
                const meta = taskTypeMeta[skill] ?? { label: skill, desc: '' };
                return (
                  <div key={skill} className="flex items-center justify-between p-3 rounded-xl bg-surface-700/50 hover:bg-surface-700 transition-colors">
                    <div>
                      <p className="text-slate-200 text-sm font-medium">{meta.label}</p>
                      <p className="text-slate-500 text-xs">{meta.desc}</p>
                    </div>
                    <span className="text-xs font-mono bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded">{skill}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-4">{d.categoriesTitle}</h2>
            <div className="flex flex-wrap gap-2">
              {agent.tags.map((tag) => (
                <span key={tag} className="px-3 py-1.5 rounded-full text-sm bg-slate-700/50 text-slate-300 border border-slate-600/30">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Identity & Stats */}
        <div className="space-y-4">
          {/* Reputation */}
          <div className="glass-card rounded-2xl p-5">
            <h2 className="font-semibold text-white mb-4">{d.reputationTitle}</h2>
            <div className="flex items-end gap-2 mb-3">
              <span className={`text-4xl font-bold ${scoreColor}`}>{formatScore(agent.reputationScore)}</span>
              <span className="text-slate-500 mb-1">/5.0</span>
              <span className={`text-sm ${scoreColor} mb-1`}>{getReputationLabel(agent.reputationScore)}</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-violet-500 rounded-full"
                style={{ width: `${(agent.reputationScore / 5) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{d.reviews(agent.reviewCount)}</span>
              <span className="text-slate-400">{d.calls(agent.callCount)}</span>
            </div>
            <Link href={`/agent/${agent.id}/reputation`} className="block mt-3 text-center text-sky-400 text-sm hover:text-sky-300 transition-colors">
              {d.viewReputation}
            </Link>
          </div>

          {/* ERC-8004 Identity */}
          <div className="glass-card rounded-2xl p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span>🪪</span> {d.identityTitle}
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-500 text-xs mb-1">{d.identityId}</p>
                <p className="text-emerald-400 font-mono font-bold">{agent.erc8004Id}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">{d.identityNetwork}</p>
                <p className="text-slate-200 text-xs">GOAT Testnet3 (chainId: 48816)</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">{d.identityWallet}</p>
                <p className="text-slate-200 font-mono text-xs">{formatAddress(agent.walletAddress)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">{d.identityStatus}</p>
                <ValidationBadge validated={agent.validated} />
              </div>
              <a
                href="https://explorer.testnet3.goat.network/tx/0x199ddff43da193587dfd57207006fb7fd71e28f30a1fe9b1402c8a6611ca6450"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors pt-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {d.identityViewTx}
              </a>
            </div>
          </div>

          {/* CTA */}
          <Link
            href={`/task/new?agentId=${agent.id}`}
            className="block w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-violet-600 text-white text-center font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-sky-500/20"
          >
            {d.useAgent}
          </Link>
        </div>
      </div>
    </div>
  );
}
