'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { Agent } from '@agentbazaar/shared';
import { tasksApi } from '@/lib/api';
import { PaymentDialog } from './PaymentDialog';
import { useLang } from '@/contexts/LangContext';

interface TaskType {
  id: string;
  label: string;
  placeholder: string;
}

interface Props {
  agent: Agent;
  taskTypes: TaskType[];
  parentTaskId?: string;
}

export function TaskForm({ agent, taskTypes, parentTaskId }: Props) {
  const router = useRouter();
  const { t } = useLang();
  const tf = t.taskForm;
  const [selectedType, setSelectedType] = useState(taskTypes[0]?.id ?? '');
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [paymentInfo, setPaymentInfo] = useState<{
    orderId: string;
    taskId: string;
    amount: string;
    currency: string;
    chain: string;
  } | null>(null);
  // Actual dynamic price returned by server (may differ from agent.price base price)
  const [actualPrice, setActualPrice] = useState<string | null>(null);

  const currentType = taskTypes.find((t) => t.id === selectedType);

  async function submitTask(orderId?: string) {
    setSubmitting(true);
    try {
      const result = await tasksApi.create({
        agentId: agent.id,
        taskType: selectedType,
        input: parentTaskId ? '(will use parent task result)' : input,
        parentTaskId,
        orderId,
      });

      if (result._status === 402) {
        // Show payment dialog — use actual amount from server (dynamic pricing may differ from agent.price)
        setActualPrice(result.amount!);
        setPaymentInfo({
          orderId: result.orderId!,
          taskId: result.taskId!,
          amount: result.amount!,
          currency: result.currency!,
          chain: result.chain!,
        });
      } else if (result._status === 200 && result.data?.taskId) {
        toast.success('Task submitted successfully!');
        router.push(`/task/${result.data.taskId}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePaymentSuccess(orderId: string) {
    setPaymentInfo(null);
    toast.loading('Executing task...', { id: 'executing' });

    // Re-submit with orderId
    try {
      const result = await tasksApi.create({
        agentId: agent.id,
        taskType: selectedType,
        input: parentTaskId ? '(will use parent task result)' : input,
        parentTaskId,
        orderId,
      });

      toast.dismiss('executing');

      if (result._status === 200 && result.data?.taskId) {
        toast.success('Task completed!');
        router.push(`/task/${result.data.taskId}`);
      } else if (result._status === 410) {
        const code = (result as { code?: string }).code;
        if (code === 'ORDER_SESSION_EXPIRED') {
          toast.error('支付会话已过期（服务器可能已重启），请刷新页面重新发起任务。', { duration: 6000 });
        } else {
          toast.error('任务状态已丢失，请联系支持团队。', { duration: 6000 });
        }
      } else if (result._status === 422) {
        toast.error((result as { error?: string }).error ?? '父任务尚未完成，请等待后重试。', { duration: 5000 });
      } else {
        toast.error('Task execution failed');
      }
    } catch (err) {
      toast.dismiss('executing');
      toast.error(err instanceof Error ? err.message : 'Execution failed');
    }
  }

  return (
    <>
      <div className="glass-card rounded-2xl p-6 space-y-5">
        <h2 className="font-semibold text-white text-lg">{tf.title}</h2>

        {/* Task Type */}
        <div>
          <label className="text-sm text-slate-400 mb-2 block">{tf.taskTypeLabel}</label>
          <div className="grid grid-cols-1 gap-2">
            {taskTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedType(type.id)}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  selectedType === type.id
                    ? 'bg-sky-500/10 border-sky-500/40 text-sky-300'
                    : 'bg-surface-700/50 border-white/5 text-slate-300 hover:border-white/10'
                }`}
              >
                <span className="text-sm font-medium">{type.label}</span>
                {selectedType === type.id && (
                  <svg className="w-4 h-4 text-sky-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        {!parentTaskId && (
          <div>
            <label className="text-sm text-slate-400 mb-2 block">{tf.inputLabel}</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentType?.placeholder ?? 'Describe your task...'}
              rows={5}
              className="w-full bg-surface-700 border border-white/10 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500/50 resize-none"
            />
          </div>
        )}

        {/* Price estimate — show dynamic price if known, otherwise fall back to base price */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-700/50 border border-white/5 text-sm">
          <span className="text-slate-400">
            {tf.estimatedCost}
            {actualPrice && actualPrice !== agent.price && (
              <span className="ml-1 text-xs text-slate-500">(动态定价)</span>
            )}
          </span>
          <span className="font-mono font-semibold text-sky-400">
            {actualPrice ?? agent.price} {agent.currency}
          </span>
        </div>

        {/* Submit */}
        <button
          onClick={() => submitTask()}
          disabled={submitting || (!parentTaskId && !input.trim())}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-violet-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {tf.submitting}
            </>
          ) : (
            tf.submit
          )}
        </button>

        <p className="text-center text-slate-600 text-xs">
          {tf.x402Note}
        </p>
      </div>

      {paymentInfo && (
        <PaymentDialog
          {...paymentInfo}
          onSuccess={handlePaymentSuccess}
          onClose={() => setPaymentInfo(null)}
        />
      )}
    </>
  );
}
