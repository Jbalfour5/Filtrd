import React from "react";

export default function GuessInput({
  guessText,
  setGuessText,
  submitGuess,
  skipRound,
  isLastRound,
  round,
  TOTAL_ROUNDS,
  revealedAnswer,
}) {
  return (
    <div className="space-y-4">
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
        <div className="flex gap-2">
          <input
            value={guessText}
            onChange={(e) => setGuessText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitGuess()}
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
            onClick={submitGuess}
            disabled={!guessText.trim()}
            className={`px-4 py-2 rounded-md transition-colors ${
              isLastRound
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {isLastRound ? "Final Guess!" : "Guess"}
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {isLastRound ? (
            <span className="text-green-600">
              ✨ Final round - audio is completely clear!
            </span>
          ) : (
            `Rounds left: ${TOTAL_ROUNDS - (round + 1)}`
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={skipRound}
          disabled={round >= TOTAL_ROUNDS - 1 || revealedAnswer}
          className="px-4 py-2 rounded-md bg-gray-100 border border-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {isLastRound ? "Final round" : "Skip round (remove filter)"}
        </button>
      </div>
    </div>
  );
}
