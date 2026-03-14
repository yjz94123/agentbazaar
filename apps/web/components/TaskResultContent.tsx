'use client';

import Link from 'next/link';
import type { Task, Agent } from '@agentbazaar/shared';
import { useLang } from '@/contexts/LangContext';
import { ResultViewer } from './ResultViewer';
import { ReviewSection } from './ReviewSection';
import { ValidationBadge } from './ValidationBadge';
import { getAgentIcon, getAgentColor, formatDate, formatDuration, getTaskTypeLabel } from '@/lib/utils';

interface Props {
  task: Task;
  agent: Agent | null;
  txHash?: string | null;
}

export function TaskResultContent({ task, agent, txHash }: Props) {
  const { t } = useLang();
  const tr = t.taskResult;

  const icon = agent ? getAgentIcon(agent.id) : '🤖';
  const gradientColor = agent ? getAgentColor(agent.id) : 'from-slate-500 to-slate-600';

  const statusLabels = tr.statusLabels as Record<string, string>;
  const statusColorMap: Record<string, string> = {
    completed: 'text-emerald-400',
    processing: 'text-sky-400',
    paid: 'text-violet-400',
    payment_required: 'text-amber-400',
    failed: 'text-red-400',
    created: 'text-slate-400',
  };
  const statusBgMap: Record<string, string> = {
    completed: 'bg-emerald-500/10 border-emerald-500/20',
    processing: 'bg-sky-500/10 border-sky-500/20',
    paid: 'bg-violet-500/10 border-violet-500/20',
    payment_required: 'bg-amber-500/10 border-amber-500/20',
    failed: 'bg-red-500/10 border-red-500/20',
    created: 'bg-slate-500/10 border-slate-500/20',
  };

  const statusLabel = statusLabels[task.status] ?? task.status;
  const statusColor = statusColorMap[task.status] ?? 'text-slate-400';
  const statusBg = statusBgMap[task.status] ?? 'bg-slate-500/10 border-slate-500/20';

  const chainableAgents: Record<string, { id: string; name: string }> = {
    'agent-news-001': { id: 'agent-report-001', name: 'Report Writer' },
    'agent-screener-001': { id: 'agent-report-001', name: 'Report Writer' },
  };
  const nextAgent = chainableAgents[task.agentId];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors">
        {tr.back}
      </Link>

      {/* Task Header */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center text-2xl flex-shrink-0`}>
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-bold text-white text-lg">{agent?.name ?? task.agentId}</h1>
              {agent && <ValidationBadge validated={agent.validated} />}
              <span className={`px-2 py-0.5 rounded-full text-xs border ${statusBg} ${statusColor}`}>
                {statusLabel}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">{getTaskTypeLabel(task.taskType)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-slate-500 text-xs mb-1">{tr.taskId}</p>
            <p className="text-slate-300 font-mono text-xs truncate">{task.id.slice(0, 20)}...</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">{tr.pricePaid}</p>
            <p className="text-sky-400 font-mono font-medium">{task.price} {task.currency}</p>
            {txHash && (
              <a
                href={`https://explorer.testnet3.goat.network/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1 text-xs text-sky-500 hover:text-sky-300 transition-colors"
              >
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {txHash.slice(0, 8)}...{txHash.slice(-6)}
              </a>
            )}
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">{tr.created}</p>
            <p className="text-slate-300">{formatDate(task.createdAt)}</p>
          </div>
          {task.executionMs !== null && (
            <div>
              <p className="text-slate-500 text-xs mb-1">{tr.execution}</p>
              <p className="text-slate-300">{formatDuration(task.executionMs)}</p>
            </div>
          )}
        </div>
      </div>

      {task.userInput && !task.parentTaskId && (
        <div className="glass-card rounded-2xl p-5 mb-6">
          <h2 className="font-semibold text-slate-400 text-xs uppercase tracking-wide mb-3">{tr.taskInput}</h2>
          <p className="text-slate-300 text-sm leading-relaxed">{task.userInput}</p>
        </div>
      )}

      {task.parentTaskId && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-sm text-violet-300">
          {tr.fromUpstream}{' '}
          <Link href={`/task/${task.parentTaskId}`} className="underline hover:text-violet-200">
            {task.parentTaskId}
          </Link>
        </div>
      )}

      {task.status === 'completed' && task.result ? (
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-white mb-4">{tr.resultTitle}</h2>
          <ResultViewer agentId={task.agentId} result={task.result} />
        </div>
      ) : task.status === 'processing' ? (
        <div className="glass-card rounded-2xl p-8 mb-6 text-center">
          <svg className="animate-spin w-8 h-8 text-sky-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-slate-300">{tr.processing}</p>
        </div>
      ) : null}

      {task.status === 'completed' && nextAgent && (
        <div className="glass-card rounded-2xl p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="font-medium text-white text-sm">{tr.chainTitle(nextAgent.name)}</p>
            <p className="text-slate-400 text-xs mt-0.5">{tr.chainDesc}</p>
          </div>
          <Link
            href={`/task/new?agentId=${nextAgent.id}&parentTaskId=${task.id}`}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-opacity flex-shrink-0"
          >
            {tr.handoff}
          </Link>
        </div>
      )}

      {task.status === 'completed' && (
        <ReviewSection taskId={task.id} agentId={task.agentId} />
      )}
    </div>
  );
}
