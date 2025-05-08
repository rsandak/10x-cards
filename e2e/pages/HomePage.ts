import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

/**
 * Page Object Model dla strony głównej
 * Zawiera metody i lokatory do interakcji ze stroną główną
 */
export class HomePage {
  private page: Page;
  private title = /10x Cards/;
  private navigationLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigationLinks = page.getByRole("link");
  }

  /**
   * Przejście na stronę główną
   */
  async goto() {
    await this.page.goto("/");
  }

  /**
   * Sprawdzanie tytułu strony
   */
  async verifyTitle() {
    await expect(this.page).toHaveTitle(this.title);
  }

  /**
   * Kliknięcie w pierwszy link nawigacyjny
   * @returns {Promise<boolean>} - Czy operacja się powiodła
   */
  async clickFirstNavigationLink(): Promise<boolean> {
    const firstLink = this.navigationLinks.first();
    if (await firstLink.isVisible()) {
      await firstLink.click();
      return true;
    }
    return false;
  }

  /**
   * Zrzut ekranu dla porównania wizualnego
   * @param {string} screenshotName - Nazwa pliku zrzutu ekranu
   */
  async takeScreenshot(screenshotName: string) {
    await expect(this.page).toHaveScreenshot(screenshotName);
  }

  /**
   * Sprawdza czy URL strony jest inny niż bazowy
   */
  async verifyUrlChanged() {
    expect(this.page.url()).not.toEqual("http://localhost:3000/");
  }
}
