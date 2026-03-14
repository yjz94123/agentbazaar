'use client';

import { useLang } from '@/contexts/LangContext';
import { useWallet } from '@/contexts/WalletContext';
import { LangToggle } from './LangToggle';

export function NavBar() {
  const { t } = useLang();
  const { address, connecting, connect, disconnect } = useWallet();

  return (
    <nav className="border-b border-white/5 bg-surface-800/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center text-sm font-bold">
              A
            </div>
            <span className="font-bold text-xl gradient-text">AgentBazaar</span>
          </a>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <a href="/" className="hover:text-white transition-colors">{t.nav.marketplace}</a>
            <span className="px-2 py-1 rounded-full border border-sky-500/30 text-sky-400 text-xs">
              GOAT Testnet3
            </span>
            <LangToggle />

            {/* Wallet Button */}
            {address ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  {address.slice(0, 6)}...{address.slice(-4)}
                </div>
                <button
                  onClick={disconnect}
                  className="px-2 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
                  title="断开钱包"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={connecting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs hover:bg-orange-500/20 transition-colors disabled:opacity-50"
              >
                {connecting ? (
                  <>
                    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    连接中...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 35 33" fill="currentColor">
                      <path d="M32.958 1L19.44 10.82l2.52-5.944L32.958 1z" opacity=".8"/>
                      <path d="M2.042 1l13.407 9.93-2.408-5.054L2.042 1zM28.045 23.44l-3.6 5.512 7.706 2.122 2.21-7.523-6.316-.11zM.666 23.55l2.2 7.524 7.694-2.122-3.59-5.512-6.304.11z" opacity=".6"/>
                    </svg>
                    连接钱包
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
