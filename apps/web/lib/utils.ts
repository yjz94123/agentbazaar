export function formatScore(score: number): string {
  return score.toFixed(1);
}

export function formatAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function getAgentIcon(agentId: string): string {
  const icons: Record<string, string> = {
    'agent-news-001': '📰',
    'agent-screener-001': '🔍',
    'agent-report-001': '📋',
  };
  return icons[agentId] ?? '🤖';
}

export function getAgentColor(agentId: string): string {
  const colors: Record<string, string> = {
    'agent-news-001': 'from-sky-500 to-blue-600',
    'agent-screener-001': 'from-violet-500 to-purple-600',
    'agent-report-001': 'from-emerald-500 to-teal-600',
  };
  return colors[agentId] ?? 'from-slate-500 to-slate-600';
}

export function getTaskTypeLabel(taskType: string): string {
  const labels: Record<string, string> = {
    news_summary: '新闻总结',
    market_brief: '市场快报',
    risk_points: '风险归纳',
    project_screening: '项目初筛',
    token_brief: 'Token 简评',
    risk_summary: '风险摘要',
    markdown_report: '研究报告',
    investment_memo: '投资备忘录',
    summary_rewrite: '摘要整理',
  };
  return labels[taskType] ?? taskType;
}

export function getReputationColor(score: number): string {
  if (score >= 4.5) return 'text-emerald-400';
  if (score >= 3.5) return 'text-sky-400';
  if (score >= 2.5) return 'text-yellow-400';
  return 'text-red-400';
}

export function getReputationLabel(score: number): string {
  if (score >= 4.5) return '顶级';
  if (score >= 3.5) return '良好';
  if (score >= 2.5) return '一般';
  return '较差';
}

export function getNextAgentId(currentAgentId: string): string | null {
  const flow: Record<string, string> = {
    'agent-news-001': 'agent-report-001',
    'agent-screener-001': 'agent-report-001',
  };
  return flow[currentAgentId] ?? null;
}
