import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

// Przykładowy komponent do testów snapshot
interface CardProps {
  title: string;
  content: string;
  footer?: string;
}

function Card({ title, content, footer }: CardProps) {
  return (
    <div className="card p-4 bg-white shadow-md rounded-md">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-gray-600">{content}</p>
      {footer && <div className="mt-4 pt-2 border-t text-sm text-gray-500">{footer}</div>}
    </div>
  );
}

describe("Card component snapshots", () => {
  it("renders basic card correctly", () => {
    // Arrange
    const { container } = render(<Card title="Test Card" content="This is test content for snapshot" />);

    // Assert - porównanie z zapisanym snapshotem
    expect(container).toMatchSnapshot();
  });

  it("renders card with footer correctly", () => {
    // Arrange
    const { container } = render(
      <Card title="Card with Footer" content="This card has a footer section" footer="Footer text goes here" />
    );

    // Assert - porównanie z zapisanym snapshotem
    expect(container).toMatchSnapshot();
  });
});
