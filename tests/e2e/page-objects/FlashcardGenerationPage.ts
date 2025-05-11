import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";
import { GenerationFormComponent } from "./components/GenerationFormComponent";
import { FlashcardCandidatesListComponent } from "./components/FlashcardCandidatesListComponent";
import { BulkSaveComponent } from "./components/BulkSaveComponent";

export class FlashcardGenerationPage {
  readonly page: Page;
  readonly container: Locator;
  readonly errorAlert: Locator;
  readonly errorMessage: Locator;
  readonly loadingIndicator: Locator;

  // Components
  readonly generationForm: GenerationFormComponent;
  readonly candidatesList: FlashcardCandidatesListComponent;
  readonly bulkSave: BulkSaveComponent;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('[data-test-id="flashcard-generation-container"]');
    this.errorAlert = page.locator('[data-test-id="generation-error-alert"]');
    this.errorMessage = page.locator('[data-test-id="generation-error-message"]');
    this.loadingIndicator = page.locator('[data-test-id="generation-loading-indicator"]');

    // Component initialization
    this.generationForm = new GenerationFormComponent(page);
    this.candidatesList = new FlashcardCandidatesListComponent(page);
    this.bulkSave = new BulkSaveComponent(page);
  }

  /**
   * Navigate to the flashcard generation page
   */
  async goto() {
    await this.page.goto("/generate");
    await this.container.waitFor({ state: "visible" });
  }

  /**
   * Check if the page is loaded
   */
  async isLoaded() {
    await expect(this.container).toBeVisible();
    await this.generationForm.isLoaded();
  }

  /**
   * Generate flashcards based on the provided text
   */
  async generateFlashcards(text: string) {
    await this.generationForm.fillSourceText(text);
    await this.generationForm.submitForm();
    await this.waitForGenerationComplete();
  }

  /**
   * Wait for the generation process to complete
   */
  async waitForGenerationComplete() {
    // First, the loading indicator should appear
    await expect(this.loadingIndicator).toBeVisible();

    // Then, the loading indicator should disappear
    await expect(this.loadingIndicator).toBeHidden({ timeout: 30000 });

    // After generation is complete, the candidate list should appear
    // or an error message
    const hasError = await this.errorAlert.isVisible();
    if (!hasError) {
      await this.candidatesList.isLoaded();
    }
  }

  /**
   * Check if a generation error occurred
   */
  async hasGenerationError(): Promise<boolean> {
    return await this.errorAlert.isVisible();
  }

  /**
   * Get the generation error message text
   */
  async getErrorMessage(): Promise<string> {
    if (await this.hasGenerationError()) {
      return (await this.errorMessage.textContent()) || "";
    }
    return "";
  }

  /**
   * Save all flashcards
   */
  async saveAllFlashcards() {
    await this.bulkSave.saveAll();
    await this.waitForSaveComplete();
  }

  /**
   * Save only selected flashcards
   */
  async saveSelectedFlashcards() {
    await this.bulkSave.saveSelected();
    await this.waitForSaveComplete();
  }

  /**
   * Wait for the save process to complete
   */
  private async waitForSaveComplete() {
    // First, the loading indicator should appear
    await expect(this.loadingIndicator).toBeVisible();

    // Then, the loading indicator should disappear
    await expect(this.loadingIndicator).toBeHidden({ timeout: 10000 });

    // After saving is complete, the candidate list should disappear
    // or an error message should appear
    const hasError = await this.errorAlert.isVisible();
    if (!hasError) {
      await expect(this.candidatesList.container).toBeHidden();
    }
  }
}
