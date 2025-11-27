import React, { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import PlayerCard from "./components/PlayerCard";
import GuessInput from "./components/GuessInput";
import GuessHistory from "./components/GuessHistory";
import RevealedAnswer from "./components/RevealedAnswer";
import { createHighCutNode } from "./filters/highcutnode";
import { createLowCutNode } from "./filters/lowcutnode";
import { createDistortionNode } from "./filters/distortionnode";
import { createReverbNode } from "./filters/reverbnode";
import { createPitchShifterNode } from "./filters/pitchshifter";

const TOTAL_ROUNDS = 7;
const FILTER_LEVELS = [6, 5, 4, 3, 2, 1, 0];
const ALL_FILTERS = [
  { name: "Modulated Delay", description: "Adds sweeping movement/wobbles" },
  {
    name: "Pitch Shift",
    description: "Randomly shifts pitch up or down",
  },
  { name: "Distortion", description: "Adds gritty distortion" },
  {
    name: "High Cut",
    description: "Removes out high frequencies (muffled vocals)",
  },
  { name: "Low Cut", description: "Removes low frequencies (thinner bass)" },
  { name: "Reverb", description: "Adds echo effect" },
];

const CLIP_LENGTH = 5;

export default function App() {
  const [SONGS, setSONGS] = useState([]);
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
  const [isLooping, setIsLooping] = useState(false);


  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const intervalRef = useRef(null);
  const filterNodesRef = useRef([]);
  const pitchShiftSemitones = useRef(
    Math.random() < 0.5 ? Math.random() * 5 : -Math.random() * 5
  );

  const filtersApplied = FILTER_LEVELS[round];
  const maxFilters = FILTER_LEVELS[0];
  const waveformProgress = 1 - filtersApplied / maxFilters;
  const isLastRound = round === TOTAL_ROUNDS - 1;
  const canGuess = !revealedAnswer;

  const nextFilterName =
    round < TOTAL_ROUNDS - 1 ? ALL_FILTERS[FILTER_LEVELS[round + 1]]?.name : "";

  useEffect(() => {
    async function loadSongs() {
      try {
        const response = await fetch("/songs.json");
        const data = await response.json();
        setSONGS(data);
        if (data.length > 0)
          setSongData(data[Math.floor(Math.random() * data.length)]);
      } catch (err) {
        console.error("Failed to load songs.json", err);
      }
    }
    loadSongs();
  }, []);

  useEffect(() => {
    setActiveFilters(ALL_FILTERS.slice(0, 6));
  }, []);

  async function createFilters(ctx, level) {
    const filters = [];
    if (level >= 1) {
      const highCut = await createHighCutNode(ctx, 3000);
      filters.push(highCut);
    }
    if (level >= 2) {
      const lowCut = await createLowCutNode(ctx, 1000);
      filters.push(lowCut);
    }
    if (level >= 3) {
      const delay = ctx.createDelay();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      lfo.type = "sine";
      lfo.frequency.value = 0.8;
      lfoGain.gain.value = 0.03;

      lfo.connect(lfoGain).connect(delay.delayTime);
      lfo.start();
      filters.push(delay);
    }
    if (level >= 4) {
      const pitchShifter = await createPitchShifterNode(
        ctx,
        pitchShiftSemitones.current
      );
      filters.push(pitchShifter);
    }
    if (level >= 5) {
      const distortion = await createDistortionNode(ctx, 4);
      filters.push(distortion);
    }
    if (level >= 6) {
      const reverb = await createReverbNode(ctx, 0.8, 0.9);
      filters.push(reverb);
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
      } catch {}
    };
  }, [songData]);

  useEffect(() => {
    if (!songData) {
      const track = SONGS[Math.floor(Math.random() * SONGS.length)];
      setSongData(track);
      return;
    }

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }

    const audioCtx = audioCtxRef.current;
    const audioEl = new Audio(songData.url);
    audioEl.crossOrigin = "anonymous";
    audioRef.current = audioEl;

    const sourceNode = audioCtx.createMediaElementSource(audioEl);
    sourceRef.current = sourceNode;

    const analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 256;
    setAnalyser(analyserNode);

    async function connectNodes() {
      const filters = await createFilters(audioCtx, FILTER_LEVELS[round]);
      filterNodesRef.current = filters;

      let nodeChain = sourceNode;
      filters.forEach((f) => {
        nodeChain.connect(f);
        nodeChain = f;
      });
      nodeChain.connect(analyserNode);
      analyserNode.connect(audioCtx.destination);
    }

    connectNodes();

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
        filterNodesRef.current.forEach((f) => f.disconnect());
        analyserNode.disconnect();
        audioEl.pause();
        clearInterval(intervalRef.current);
      } catch {}
    };
  }, [songData, round]);

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

    if (analyser) nodeChain.connect(analyser);
    analyser?.connect(audioCtxRef.current.destination);
  }

  useEffect(() => {
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

        const currentProgress =
          (audioRef.current.currentTime - clipStart) / CLIP_LENGTH;

        setProgress(currentProgress);

        if (audioRef.current.currentTime >= clipStart + CLIP_LENGTH) {
          if (isLooping) {
            audioRef.current.currentTime = clipStart;
          } else {
            audioRef.current.pause();
            setIsPlaying(false);
            clearInterval(intervalRef.current);
          }
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
    } else setRevealedAnswer(songData);
  }

  function skipRound() {
    if (round < TOTAL_ROUNDS - 1 && !revealedAnswer) {
      setRound((r) => r + 1);
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
            isLooping={isLooping}
            setIsLooping={setIsLooping}
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
              SONGS={SONGS}
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
