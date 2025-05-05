import { Button } from "../ui/button";
import type { FlashcardCandidateDTO } from "../../types";

interface BulkSaveButtonProps {
  candidates: (FlashcardCandidateDTO & {
    status: "pending" | "accepted" | "edited" | "rejected";
  })[];
  generationId: number;
  onSave: (saveAll: boolean) => Promise<void>;
  disabled?: boolean;
}

export function BulkSaveButton({ candidates, generationId, onSave, disabled = false }: BulkSaveButtonProps) {
  const acceptedCount = candidates.filter((c) => c.status === "accepted" || c.status === "edited").length;
  const hasAccepted = acceptedCount > 0;
  const hasNonRejected = candidates.some((c) => c.status !== "rejected");

  if (candidates.length === 0) {
    return null;
  }

  const nonRejectedCount = candidates.filter((c) => c.status !== "rejected").length;

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">
          {acceptedCount} of {candidates.length} flashcards selected
        </p>
      </div>
      <div className="flex gap-4">
        {hasNonRejected && (
          <Button variant="outline" onClick={() => onSave(true)} disabled={disabled || nonRejectedCount === 0}>
            Save All ({nonRejectedCount})
          </Button>
        )}
        <Button variant="default" onClick={() => onSave(false)} disabled={disabled || !hasAccepted}>
          Save Selected ({acceptedCount})
        </Button>
      </div>
    </div>
  );
}
