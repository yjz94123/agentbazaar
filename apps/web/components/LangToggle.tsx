'use client';

import { useLang } from '@/contexts/LangContext';

export function LangToggle() {
  const { lang, setLang } = useLang();

  return (
    <button
      onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
      className="px-3 py-1 rounded-full border border-white/10 text-slate-400 text-xs hover:border-sky-500/40 hover:text-sky-400 transition-all font-medium"
    >
      {lang === 'zh' ? 'EN' : '中文'}
    </button>
  );
}
