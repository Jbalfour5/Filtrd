import React from "react";
import TinyWaveform from "./TinyWaveform";
import ActiveFilters from "./ActiveFilters";
import {
  PlayIcon,
  PauseIcon,
  ArrowPathRoundedSquareIcon,
} from "@heroicons/react/24/solid";

export default function PlayerCard({
  round,
  isPlaying,
  togglePlay,
  filtersApplied,
  revealedAnswer,
  activeFilters,
  playerReady,
  analyser,
  progress,
  isLooping,
  setIsLooping,
}) {
  const remaining = Math.max(0, Math.ceil((1 - progress) * 5));

  return (
    <div className="rounded-xl border border-gray-300 p-4 bg-gray-50">
      <div className="flex gap-4">
        <div className="mt-38 w-20 h-20 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
          {round + 1}
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={togglePlay}
              disabled={!playerReady}
              className={`p-2 rounded-md duration-300 cursor-pointer bg-white border border-gray-300 hover:bg-gray-100 transition-colors shadow-sm ${
                !playerReady ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isPlaying ? (
                <PauseIcon className="h-5 w-5 text-gray-700" />
              ) : (
                <PlayIcon className="h-5 w-5 text-gray-700" />
              )}
            </button>

            <button
              onClick={() => setIsLooping((prev) => !prev)}
              disabled={!playerReady}
              className={`cursor-pointer p-2 rounded-md border-gray-300 border transition-colors shadow-sm ${
                isLooping
                  ? "bg-gradient-to-br from-indigo-400 to-indigo-600 hover:to-indigo-800"
                  : "bg-white hover:bg-gray-100"
              } ${!playerReady ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <ArrowPathRoundedSquareIcon
                className={`h-5 w-5 ${
                  isLooping ? "text-white" : "text-gray-700"
                }`}
              />
            </button>

            <div className="text-sm text-gray-700">
              <div className="font-semibold">Filtered Snippet</div>
              <div className="text-xs text-gray-500">
                {filtersApplied === 0
                  ? "No filters"
                  : `Filters applied: ${filtersApplied}/6`}
                {revealedAnswer && " • Game Over"}
              </div>
            </div>
          </div>

          {analyser && <TinyWaveform analyser={analyser} />}

          <div className="relative h-6 w-full mt-2">
            <div className="absolute inset-0 bg-gray-300 rounded"></div>
            <div
              className="absolute left-0 top-0 h-6 bg-indigo-600 rounded transition-all duration-50"
              style={{ width: `${Math.min(progress * 100, 100)}%` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
              {Math.max(0, Math.ceil((1 - progress) * 5))}s
            </div>
          </div>

          {activeFilters.length > 0 && (
            <ActiveFilters filters={activeFilters} currentRound={round} />
          )}
        </div>
      </div>
    </div>
  );
}
