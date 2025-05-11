"use client";

import { useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import type { GenerateFlashcardsCommand } from "../../types";

interface GenerationFormProps {
  onSubmit: (command: GenerateFlashcardsCommand) => Promise<void>;
  isLoading: boolean;
}

export interface GenerationFormRef {
  reset: () => void;
}

export const GenerationForm = forwardRef<GenerationFormRef, GenerationFormProps>(function GenerationForm(
  { onSubmit, isLoading },
  ref
) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateText = useCallback((value: string) => {
    if (value.length < 1000) {
      return "Text must be at least 1000 characters long";
    }
    if (value.length > 10000) {
      return "Text cannot exceed 10000 characters";
    }
    return null;
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setError(validateText(newText));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateText(text);
    if (validationError) {
      setError(validationError);
      return;
    }

    const command: GenerateFlashcardsCommand = {
      source_text: text,
    };

    await onSubmit(command);
  };

  useImperativeHandle(ref, () => ({
    reset: () => {
      setText("");
      setError(null);
    },
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-test-id="flashcard-generation-form">
      <div className="space-y-2">
        <Textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Enter your text here (1000-10000 characters)"
          className="min-h-[200px]"
          disabled={isLoading}
          data-test-id="source-text-input"
        />
        <div className="flex justify-between text-sm">
          <span
            className={text.length < 1000 || text.length > 10000 ? "text-red-500" : "text-green-500"}
            data-test-id="character-count"
          >
            {text.length} / 10000 characters
          </span>
          {error && (
            <span className="text-red-500" data-test-id="text-input-error">
              {error}
            </span>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={!!error || isLoading || text.length === 0}
        className="w-full"
        data-test-id="generate-flashcards-button"
      >
        {isLoading ? "Generating..." : "Generate Flashcards"}
      </Button>
    </form>
  );
});
