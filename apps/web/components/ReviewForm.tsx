'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { reviewsApi } from '@/lib/api';
import { useLang } from '@/contexts/LangContext';

interface Props {
  taskId: string;
  agentId: string;
  onSuccess: () => void;
}

export function ReviewForm({ taskId, agentId, onSuccess }: Props) {
  const { t } = useLang();
  const rv = t.review;
  const [rating, setRating] = useState(5);
  const [helpful, setHelpful] = useState(true);
  const [accurate, setAccurate] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await reviewsApi.create({ taskId, agentId, rating, helpful, accurate, comment });
      toast.success('Review submitted! Reputation updated ✨');
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Submit failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
      <h3 className="font-semibold text-white text-lg">{rv.sectionTitle}</h3>

      {/* Stars */}
      <div>
        <label className="text-sm text-slate-400 mb-2 block">{rv.ratingLabel}</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-slate-600'}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={helpful}
            onChange={(e) => setHelpful(e.target.checked)}
            className="w-4 h-4 rounded accent-sky-500"
          />
          <span className="text-sm text-slate-300">{rv.helpful}</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={accurate}
            onChange={(e) => setAccurate(e.target.checked)}
            className="w-4 h-4 rounded accent-sky-500"
          />
          <span className="text-sm text-slate-300">{rv.accurate}</span>
        </label>
      </div>

      {/* Comment */}
      <div>
        <label className="text-sm text-slate-400 mb-2 block">{rv.commentLabel}</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={rv.commentPlaceholder}
          rows={3}
          className="w-full bg-surface-700 border border-white/10 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500/50 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 font-medium hover:bg-sky-500/20 transition-all disabled:opacity-50"
      >
        {submitting ? rv.submitting : rv.submit}
      </button>
    </form>
  );
}
