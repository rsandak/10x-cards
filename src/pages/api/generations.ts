import type { APIRoute } from "astro";
import { z } from "zod";
import type { GenerateFlashcardsCommand } from "../../types";
import { GenerationService } from "../../lib/services/generation.service";
import { OpenRouterService } from "../../lib/openrouter.service";
import { getOpenRouterConfig } from "../../lib/config/openrouter.config";
import { supabaseClient } from "../../db/supabase.client";

export const prerender = false;

// Validation schema for the request body
const generateFlashcardsSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Text must be at least 1000 characters long")
    .max(10000, "Text must not exceed 10000 characters"),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    if (!locals.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate request body
    const body = (await request.json()) as GenerateFlashcardsCommand;
    const validationResult = generateFlashcardsSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Initialize OpenRouter service with API key from environment
    const openRouter = new OpenRouterService(getOpenRouterConfig(import.meta.env.OPENROUTER_API_KEY));

    // Initialize generation service with OpenRouter
    const generationService = new GenerationService(supabaseClient, openRouter);
    const result = await generationService.generateFlashcards(body.source_text, locals.user.id);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing generation request:", error);

    // Log error to generation_error_logs table
    // TODO: Implement error logging

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
