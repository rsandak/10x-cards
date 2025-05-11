import { test, expect } from "@playwright/test";
import { LoginPage } from "./page-objects/LoginPage";

test.describe("Authentication", () => {
  test("Should login successfully with environment credentials", async ({ page }) => {
    // Initialize login page
    const loginPage = new LoginPage(page);

    // Navigate to login page
    await page.goto("/auth/signin");
    await loginPage.isLoaded();

    // Login with environment credentials
    await loginPage.loginWithEnvCredentials();

    // Wait for successful login and navigation
    await loginPage.waitForLoginComplete();

    // Verify we're no longer on the login page
    expect(page.url()).not.toContain("/auth/signin");
  });
});
