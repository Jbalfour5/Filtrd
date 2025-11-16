import React, { useEffect, useRef, useState } from 'react';

const TOTAL_ROUNDS = 6;
const FILTER_LEVELS = [6, 5, 4, 3, 2, 0];

const ALL_FILTERS = [
  { name: 'Low Cut', description: 'Removes low frequencies' },
  { name: 'High Cut', description: 'Removes high frequencies' },
  { name: 'Bit Crusher', description: 'Reduces audio quality' },
  { name: 'Reverb', description: 'Adds echo effect' },
  { name: 'Distortion', description: 'Adds gritty distortion' },
  { name: 'Band Pass', description: 'Narrows frequency range' },
  { name: 'Phaser', description: 'Creates sweeping effect' },
  { name: 'Flanger', description: 'Adds jet-like sound' },
  { name: 'Chorus', description: 'Thickens the sound' },
  { name: 'EQ Cut', description: 'Reduces specific frequencies' }
];

const SAMPLE_CLIP = '/audio/song.mp3';
const ANSWER = { title: 'Your Song', artist: 'Your Artist' };

function IconPlay() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M5 3v18l15-9-15-9z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPause() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M6 4h4v16H6zM14 4h4v16h-4z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconFilter() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TinyWaveform({ progress = 0 }) {
  const barHeights = [20, 30, 40].map(height => height * progress);
  
  return (
    <div className="relative w-full h-14 flex items-center justify-center overflow-hidden">
      <canvas id="tinyWaveCanvas" className="absolute inset-0 w-full h-full"></canvas>
      <div className="absolute inset-0 flex items-end gap-2 px-2 opacity-40">
        {barHeights.map((height, i) => (
          <div
            key={i}
            className="flex-1 bg-indigo-500 rounded-full transition-all"
            style={{ height: `${height}px` }}
          />
        ))}
      </div>
    </div>
  );
}

