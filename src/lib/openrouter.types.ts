import { z } from "zod";

export const ConfigurationSchema = z.object({
  apiUrl: z.string().url().default("https://openrouter.ai/api/v1"),
  apiKey: z.string().min(1, "API key is required"),
  modelName: z.string().min(1, "Model name is required"),
  modelParams: z
    .object({
      temperature: z.number().min(0).max(2).default(0.7),
      maxTokens: z.number().positive().default(512),
      frequencyPenalty: z.number().min(-2).max(2).default(0),
      presencePenalty: z.number().min(-2).max(2).default(0),
    })
    .default({}),
});

export type Configuration = z.infer<typeof ConfigurationSchema>;

export interface FormattedRequest {
  messages: {
    role: "system" | "user";
    content: string;
  }[];
  model: string;
  response_format: {
    type: "json_schema";
    json_schema: {
      name: string;
      schema: Record<string, unknown>;
    };
  };
  temperature: number;
  max_tokens: number;
  frequency_penalty: number;
  presence_penalty: number;
}

export interface ParsedResponse {
  content: Record<string, unknown>[] | Record<string, unknown>;
  error?: OpenRouterError;
}

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}
