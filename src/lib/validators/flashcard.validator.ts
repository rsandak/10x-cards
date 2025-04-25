import { z } from "zod";
import type { CreateFlashcardsCommand } from "../../types";

const flashcardSourceEnum = z.enum(["Manual", "AI-full", "AI-edited"] as const);

const createFlashcardSchema = z
  .object({
    front: z.string().min(1).max(200),
    back: z.string().min(1).max(500),
    source: flashcardSourceEnum,
    generationId: z.number().optional(),
  })
  .refine(
    (data) => {
      // Validate that generationId is present when source is AI-related
      if (data.source === "AI-full" || data.source === "AI-edited") {
        return data.generationId !== undefined;
      }
      return true;
    },
    {
      message: "generationId is required when source is AI-full or AI-edited",
    }
  );

export const createFlashcardsCommandSchema = z.object({
  flashcards: z.array(createFlashcardSchema).min(1),
  generationId: z.number().optional(),
});

export type CreateFlashcardsCommandValidated = z.infer<typeof createFlashcardsCommandSchema>;

export function validateCreateFlashcardsCommand(input: unknown): CreateFlashcardsCommand {
  return createFlashcardsCommandSchema.parse(input);
}
