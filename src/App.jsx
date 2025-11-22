import React, { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import PlayerCard from "./components/PlayerCard";
import GuessInput from "./components/GuessInput";
import GuessHistory from "./components/GuessHistory";
import RevealedAnswer from "./components/RevealedAnswer";

const TOTAL_ROUNDS = 7;
const FILTER_LEVELS = [6, 5, 4, 3, 2, 1, 0];
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
  { title: "Gravity", artist: "Brent Faiyaz", url: "/songs/Gravity.mp3" },
  {
    title: "Flashing Lights",
    artist: "Kanye West",
    url: "/songs/Flashing_Lights.mp3",
  },
  { title: "I Wonder", artist: "Kanye West", url: "/songs/I_Wonder.mp3" },
  {
    title: "Money Trees",
    artist: "Kendrick Lamar",
    url: "/songs/Money_Trees.mp3",
  },
  {
    title: "No Role Modelz",
    artist: "J Cole",
    url: "/songs/No_Role_Modelz.mp3",
  },
  { title: "Passionfruit", artist: "Drake", url: "/songs/Passionfruit.mp3" },
  {
    title: "Is There Someone Else?",
    artist: "The Weeknd",
    url: "/songs/Is_There_Someone_Else.mp3",
  },
  {
    title: "See You Again",
    artist: "Tyler The Creator",
    url: "/songs/See_You_Again.mp3",
  },
  { title: "The Thrill", artist: "Wiz Khalifa", url: "/songs/The_Thrill.mp3" },
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
    setActiveFilters(ALL_FILTERS.slice(0, 6));
  }, []);

  useEffect(() => {
    if (!songData) {
      const track = SONGS[Math.floor(Math.random() * SONGS.length)];
      setSongData(track);
      return;
    }

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = audioCtx;

    const audioEl = new Audio(songData.url);
    audioEl.crossOrigin = "anonymous";
    audioRef.current = audioEl;

    const sourceNode = audioCtx.createMediaElementSource(audioEl);
    sourceRef.current = sourceNode;

    const currentFilterLevel = FILTER_LEVELS[round];
    const filters = createFilters(audioCtx, currentFilterLevel);
    filterNodesRef.current = filters;

    let node = sourceNode;
    filters.forEach((filter) => {
      node.connect(filter);
      node = filter;
    });

    node.connect(audioCtx.destination);

    setPlayerReady(true);

    return () => {
      try {
        sourceNode.disconnect();
        filters.forEach((f) => f.disconnect());
      } catch (_) {}
    };
  }, [songData, round]);

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
    }
    if (level >= 2) {
    }
    if (level >= 3) {
    }
    if (level >= 4) {
    }
    if (level >= 5) {
    }
    if (level >= 6) {
    }
    return filters;
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
    const guess = guessText.toLowerCase().replace(/\s+/g, "");
    const isCorrect =
      songData &&
      [songData.title.toLowerCase().replace(/\s+/g, "")].some((t) =>
        t.toLowerCase().includes(guess.toLowerCase())
      );

    const isPartialCorrect =
      songData &&
      [songData.artist.toLowerCase().replace(/\s+/g, "")].some((t) =>
        t.toLowerCase().includes(guess.toLowerCase())
      );

    setGuesses((g) => [
      {
        songTitle: songData.title,
        songArtist: songData.artist,
        text: guessText,
        round: round + 1,
        filters: filtersApplied,
        correct: isCorrect,
        partialCorrect: isPartialCorrect,
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
    setIsPlaying(false);
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
