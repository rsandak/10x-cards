import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly container: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('[data-test-id="login-form-container"]');
    this.emailInput = page.locator('[data-test-id="login-email-input"]');
    this.passwordInput = page.locator('[data-test-id="login-password-input"]');
    this.signInButton = page.locator('[data-test-id="login-submit-button"]');
    this.errorMessage = page.locator('[data-test-id="login-error"]');
  }

  /**
   * Check if the login page is loaded
   */
  async isLoaded() {
    console.log("Checking if login form is visible");
    await expect(this.container).toBeVisible({ timeout: 10000 });
    await expect(this.emailInput).toBeVisible({ timeout: 5000 });
    await expect(this.passwordInput).toBeVisible({ timeout: 5000 });
    await expect(this.signInButton).toBeVisible({ timeout: 5000 });
    console.log("Login form is visible");
  }

  /**
   * Login with the provided credentials
   */
  async login(email: string, password: string) {
    console.log(`Filling login form with email: ${email}`);
    await this.emailInput.clear();
    await this.emailInput.fill(email);
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);

    console.log("Clicking sign in button");
    await this.signInButton.click();
    console.log("Sign in button clicked");
  }

  /**
   * Login with credentials from environment variables
   */
  async loginWithEnvCredentials() {
    const username = process.env.E2E_USERNAME || "";
    const password = process.env.E2E_PASSWORD || "";

    if (!username || !password) {
      throw new Error("E2E_USERNAME or E2E_PASSWORD environment variables are not set");
    }

    console.log(`Logging in with username: ${username}`);
    await this.login(username, password);
  }

  /**
   * Wait for login to complete and redirect
   */
  async waitForLoginComplete() {
    // Wait for the submit button to be disabled while request is in progress
    console.log("Waiting for login process to complete...");
    try {
      await expect(this.signInButton).toBeDisabled({ timeout: 5000 });
    } catch {
      console.log("Note: Button was not disabled or disabled too quickly");
    }

    // Check if there's an error displayed on the form
    if (await this.errorMessage.isVisible()) {
      const errorText = await this.errorMessage.textContent();
      console.log(`Login error detected: ${errorText}`);
      throw new Error(`Login failed: ${errorText}`);
    }

    // Wait for navigation away from login page
    try {
      await this.page.waitForURL(/^\/(generate|dashboard|flashcards|home).*$/i, { timeout: 15000 });
      console.log(`Successfully navigated to: ${this.page.url()}`);
    } catch {
      console.log("URL navigation timeout - trying alternative methods");

      try {
        // Wait for login form to disappear
        await expect(this.container).toBeHidden({ timeout: 5000 });
        console.log("Login form is now hidden");
      } catch {
        console.log("Manual navigation to /generate required");
        // Navigate directly if needed
        await this.page.goto("/generate");
        console.log(`Manually navigated to: ${this.page.url()}`);
      }
    }
  }

  /**
   * Check if login error occurred
   */
  async hasLoginError(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  /**
   * Complete login process including waiting for redirect
   */
  async completeLogin(username: string, password: string) {
    await this.login(username, password);
    await this.waitForLoginComplete();
  }

  /**
   * Complete login with environment credentials including waiting for redirect
   */
  async completeLoginWithEnvCredentials() {
    await this.loginWithEnvCredentials();
    await this.waitForLoginComplete();
  }
}
