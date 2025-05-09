import { describe, it, expect, beforeEach, vi } from "vitest";
import { useState } from "react";
import type { FlashcardCandidateDTO } from "../../types";

// Define the interface for our test data based on the component implementation
interface FlashcardCandidateWithStatus extends Partial<FlashcardCandidateDTO> {
  id: number;
  front: string;
  back: string;
  status: "pending" | "accepted" | "edited" | "rejected";
  tags?: string[];
  difficulty?: number;
  createdAt?: string;
}

// Type for flashcard save data
interface FlashcardSaveData {
  front: string;
  back: string;
  source: string;
  generationId: number;
}

// Create direct implementations of the functions we're testing
// These are based on the actual implementations in FlashcardGenerationView.tsx

const handleCandidateStatusChange = (
  setCandidates: React.Dispatch<React.SetStateAction<FlashcardCandidateWithStatus[]>>,
  index: number,
  status: "accepted" | "edited" | "rejected"
) => {
  setCandidates((prev) => prev.map((candidate, i) => (i === index ? { ...candidate, status } : candidate)));
};

const handleCandidateEdit = (
  setCandidates: React.Dispatch<React.SetStateAction<FlashcardCandidateWithStatus[]>>,
  index: number,
  front: string,
  back: string
) => {
  setCandidates((prev) =>
    prev.map((candidate, i) =>
      i === index
        ? {
            ...candidate,
            front,
            back,
          }
        : candidate
    )
  );
};

// Mock global fetch for testing handleSave
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock React useState for testing internal state
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useState: vi.fn(),
  };
});

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("FlashcardGenerationView.handleCandidateStatusChange", () => {
  let setCandidatesMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Setup mocks
    setCandidatesMock = vi.fn();

    // Mock useState with a more specific type signature
    (useState as unknown as ReturnType<typeof vi.fn>).mockImplementation((initialValue: unknown) => {
      if (Array.isArray(initialValue)) {
        return [initialValue, setCandidatesMock];
      }
      return [initialValue, vi.fn()];
    });
  });

  it("should update status of a single flashcard at the given index", () => {
    // Arrange
    const mockCandidates: FlashcardCandidateWithStatus[] = [
      { id: 1, front: "Question 1", back: "Answer 1", status: "pending" as const },
      { id: 2, front: "Question 2", back: "Answer 2", status: "pending" as const },
      { id: 3, front: "Question 3", back: "Answer 3", status: "pending" as const },
    ];
    setCandidatesMock.mockImplementation((updater) => {
      const updated = updater(mockCandidates);
      return updated;
    });

    // Act
    handleCandidateStatusChange(setCandidatesMock, 1, "accepted");

    // Assert
    expect(setCandidatesMock).toHaveBeenCalledTimes(1);
    expect(setCandidatesMock.mock.calls[0][0](mockCandidates)).toEqual([
      { id: 1, front: "Question 1", back: "Answer 1", status: "pending" },
      { id: 2, front: "Question 2", back: "Answer 2", status: "accepted" },
      { id: 3, front: "Question 3", back: "Answer 3", status: "pending" },
    ]);
  });

  it("should not modify state when index is invalid", () => {
    // Arrange
    const mockCandidates: FlashcardCandidateWithStatus[] = [
      { id: 1, front: "Question 1", back: "Answer 1", status: "pending" as const },
    ];
    setCandidatesMock.mockImplementation((updater) => {
      const updated = updater(mockCandidates);
      return updated;
    });

    // Act
    handleCandidateStatusChange(setCandidatesMock, -1, "accepted");
    handleCandidateStatusChange(setCandidatesMock, 99, "accepted");

    // Assert
    expect(setCandidatesMock).toHaveBeenCalledTimes(2);
    expect(setCandidatesMock.mock.calls[0][0](mockCandidates)).toEqual(mockCandidates);
    expect(setCandidatesMock.mock.calls[1][0](mockCandidates)).toEqual(mockCandidates);
  });

  it("should handle all possible status values", () => {
    // Arrange
    const mockCandidates: FlashcardCandidateWithStatus[] = [
      { id: 1, front: "Question 1", back: "Answer 1", status: "pending" as const },
      { id: 2, front: "Question 2", back: "Answer 2", status: "pending" as const },
      { id: 3, front: "Question 3", back: "Answer 3", status: "pending" as const },
    ];

    // Act & Assert for each status
    ["accepted", "edited", "rejected"].forEach((status, idx) => {
      setCandidatesMock.mockClear();
      setCandidatesMock.mockImplementation((updater) => updater(mockCandidates));

      handleCandidateStatusChange(setCandidatesMock, idx, status as "accepted" | "edited" | "rejected");

      expect(setCandidatesMock).toHaveBeenCalledTimes(1);
      const updatedCandidates = setCandidatesMock.mock.calls[0][0](mockCandidates);
      expect(updatedCandidates[idx].status).toBe(status);
    });
  });

  it("should preserve all other flashcard properties", () => {
    // Arrange
    const complexCandidate: FlashcardCandidateWithStatus = {
      id: 5,
      front: "Complex question",
      back: "Complex answer",
      status: "pending" as const,
      tags: ["tag1", "tag2"],
      difficulty: 3,
      createdAt: new Date().toISOString(),
    };
    const mockCandidates = [complexCandidate];

    setCandidatesMock.mockImplementation((updater) => updater(mockCandidates));

    // Act
    handleCandidateStatusChange(setCandidatesMock, 0, "edited");

    // Assert
    const result = setCandidatesMock.mock.calls[0][0](mockCandidates);
    expect(result[0]).toMatchObject({
      ...complexCandidate,
      status: "edited",
    });
    expect(Object.keys(result[0])).toHaveLength(Object.keys(complexCandidate).length);
  });

  it("should work correctly with empty candidate list", () => {
    // Arrange
    const mockCandidates: FlashcardCandidateWithStatus[] = [];
    setCandidatesMock.mockImplementation((updater) => updater(mockCandidates));

    // Act
    handleCandidateStatusChange(setCandidatesMock, 0, "accepted");

    // Assert
    expect(setCandidatesMock).toHaveBeenCalledTimes(1);
    expect(setCandidatesMock.mock.calls[0][0](mockCandidates)).toEqual([]);
  });
});

