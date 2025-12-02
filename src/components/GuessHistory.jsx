import React from "react";

function cleanAndFormatArtistName(name) {
  if (!name) return "";

  const words = name.replace(/\s+/g, " ").split(" ");
  const capitalized = words.map(
    (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  );

  return capitalized.join(" ");
}

export default function GuessHistory({ guesses }) {
  return (
    <div className="pb-10">
      <h3 className="text-sm font-medium text-gray-700">Guesses</h3>
      <div className="space-y-2">
        {guesses.length === 0 && (
          <div className="text-xs text-gray-500">No guesses yet.</div>
        )}
        {guesses.map((g, i) => (
          <div
            key={i}
            className="flex items-center justify-between border border-gray-300 rounded-md p-3 bg-white"
          >
            <div>
              <div className="font-medium text-gray-900">
                {g.correct
                  ? g.songTitle
                  : g.partialCorrect
                  ? cleanAndFormatArtistName(g.correctArtist) // use correctArtist
                  : cleanAndFormatArtistName(g.text)}
              </div>
              <div className="text-xs text-gray-500">
                Round {g.round} — Filters Applied: {g.filters}
              </div>
            </div>
            <div className="text-sm">
              {g.correct ? (
                <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs border border-green-200">
                  Correct
                </span>
              ) : g.partialCorrect ? (
                <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs border border-amber-200">
                  Correct Artist
                </span>
              ) : (
                <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs border border-red-200">
                  Incorrect
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
