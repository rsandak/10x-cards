import type { FlashcardCandidateDTO } from "../../types";
import { FlashcardCandidateItem } from "./FlashcardCandidateItem";

interface FlashcardCandidatesListProps {
  candidates: (FlashcardCandidateDTO & {
    status: "pending" | "accepted" | "edited" | "rejected";
  })[];
  onCandidateStatusChange: (index: number, status: "accepted" | "edited" | "rejected") => void;
  onCandidateEdit: (index: number, front: string, back: string) => void;
  isLoading?: boolean;
}

export function FlashcardCandidatesList({
  candidates,
  onCandidateStatusChange,
  onCandidateEdit,
  isLoading = false,
}: FlashcardCandidatesListProps) {
  if (candidates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Generated Flashcards</h2>
        <p className="text-sm text-muted-foreground">
          {candidates.filter((c) => c.status === "accepted" || c.status === "edited").length} of {candidates.length}{" "}
          selected
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {candidates.map((candidate, index) => (
          <FlashcardCandidateItem
            key={index}
            candidate={candidate}
            onStatusChange={(status) => onCandidateStatusChange(index, status)}
            onEdit={(front, back) => onCandidateEdit(index, front, back)}
            disabled={isLoading}
          />
        ))}
      </div>
    </div>
  );
}
