import { llmService } from '../services/llm.service';
import type { ProjectScreenerResult } from '@agentbazaar/shared';

const SYSTEM_PROMPT = `你是一个 Web3 项目初筛 Agent。
请对用户提供的项目进行快速筛选，并输出结构化 JSON：
{
  "projectName": "项目名称",
  "overview": "项目简介（2-3句话）",
  "strengths": ["优势1", "优势2", "优势3"],
  "risks": ["风险1", "风险2"],
  "score": 7,
  "recommendation": "是否建议继续研究的简短建议"
}
score 为 1-10 的整数，只输出 JSON。`;

export async function runProjectScreener(input: string, taskType: string): Promise<ProjectScreenerResult> {
  const response = await llmService.chat(
    [{ role: 'user', content: `任务类型：${taskType}\n项目信息：${input}` }],
    SYSTEM_PROMPT
  );
  return JSON.parse(response.content) as ProjectScreenerResult;
}
