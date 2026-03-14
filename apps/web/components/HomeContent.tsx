'use client';

import type { Agent } from '@agentbazaar/shared';
import { useLang } from '@/contexts/LangContext';
import { AgentCard } from './AgentCard';

export function HomeContent({ agents }: { agents: Agent[] }) {
  const { t } = useLang();
  const h = t.home;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/5 text-sky-400 text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            {h.badge}
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
            {h.title1 && <>{h.title1}{' '}</>}
            <span className="gradient-text text-glow">{h.title2}</span>
            <br />
            {h.title3}
          </h1>

          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            {h.desc}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#agents"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-violet-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-sky-500/20"
            >
              {h.exploreBtn}
            </a>
            <a
              href="#how-it-works"
              className="px-8 py-3.5 rounded-xl border border-white/10 text-slate-300 hover:border-white/20 hover:text-white transition-all"
            >
              {h.howBtn}
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 px-4 border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: '3', label: h.stats.agents, color: 'text-sky-400' },
              { value: '910+', label: h.stats.tasks, color: 'text-violet-400' },
              { value: '100%', label: h.stats.identity, color: 'text-emerald-400' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-slate-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent List */}
      <section id="agents" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">{h.agentsTitle}</h2>
              <p className="text-slate-400 text-sm mt-1">{h.agentsSubtitle}</p>
            </div>
            <span className="text-slate-500 text-sm">{h.agentsCount(agents.length)}</span>
          </div>

          {agents.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <p className="text-lg mb-2">{h.emptyTitle}</p>
              <p className="text-sm">{h.emptyHint}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-12">{h.howTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {h.steps.map((item) => (
              <div key={item.step} className="glass-card rounded-2xl p-5 text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="text-xs text-sky-400/60 font-mono mb-1">{item.step}</div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {h.features.map((item) => (
              <div key={item.title} className={`rounded-2xl p-6 bg-gradient-to-br ${item.color} border ${item.border}`}>
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
