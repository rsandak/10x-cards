import type { APIRoute } from "astro";
import { FlashcardService } from "../../lib/services/flashcard.service";
import { validateCreateFlashcardsCommand } from "../../lib/validators/flashcard.validator";
import { DEFAULT_USER_ID } from "../../db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const command = validateCreateFlashcardsCommand(body);

    // Create flashcard service instance
    const flashcardService = new FlashcardService(locals.supabase);

    // Create flashcards
    const createdFlashcards = await flashcardService.createFlashcards(command.flashcards, DEFAULT_USER_ID);

    return new Response(JSON.stringify(createdFlashcards), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error creating flashcards:", error);

    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
