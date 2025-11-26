import React, { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import PlayerCard from "./components/PlayerCard";
import GuessInput from "./components/GuessInput";
import GuessHistory from "./components/GuessHistory";
import RevealedAnswer from "./components/RevealedAnswer";
import { createHighCutNode } from "./filters/highcutnode";
import { createLowCutNode } from "./filters/lowcutnode";
import { createDistortionNode } from "./filters/distortionnode";

const TOTAL_ROUNDS = 7;
const FILTER_LEVELS = [6, 5, 4, 3, 2, 1, 0];
const ALL_FILTERS = [
  {
    name: "High Cut",
    description: "Removes out high frequencies (muffled vocals)",
  },
  { name: "Low Cut", description: "Removes low frequencies (thinner bass)" },
  { name: "Distortion", description: "Adds gritty distortion" },
  { name: "Modulated Delay", description: "Adds sweeping movement/wobbles" },
  { name: "Reverb", description: "Adds echo effect" },
  { name: "Bit Crusher", description: "Reduces audio quality" },
];

const CLIP_LENGTH = 10;

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

  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const filterNodesRef = useRef([]);
  const gainNodeRef = useRef(null);
  const animationRef = useRef(null);

  const filtersApplied = FILTER_LEVELS[round];
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
      } catch {}
    }
    loadSongs();
  }, []);

  useEffect(() => {
    setActiveFilters(ALL_FILTERS.slice(0, 6));
  }, []);

  async function createFilters(ctx, level) {
    const filters = [];
    if (level >= 1) filters.push(await createHighCutNode(ctx, 8000));
    if (level >= 2) filters.push(await createLowCutNode(ctx, 1000));
    if (level >= 3) filters.push(await createDistortionNode(ctx, 4));
    if (level >= 4) {
      const delay = ctx.createDelay();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = "sine";
      lfo.frequency.value = 0.4;
      lfoGain.gain.value = 0.02;
      lfo.connect(lfoGain).connect(delay.delayTime);
      lfo.start();
      filters.push(delay);
    }
    return filters;
  }

  async function normalizeTrack(audioCtx, audioEl) {
    const response = await fetch(audioEl.src);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    let sum = 0;
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < channelData.length; i++)
      sum += channelData[i] * channelData[i];
    const rms = Math.sqrt(sum / channelData.length);
    const targetRMS = 0.1;
    return targetRMS / (rms || 1);
  }

  useEffect(() => {
    if (!songData) return;
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
    const gainNode = audioCtx.createGain();
    gainNodeRef.current = gainNode;
    sourceNode.connect(gainNode);
    gainNode.connect(analyserNode);
    analyserNode.connect(audioCtx.destination);
    audioEl.addEventListener("loadedmetadata", async () => {
      const gainFactor = await normalizeTrack(audioCtx, audioEl);
      gainNode.gain.value = gainFactor;
      const maxStart = Math.max(0, audioEl.duration - CLIP_LENGTH);
      setClipStart(Math.random() * maxStart);
      setPlayerReady(true);
    });
    return () => {
      try {
        sourceNode.disconnect();
        analyserNode.disconnect();
        gainNode.disconnect();
        audioEl.pause();
        cancelAnimationFrame(animationRef.current);
      } catch {}
    };
  }, [songData]);

  useEffect(() => {
    async function connectNodes() {
      if (!audioCtxRef.current || !sourceRef.current || !gainNodeRef.current)
        return;

      filterNodesRef.current.forEach((f) => f.disconnect());
      const filters = await createFilters(audioCtxRef.current, filtersApplied);
      filterNodesRef.current = filters;

      sourceRef.current.disconnect();
      gainNodeRef.current.disconnect();

      let nodeChain = sourceRef.current;

      filters.forEach((f) => {
        if (nodeChain && f) {
          nodeChain.connect(f);
          nodeChain = f;
        }
      });

      if (nodeChain && gainNodeRef.current)
        nodeChain.connect(gainNodeRef.current);
      if (gainNodeRef.current && analyser) {
        gainNodeRef.current.connect(analyser);
        analyser.connect(audioCtxRef.current.destination);
      }
    }

    connectNodes();
  }, [round, songData, analyser]);

  function updateProgress() {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const elapsed = audio.currentTime - clipStart;
    const clamped = Math.max(0, Math.min(elapsed, CLIP_LENGTH));
    setProgress(clamped / CLIP_LENGTH);

    if (elapsed < CLIP_LENGTH && !audio.paused) {
      animationRef.current = requestAnimationFrame(updateProgress);
    } else {
      audio.pause();
      setIsPlaying(false);
      setProgress(1);
    }
  }

  function togglePlay() {
    if (!audioRef.current || !audioCtxRef.current || clipStart === null) return;
    const audio = audioRef.current;
    audioCtxRef.current.resume();

    if (!isPlaying) {
      if (
        !audio.startedOnce ||
        audio.currentTime < clipStart ||
        audio.currentTime >= clipStart + CLIP_LENGTH
      ) {
        audio.currentTime = clipStart;
        setProgress(0);
        audio.startedOnce = true;
      }
      audio.play();
      setIsPlaying(true);
      animationRef.current = requestAnimationFrame(updateProgress);
    } else {
      audio.pause();
      cancelAnimationFrame(animationRef.current);
      setIsPlaying(false);
    }
  }

  function submitGuess() {
    if (!guessText.trim() || !canGuess) return;
    const guess = guessText.toLowerCase().replace(/\s+/g, "");
    const isCorrect =
      songData &&
      [songData.title.toLowerCase().replace(/\s+/g, "")].some((t) =>
        t.includes(guess)
      );
    const isPartialCorrect =
      songData &&
      [songData.artist.toLowerCase().replace(/\s+/g, "")].some((t) =>
        t.includes(guess)
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
    if (audioRef.current) {
      audioRef.current.currentTime = clipStart || 0;
      audioRef.current.pause();
    }
    cancelAnimationFrame(animationRef.current);
    setIsPlaying(false);
    setProgress(0);
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
