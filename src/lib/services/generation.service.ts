import type { SupabaseClient } from "../../db/supabase.client";
import type { FlashcardCandidateDTO, GenerateFlashcardsResponseDTO } from "../../types";
import crypto from "crypto";

export interface GenerationServiceConfig {
  llmTimeoutMs: number;
}

export class GenerationService {
  private readonly config: GenerationServiceConfig;
  private readonly supabase: SupabaseClient;

  constructor(supabase: SupabaseClient, config: GenerationServiceConfig = { llmTimeoutMs: 60000 }) {
    this.supabase = supabase;
    this.config = config;
  }

  async generateFlashcards(sourceText: string, userId: string): Promise<GenerateFlashcardsResponseDTO> {
    try {
      const sourceTextHash = await this.calculateHash(sourceText);
      const startTime = new Date();

      const generation = await this.createGenerationRecord(userId, sourceText, sourceTextHash, startTime);
      const mockCandidates = await this.generateMockCandidates();

      await this.updateGenerationStats(generation.id, mockCandidates.length, startTime);

      return {
        generationId: generation.id,
        totalGenerated: mockCandidates.length,
        flashcardCandidates: mockCandidates,
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
          model: "gpt-4-turbo",
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

  private async generateMockCandidates(): Promise<FlashcardCandidateDTO[]> {
    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return [
      {
        front: "What is the capital of France?",
        back: "Paris",
        source: "AI-full",
      },
      {
        front: "What is the largest planet in our solar system?",
        back: "Jupiter",
        source: "AI-full",
      },
    ];
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
          model: "gpt-4-turbo",
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
