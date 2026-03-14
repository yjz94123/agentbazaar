import { config } from '../config/env';

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMResponse {
  content: string;
  model: string;
}

export const llmService = {
  async chat(messages: LLMMessage[], systemPrompt?: string): Promise<LLMResponse> {
    const allMessages: LLMMessage[] = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    const apiKey = config.deepseekApiKey || config.openaiApiKey;
    if (!apiKey) {
      throw new Error('No LLM API key configured (DEEPSEEK_API_KEY or OPENAI_API_KEY)');
    }

    const baseUrl = config.llmBaseUrl;
    const model = config.modelName;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: allMessages,
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
      model: string;
    };

    return {
      content: data.choices[0].message.content,
      model: data.model,
    };
  },
};
