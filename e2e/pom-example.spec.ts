import { test } from "@playwright/test";
import { HomePage } from "./pages/HomePage";

test.describe("Home page tests with Page Object Model", () => {
  test("basic navigation flow", async ({ page }) => {
    // Inicjalizacja Page Object dla strony głównej
    const homePage = new HomePage(page);

    // Przejście na stronę główną
    await homePage.goto();

    // Weryfikacja tytułu strony
    await homePage.verifyTitle();

    // Kliknięcie pierwszego linku nawigacyjnego (jeśli istnieje)
    const didClick = await homePage.clickFirstNavigationLink();

    if (didClick) {
      // Sprawdzenie czy URL się zmienił po kliknięciu
      await homePage.verifyUrlChanged();
    } else {
      // Jeśli nie udało się kliknąć, zaznacz test jako pominięty
      test.skip();
    }
  });

  test("visual comparison test", async ({ page }) => {
    // Inicjalizacja Page Object dla strony głównej
    const homePage = new HomePage(page);

    // Przejście na stronę główną
    await homePage.goto();

    // Wykonanie zrzutu ekranu do porównania wizualnego
    await homePage.takeScreenshot("home-page-pom.png");
  });
});
