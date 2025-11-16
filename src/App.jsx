import React, { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import PlayerCard from './components/PlayerCard';
import GuessInput from './components/GuessInput';
import GuessHistory from './components/GuessHistory';
import RevealedAnswer from './components/RevealedAnswer';

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
        <Header />
        
        <main className="space-y-6">
          <PlayerCard
            round={round}
            isPlaying={isPlaying}
            togglePlay={togglePlay}
            filtersApplied={filtersApplied}
            isLastRound={isLastRound}
            revealedAnswer={revealedAnswer}
            waveformProgress={waveformProgress}
            activeFilters={activeFilters}
            audioRef={audioRef}
          />

          {!revealedAnswer && (
            <GuessInput
              guessText={guessText}
              setGuessText={setGuessText}
              submitGuess={submitGuess}
              skipRound={skipRound}
              isLastRound={isLastRound}
              round={round}
              TOTAL_ROUNDS={TOTAL_ROUNDS}
              revealedAnswer={revealedAnswer}
            />
          )}

          {revealedAnswer && (
            <RevealedAnswer revealedAnswer={revealedAnswer} guesses={guesses} />
          )}

          <GuessHistory guesses={guesses} />
        </main>
      </div>
    </div>
  );
}