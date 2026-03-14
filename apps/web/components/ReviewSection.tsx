'use client';

import { useState } from 'react';
import { ReviewForm } from './ReviewForm';
import { useLang } from '@/contexts/LangContext';

interface Props {
  taskId: string;
  agentId: string;
}

export function ReviewSection({ taskId, agentId }: Props) {
  const { t } = useLang();
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center">
        <div className="text-3xl mb-2">🎉</div>
        <p className="text-white font-medium">{t.review.successMsg}</p>
        <a href={`/agent/${agentId}/reputation`} className="inline-block mt-3 text-sky-400 text-sm hover:text-sky-300 transition-colors">
          {t.agentDetail.viewReputation}
        </a>
      </div>
    );
  }

  return (
    <ReviewForm
      taskId={taskId}
      agentId={agentId}
      onSuccess={() => setSubmitted(true)}
    />
  );
}
