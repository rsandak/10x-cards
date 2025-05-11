import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

export class BulkSaveComponent {
  readonly page: Page;
  readonly container: Locator;
  readonly saveCounter: Locator;
  readonly saveAllButton: Locator;
  readonly saveSelectedButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('[data-test-id="bulk-save-button"]');
    this.saveCounter = page.locator('[data-test-id="bulk-save-counter"]');
    this.saveAllButton = page.locator('[data-test-id="save-all-button"]');
    this.saveSelectedButton = page.locator('[data-test-id="save-selected-button"]');
  }

  /**
   * Check if the component is loaded
   */
  async isLoaded() {
    await expect(this.container).toBeVisible();
  }

  /**
   * Check if the component is enabled
   */
  async isEnabled() {
    const isAllEnabled = await this.saveAllButton.isEnabled();
    const isSelectedEnabled = await this.saveSelectedButton.isEnabled();
    return isAllEnabled || isSelectedEnabled;
  }

  /**
   * Get the save counter
   */
  async getSaveCount(): Promise<{ selected: number; total: number }> {
    const text = (await this.saveCounter.textContent()) || "0 of 0 flashcards selected";
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
   * Save all flashcards
   */
  async saveAll() {
    await this.isLoaded();

    // Check if the button is visible and enabled
    const isVisible = await this.saveAllButton.isVisible();
    if (!isVisible) {
      throw new Error("Save All button is not visible");
    }

    const isEnabled = await this.saveAllButton.isEnabled();
    if (!isEnabled) {
      throw new Error("Save All button is disabled");
    }

    await this.saveAllButton.click();
  }

  /**
   * Save only selected flashcards
   */
  async saveSelected() {
    await this.isLoaded();

    // Check if the button is visible and enabled
    const isVisible = await this.saveSelectedButton.isVisible();
    if (!isVisible) {
      throw new Error("Save Selected button is not visible");
    }

    const isEnabled = await this.saveSelectedButton.isEnabled();
    if (!isEnabled) {
      throw new Error("Save Selected button is disabled");
    }

    await this.saveSelectedButton.click();
  }
}
