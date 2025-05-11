import { test, expect } from "@playwright/test";
import { FlashcardGenerationPage } from "./page-objects/FlashcardGenerationPage";
import { LoginPage } from "./page-objects/LoginPage";

test.describe("Flashcard Generation", () => {
  test.beforeEach(async ({ page }) => {
    // Moderate timeout for login process
    test.setTimeout(45000);

    console.log("Starting login process...");

    // Login before each test
    const loginPage = new LoginPage(page);
    await page.goto("/auth/signin");
    await loginPage.isLoaded();

    // Use enhanced method that waits for redirection
    await loginPage.completeLoginWithEnvCredentials();

    console.log("Login completed successfully");
  });

  test("Should generate flashcards from input text and allow saving them", async ({ page }) => {
    // Moderate timeout for this test
    test.setTimeout(45000);

    console.log("Starting flashcard generation test...");

    // Initialize page
    const flashcardPage = new FlashcardGenerationPage(page);

    // Navigate to flashcard generation page
    await flashcardPage.goto();
    await flashcardPage.isLoaded();

    console.log("Flashcard generation page loaded");

    // Prepare source text (over 1000 characters)
    const sampleText = `
      The hexagonal architecture divides a system into several loosely-coupled interchangeable components, such as the application core, the database, the user interface, test scripts and interfaces with other systems. This approach is an alternative to the traditional layered architecture.

Each component is connected to the others through a number of exposed "ports". Communication through these ports follow a given protocol depending on their purpose. Ports and protocols define an abstract API that can be implemented by any suitable technical means (e.g. method invocation in an object-oriented language, remote procedure calls, or Web services).

The granularity of the ports and their number is not constrained:

a single port could in some case be sufficient (e.g. in the case of a simple service consumer);
typically, there are ports for event sources (user interface, automatic feeding), notifications (outgoing notifications), database (in order to interface the component with any suitable DBMS), and administration (for controlling the component);
in an extreme case, there could be a different port for every use case, if needed.
Adapters are the glue between components and the outside world. They tailor the exchanges between the external world and the ports that represent the requirements of the inside of the application component. There can be several adapters for one port, for example, data can be provided by a user through a GUI or a command-line interface, by an automated data source, or by test scripts.
    `;

    // Step 1: Fill the form and generate flashcards
    console.log("Generating flashcards...");
    await flashcardPage.generateFlashcards(sampleText);

    // Check if no error occurred
    expect(await flashcardPage.hasGenerationError()).toBeFalsy();

    // Check if flashcard list is visible
    await flashcardPage.candidatesList.isLoaded();
    console.log("Candidate list loaded");

    // Get generated flashcards
    const candidates = await flashcardPage.candidatesList.getAllCandidates();
    console.log(`Generated ${candidates.length} flashcards`);
    expect(candidates.length).toBeGreaterThan(0);

    // Step 2: Interact with flashcards
    console.log("Interacting with flashcards...");
    // Accept first 2 flashcards
    if (candidates.length >= 2) {
      await flashcardPage.candidatesList.acceptFlashcard(0);
      await flashcardPage.candidatesList.acceptFlashcard(1);
    }

    // If there are 3 or more flashcards, edit the third one
    if (candidates.length >= 3) {
      await flashcardPage.candidatesList.editFlashcard(2, "Edited front", "Edited back content");
    }

    // If there are 4 or more flashcards, reject the fourth one
    if (candidates.length >= 4) {
      await flashcardPage.candidatesList.rejectFlashcard(3);
    }

    // Check how many flashcards are selected
    const counters = await flashcardPage.candidatesList.getSelectedCount();
    console.log(`Selected ${counters.selected} flashcards out of ${counters.total} total`);
    // Make sure the number of selected flashcards is appropriate (at least 3 if we have enough flashcards)
    const expectedSelected = Math.min(3, candidates.length);
    expect(counters.selected).toBeGreaterThanOrEqual(expectedSelected);

    // Step 3: Save selected flashcards
    console.log("Saving flashcards...");
    await flashcardPage.saveSelectedFlashcards();

    // Check if no error occurred
    expect(await flashcardPage.hasGenerationError()).toBeFalsy();

    // Check if candidate list is no longer visible after saving
    expect(await page.locator('[data-test-id="flashcard-candidates-list"]').isVisible()).toBeFalsy();

    console.log("Test completed successfully");
  });

  test("Should display error for text that is too short", async ({ page }) => {
    console.log("Starting validation error test...");

    // Initialize page
    const flashcardPage = new FlashcardGenerationPage(page);

    // Navigate to flashcard generation page
    await flashcardPage.goto();

    try {
      await flashcardPage.isLoaded();
      console.log("Flashcard generation page loaded");
    } catch (error) {
      console.error("Error loading flashcard generation page");
      throw error;
    }

    // Prepare text that is too short for generating flashcards
    const sampleText = "This text is too short for generating flashcards.";

    // Fill the form but don't submit (button should be disabled)
    await flashcardPage.generationForm.fillSourceText(sampleText);
    console.log("Short text entered");

    // Check validation error and button state
    const hasValidationError = await flashcardPage.generationForm.hasValidationError();
    const isButtonDisabled = await page.locator('[data-test-id="generate-flashcards-button"]').isDisabled();

    console.log("Validation error present:", hasValidationError);
    console.log("Generate button disabled:", isButtonDisabled);

    // Verify expectations
    expect(hasValidationError).toBeTruthy();
    expect(isButtonDisabled).toBeTruthy();

    console.log("Test completed successfully");
  });
});
