'use client';

import type { ReputationData } from '@agentbazaar/shared';
import { formatScore, formatDate, getReputationColor, getReputationLabel } from '@/lib/utils';
import { ValidationBadge } from './ValidationBadge';
import { useLang } from '@/contexts/LangContext';

interface Props {
  data: ReputationData;
}

export function ReputationPanel({ data }: Props) {
  const { t } = useLang();
  const r = t.reputation;
  const scoreColor = getReputationColor(data.reputationScore);
  const scoreLabel = getReputationLabel(data.reputationScore);

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">{r.title}</h3>
          <ValidationBadge validated={data.validated} size="md" />
        </div>
        <div className="flex items-end gap-3 mb-4">
          <span className={`text-5xl font-bold ${scoreColor}`}>{formatScore(data.reputationScore)}</span>
          <span className="text-slate-500 text-lg mb-1">/5.0</span>
          <span className={`text-sm font-medium ${scoreColor} mb-1`}>{scoreLabel}</span>
        </div>

        {/* Score bar */}
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-violet-500 rounded-full transition-all"
            style={{ width: `${(data.reputationScore / 5) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{data.reviewCount}</div>
            <div className="text-xs text-slate-400">{r.totalReviews}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">{data.helpfulRate}%</div>
            <div className="text-xs text-slate-400">{r.helpful}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-sky-400">{data.accurateRate}%</div>
            <div className="text-xs text-slate-400">{r.accurate}</div>
          </div>
        </div>
      </div>

      {/* Validation Records */}
      {data.validationRecords.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-4">{r.validationHistory}</h3>
          <div className="space-y-3">
            {data.validationRecords.map((record) => (
              <div key={record.id} className="flex items-start gap-3 p-3 rounded-xl bg-surface-700/50">
                <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${record.status === 'verified' ? 'bg-emerald-400' : record.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200">{record.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">{record.validator}</span>
                    <span className="text-xs text-slate-600">·</span>
                    <span className="text-xs text-slate-500">{formatDate(record.createdAt)}</span>
                  </div>
                </div>
                <span className={`text-xs font-medium capitalize flex-shrink-0 ${record.status === 'verified' ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Reviews */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-4">{r.recentReviews(data.reviews.length)}</h3>
        {data.reviews.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">{r.noReviews}</p>
        ) : (
          <div className="space-y-4">
            {data.reviews.slice(0, 5).map((review) => (
              <div key={review.id} className="p-4 rounded-xl bg-surface-700/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-slate-600'}`}>★</span>
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">{formatDate(review.createdAt)}</span>
                </div>
                {review.comment && (
                  <p className="text-sm text-slate-300">{review.comment}</p>
                )}
                <div className="flex gap-3 text-xs">
                  {review.helpful && <span className="text-emerald-400">✓ Helpful</span>}
                  {review.accurate && <span className="text-sky-400">✓ Accurate</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
