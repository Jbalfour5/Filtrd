import React, { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import PlayerCard from "./components/PlayerCard";
import GuessInput from "./components/GuessInput";
import GuessHistory from "./components/GuessHistory";
import RevealedAnswer from "./components/RevealedAnswer";

const TOTAL_ROUNDS = 6;
const FILTER_LEVELS = [6, 5, 4, 3, 2, 0];
const ALL_FILTERS = [
  { name: "Low Cut", description: "Removes low frequencies" },
  { name: "High Cut", description: "Removes high frequencies" },
  { name: "Bit Crusher", description: "Reduces audio quality" },
  { name: "Reverb", description: "Adds echo effect" },
  { name: "Distortion", description: "Adds gritty distortion" },
  { name: "Band Pass", description: "Narrows frequency range" },
];

const SONGS = [
  { title: "Pink+White", artist: "Frank Ocean", url: "/songs/Pink+White.mp3" },
  { title: "Best Part", artist: "Daniel Caesar", url: "/songs/Best_Part.mp3" },
  { title: "Snooze", artist: "SZA", url: "/songs/Snooze.mp3" },
  {
    title: "Chamber Of Reflection",
    artist: "Mac DeMarco",
    url: "/songs/Chamber_Of_Reflection.mp3",
  },
  { title: "Bad Habit", artist: "Steve Lacy", url: "/songs/Bad_Habit.mp3" },
  { title: "Earfquake", artist: "Tyler The Creator", url: "/songs/Ivy.mp3" },
  {
    title: "Rock With You",
    artist: "Michael Jackson",
    url: "/songs/Rock_With_You.mp3",
  },
  { title: "20 Min", artist: "Lil Uzi Vert", url: "/songs/20_Min.mp3" },
];

export default function App() {
  const [round, setRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [guessText, setGuessText] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [revealedAnswer, setRevealedAnswer] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [songData, setSongData] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);

  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const filterNodesRef = useRef([]);

  const filtersApplied = FILTER_LEVELS[round];
  const maxFilters = FILTER_LEVELS[0];
  const waveformProgress = 1 - filtersApplied / maxFilters;
  const isLastRound = round === TOTAL_ROUNDS - 1;
  const canGuess = !revealedAnswer;

  useEffect(() => {
    const shuffled = [...ALL_FILTERS].sort(() => 0.5 - Math.random());
    setActiveFilters(shuffled.slice(0, 6));
  }, []);

  useEffect(() => {
    if (!songData) {
      const track = SONGS[Math.floor(Math.random() * SONGS.length)];
      setSongData(track);
    }

    audioCtxRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();
    const audioEl = new Audio(songData?.url);
    audioEl.crossOrigin = "anonymous";
    audioRef.current = audioEl;

    sourceRef.current = audioCtxRef.current.createMediaElementSource(audioEl);
    const filters = createFilters(audioCtxRef.current, filtersApplied);
    filterNodesRef.current = filters;

    let nodeChain = sourceRef.current;
    filters.forEach((f) => {
      nodeChain.connect(f);
      nodeChain = f;
    });
    nodeChain.connect(audioCtxRef.current.destination);

    setPlayerReady(true);
  }, [songData]);

  useEffect(() => {
    if (!audioCtxRef.current || !sourceRef.current) return;

    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    filterNodesRef.current.forEach((f) => f.disconnect());
    filterNodesRef.current = [];

    const filters = createFilters(audioCtxRef.current, filtersApplied);
    filterNodesRef.current = filters;

    let nodeChain = sourceRef.current;
    filters.forEach((f) => {
      nodeChain.connect(f);
      nodeChain = f;
    });
    nodeChain.connect(audioCtxRef.current.destination);
  }, [round]);

  function createFilters(ctx, level) {
    const filters = [];
    if (level >= 1) {
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = 1500 - level * 150;
      filters.push(lowpass);
    }
    if (level >= 2) {
      const highpass = ctx.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = 300 + level * 100;
      filters.push(highpass);
    }
    if (level >= 3) {
      const distortion = ctx.createWaveShaper();
      distortion.curve = makeDistortionCurve(level * 10);
      filters.push(distortion);
    }
    return filters;
  }

  function makeDistortionCurve(amount) {
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] =
        ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }

  function togglePlay() {
    if (!audioRef.current) return;
    if (!isPlaying) {
      audioCtxRef.current.resume();
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
    setIsPlaying(!isPlaying);
  }

  function submitGuess() {
    if (!guessText.trim() || !canGuess) return;
    const guess = guessText.trim();
    const isCorrect =
      songData &&
      [songData.title, songData.artist].some((t) =>
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

    setGuessText("");

    if (isCorrect) setRevealedAnswer(songData);
    else if (round < TOTAL_ROUNDS - 1) setRound((r) => r + 1);
    else setRevealedAnswer(songData);
  }

  function skipRound() {
    if (round < TOTAL_ROUNDS - 1 && !revealedAnswer) setRound((r) => r + 1);
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
            playerReady={playerReady}
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
            <RevealedAnswer revealedAnswer={songData} guesses={guesses} />
          )}
          <GuessHistory guesses={guesses} />
        </main>
      </div>
    </div>
  );
}
