/*
 DTO and Command Model definitions for the API endpoints.
 Based on the database models defined in src/db/database.types.ts and the API plan.
*/

import type { Database } from "./db/database.types";

// ----------------------------------------------------------------------
// Database Record Aliases
// Define aliases for database records to ensure consistency across the application.
// ----------------------------------------------------------------------
export type Generation = Database["public"]["Tables"]["generations"]["Row"];
export type Flashcard = Database["public"]["Tables"]["flashcards"]["Row"];
export type GenerationErrorLog = Database["public"]["Tables"]["generation_error_logs"]["Row"];

// Enumerated types from the database
export type FlashcardSource = "AI-full" | "Manual" | "AI-edited";

// =======================================================
// Generations
// =======================================================

// GenerationDTO corresponds to the generation record in the database
export type GenerationDTO = Generation;

// Command model for creating a new generation via POST /generations
// The 'source_text' must be between 1000 and 10000 characters.
export interface GenerateFlashcardsCommand {
  source_text: string;
}

// DTO returned from POST /generations endpoint
export interface GenerateFlashcardsResponseDTO {
  generationId: number;
  totalGenerated: number; // total count of generated flashcards
  flashcardCandidates: FlashcardCandidateDTO[];
}

// Flashcard candidate extracted from a generation process
// Only includes the necessary properties for client review.
export interface FlashcardCandidateDTO {
  front: string;
  back: string;
  // This should be "AI-full" as per API plan
  source: "AI-full";
}

// =======================================================
// Flashcards
// =======================================================

// FlashcardDTO corresponds to the flashcard record in the database
export type FlashcardDTO = Flashcard;

// Command model for creating a flashcard via POST /flashcards
// Each flashcard must have front and back text with length validations and a valid source.
export interface CreateFlashcardDTO {
  // Front text, 1-200 characters
  front: string;
  // Back text, 1-500 characters
  back: string;
  // Source must be one of: "Manual", "AI-full", or "AI-edited"
  source: FlashcardSource;
  // Optional generationId, required if flashcard is AI-generated (i.e. source is "AI-full" or "AI-edited")
  generationId?: number;
}

export interface CreateFlashcardsCommand {
  flashcards: CreateFlashcardDTO[]; // Must contain at least one flashcard
}

// Command model for updating a flashcard via PUT /flashcards/{id}
// At least one field (front or back) must be provided
export interface UpdateFlashcardCommand {
  front?: string;
  back?: string;
  // Note: Runtime validation should ensure at least one field is provided.
}

// =======================================================
// Generation Error Logs
// =======================================================

// GenerationErrorLogDTO corresponds to an error log record in the database
export type GenerationErrorLogDTO = GenerationErrorLog;

// =======================================================
// Pagination Types
// =======================================================

export interface PaginationParams {
  limit: number;
  offset: number;
}

export interface PaginationMeta {
  limit: number;
  offset: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
