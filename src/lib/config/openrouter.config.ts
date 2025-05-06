import type { Configuration } from "../openrouter.types";

export const getOpenRouterConfig = (apiKey: string): Configuration => ({
  apiUrl: "https://openrouter.ai/api/v1",
  apiKey,
  modelName: "openai/gpt-4o-mini",
  modelParams: {
    temperature: 0.7,
    maxTokens: 2048,
    frequencyPenalty: 0.3,
    presencePenalty: 0.3,
  },
});
