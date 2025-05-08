import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// Przykładowy komponent do testowania
function Button({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
      {children}
    </button>
  );
}

describe("Button component", () => {
  it("renders with correct text", () => {
    // Arrange
    const noop = vi.fn();
    render(<Button onClick={noop}>Click me</Button>);

    // Assert
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick handler when clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    // Act
    await user.click(screen.getByText("Click me"));

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
