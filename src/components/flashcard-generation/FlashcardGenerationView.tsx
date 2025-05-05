"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import type {
  GenerateFlashcardsCommand,
  GenerateFlashcardsResponseDTO,
  FlashcardCandidateDTO,
  CreateFlashcardsCommand,
  CreateFlashcardDTO,
} from "../../types";
import { GenerationForm, type GenerationFormRef } from "./GenerationForm";
import { LoadingIndicator } from "../ui/loading-indicator";
import { Alert, AlertDescription } from "../ui/alert";
import { FlashcardCandidatesList } from "./FlashcardCandidatesList";
import { BulkSaveButton } from "./BulkSaveButton";

interface FlashcardCandidateViewModel extends FlashcardCandidateDTO {
  status: "pending" | "accepted" | "edited" | "rejected";
}

export default function FlashcardGenerationView() {
  const formRef = useRef<GenerationFormRef>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<FlashcardCandidateViewModel[]>([]);
  const [generationId, setGenerationId] = useState<number | null>(null);

  const handleGenerateFlashcards = async (command: GenerateFlashcardsCommand) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await fetch("/api/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error("Failed to generate flashcards. Please try again.");
      }

      const data: GenerateFlashcardsResponseDTO = await response.json();
      setGenerationId(data.generationId);

      // Convert FlashcardCandidateDTO[] to FlashcardCandidateViewModel[]
      const candidatesWithStatus = data.flashcardCandidates.map((candidate) => ({
        ...candidate,
        status: "pending" as const,
      }));

      setCandidates(candidatesWithStatus);
      toast.success(`Successfully generated ${data.flashcardCandidates.length} flashcards`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
      toast.error("Failed to generate flashcards");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCandidateStatusChange = (index: number, status: "accepted" | "edited" | "rejected") => {
    setCandidates((prev) => prev.map((candidate, i) => (i === index ? { ...candidate, status } : candidate)));
  };

  const handleCandidateEdit = (index: number, front: string, back: string) => {
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

  const handleSave = async (saveAll: boolean) => {
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
        .map(
          (candidate) =>
            ({
              front: candidate.front,
              back: candidate.back,
              source: candidate.status === "edited" ? "AI-edited" : "AI-full",
              generationId,
            }) as CreateFlashcardDTO
        );

      const command: CreateFlashcardsCommand = {
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

      toast.success(`Successfully saved ${flashcardsToSave.length} flashcards`);

      // Clear the form after successful save
      formRef.current?.reset();
      setCandidates([]);
      setGenerationId(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
      toast.error("Failed to save flashcards");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <GenerationForm ref={formRef} onSubmit={handleGenerateFlashcards} isLoading={isLoading} />

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {isLoading && <LoadingIndicator />}

      <FlashcardCandidatesList
        candidates={candidates}
        onCandidateStatusChange={handleCandidateStatusChange}
        onCandidateEdit={handleCandidateEdit}
        isLoading={isLoading}
      />

      {candidates.length > 0 && generationId && (
        <BulkSaveButton candidates={candidates} generationId={generationId} onSave={handleSave} disabled={isLoading} />
      )}
    </div>
  );
}
