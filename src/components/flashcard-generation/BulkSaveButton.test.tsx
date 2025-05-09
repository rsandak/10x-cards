import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BulkSaveButton } from "./BulkSaveButton";
import type { FlashcardCandidateDTO } from "../../types";

describe("BulkSaveButton", () => {
  const mockOnSave = vi.fn();
  const baseCandidate: FlashcardCandidateDTO = {
    front: "Test front",
    back: "Test back",
    source: "AI-full",
  };

  const createCandidates = (statuses: ("pending" | "accepted" | "edited" | "rejected")[]) => {
    return statuses.map((status) => ({
      ...baseCandidate,
      status,
    }));
  };

  beforeEach(() => {
    mockOnSave.mockClear();
  });

  it("should not render when candidates array is empty", () => {
    const { container } = render(<BulkSaveButton candidates={[]} generationId={1} onSave={mockOnSave} />);
    expect(container.firstChild).toBeNull();
  });

  it("should display correct count of selected flashcards", () => {
    const candidates = createCandidates(["accepted", "rejected", "edited", "pending"]);
    render(<BulkSaveButton candidates={candidates} generationId={1} onSave={mockOnSave} />);

    expect(screen.getByText("2 of 4 flashcards selected")).toBeInTheDocument();
  });

  it("should enable 'Save Selected' button only when there are accepted or edited cards", () => {
    const candidates = createCandidates(["pending", "rejected"]);
    render(<BulkSaveButton candidates={candidates} generationId={1} onSave={mockOnSave} />);

    const saveSelectedButton = screen.getByText("Save Selected (0)");
    expect(saveSelectedButton).toBeDisabled();
  });

  it("should show correct count for 'Save All' button", () => {
    const candidates = createCandidates(["pending", "accepted", "rejected", "edited"]);
    render(<BulkSaveButton candidates={candidates} generationId={1} onSave={mockOnSave} />);

    const saveAllButton = screen.getByText("Save All (3)");
    expect(saveAllButton).toBeInTheDocument();
  });

  it("should not show 'Save All' button when all cards are rejected", () => {
    const candidates = createCandidates(["rejected", "rejected"]);
    render(<BulkSaveButton candidates={candidates} generationId={1} onSave={mockOnSave} />);

    expect(screen.queryByText(/Save All/)).not.toBeInTheDocument();
  });

  it("should call onSave with correct parameters when buttons are clicked", async () => {
    const candidates = createCandidates(["accepted", "pending", "edited"]);
    render(<BulkSaveButton candidates={candidates} generationId={1} onSave={mockOnSave} />);

    // Test "Save All" button
    fireEvent.click(screen.getByText("Save All (3)"));
    expect(mockOnSave).toHaveBeenCalledWith(true);

    // Test "Save Selected" button
    fireEvent.click(screen.getByText("Save Selected (2)"));
    expect(mockOnSave).toHaveBeenCalledWith(false);
  });

  it("should disable both buttons when disabled prop is true", () => {
    const candidates = createCandidates(["accepted", "pending"]);
    render(<BulkSaveButton candidates={candidates} generationId={1} onSave={mockOnSave} disabled={true} />);

    const saveAllButton = screen.getByText("Save All (2)");
    const saveSelectedButton = screen.getByText("Save Selected (1)");

    expect(saveAllButton).toBeDisabled();
    expect(saveSelectedButton).toBeDisabled();
  });
});