function ActiveFilters({ filters, currentRound }) {
  const filtersToShow = filters.slice(0, FILTER_LEVELS[currentRound]);
  const removedFilters = filters.slice(FILTER_LEVELS[currentRound]);

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <IconFilter />
        <span>Active Filters ({filtersToShow.length})</span>
      </div>
      
      {filtersToShow.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {filtersToShow.map((filter, index) => (
            <div
              key={index}
              className="p-2 bg-red-50 border border-red-200 rounded-md text-xs"
            >
              <div className="font-medium text-red-800">{filter.name}</div>
              <div className="text-red-600">{filter.description}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
          <div className="font-medium">🎉 No filters applied!</div>
          <div className="text-xs mt-1">The audio is completely clear. Final chance to guess!</div>
        </div>
      )}

      {removedFilters.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-gray-500 mb-2">Removed filters:</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {removedFilters.map((filter, index) => (
              <div
                key={index}
                className="p-2 bg-green-50 border border-green-200 rounded-md text-xs opacity-60"
              >
                <div className="font-medium text-green-700 line-through">{filter.name}</div>
                <div className="text-green-600 text-xs">{filter.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const audioRef = useRef(null);

  const [round, setRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [guessText, setGuessText] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [revealedAnswer, setRevealedAnswer] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);

  useEffect(() => {
    const shuffled = [...ALL_FILTERS].sort(() => 0.5 - Math.random());
    setActiveFilters(shuffled.slice(0, 6));
  }, []);

  const filtersApplied = FILTER_LEVELS[round];
  const maxFilters = FILTER_LEVELS[0];
  const waveformProgress = 1 - (filtersApplied / maxFilters);
  const isLastRound = round === TOTAL_ROUNDS - 1;
  const canGuess = !revealedAnswer;

  useEffect(() => {
    const a = audioRef.current;
    if (a) {
      a.currentTime = 0;
      setIsPlaying(false);
      a.pause();
    }
  }, [round]);

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) {
      a.pause();
      setIsPlaying(false);
    } else {
      a.play();
      setIsPlaying(true);
    }
  }

  function submitGuess() {
    if (!guessText.trim() || !canGuess) return;
    const guess = guessText.trim();
    const isCorrect = [ANSWER.title, ANSWER.artist].some((t) =>
      t.toLowerCase().includes(guess.toLowerCase())
    );

    setGuesses((g) => [
      {
        text: guess,
        round: round + 1,
        filters: filtersApplied,
        correct: isCorrect,
      },
      ...g,
    ]);

    setGuessText('');

    if (isCorrect) {
      setRevealedAnswer(ANSWER);
    } else if (round < TOTAL_ROUNDS - 1) {
      setRound((r) => r + 1);
    } else {
      setRevealedAnswer(ANSWER);
    }
  }

  function skipRound() {
    if (round < TOTAL_ROUNDS - 1 && !revealedAnswer) {
      setRound((r) => r + 1);
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">FILTRD — Daily Filtered Clip</h1>
            <p className="text-sm text-gray-600">Guess the song as filters are removed.</p>
          </div>

          <button
            className="text-sm px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            New
          </button>
        </header>

        <main className="space-y-6">
          <div className="rounded-xl border border-gray-300 p-4 bg-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                {round + 1}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-md bg-white border border-gray-300 hover:bg-gray-100 transition-colors shadow-sm"
                  >
                    {isPlaying ? <IconPause /> : <IconPlay />}
                  </button>

                  <div className="text-sm text-gray-700">
                    <div className="font-semibold">Filtered Clip</div>
                    <div className="text-xs text-gray-500">
                      {isLastRound ? 'No filters - Final round!' : `Filters applied: ${filtersApplied}/6`}
                      {revealedAnswer && ' • Game Over'}
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
                  <ActiveFilters 
                    filters={activeFilters} 
                    currentRound={round}
                  />
                )}
              </div>
            </div>

            <audio ref={audioRef} src={SAMPLE_CLIP} preload="auto" />
          </div>

          {!revealedAnswer && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isLastRound ? '🎵 Final Round - Clear Audio!' : 'Enter your guess'}
                </label>
                <div className="flex gap-2">
                  <input
                    value={guessText}
                    onChange={(e) => setGuessText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitGuess()}
                    className={`flex-1 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 bg-white ${
                      isLastRound ? 'border-green-300 bg-green-50 placeholder-green-400' : 'border-gray-300'
                    }`}
                    placeholder={
                      isLastRound 
                        ? "Final chance - the audio is clear!" 
                        : "Type song title or artist..."
                    }
                  />
                  <button
                    onClick={submitGuess}
                    disabled={!guessText.trim()}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      isLastRound
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isLastRound ? 'Final Guess!' : 'Guess'}
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {isLastRound ? (
                    <span className="text-green-600">✨ Final round - audio is completely clear!</span>
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
                  {isLastRound ? 'Final round' : 'Skip round (remove filter)'}
                </button>
              </div>
            </div>
          )}

          {revealedAnswer && (
            <div className="p-4 rounded-xl border border-green-300 bg-green-50 text-green-800">
              <div className="font-semibold mb-1">
                {guesses.some(g => g.correct) ? '🎉 Correct!' : 'Game Over - Answer Revealed:'}
              </div>
              <div className="text-lg">{revealedAnswer.title} — {revealedAnswer.artist}</div>
              <div className="text-xs mt-2 text-green-600">
                {guesses.some(g => g.correct) 
                  ? `You guessed it in round ${guesses.find(g => g.correct).round}!` 
                  : 'Better luck next time!'}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-700">Guesses</h3>
            <div className="space-y-2">
              {guesses.length === 0 && <div className="text-xs text-gray-500">No guesses yet.</div>}
              {guesses.map((g, i) => (
                <div key={i} className="flex items-center justify-between border border-gray-300 rounded-md p-3 bg-white">
                  <div>
                    <div className="font-medium text-gray-900">{g.text}</div>
                    <div className="text-xs text-gray-500">Round {g.round} — filters applied: {g.filters}</div>
                  </div>
                  <div className="text-sm">
                    {g.correct ? (
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs border border-green-200">Correct</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs border border-red-200">Incorrect</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}