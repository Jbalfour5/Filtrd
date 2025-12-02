import React from "react";
import FiltrdLogo from "../assets/Filtrd.png";

export default function Header({ nextSongCountdown }) {
  return (
    <header className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-1">
        <img
          src={FiltrdLogo}
          alt="Filtrd logo"
          className="w-14 h-14 object-contain"
        />

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Filtrd – Daily Filtered Song
          </h1>
          <p className="text-sm text-gray-600">
            Guess the song as filters are removed.
          </p>

          <p className="text-sm text-gray-500 mt-1">
            Next song in:{" "}
            <span className="font-semibold">{nextSongCountdown}</span>
          </p>
        </div>
      </div>
    </header>
  );
}
