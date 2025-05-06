import type { SupabaseClient } from "../../db/supabase.client";
import type { GenerateFlashcardsResponseDTO } from "../../types";
import type { OpenRouterService } from "../openrouter.service";
import crypto from "crypto";

export interface GenerationServiceConfig {
  llmTimeoutMs: number;
  systemPrompt: string;
}

const DEFAULT_CONFIG: GenerationServiceConfig = {
  llmTimeoutMs: 60000,
  systemPrompt: `You are an AI assistant specialized in creating flashcards from provided text. 
Your task is to analyze the text and create meaningful flashcards that help in learning the material.
Each flashcard should have a clear question on the front and a concise answer on the back.
Focus on key concepts, definitions, and relationships.
Avoid creating flashcards that are too obvious or too complex.
Format your response as a JSON array of flashcard objects with 'front' and 'back' properties.`,
};

export class GenerationService {
  private readonly config: GenerationServiceConfig;
  private readonly supabase: SupabaseClient;
  private readonly openRouter: OpenRouterService;

  constructor(supabase: SupabaseClient, openRouter: OpenRouterService, config: Partial<GenerationServiceConfig> = {}) {
    this.supabase = supabase;
    this.openRouter = openRouter;
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Update OpenRouter system message
    this.openRouter.updateConfiguration({
      modelParams: {
        temperature: 0.7, // Balanced between creativity and accuracy
        maxTokens: 2048, // Allow for longer responses to handle multiple flashcards
        frequencyPenalty: 0.3, // Slight penalty to avoid repetitive patterns
        presencePenalty: 0.3, // Slight penalty to encourage diverse content
      },
    });
  }

  async generateFlashcards(sourceText: string, userId: string): Promise<GenerateFlashcardsResponseDTO> {
    try {
      const sourceTextHash = await this.calculateHash(sourceText);
      const startTime = new Date();

      const generation = await this.createGenerationRecord(userId, sourceText, sourceTextHash, startTime);

      // Generate flashcards using OpenRouter
      const response = await this.openRouter.sendMessage(sourceText);

      if (!response.content || !Array.isArray(response.content)) {
        throw new Error("Invalid response format from LLM");
      }

      interface FlashcardResponse {
        front: string;
        back: string;
      }

      const flashcardCandidates = (response.content as unknown as FlashcardResponse[]).map((card) => ({
        front: card.front,
        back: card.back,
        source: "AI-full" as const,
      }));

      await this.updateGenerationStats(generation.id, flashcardCandidates.length, startTime);

      return {
        generationId: generation.id,
        totalGenerated: flashcardCandidates.length,
        flashcardCandidates,
      };
    } catch (error) {
      await this.logGenerationError(error, {
        sourceTextHash: await this.calculateHash(sourceText),
        sourceTextLength: sourceText.length,
        userId,
      });
      throw error;
    }
  }

  private async calculateHash(sourceText: string): Promise<string> {
    return crypto.createHash("md5").update(sourceText).digest("hex");
  }

  private async createGenerationRecord(userId: string, sourceText: string, sourceTextHash: string, startTime: Date) {
    const { data: generation, error: insertError } = await this.supabase
      .from("generations")
      .insert([
        {
          user_id: userId,
          source_text_hash: sourceTextHash,
          source_text_length: sourceText.length,
          model: this.openRouter.config.modelName,
          generated_count: 0,
          generation_duration: 0,
          created_at: startTime.toISOString(),
        },
      ])
      .select()
      .single();

    if (insertError || !generation) {
      throw insertError;
    }

    return generation;
  }

  private async updateGenerationStats(generationId: number, generatedCount: number, startTime: Date): Promise<void> {
    const endTime = new Date();
    const durationMs = endTime.getTime() - startTime.getTime();

    await this.supabase
      .from("generations")
      .update({
        generated_count: generatedCount,
        generation_duration: Math.round(durationMs / 1000), // Convert to seconds
      })
      .eq("id", generationId);
  }

  private async logGenerationError(
    error: unknown,
    data: { sourceTextHash: string; sourceTextLength: number; userId: string }
  ): Promise<void> {
    try {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      await this.supabase.from("generation_error_logs").insert([
        {
          user_id: data.userId,
          error_message: errorMessage,
          model: this.openRouter.config.modelName,
          source_text_length: data.sourceTextLength,
          source_text_hash: data.sourceTextHash,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (logError) {
      console.error("Failed to log generation error:", logError);
    }
  }
}
