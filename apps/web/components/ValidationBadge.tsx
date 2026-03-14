'use client';

import { useLang } from '@/contexts/LangContext';

interface Props {
  validated: boolean;
  size?: 'sm' | 'md';
}

export function ValidationBadge({ validated, size = 'sm' }: Props) {
  const { t } = useLang();
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  if (validated) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium ${sizeClasses}`}>
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        {t.validation.verified}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-slate-700/50 border border-slate-600/30 text-slate-400 font-medium ${sizeClasses}`}>
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      {t.validation.unverified}
    </span>
  );
}
