'use client';

import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { paymentsApi } from '@/lib/api';
import { useLang } from '@/contexts/LangContext';
import { useWallet } from '@/contexts/WalletContext';

interface Props {
  orderId: string;
  taskId: string;
  amount: string;
  currency: string;
  chain: string;
  onSuccess: (orderId: string) => void;
  onClose: () => void;
}

const GOAT_CHAIN_ID = 48816;
const USDC_CONTRACT = '0x29d1ee93e9ecf6e50f309f498e40a6b42d352fa1';

function CopyButton({ text, copyLabel, copiedLabel }: { text: string; copyLabel: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="text-xs text-slate-400 hover:text-sky-400 transition-colors px-2 py-1 rounded border border-white/10 hover:border-sky-500/30 ml-2 flex-shrink-0"
    >
      {copied ? copiedLabel : copyLabel}
    </button>
  );
}

export function PaymentDialog({ orderId, amount, currency, onSuccess, onClose }: Props) {
  const { t } = useLang();
  const p = t.payment;
  const { address: walletAddress, connect, connecting } = useWallet();

  const [initiating, setInitiating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [confirmedTxHash, setConfirmedTxHash] = useState<string | null>(null);

  const [goatOrder, setGoatOrder] = useState<{
    payToAddress: string;
    goatOrderId: string;
    amountWei: string;
  } | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Guard against both manual verify and auto-polling calling onSuccess simultaneously
  const successCalledRef = useRef(false);

  // Cleanup interval on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, []);

  // Auto-initiate when wallet just connected
  useEffect(() => {
    if (walletAddress && !goatOrder && !initiating && !paid) {
      handleInitiateGoat(walletAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  async function handleInitiateGoat(address: string) {
    setInitiating(true);
    try {
      const result = await paymentsApi.initiateGoat(orderId, address);
      setGoatOrder(result);
      toast.success('GOAT x402 订单已创建！');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '创建订单失败');
    } finally {
      setInitiating(false);
    }
  }

  async function handleVerify() {
    setVerifying(true);
    try {
      const result = await paymentsApi.verifyGoat(orderId);
      if (result.confirmed) {
        stopPolling();
        if (!successCalledRef.current) {
          successCalledRef.current = true;
          setConfirmedTxHash(result.txHash);
          setPaid(true);
          toast.success('链上支付已确认！');
          setTimeout(() => onSuccess(orderId), 2000);
        }
      } else {
        toast(`状态: ${result.goatStatus} — 等待确认`, { icon: '⏳' });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '验证失败');
    } finally {
      setVerifying(false);
    }
  }

  function startAutoPolling() {
    if (pollRef.current) return;
    toast('每 5 秒自动检查状态...', { icon: '🔄', duration: 3000 });
    pollRef.current = setInterval(async () => {
      try {
        const result = await paymentsApi.verifyGoat(orderId);
        if (result.confirmed && !successCalledRef.current) {
          successCalledRef.current = true;
          stopPolling();
          setConfirmedTxHash(result.txHash);
          setPaid(true);
          toast.success('链上支付已确认！');
          setTimeout(() => onSuccess(orderId), 2000);
        }
      } catch {}
    }, 5000);
  }

  function handleClose() {
    stopPolling();
    onClose();
  }

  const amountWeiDisplay = goatOrder
    ? `${(parseInt(goatOrder.amountWei) / 1e6).toFixed(4)} ${currency}`
    : `${amount} ${currency}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-md glass-card rounded-2xl p-6 border border-sky-500/20 glow-blue">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-white">{p.title}</h2>
              <p className="text-xs text-slate-400">{p.subtitle}</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* HTTP 402 Badge */}
        <div className="mb-4 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
          <span className="text-amber-400 font-mono font-bold text-sm">{p.http402Badge}</span>
          <span className="text-slate-400 text-xs">{p.paymentRequiredMsg(amount, currency)}</span>
        </div>

        {/* Paid state */}
        {paid ? (
          <div className="py-6 text-center space-y-3">
            <div className="text-4xl mb-1">✅</div>
            <p className="text-emerald-400 font-semibold">{p.confirmed}</p>
            <p className="text-slate-400 text-sm">{p.executing}</p>
            {confirmedTxHash && (
              <a
                href={`https://explorer.testnet3.goat.network/tx/${confirmedTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs hover:bg-sky-500/20 transition-colors font-mono"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {confirmedTxHash.slice(0, 10)}...{confirmedTxHash.slice(-6)} — 在链上查看
              </a>
            )}
          </div>
        ) : !walletAddress ? (
          /* No wallet connected */
          <div className="space-y-4">
            <div className="px-4 py-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center space-y-3">
              <p className="text-orange-300 text-sm">连接钱包后自动发起支付</p>
              <p className="text-slate-500 text-xs">请先在导航栏连接 MetaMask 钱包</p>
              <button
                onClick={connect}
                disabled={connecting}
                className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-300 text-sm font-medium hover:bg-orange-500/30 transition-colors disabled:opacity-50"
              >
                {connecting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    连接中...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 35 33" fill="currentColor">
                      <path d="M32.958 1L19.44 10.82l2.52-5.944L32.958 1z" opacity=".8"/>
                      <path d="M2.042 1l13.407 9.93-2.408-5.054L2.042 1zM28.045 23.44l-3.6 5.512 7.706 2.122 2.21-7.523-6.316-.11zM.666 23.55l2.2 7.524 7.694-2.122-3.59-5.512-6.304.11z" opacity=".6"/>
                    </svg>
                    连接 MetaMask
                  </>
                )}
              </button>
            </div>

            <div className="px-4 py-3 rounded-xl bg-surface-700/50 border border-white/5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">{p.networkLabel}</span>
                <span className="text-slate-200">GOAT Testnet3 (chainId: {GOAT_CHAIN_ID})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{p.amountLabel}</span>
                <span className="font-mono font-bold text-sky-400">{amount} {currency}</span>
              </div>
            </div>
          </div>
        ) : !goatOrder ? (
          /* Wallet connected, creating order */
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
              <span className="text-emerald-300 text-xs font-mono flex-1 truncate">{walletAddress}</span>
              <span className="text-emerald-500 text-xs">已连接</span>
            </div>

            <div className="px-4 py-3 rounded-xl bg-surface-700/50 border border-white/5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">{p.networkLabel}</span>
                <span className="text-slate-200">GOAT Testnet3 (chainId: {GOAT_CHAIN_ID})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{p.amountLabel}</span>
                <span className="font-mono font-bold text-sky-400">{amount} {currency}</span>
              </div>
            </div>

            <button
              onClick={() => handleInitiateGoat(walletAddress)}
              disabled={initiating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-violet-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {initiating ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {p.creatingOrder}
                </>
              ) : (
                p.createOrder
              )}
            </button>
          </div>
        ) : (
          /* Payment address shown, waiting for transfer */
          <>
            <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300">
              {p.orderCreated(currency)}
            </div>

            <div className="space-y-3 mt-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">{p.sendTo(amountWeiDisplay)}</p>
                <div className="flex items-center gap-2 bg-surface-700/50 border border-white/10 rounded-xl px-3 py-2.5">
                  <span className="font-mono text-sky-400 text-xs break-all flex-1">{goatOrder.payToAddress}</span>
                  <CopyButton text={goatOrder.payToAddress} copyLabel={p.copy} copiedLabel={p.copied} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="px-3 py-2 rounded-lg bg-surface-700/50 border border-white/5">
                  <p className="text-slate-500 mb-0.5">{p.tokenContract}</p>
                  <div className="flex items-center">
                    <span className="text-slate-300 font-mono truncate">{USDC_CONTRACT.slice(0, 12)}...</span>
                    <CopyButton text={USDC_CONTRACT} copyLabel={p.copy} copiedLabel={p.copied} />
                  </div>
                </div>
                <div className="px-3 py-2 rounded-lg bg-surface-700/50 border border-white/5">
                  <p className="text-slate-500 mb-0.5">{p.amountWei}</p>
                  <div className="flex items-center">
                    <span className="text-slate-300 font-mono">{goatOrder.amountWei}</span>
                    <CopyButton text={goatOrder.amountWei} copyLabel={p.copy} copiedLabel={p.copied} />
                  </div>
                </div>
              </div>

              <div className="px-3 py-2 rounded-lg bg-surface-700/30 border border-white/5 text-xs">
                <p className="text-slate-500 mb-0.5">{p.goatOrderId}</p>
                <div className="flex items-center">
                  <span className="text-slate-400 font-mono truncate">{goatOrder.goatOrderId}</span>
                  <CopyButton text={goatOrder.goatOrderId} copyLabel={p.copy} copiedLabel={p.copied} />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={handleVerify}
                disabled={verifying}
                className="flex-1 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold hover:bg-emerald-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {verifying ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {p.checking}
                  </>
                ) : (
                  p.checkStatus
                )}
              </button>
              <button
                onClick={startAutoPolling}
                className="px-4 py-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm hover:bg-sky-500/20 transition-colors"
                title="每 5 秒自动轮询"
              >
                🔄
              </button>
            </div>

            <button
              onClick={() => {
                stopPolling();
                if (!successCalledRef.current) {
                  successCalledRef.current = true;
                  onSuccess(orderId);
                }
              }}
              className="w-full mt-2 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm hover:bg-violet-500/20 transition-colors"
            >
              跳过验证，直接执行任务 →
            </button>

            <p className="text-center text-slate-600 text-xs mt-3">
              {p.sendFromWallet(currency)}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