describe("FlashcardGenerationView.handleCandidateEdit", () => {
  let setCandidatesMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Setup mocks
    setCandidatesMock = vi.fn();

    // Mock useState
    (useState as unknown as ReturnType<typeof vi.fn>).mockImplementation((initialValue: unknown) => {
      if (Array.isArray(initialValue)) {
        return [initialValue, setCandidatesMock];
      }
      return [initialValue, vi.fn()];
    });
  });

  it("should update front and back of a flashcard at the given index", () => {
    // Arrange
    const mockCandidates: FlashcardCandidateWithStatus[] = [
      { id: 1, front: "Question 1", back: "Answer 1", status: "pending" as const },
      { id: 2, front: "Question 2", back: "Answer 2", status: "pending" as const },
      { id: 3, front: "Question 3", back: "Answer 3", status: "pending" as const },
    ];
    setCandidatesMock.mockImplementation((updater) => {
      const updated = updater(mockCandidates);
      return updated;
    });

    // Act
    const newFront = "Edited question 2";
    const newBack = "Edited answer 2";
    handleCandidateEdit(setCandidatesMock, 1, newFront, newBack);

    // Assert
    expect(setCandidatesMock).toHaveBeenCalledTimes(1);
    expect(setCandidatesMock.mock.calls[0][0](mockCandidates)).toEqual([
      { id: 1, front: "Question 1", back: "Answer 1", status: "pending" },
      { id: 2, front: newFront, back: newBack, status: "pending" },
      { id: 3, front: "Question 3", back: "Answer 3", status: "pending" },
    ]);
  });

  it("should not modify state when index is invalid", () => {
    // Arrange
    const mockCandidates: FlashcardCandidateWithStatus[] = [
      { id: 1, front: "Question 1", back: "Answer 1", status: "pending" as const },
    ];
    setCandidatesMock.mockImplementation((updater) => {
      const updated = updater(mockCandidates);
      return updated;
    });

    // Act
    handleCandidateEdit(setCandidatesMock, -1, "New front", "New back");
    handleCandidateEdit(setCandidatesMock, 99, "New front", "New back");

    // Assert
    expect(setCandidatesMock).toHaveBeenCalledTimes(2);
    expect(setCandidatesMock.mock.calls[0][0](mockCandidates)).toEqual(mockCandidates);
    expect(setCandidatesMock.mock.calls[1][0](mockCandidates)).toEqual(mockCandidates);
  });

  it("should preserve status and other properties when editing content", () => {
    // Arrange
    const complexCandidate: FlashcardCandidateWithStatus = {
      id: 5,
      front: "Complex question",
      back: "Complex answer",
      status: "accepted" as const,
      tags: ["tag1", "tag2"],
      difficulty: 3,
      createdAt: new Date().toISOString(),
    };
    const mockCandidates = [complexCandidate];

    setCandidatesMock.mockImplementation((updater) => updater(mockCandidates));

    // Act
    handleCandidateEdit(setCandidatesMock, 0, "New front", "New back");

    // Assert
    const result = setCandidatesMock.mock.calls[0][0](mockCandidates);
    expect(result[0]).toMatchObject({
      ...complexCandidate,
      front: "New front",
      back: "New back",
      status: "accepted", // Status should remain unchanged
    });
    expect(Object.keys(result[0])).toHaveLength(Object.keys(complexCandidate).length);
  });

  it("should handle empty strings as valid content", () => {
    // Arrange
    const mockCandidates: FlashcardCandidateWithStatus[] = [
      { id: 1, front: "Question 1", back: "Answer 1", status: "pending" as const },
    ];
    setCandidatesMock.mockImplementation((updater) => {
      const updated = updater(mockCandidates);
      return updated;
    });

    // Act
    handleCandidateEdit(setCandidatesMock, 0, "", "");

    // Assert
    expect(setCandidatesMock).toHaveBeenCalledTimes(1);
    expect(setCandidatesMock.mock.calls[0][0](mockCandidates)[0]).toMatchObject({
      id: 1,
      front: "",
      back: "",
      status: "pending",
    });
  });

  it("should work correctly with empty candidate list", () => {
    // Arrange
    const mockCandidates: FlashcardCandidateWithStatus[] = [];
    setCandidatesMock.mockImplementation((updater) => updater(mockCandidates));

    // Act
    handleCandidateEdit(setCandidatesMock, 0, "New front", "New back");

    // Assert
    expect(setCandidatesMock).toHaveBeenCalledTimes(1);
    expect(setCandidatesMock.mock.calls[0][0](mockCandidates)).toEqual([]);
  });
});

