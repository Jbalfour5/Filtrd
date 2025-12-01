import React, { useState, useMemo } from "react";

export default function GuessInput({
  guessText,
  setGuessText,
  submitGuess,
  skipRound,
  isLastRound,
  round,
  TOTAL_ROUNDS,
  revealedAnswer,
  nextFilterName,
  SONGS,
}) {
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const suggestions = useMemo(() => {
    if (!guessText.trim() || !showSuggestions) return [];
    const query = guessText.toLowerCase();
    return SONGS.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.artist.toLowerCase().includes(query)
    );
  }, [guessText, showSuggestions, SONGS]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      submitGuess();
      setShowSuggestions(false);
    } else if (e.key === "ArrowDown") {
      setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    }
  };

  return (
    <div className="space-y-4 relative">
      <div>
        <div className="mb-3 p-3 bg-amber-50 border-l-4 border-amber-400 text-amber-800 text-sm rounded-md flex items-start gap-2">
          <span className="text-lg">💡</span>
          <p>
            Guessing the <span className="font-semibold">artist</span> does not
            complete the game. However, it can help you narrow down your answer
            before guessing the{" "}
            <span className="font-semibold">song title</span>.
          </p>
        </div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {isLastRound ? "🎵 Final Round - Clear Audio!" : "Enter your guess"}
        </label>
        <div className="flex gap-2 relative">
          <input
            value={guessText}
            onChange={(e) => {
              setGuessText(e.target.value);
              setHighlightedIndex(-1);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            className={`flex-1 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 bg-white ${
              isLastRound
                ? "border-green-300 bg-green-50 placeholder-green-400"
                : "border-gray-300"
            }`}
            placeholder={
              isLastRound
                ? "Final chance - the audio is clear!"
                : "Type song title or song artist..."
            }
          />
          <button
            onClick={() => {
              submitGuess();
              setShowSuggestions(false);
            }}
            disabled={!guessText.trim()}
            className={`cursor-pointer px-4 py-2 rounded-md duration-300  transition-colors ${
              isLastRound
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gradient-to-br from-indigo-400 to-indigo-600 hover:to-indigo-800 text-white"
            }`}
          >
            {isLastRound ? "Final Guess!" : "Guess"}
          </button>
        </div>
      </div>

      {suggestions.length > 0 && !revealedAnswer && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
          {suggestions.map((s, idx) => (
            <li
              key={s.title + s.artist}
              onClick={() => {
                setGuessText(s.title);
                setHighlightedIndex(-1);
                setShowSuggestions(false);
              }}
              onMouseEnter={() => setHighlightedIndex(idx)}
              className={`px-3 py-2 cursor-pointer ${
                idx === highlightedIndex ? "bg-indigo-100" : ""
              }`}
            >
              <span className="font-semibold">{s.title}</span> -{" "}
              <span className="text-gray-600">{s.artist}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2 text-xs text-gray-500">
        {isLastRound ? (
          <span className="text-green-600">
            ✨ Final round - audio is completely clear!
          </span>
        ) : (
          `Rounds left: ${TOTAL_ROUNDS - (round + 1)}`
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={skipRound}
          disabled={round >= TOTAL_ROUNDS - 1 || revealedAnswer}
          className="px-4 py-2 cursor-pointer rounded-md bg-gray-100 border border-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed duration-300 transition-colors text-sm"
        >
          {isLastRound
            ? "Final round"
            : `Skip Round (Remove ${nextFilterName})`}
        </button>
      </div>
    </div>
  );
}
