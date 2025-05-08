import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useState, useCallback } from "react";

// Przykładowy hook do testowania
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => setCount((c) => c + 1), []);
  const decrement = useCallback(() => setCount((c) => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);

  return { count, increment, decrement, reset };
}

describe("useCounter hook", () => {
  it("should initialize with default value", () => {
    // Arrange & Act
    const { result } = renderHook(() => useCounter());

    // Assert
    expect(result.current.count).toBe(0);
  });

  it("should initialize with custom value", () => {
    // Arrange & Act
    const { result } = renderHook(() => useCounter(10));

    // Assert
    expect(result.current.count).toBe(10);
  });

  it("should increment counter", () => {
    // Arrange
    const { result } = renderHook(() => useCounter());

    // Act
    act(() => {
      result.current.increment();
    });

    // Assert
    expect(result.current.count).toBe(1);
  });

  it("should decrement counter", () => {
    // Arrange
    const { result } = renderHook(() => useCounter(5));

    // Act
    act(() => {
      result.current.decrement();
    });

    // Assert
    expect(result.current.count).toBe(4);
  });

  it("should reset counter", () => {
    // Arrange
    const { result } = renderHook(() => useCounter(5));

    // Act
    act(() => {
      result.current.increment();
      result.current.reset();
    });

    // Assert
    expect(result.current.count).toBe(5);
  });
});
