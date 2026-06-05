import { useState } from "react";

interface GuessFormProps {
  onSubmitGuess: (text: string) => Promise<string | null>;
  disabled?: boolean;
}

export function GuessForm({ onSubmitGuess, disabled = false }: GuessFormProps) {
  const [guessText, setGuessText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmed = guessText.trim();
    if (!trimmed) {
      setError("Guess cannot be empty");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitGuess(trimmed);
      setGuessText("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit guess";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="form__field">
        <input
          className="form__input"
          value={guessText}
          onChange={(event) => setGuessText(event.target.value)}
          placeholder="Type your guess here..."
          disabled={disabled || submitting}
        />
      </label>
      {error && <p className="form__error">{error}</p>}
      <div className="button-row button-row--compact">
        <button className="button button--primary" type="submit" disabled={disabled || submitting}>
          {submitting ? "Submitting..." : "Submit Guess"}
        </button>
      </div>
    </form>
  );
}
