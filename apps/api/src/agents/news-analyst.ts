import { llmService } from '../services/llm.service';
import type { NewsAnalystResult } from '@agentbazaar/shared';

const SYSTEM_PROMPT = `你是一个专业新闻分析 Agent。
请基于用户输入的主题，总结关键事件，提炼风险点，并输出结构化 JSON 结果：
{
  "title": "新闻分析标题",
  "summary": "综合概述（2-3句话）",
  "highlights": ["关键事件1", "关键事件2", "关键事件3"],
  "risks": ["风险点1", "风险点2"],
  "conclusion": "一句话总结"
}
只输出 JSON，不要其他内容。`;

export async function runNewsAnalyst(input: string, taskType: string): Promise<NewsAnalystResult> {
  const response = await llmService.chat(
    [{ role: 'user', content: `任务类型：${taskType}\n主题：${input}` }],
    SYSTEM_PROMPT
  );
  return JSON.parse(response.content) as NewsAnalystResult;
}