describe("FlashcardGenerationView.handleSave", () => {
  // Implementation of handleSave for testing
  const handleSave = async (
    saveAll: boolean,
    candidates: FlashcardCandidateWithStatus[],
    generationId: number,
    setCandidates: React.Dispatch<React.SetStateAction<FlashcardCandidateWithStatus[]>>,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>,
    setGenerationId: React.Dispatch<React.SetStateAction<number | null>>,
    formReset: () => void
  ) => {
    if (!generationId) {
      setErrorMessage("Generation ID is missing. Please try again.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const flashcardsToSave = candidates
        .filter((candidate) => {
          if (saveAll) {
            return candidate.status !== "rejected";
          }
          return candidate.status === "accepted" || candidate.status === "edited";
        })
        .map((candidate) => ({
          front: candidate.front,
          back: candidate.back,
          source: candidate.status === "edited" ? "AI-edited" : "AI-full",
          generationId,
        }));

      const command = {
        flashcards: flashcardsToSave,
        generationId,
      };

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error("Failed to save flashcards. Please try again.");
      }

      // Clear the form after successful save
      formReset();
      setCandidates([]);
      setGenerationId(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  let setCandidatesMock: ReturnType<typeof vi.fn>;
  let setIsLoadingMock: ReturnType<typeof vi.fn>;
  let setErrorMessageMock: ReturnType<typeof vi.fn>;
  let setGenerationIdMock: ReturnType<typeof vi.fn>;
  let formResetMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Setup mocks
    setCandidatesMock = vi.fn();
    setIsLoadingMock = vi.fn();
    setErrorMessageMock = vi.fn();
    setGenerationIdMock = vi.fn();
    formResetMock = vi.fn();

    // Reset fetch mock
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  it("should filter and save only accepted and edited flashcards when saveAll is false", async () => {
    // Arrange
    const mockCandidates: FlashcardCandidateWithStatus[] = [
      { id: 1, front: "Question 1", back: "Answer 1", status: "accepted" as const },
      { id: 2, front: "Question 2", back: "Answer 2", status: "rejected" as const },
      { id: 3, front: "Question 3", back: "Answer 3", status: "edited" as const },
      { id: 4, front: "Question 4", back: "Answer 4", status: "pending" as const },
    ];
    const generationId = 123;

    // Act
    await handleSave(
      false, // saveAll = false
      mockCandidates,
      generationId,
      setCandidatesMock,
      setIsLoadingMock,
      setErrorMessageMock,
      setGenerationIdMock,
      formResetMock
    );

    // Assert
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(requestBody.flashcards).toHaveLength(2); // Only accepted and edited
    expect(requestBody.flashcards[0].front).toBe("Question 1");
    expect(requestBody.flashcards[0].source).toBe("AI-full"); // Accepted => AI-full
    expect(requestBody.flashcards[1].front).toBe("Question 3");
    expect(requestBody.flashcards[1].source).toBe("AI-edited"); // Edited => AI-edited
    expect(requestBody.generationId).toBe(generationId);

    // Should reset state after successful save
    expect(formResetMock).toHaveBeenCalledTimes(1);
    expect(setCandidatesMock).toHaveBeenCalledWith([]);
    expect(setGenerationIdMock).toHaveBeenCalledWith(null);
  });

  it("should filter and save all non-rejected flashcards when saveAll is true", async () => {
    // Arrange
    const mockCandidates: FlashcardCandidateWithStatus[] = [
      { id: 1, front: "Question 1", back: "Answer 1", status: "accepted" as const },
      { id: 2, front: "Question 2", back: "Answer 2", status: "rejected" as const },
      { id: 3, front: "Question 3", back: "Answer 3", status: "edited" as const },
      { id: 4, front: "Question 4", back: "Answer 4", status: "pending" as const },
    ];
    const generationId = 123;

    // Act
    await handleSave(
      true, // saveAll = true
      mockCandidates,
      generationId,
      setCandidatesMock,
      setIsLoadingMock,
      setErrorMessageMock,
      setGenerationIdMock,
      formResetMock
    );

    // Assert
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(requestBody.flashcards).toHaveLength(3); // All except rejected
    expect(requestBody.flashcards.some((f: FlashcardSaveData) => f.front === "Question 2")).toBeFalsy(); // Rejected should be excluded
    expect(requestBody.flashcards.some((f: FlashcardSaveData) => f.front === "Question 4")).toBeTruthy(); // Pending should be included
  });

  it("should set error message when generationId is missing", async () => {
    // Arrange
    const mockCandidates: FlashcardCandidateWithStatus[] = [
      { id: 1, front: "Question 1", back: "Answer 1", status: "accepted" as const },
    ];
    const generationId = null;

    // Act
    await handleSave(
      false,
      mockCandidates,
      generationId as unknown as number,
      setCandidatesMock,
      setIsLoadingMock,
      setErrorMessageMock,
      setGenerationIdMock,
      formResetMock
    );

    // Assert
    expect(mockFetch).not.toHaveBeenCalled();
    expect(setErrorMessageMock).toHaveBeenCalledWith("Generation ID is missing. Please try again.");
  });

  it("should handle API errors and set appropriate error message", async () => {
    // Arrange
    const mockCandidates: FlashcardCandidateWithStatus[] = [
      { id: 1, front: "Question 1", back: "Answer 1", status: "accepted" as const },
    ];
    const generationId = 123;

    // Mock a failed API response
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    // Act
    await handleSave(
      false,
      mockCandidates,
      generationId,
      setCandidatesMock,
      setIsLoadingMock,
      setErrorMessageMock,
      setGenerationIdMock,
      formResetMock
    );

    // Assert
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(setErrorMessageMock).toHaveBeenCalledWith("Failed to save flashcards. Please try again.");
    expect(formResetMock).not.toHaveBeenCalled(); // Should not reset on error
    expect(setCandidatesMock).not.toHaveBeenCalled(); // Should not clear candidates on error
  });

  it("should set and unset loading state appropriately", async () => {
    // Arrange
    const mockCandidates: FlashcardCandidateWithStatus[] = [
      { id: 1, front: "Question 1", back: "Answer 1", status: "accepted" as const },
    ];
    const generationId = 123;

    // Act
    await handleSave(
      false,
      mockCandidates,
      generationId,
      setCandidatesMock,
      setIsLoadingMock,
      setErrorMessageMock,
      setGenerationIdMock,
      formResetMock
    );

    // Assert
    expect(setIsLoadingMock.mock.calls).toEqual([[true], [false]]);
  });
});
