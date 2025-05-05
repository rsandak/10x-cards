import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import type { FlashcardCandidateDTO } from "../../types";

interface FlashcardCandidateItemProps {
  candidate: FlashcardCandidateDTO & { status: "pending" | "accepted" | "edited" | "rejected" };
  onStatusChange: (status: "accepted" | "edited" | "rejected") => void;
  onEdit: (front: string, back: string) => void;
  disabled?: boolean;
}

export function FlashcardCandidateItem({
  candidate,
  onStatusChange,
  onEdit,
  disabled = false,
}: FlashcardCandidateItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [front, setFront] = useState(candidate.front);
  const [back, setBack] = useState(candidate.back);
  const [error, setError] = useState<string | null>(null);

  const validateEdit = () => {
    if (front.length > 200) {
      setError("Front text cannot exceed 200 characters");
      return false;
    }
    if (back.length > 500) {
      setError("Back text cannot exceed 500 characters");
      return false;
    }
    if (front.length === 0 || back.length === 0) {
      setError("Both front and back text are required");
      return false;
    }
    return true;
  };

  const handleSaveEdit = () => {
    if (validateEdit()) {
      onEdit(front, back);
      setIsEditing(false);
      setError(null);
      onStatusChange("edited");
    }
  };

  const handleCancelEdit = () => {
    setFront(candidate.front);
    setBack(candidate.back);
    setIsEditing(false);
    setError(null);
  };

  const getStatusBadge = () => {
    switch (candidate.status) {
      case "accepted":
        return <Badge variant="default">Accepted</Badge>;
      case "edited":
        return <Badge variant="secondary">Edited & Accepted</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className={candidate.status === "rejected" ? "opacity-50" : ""}>
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg">Flashcard</h3>
          {getStatusBadge()}
        </div>
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Textarea
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Front text"
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground mt-1">{front.length}/200 characters</p>
            </div>
            <div>
              <Textarea
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Back text"
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground mt-1">{back.length}/500 characters</p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        ) : (
          <>
            <div>
              <h3 className="font-semibold mb-2">Front</h3>
              <p className="text-sm">{candidate.front}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Back</h3>
              <p className="text-sm">{candidate.back}</p>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="gap-2">
        {isEditing ? (
          <>
            <Button onClick={handleSaveEdit} disabled={disabled}>
              Save
            </Button>
            <Button onClick={handleCancelEdit} variant="outline" disabled={disabled}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => onStatusChange("accepted")}
              variant="default"
              disabled={disabled || candidate.status === "accepted" || candidate.status === "edited"}
            >
              Accept
            </Button>
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              disabled={disabled || candidate.status === "rejected"}
            >
              Edit
            </Button>
            <Button
              onClick={() => onStatusChange("rejected")}
              variant="destructive"
              disabled={disabled || candidate.status === "rejected"}
            >
              Reject
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
