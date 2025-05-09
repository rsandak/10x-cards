import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FlashcardService } from "../flashcard.service";
import type { CreateFlashcardDTO, FlashcardDTO, CreateFlashcardsCommand, FlashcardSource } from "../../../types";
import type { SupabaseClient } from "../../../db/supabase.client";

// Mock Supabase client
vi.mock("../../../db/supabase.client", () => ({
  SupabaseClient: vi.fn(),
}));

describe("FlashcardService", () => {
  let flashcardService: FlashcardService;
  let mockSupabase: {
    from: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Create a mock Supabase client with the methods we need
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };

    // Create service with mock
    flashcardService = new FlashcardService(mockSupabase as unknown as SupabaseClient);

    // Spy on console methods
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("createFlashcards", () => {
    const userId = "test-user-id";
    const generationId = 123;

    const sampleFlashcards: CreateFlashcardDTO[] = [
      {
        front: "Test Front 1",
        back: "Test Back 1",
        source: "Manual" as FlashcardSource,
      },
      {
        front: "Test Front 2",
        back: "Test Back 2",
        source: "AI-full" as FlashcardSource,
        generationId: 123,
      },
    ];

    const command: CreateFlashcardsCommand = {
      flashcards: sampleFlashcards,
      generationId,
    };

    const dbResponse: Partial<FlashcardDTO>[] = [
      {
        id: 1,
        front: "Test Front 1",
        back: "Test Back 1",
        source: "Manual",
        user_id: userId,
        generation_id: generationId,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
      {
        id: 2,
        front: "Test Front 2",
        back: "Test Back 2",
        source: "AI-full",
        user_id: userId,
        generation_id: generationId,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    ] as FlashcardDTO[];

    it("should successfully create flashcards", async () => {
      // Arrange
      mockSupabase.select.mockResolvedValueOnce({ data: dbResponse, error: null });

      // Act
      const result = await flashcardService.createFlashcards(command, userId);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
      expect(mockSupabase.insert).toHaveBeenCalledWith([
        {
          front: "Test Front 1",
          back: "Test Back 1",
          source: "Manual",
          user_id: userId,
          generation_id: generationId,
        },
        {
          front: "Test Front 2",
          back: "Test Back 2",
          source: "AI-full",
          user_id: userId,
          generation_id: generationId,
        },
      ]);
      expect(result).toEqual(dbResponse);
      expect(console.log).toHaveBeenCalledWith(`Creating ${sampleFlashcards.length} flashcards for user ${userId}`);
      expect(console.log).toHaveBeenCalledWith(
        `Successfully created ${dbResponse.length} flashcards for user ${userId}`
      );
    });

    it("should throw error when database insert fails", async () => {
      // Arrange
      const dbError = { message: "Database error" };
      mockSupabase.select.mockResolvedValueOnce({ data: null, error: dbError });

      // Act & Assert
      await expect(flashcardService.createFlashcards(command, userId)).rejects.toThrow(
        `Failed to create flashcards: ${dbError.message}`
      );

      expect(console.error).toHaveBeenCalledWith(
        "Failed to create flashcards:",
        expect.objectContaining({
          error: dbError,
          userId,
          flashcardsCount: sampleFlashcards.length,
        })
      );
    });

    it("should throw error when no data is returned", async () => {
      // Arrange
      mockSupabase.select.mockResolvedValueOnce({ data: null, error: null });

      // Act & Assert
      await expect(flashcardService.createFlashcards(command, userId)).rejects.toThrow(
        "No data returned after creating flashcards"
      );

      expect(console.error).toHaveBeenCalledWith(
        "No data returned after creating flashcards:",
        expect.objectContaining({
          userId,
          flashcardsCount: sampleFlashcards.length,
        })
      );
    });

    it("should update generation stats for AI flashcards", async () => {
      // Arrange
      mockSupabase.select.mockResolvedValueOnce({ data: dbResponse, error: null });

      mockSupabase.single.mockResolvedValueOnce({
        data: { generated_count: 5 },
        error: null,
      });

      mockSupabase.update.mockResolvedValueOnce({ error: null });

      const aiFlashcards: CreateFlashcardDTO[] = [
        {
          front: "AI Front",
          back: "AI Back",
          source: "AI-full" as FlashcardSource,
        },
        {
          front: "AI Edited Front",
          back: "AI Edited Back",
          source: "AI-edited" as FlashcardSource,
        },
      ];

      const aiCommand: CreateFlashcardsCommand = {
        flashcards: aiFlashcards,
        generationId,
      };

      // Act
      await flashcardService.createFlashcards(aiCommand, userId);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
      expect(mockSupabase.from).toHaveBeenCalledWith("generations");

      expect(mockSupabase.eq).toHaveBeenCalledWith("id", generationId);

      expect(mockSupabase.select).toHaveBeenCalledWith("generated_count");

      expect(mockSupabase.update).toHaveBeenCalledWith({
        accepted_unedited_count: 1,
        accepted_edited_count: 1,
        unaccepted_count: 3,
      });
    });

    it("should handle errors during generation stats update", async () => {
      // Arrange
      mockSupabase.select.mockResolvedValueOnce({ data: dbResponse, error: null });

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Generation not found" },
      });

      const aiFlashcards: CreateFlashcardDTO[] = [
        {
          front: "AI Front",
          back: "AI Back",
          source: "AI-full" as FlashcardSource,
        },
      ];

      const aiCommand: CreateFlashcardsCommand = {
        flashcards: aiFlashcards,
        generationId,
      };

      // Act - to nie powinno rzucić błędu, ponieważ obsługa błędu updateGenerationStats
      // jest wewnętrznie obsługiwana i nie wpływa na główny proces tworzenia fiszek
      const result = await flashcardService.createFlashcards(aiCommand, userId);

      // Assert
      // Sprawdzamy czy fiszki zostały utworzone pomimo błędu w aktualizacji statystyk
      expect(result).toEqual(dbResponse);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to get generation"),
        expect.anything()
      );
      // Sprawdzamy czy nie próbowano aktualizować statystyk
      expect(mockSupabase.update).not.toHaveBeenCalled();
    });
  });
});
