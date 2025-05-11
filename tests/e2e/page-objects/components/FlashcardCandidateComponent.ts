import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

export class FlashcardCandidateComponent {
  readonly page: Page;
  readonly container: Locator;
  readonly frontContent: Locator;
  readonly backContent: Locator;
  readonly acceptButton: Locator;
  readonly editButton: Locator;
  readonly rejectButton: Locator;
  readonly editForm: Locator;
  readonly frontTextarea: Locator;
  readonly backTextarea: Locator;
  readonly saveEditButton: Locator;
  readonly cancelEditButton: Locator;
  readonly errorMessage: Locator;
  readonly statusBadges: {
    accepted: Locator;
    edited: Locator;
    rejected: Locator;
  };

  constructor(page: Page, index: number) {
    this.page = page;
    this.container = page.locator(`[data-test-id="flashcard-candidate-${index}"]`);

    // Flashcard content
    this.frontContent = this.container.locator('[data-test-id="flashcard-front-content"]');
    this.backContent = this.container.locator('[data-test-id="flashcard-back-content"]');

    // Action buttons
    this.acceptButton = this.container.locator('[data-test-id="accept-flashcard-button"]');
    this.editButton = this.container.locator('[data-test-id="edit-flashcard-button"]');
    this.rejectButton = this.container.locator('[data-test-id="reject-flashcard-button"]');

    // Edit form
    this.editForm = this.container.locator('[data-test-id="flashcard-edit-form"]');
    this.frontTextarea = this.container.locator('[data-test-id="edit-front-textarea"]');
    this.backTextarea = this.container.locator('[data-test-id="edit-back-textarea"]');
    this.saveEditButton = this.container.locator('[data-test-id="save-edit-button"]');
    this.cancelEditButton = this.container.locator('[data-test-id="cancel-edit-button"]');
    this.errorMessage = this.container.locator('[data-test-id="edit-error-message"]');

    // Status badges
    this.statusBadges = {
      accepted: this.container.locator('[data-test-id="status-badge-accepted"]'),
      edited: this.container.locator('[data-test-id="status-badge-edited"]'),
      rejected: this.container.locator('[data-test-id="status-badge-rejected"]'),
    };
  }

  /**
   * Check if the candidate is visible
   */
  async isVisible() {
    await expect(this.container).toBeVisible();
  }

  /**
   * Get the front text content
   */
  async getFrontText(): Promise<string> {
    const isEditing = await this.isInEditMode();
    if (isEditing) {
      return await this.frontTextarea.inputValue();
    } else {
      return (await this.frontContent.locator("p").textContent()) || "";
    }
  }

  /**
   * Get the back text content
   */
  async getBackText(): Promise<string> {
    const isEditing = await this.isInEditMode();
    if (isEditing) {
      return await this.backTextarea.inputValue();
    } else {
      return (await this.backContent.locator("p").textContent()) || "";
    }
  }

  /**
   * Check if the flashcard is in edit mode
   */
  async isInEditMode(): Promise<boolean> {
    return await this.editForm.isVisible();
  }

  /**
   * Get the flashcard status (accepted, edited, rejected or undefined)
   */
  async getStatus(): Promise<string | undefined> {
    for (const [status, badge] of Object.entries(this.statusBadges)) {
      if (await badge.isVisible()) {
        return status;
      }
    }
    return undefined;
  }

  /**
   * Accept the flashcard
   */
  async accept() {
    // If the flashcard is already in edit mode, cancel editing first
    if (await this.isInEditMode()) {
      await this.cancelEdit();
    }

    // If the accept button is enabled, click it
    if (await this.acceptButton.isEnabled()) {
      await this.acceptButton.click();
      await expect(this.statusBadges.accepted).toBeVisible();
    }
  }

  /**
   * Reject the flashcard
   */
  async reject() {
    // If the flashcard is already in edit mode, cancel editing first
    if (await this.isInEditMode()) {
      await this.cancelEdit();
    }

    // If the reject button is enabled, click it
    if (await this.rejectButton.isEnabled()) {
      await this.rejectButton.click();
      await expect(this.statusBadges.rejected).toBeVisible();
    }
  }

  /**
   * Start editing the flashcard
   */
  async startEdit() {
    // If the flashcard is not in edit mode, click the edit button
    if (!(await this.isInEditMode())) {
      if (await this.editButton.isEnabled()) {
        await this.editButton.click();
        await expect(this.editForm).toBeVisible();
      }
    }
  }

  /**
   * Cancel editing the flashcard
   */
  async cancelEdit() {
    if (await this.isInEditMode()) {
      await this.cancelEditButton.click();
      await expect(this.editForm).not.toBeVisible();
    }
  }

  /**
   * Edit the flashcard
   */
  async edit(front: string, back: string) {
    await this.startEdit();

    // Fill in the form fields
    await this.frontTextarea.fill(front);
    await this.backTextarea.fill(back);

    // Save changes
    await this.saveEditButton.click();

    // Make sure the edit was saved
    await expect(this.editForm).not.toBeVisible();
    await expect(this.statusBadges.edited).toBeVisible();
  }

  /**
   * Check if the flashcard has an edit error
   */
  async hasEditError(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  /**
   * Get the edit error text
   */
  async getEditErrorText(): Promise<string> {
    if (await this.hasEditError()) {
      return (await this.errorMessage.textContent()) || "";
    }
    return "";
  }
}
