import type { Configuration, FormattedRequest, ParsedResponse } from "./openrouter.types";
import { OpenRouterError, ConfigurationSchema } from "./openrouter.types";

interface RetryOptions {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
}

export class OpenRouterService {
  private readonly _apiClient: typeof fetch;
  private readonly _systemMessage: string;
  private readonly _responseFormat: FormattedRequest["response_format"];
  private readonly _retryOptions: RetryOptions;
  public readonly config: Configuration;

  constructor(config: Configuration) {
    // Validate configuration using Zod
    const validatedConfig = ConfigurationSchema.parse(config);

    this.config = validatedConfig;
    this._systemMessage = `You are an AI assistant specialized in creating flashcards from provided text. 
Your task is to analyze the text and create meaningful flashcards that help in learning the material.
Each flashcard should have a clear question on the front and a concise answer on the back.
Focus on key concepts, definitions, and relationships.
Avoid creating flashcards that are too obvious or too complex.
Format your response as a JSON array of flashcard objects with 'front' and 'back' properties.`;

    this._responseFormat = {
      type: "json_schema",
      json_schema: {
        name: "flashcards",
        schema: {
          type: "object",
          properties: {
            flashcards: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  front: {
                    type: "string",
                    description: "The question or prompt on the front of the flashcard",
                  },
                  back: {
                    type: "string",
                    description: "The answer or explanation on the back of the flashcard",
                  },
                },
                required: ["front", "back"],
              },
            },
          },
          required: ["flashcards"],
        },
      },
    };

    this._apiClient = fetch;

    this._retryOptions = {
      maxRetries: 3,
      initialDelay: 1000, // 1 second
      maxDelay: 10000, // 10 seconds
    };
  }

  public updateConfiguration(newConfig: Partial<Configuration>): void {
    // Merge new config with existing config and validate
    const mergedConfig = {
      ...this.config,
      ...newConfig,
      modelParams: {
        ...this.config.modelParams,
        ...newConfig.modelParams,
      },
    };

    // Validate merged configuration
    const validatedConfig = ConfigurationSchema.parse(mergedConfig);

    // Update only if validation passes
    Object.assign(this.config, validatedConfig);
  }

  private async _retryWithExponentialBackoff<T>(operation: () => Promise<T>, retryCount = 0): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      // Don't retry if it's not a network error or we've exceeded max retries
      if (
        !(error instanceof OpenRouterError && error.code === "NETWORK_ERROR") ||
        retryCount >= this._retryOptions.maxRetries
      ) {
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        this._retryOptions.initialDelay * Math.pow(2, retryCount) * (0.5 + Math.random()),
        this._retryOptions.maxDelay
      );

      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry the operation
      return this._retryWithExponentialBackoff(operation, retryCount + 1);
    }
  }

  private _formatRequest(userMessage: string): FormattedRequest {
    if (!userMessage.trim()) {
      throw new OpenRouterError("User message cannot be empty", "VALIDATION_ERROR");
    }

    return {
      messages: [
        {
          role: "system",
          content: this._systemMessage,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      model: this.config.modelName,
      response_format: this._responseFormat,
      temperature: this.config.modelParams.temperature,
      max_tokens: this.config.modelParams.maxTokens,
      frequency_penalty: this.config.modelParams.frequencyPenalty,
      presence_penalty: this.config.modelParams.presencePenalty,
    };
  }

  private async _parseResponse(response: Response): Promise<ParsedResponse> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new OpenRouterError(errorData.error || `API request failed with status ${response.status}`, "API_ERROR");
    }

    try {
      const data = await response.json();

      // OpenRouter wraps the response in a choices array
      if (!data.choices?.[0]?.message?.content) {
        throw new OpenRouterError("Invalid response format from API", "PARSE_ERROR");
      }

      // Parse the JSON content from the response
      const parsedContent = JSON.parse(data.choices[0].message.content);

      // Extract flashcards array from the response
      const content = parsedContent.flashcards;

      if (!Array.isArray(content)) {
        throw new OpenRouterError("Invalid response format: flashcards property is not an array", "PARSE_ERROR");
      }

      return {
        content,
        error: undefined,
      };
    } catch (error) {
      if (error instanceof OpenRouterError) {
        throw error;
      }
      throw new OpenRouterError(`Failed to parse API response: ${(error as Error).message}`, "PARSE_ERROR");
    }
  }

  public async sendMessage(userMessage: string): Promise<ParsedResponse> {
    const request = this._formatRequest(userMessage);

    return this._retryWithExponentialBackoff(async () => {
      try {
        const response = await this._apiClient(`${this.config.apiUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
            "HTTP-Referer": "https://10x-cards.com", // Required by OpenRouter
            "X-Title": "10x Cards", // Required by OpenRouter
          },
          body: JSON.stringify(request),
        });

        return await this._parseResponse(response);
      } catch (error) {
        if (error instanceof OpenRouterError) {
          throw error;
        }
        throw new OpenRouterError(`Failed to send message: ${(error as Error).message}`, "NETWORK_ERROR");
      }
    });
  }
}
