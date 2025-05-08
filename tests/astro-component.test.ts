import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/dom";

// Symulacja renderowania komponentu Astro poprzez renderowanie HTML
describe("Astro component rendering", () => {
  it("should render static HTML correctly", () => {
    // Arrange - przygotowanie HTML, który symuluje wyrenderowany komponent Astro
    const html = `
      <div class="card">
        <h2 class="card-title">Test Card</h2>
        <p class="card-content">This is a test card content.</p>
        <button class="card-button">Click me</button>
      </div>
    `;

    // Act - ustawienie HTML w dokumencie
    document.body.innerHTML = html;

    // Assert - sprawdzanie czy elementy są obecne
    expect(screen.getByText("Test Card")).toBeDefined();
    expect(screen.getByText("This is a test card content.")).toBeDefined();
    expect(screen.getByRole("button")).toBeDefined();
    expect(screen.getByRole("button")).toHaveTextContent("Click me");
  });
});
