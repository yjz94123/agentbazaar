'use client';

import ReactMarkdown from 'react-markdown';
import type {
  NewsAnalystResult,
  ProjectScreenerResult,
  ReportWriterResult,
} from '@agentbazaar/shared';
import { useLang } from '@/contexts/LangContext';

interface Props {
  agentId: string;
  result: unknown;
}

function NewsResult({ data }: { data: NewsAnalystResult }) {
  const { t } = useLang();
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">{data.title}</h2>
      <p className="text-slate-300 leading-relaxed">{data.summary}</p>

      <div>
        <h3 className="text-sm font-semibold text-sky-400 mb-2 uppercase tracking-wide">{t.result.highlights}</h3>
        <ul className="space-y-2">
          {data.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
              <span className="text-sky-400 mt-0.5">→</span>
              {h}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-amber-400 mb-2 uppercase tracking-wide">{t.result.risks}</h3>
        <ul className="space-y-2">
          {data.risks.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
              <span className="text-amber-400 mt-0.5">⚠</span>
              {r}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl bg-sky-500/5 border border-sky-500/20 p-4">
        <p className="text-slate-200 text-sm font-medium">💡 {data.conclusion}</p>
      </div>
    </div>
  );
}

function ScreenerResult({ data }: { data: ProjectScreenerResult }) {
  const { t } = useLang();
  const scoreColor = data.score >= 7 ? 'text-emerald-400' : data.score >= 5 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">{data.projectName}</h2>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">{t.result.score}</span>
          <span className={`text-3xl font-bold ${scoreColor}`}>{data.score}</span>
          <span className="text-slate-500">/10</span>
        </div>
      </div>

      <p className="text-slate-300 leading-relaxed">{data.overview}</p>

      <div>
        <h3 className="text-sm font-semibold text-emerald-400 mb-2 uppercase tracking-wide">{t.result.strengths}</h3>
        <ul className="space-y-2">
          {data.strengths.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
              <span className="text-emerald-400 mt-0.5">✓</span>
              {s}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-amber-400 mb-2 uppercase tracking-wide">{t.result.risks}</h3>
        <ul className="space-y-2">
          {data.risks.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
              <span className="text-amber-400 mt-0.5">⚠</span>
              {r}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl bg-violet-500/5 border border-violet-500/20 p-4">
        <p className="text-slate-200 text-sm font-medium">🎯 {data.recommendation}</p>
      </div>
    </div>
  );
}

function ReportResult({ data }: { data: ReportWriterResult }) {
  return (
    <div className="space-y-4">
      <div className="markdown-content">
        <ReactMarkdown>{data.markdown}</ReactMarkdown>
      </div>
    </div>
  );
}

export function ResultViewer({ agentId, result }: Props) {
  if (!result) return null;

  if (agentId === 'agent-news-001') {
    return <NewsResult data={result as NewsAnalystResult} />;
  }
  if (agentId === 'agent-screener-001') {
    return <ScreenerResult data={result as ProjectScreenerResult} />;
  }
  if (agentId === 'agent-report-001') {
    return <ReportResult data={result as ReportWriterResult} />;
  }

  // Fallback: raw JSON
  return (
    <pre className="bg-surface-700 rounded-xl p-4 text-sm text-slate-300 overflow-x-auto font-mono">
      {JSON.stringify(result, null, 2)}
    </pre>
  );
}
