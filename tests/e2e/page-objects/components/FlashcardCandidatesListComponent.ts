import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";
import { FlashcardCandidateComponent } from "./FlashcardCandidateComponent";

export class FlashcardCandidatesListComponent {
  readonly page: Page;
  readonly container: Locator;
  readonly selectedCounter: Locator;
  readonly candidatesGrid: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('[data-test-id="flashcard-candidates-list"]');
    this.selectedCounter = page.locator('[data-test-id="selected-flashcards-counter"]');
    this.candidatesGrid = page.locator('[data-test-id="flashcard-candidates-grid"]');
  }

  /**
   * Check if the list is loaded
   */
  async isLoaded() {
    await expect(this.container).toBeVisible();
    await expect(this.candidatesGrid).toBeVisible();
  }

  /**
   * Get the number of selected candidates
   */
  async getSelectedCount(): Promise<{ selected: number; total: number }> {
    const text = (await this.selectedCounter.textContent()) || "0 of 0 selected";
    const match = text.match(/(\d+) of (\d+)/);
    if (match) {
      return {
        selected: parseInt(match[1], 10),
        total: parseInt(match[2], 10),
      };
    }
    return { selected: 0, total: 0 };
  }

  /**
   * Get all candidates as components
   */
  async getAllCandidates() {
    await this.isLoaded();

    const count = await this.getCandidateCount();
    const candidates: FlashcardCandidateComponent[] = [];

    for (let i = 0; i < count; i++) {
      candidates.push(new FlashcardCandidateComponent(this.page, i));
    }

    return candidates;
  }

  /**
   * Get the number of flashcard candidates
   */
  async getCandidateCount(): Promise<number> {
    await this.isLoaded();
    return await this.page.locator('[data-test-id^="flashcard-candidate-"]').count();
  }

  /**
   * Accept all flashcards
   */
  async acceptAllFlashcards() {
    const candidates = await this.getAllCandidates();
    for (const candidate of candidates) {
      await candidate.accept();
    }
  }

  /**
   * Accept a specific flashcard by index
   */
  async acceptFlashcard(index: number) {
    const candidate = new FlashcardCandidateComponent(this.page, index);
    await candidate.accept();
  }

  /**
   * Edit the flashcard at the specified index
   */
  async editFlashcard(index: number, front: string, back: string) {
    const candidate = new FlashcardCandidateComponent(this.page, index);
    await candidate.edit(front, back);
  }

  /**
   * Reject the flashcard at the specified index
   */
  async rejectFlashcard(index: number) {
    const candidate = new FlashcardCandidateComponent(this.page, index);
    await candidate.reject();
  }
}
