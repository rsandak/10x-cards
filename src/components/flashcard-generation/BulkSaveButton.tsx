import { Button } from "../ui/button";
import type { FlashcardCandidateDTO } from "../../types";

interface BulkSaveButtonProps {
  candidates: (FlashcardCandidateDTO & {
    status: "pending" | "accepted" | "edited" | "rejected";
  })[];
  generationId: number;
  onSave: (saveAll: boolean) => Promise<void>;
  disabled?: boolean;
  "data-test-id"?: string;
}

export function BulkSaveButton({
  candidates,
  onSave,
  disabled = false,
  "data-test-id": dataTestId,
}: BulkSaveButtonProps) {
  const acceptedCount = candidates.filter((c) => c.status === "accepted" || c.status === "edited").length;
  const hasAccepted = acceptedCount > 0;
  const hasNonRejected = candidates.some((c) => c.status !== "rejected");

  if (candidates.length === 0) {
    return null;
  }

  const nonRejectedCount = candidates.filter((c) => c.status !== "rejected").length;

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center" data-test-id={dataTestId}>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground" data-test-id="bulk-save-counter">
          {acceptedCount} of {candidates.length} flashcards selected
        </p>
      </div>
      <div className="flex gap-4">
        {hasNonRejected && (
          <Button
            variant="outline"
            onClick={() => onSave(true)}
            disabled={disabled || nonRejectedCount === 0}
            data-test-id="save-all-button"
          >
            Save All ({nonRejectedCount})
          </Button>
        )}
        <Button
          variant="default"
          onClick={() => onSave(false)}
          disabled={disabled || !hasAccepted}
          data-test-id="save-selected-button"
        >
          Save Selected ({acceptedCount})
        </Button>
      </div>
    </div>
  );
}
