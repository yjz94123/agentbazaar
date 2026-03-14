'use client';

import { useLang } from '@/contexts/LangContext';

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t border-white/5 mt-20 py-8 text-center text-slate-600 text-sm">
      <p>{t.footer}</p>
    </footer>
  );
}
