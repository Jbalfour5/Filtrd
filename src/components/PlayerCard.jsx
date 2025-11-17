import React from "react";
import IconPlay from "./icons/IconPlay";
import IconPause from "./icons/IconPause";
import TinyWaveform from "./TinyWaveform";
import ActiveFilters from "./ActiveFilters";

export default function PlayerCard({
  round,
  isPlaying,
  togglePlay,
  filtersApplied,
  revealedAnswer,
  waveformProgress,
  activeFilters,
  playerReady,
}) {
  return (
    <div className="rounded-xl border border-gray-300 p-4 bg-gray-50">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
          {round + 1}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              disabled={!playerReady}
              className={`p-2 rounded-md bg-white border border-gray-300 hover:bg-gray-100 transition-colors shadow-sm ${
                !playerReady ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isPlaying ? <IconPause /> : <IconPlay />}
            </button>

            <div className="text-sm text-gray-700">
              <div className="font-semibold">Filtered Clip</div>
              <div className="text-xs text-gray-500">
                {filtersApplied === 0
                  ? "No filters"
                  : `Filters applied: ${filtersApplied}/6`}
                {revealedAnswer && " • Game Over"}
              </div>
            </div>
          </div>

          <div className="mt-3">
            <TinyWaveform progress={waveformProgress} />
            <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
              <div>All filters</div>
              <div>No filters</div>
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
