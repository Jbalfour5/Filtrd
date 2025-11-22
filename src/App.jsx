import React, { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import PlayerCard from "./components/PlayerCard";
import GuessInput from "./components/GuessInput";
import GuessHistory from "./components/GuessHistory";
import RevealedAnswer from "./components/RevealedAnswer";
import { createHighCutNode } from "./filters/highcutnode";

const TOTAL_ROUNDS = 6;
const FILTER_LEVELS = [5, 4, 3, 2, 1, 0];
const ALL_FILTERS = [
  { name: "Reverb", description: "Adds echo effect" },
  { name: "Bit Crusher", description: "Reduces audio quality" },
  { name: "Distortion", description: "Adds gritty distortion" },
  { name: "Low Cut", description: "Removes low frequencies" },
  { name: "High Cut", description: "Removes high frequencies" },
  { name: "Chorus", description: "Adds modulation" },
];

const SONGS = [
  { title: "Pink+White", artist: "Frank Ocean", url: "/songs/Pink+White.mp3" },
  { title: "Best Part", artist: "Daniel Caesar", url: "/songs/Best_Part.mp3" },
  { title: "Snooze", artist: "SZA", url: "/songs/Snooze.mp3" },
  { title: "Chamber Of Reflection", artist: "Mac DeMarco", url: "/songs/Chamber_Of_Reflection.mp3" },
  { title: "Bad Habit", artist: "Steve Lacy", url: "/songs/Bad_Habit.mp3" },
  { title: "Earfquake", artist: "Tyler The Creator", url: "/songs/Ivy.mp3" },
  { title: "Rock With You", artist: "Michael Jackson", url: "/songs/Rock_With_You.mp3" },
  { title: "Gravity", artist: "Brent Faiyaz", url: "/songs/Gravity.mp3" },
  { title: "Flashing Lights", artist: "Kanye West", url: "/songs/Flashing_Lights.mp3" },
  { title: "I Wonder", artist: "Kanye West", url: "/songs/I_Wonder.mp3" },
  { title: "Money Trees", artist: "Kendrick Lamar", url: "/songs/Money_Trees.mp3" },
  { title: "No Role Modelz", artist: "J Cole", url: "/songs/No_Role_Modelz.mp3" },
  { title: "Passionfruit", artist: "Drake", url: "/songs/Passionfruit.mp3" },
  { title: "Is There Someone Else?", artist: "The Weeknd", url: "/songs/Is_There_Someone_Else.mp3" },
  { title: "See You Again", artist: "Tyler The Creator", url: "/songs/See_You_Again.mp3" },
  { title: "The Thrill", artist: "Wiz Khalifa", url: "/songs/The_Thrill.mp3" },
];

const CLIP_LENGTH = 10;

export default function App() {
  const [round, setRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [guessText, setGuessText] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [revealedAnswer, setRevealedAnswer] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [songData, setSongData] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [analyser, setAnalyser] = useState(null);
  const [progress, setProgress] = useState(0);
  const [clipStart, setClipStart] = useState(null);

  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const intervalRef = useRef(null);

  const filtersApplied = FILTER_LEVELS[round];
  const maxFilters = FILTER_LEVELS[0];
  const waveformProgress = 1 - filtersApplied / maxFilters;
  const isLastRound = round === TOTAL_ROUNDS - 1;
  const canGuess = !revealedAnswer;

  const nextFilterName =
    round < TOTAL_ROUNDS - 1 ? ALL_FILTERS[FILTER_LEVELS[round + 1]]?.name : "";


  useEffect(() => {
    setActiveFilters(ALL_FILTERS.slice(0, 6));
  }, []);

  async function createFilters(ctx, level) {
    const filters = [];
    if (level >= 1) {
      const highCut = await createHighCutNode(ctx, 80);
      filters.push(highCut);
    }
    if (level >= 2) {
    }
    if (level >= 3) {
    }
    if (level >= 4) {
    }
    if (level >= 5) {
    }
    return filters;
  }
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

    const analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 256;
    setAnalyser(analyserNode);

    sourceNode.connect(analyserNode);
    analyserNode.connect(audioCtx.destination);

    audioEl.addEventListener("loadedmetadata", () => {
      if (clipStart === null) {
        const maxStart = Math.max(0, audioEl.duration - CLIP_LENGTH);
        setClipStart(Math.random() * maxStart);
      }
      setPlayerReady(true);
    });

    return () => {
      try {
        sourceNode.disconnect();
        analyserNode.disconnect();
        audioEl.pause();
        clearInterval(intervalRef.current);
      } catch (_) {}
    };
  }, [songData]);

  useEffect(() => {
    async function setup() {
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

      const filters = await createFilters(audioCtx, FILTER_LEVELS[round]);
      filterNodesRef.current = filters;

      let node = sourceNode;
      filters.forEach((f) => {
        node.connect(f);
        node = f;
      });

      node.connect(audioCtx.destination);
      setPlayerReady(true);
    }

    setup();

    return () => {
      try {
        sourceRef.current?.disconnect();
        filterNodesRef.current.forEach((f) => f.disconnect());
      } catch {}
    };
  }, [songData, round]);

  useEffect(() => {
    async function updateFilters() {
      if (!audioCtxRef.current || !sourceRef.current) return;

      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      }

      filterNodesRef.current.forEach((f) => f.disconnect());
      filterNodesRef.current = [];

      const filters = await createFilters(audioCtxRef.current, filtersApplied);
      filterNodesRef.current = filters;

      let nodeChain = sourceRef.current;
      filters.forEach((f) => {
        nodeChain.connect(f);
        nodeChain = f;
      });
      nodeChain.connect(audioCtxRef.current.destination);
    }

    updateFilters();
  }, [round]);

  function togglePlay() {
    if (!audioRef.current || !audioCtxRef.current || clipStart === null) return;
  
    const audio = audioRef.current;
  
    audioCtxRef.current.resume();
  
    if (!isPlaying) {
      if (!audio.startedOnce || audio.currentTime >= clipStart + CLIP_LENGTH) {
        audio.currentTime = clipStart;
        setProgress(0);
        audio.startedOnce = true;
      }
  
      audio.play();
  
      intervalRef.current = setInterval(() => {
        if (!audioRef.current) return;
        const currentProgress = (audioRef.current.currentTime - clipStart) / CLIP_LENGTH;
        setProgress(currentProgress);
  
        if (audioRef.current.currentTime >= clipStart + CLIP_LENGTH) {
          audioRef.current.pause();
          setIsPlaying(false);
          clearInterval(intervalRef.current);
        }
      }, 50);
    } else {
      audio.pause();
      clearInterval(intervalRef.current);
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
    else if (round < TOTAL_ROUNDS - 1) {
      setRound((r) => r + 1);
      setClipStart(null);
    } else setRevealedAnswer(songData);
  }

  function skipRound() {
    if (round < TOTAL_ROUNDS - 1 && !revealedAnswer) {
      setRound((r) => r + 1);
      setClipStart(null);
    }
    setIsPlaying(false);
    clearInterval(intervalRef.current);
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-3xl bg-white">
        <Header />
        <main className="space-y-6">
          <PlayerCard
            round={round}
            isPlaying={isPlaying}
            togglePlay={togglePlay}
            filtersApplied={filtersApplied}
            revealedAnswer={revealedAnswer}
            activeFilters={activeFilters}
            playerReady={playerReady}
            analyser={analyser}
            progress={progress}
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
              nextFilterName={nextFilterName}
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
