import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("page loads successfully", async ({ page }) => {
    // Arrange - przygotowanie testu
    await page.goto("/");

    // Assert - sprawdzenie czy strona załadowała się poprawnie
    await expect(page).toHaveTitle(/10x Cards/);
  });

  test("navigation works correctly", async ({ page }) => {
    // Arrange - przejście na stronę główną
    await page.goto("/");

    // Act - kliknięcie pierwszego linku nawigacyjnego (zakładamy, że istnieje)
    const firstNavLink = page.getByRole("link").first();
    if (await firstNavLink.isVisible()) {
      await firstNavLink.click();

      // Assert - sprawdzenie czy URL się zmienił
      expect(page.url()).not.toEqual("http://localhost:3000/");
    } else {
      // Jeśli link nie istnieje, test kończy się powodzeniem
      test.skip();
    }
  });

  test("takes a screenshot for visual comparison", async ({ page }) => {
    // Arrange - przejście na stronę główną
    await page.goto("/");

    // Act & Assert - zrobienie zrzutu ekranu i porównanie z bazowym
    await expect(page).toHaveScreenshot("home-page.png");
  });
});
