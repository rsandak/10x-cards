import type { SupabaseClient } from "../../db/supabase.client";
import type { CreateFlashcardDTO, FlashcardDTO } from "../../types";

export class FlashcardService {
  constructor(private readonly supabase: SupabaseClient) {}

  async createFlashcards(flashcards: CreateFlashcardDTO[], userId: string): Promise<FlashcardDTO[]> {
    console.log(`Creating ${flashcards.length} flashcards for user ${userId}`);

    const flashcardsToInsert = flashcards.map(({ generationId, ...rest }) => ({
      ...rest,
      user_id: userId,
      generation_id: generationId,
    }));

    try {
      const { data, error } = await this.supabase.from("flashcards").insert(flashcardsToInsert).select();

      if (error) {
        console.error("Failed to create flashcards:", {
          error,
          userId,
          flashcardsCount: flashcards.length,
        });
        throw new Error(`Failed to create flashcards: ${error.message}`);
      }

      if (!data) {
        console.error("No data returned after creating flashcards:", {
          userId,
          flashcardsCount: flashcards.length,
        });
        throw new Error("No data returned after creating flashcards");
      }

      // Update generation statistics for AI flashcards
      const aiFlashcards = flashcards.filter((f) => f.source !== "Manual" && f.generationId);
      if (aiFlashcards.length > 0 && aiFlashcards[0].generationId) {
        const generationId = aiFlashcards[0].generationId;
        console.log(`Updating stats for generation ${generationId}`);
        await this.updateGenerationStats(aiFlashcards, generationId);
      }

      console.log(`Successfully created ${data.length} flashcards for user ${userId}`);
      return data;
    } catch (error) {
      console.error("Unexpected error while creating flashcards:", {
        error,
        userId,
        flashcardsCount: flashcards.length,
      });
      throw error;
    }
  }

  private async updateGenerationStats(aiFlashcards: CreateFlashcardDTO[], generationId: number): Promise<void> {
    try {
      // Calculate review results
      const stats = {
        accepted_unedited_count: aiFlashcards.filter((f) => f.source === "AI-full").length,
        accepted_edited_count: aiFlashcards.filter((f) => f.source === "AI-edited").length,
      };

      // Get the generation to verify it exists
      const { data: generation, error: selectError } = await this.supabase
        .from("generations")
        .select("generated_count")
        .eq("id", generationId)
        .single();

      if (selectError) {
        console.error(`Failed to get generation ${generationId}:`, selectError);
        return;
      }

      if (!generation) {
        console.error(`Generation ${generationId} not found`);
        return;
      }

      const totalAccepted = stats.accepted_unedited_count + stats.accepted_edited_count;
      const unaccepted_count = generation.generated_count - totalAccepted;

      // Validate the numbers add up
      if (totalAccepted > generation.generated_count) {
        console.error(
          `Invalid review results: accepted count (${totalAccepted}) exceeds generated count (${generation.generated_count})`
        );
        return;
      }

      console.log(`Updating generation ${generationId} review results:`, {
        ...stats,
        unaccepted_count,
        total_generated: generation.generated_count,
      });

      // Save review results
      const { error: updateError } = await this.supabase
        .from("generations")
        .update({
          accepted_unedited_count: stats.accepted_unedited_count,
          accepted_edited_count: stats.accepted_edited_count,
          unaccepted_count,
        })
        .eq("id", generationId);

      if (updateError) {
        console.error(`Failed to update generation ${generationId} review results:`, updateError);
      } else {
        console.log(`Successfully updated generation ${generationId} review results`);
      }
    } catch (error) {
      console.error("Unexpected error while updating generation stats:", error);
      // Don't rethrow - we don't want to fail the whole operation if stats update fails
    }
  }
}
