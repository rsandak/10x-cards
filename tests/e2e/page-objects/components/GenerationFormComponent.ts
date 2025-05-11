import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

export class GenerationFormComponent {
  readonly page: Page;
  readonly container: Locator;
  readonly sourceTextInput: Locator;
  readonly characterCount: Locator;
  readonly errorMessage: Locator;
  readonly generateButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('[data-test-id="flashcard-generation-form"]');
    this.sourceTextInput = page.locator('[data-test-id="source-text-input"]');
    this.characterCount = page.locator('[data-test-id="character-count"]');
    this.errorMessage = page.locator('[data-test-id="text-input-error"]');
    this.generateButton = page.locator('[data-test-id="generate-flashcards-button"]');
  }

  /**
   * Check if the form is loaded
   */
  async isLoaded() {
    await expect(this.container).toBeVisible();
    await expect(this.sourceTextInput).toBeVisible();
    await expect(this.generateButton).toBeVisible();
  }

  /**
   * Fill the source text field
   */
  async fillSourceText(text: string) {
    await this.sourceTextInput.fill(text);

    // Allow time for UI to update after text input
    await this.page.waitForTimeout(500);
  }

  /**
   * Get the character count in the source text
   */
  async getCharacterCount(): Promise<number> {
    const countText = (await this.characterCount.textContent()) || "0 / 10000 characters";
    const match = countText.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Check if the form has validation errors
   */
  async hasValidationError(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  /**
   * Get the validation error text
   */
  async getValidationErrorText(): Promise<string> {
    if (await this.hasValidationError()) {
      return (await this.errorMessage.textContent()) || "";
    }
    return "";
  }

  /**
   * Submit the form (click the generate button)
   */
  async submitForm() {
    await this.generateButton.click();
  }
}
