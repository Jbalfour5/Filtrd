import React from 'react';

export default function Header() {
  return (
    <header className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          FILTRD — Daily Filtered Clip
        </h1>
        <p className="text-sm text-gray-600">
          Guess the song as filters are removed.
        </p>
      </div>

      <button
        className="text-sm px-3 py-2 cursor-pointer rounded-md bg-gradient-to-br from-indigo-400 to-indigo-600 hover:to-indigo-800 text-white transition-colors"
        onClick={() => window.location.reload()}
      >
        New
      </button>
    </header>
  );
}