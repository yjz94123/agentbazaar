import { llmService } from '../services/llm.service';
import type { ReportWriterResult } from '@agentbazaar/shared';

const SYSTEM_PROMPT = `你是一个专业研究报告 Agent。
请基于输入内容，整理成一份简洁清晰的研究报告，输出 JSON 格式：
{
  "title": "报告标题",
  "markdown": "完整的 Markdown 报告内容（包含标题、摘要、正文、风险提示、结论各节）",
  "summary": "报告摘要（2-3句话）",
  "conclusion": "核心结论（1-2句话）"
}
只输出 JSON。`;

export async function runReportWriter(input: string, taskType: string): Promise<ReportWriterResult> {
  const response = await llmService.chat(
    [{ role: 'user', content: `任务类型：${taskType}\n输入内容：${input}` }],
    SYSTEM_PROMPT
  );
  return JSON.parse(response.content) as ReportWriterResult;
}
