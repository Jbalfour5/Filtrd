import React, { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import PlayerCard from "./components/PlayerCard";
import GuessInput from "./components/GuessInput";
import GuessHistory from "./components/GuessHistory";
import RevealedAnswer from "./components/RevealedAnswer";
import { createHighCutNode } from "./filters/highcutnode";
import { createLowCutNode } from "./filters/lowcutnode";

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
  {
    title: "Blinding Lights",
    artist: "The Weeknd",
    url: "/songs/01 - Blinding Lights.mp3",
  },
  {
    title: "One Dance",
    artist: "Drake",
    url: "/songs/001 - Drake “One Dance” (Clean).mp3",
  },
  {
    title: "See You Again",
    artist: "Wiz Khalifa ft. Charlie Puth",
    url: "/songs/01 - Wiz Khalifa - See You Again ft. Charlie Puth [Official Video] Furious 7 Soundtrack.mp3",
  },
  {
    title: "Heart Attack",
    artist: "Demi Lovato",
    url: "/songs/02 - Demi Lovato - Heart Attack (Official Video).mp3",
  },
  { title: "God's Plan", artist: "Drake", url: "/songs/002 - God's Plan.mp3" },
  { title: "Physical", artist: "Dua Lipa", url: "/songs/02 - Physical.mp3" },
  {
    title: "All The Stars",
    artist: "Kendrick Lamar & SZA",
    url: "/songs/003 - All The Stars.mp3",
  },
  {
    title: "Sweet Melody",
    artist: "Little Mix",
    url: "/songs/03 - Sweet Melody.mp3",
  },
  {
    title: "Rain On Me",
    artist: "Lady Gaga & Ariana Grande",
    url: "/songs/04 - Rain On Me.mp3",
  },
  {
    title: "Can't Feel My Face",
    artist: "The Weeknd",
    url: "/songs/004 - The Weeknd - Can't Feel My Face (Official Video).mp3",
  },
  {
    title: "Breaking Me",
    artist: "Topic & A7S",
    url: "/songs/05 - Breaking Me.mp3",
  },
  {
    title: "24K Magic",
    artist: "Bruno Mars",
    url: "/songs/005 - Bruno Mars - 24K Magic (Official Music Video).mp3",
  },
  {
    title: "Head & Heart",
    artist: "Joel Corry ft. MNEK",
    url: "/songs/06 - Head & Heart (feat. MNEK).mp3",
  },
  {
    title: "Uptown Funk",
    artist: "Mark Ronson ft. Bruno Mars",
    url: "/songs/006 - Mark Ronson - Uptown Funk (Official Video) ft. Bruno Mars.mp3",
  },
  {
    title: "Cheerleader (Felix Jaehn Remix)",
    artist: "OMI",
    url: "/songs/007 - OMI - Cheerleader (Felix Jaehn Remix) (Official Video) [Ultra Records].mp3",
  },
  {
    title: "Roses (Imanbek Remix)",
    artist: "SAINt JHN",
    url: "/songs/07 - Roses (Imanbek Remix).mp3",
  },
  {
    title: "Bad Habits",
    artist: "Ed Sheeran",
    url: "/songs/08 - Bad Habits.mp3",
  },
  {
    title: "Lean On",
    artist: "Major Lazer & DJ Snake",
    url: "/songs/008 - Major Lazer & DJ Snake - Lean On (feat. MØ) [Official 4K Music Video].mp3",
  },
  {
    title: "good 4 u",
    artist: "Olivia Rodrigo",
    url: "/songs/09 - good 4 u.mp3",
  },
  {
    title: "Lush Life",
    artist: "Zara Larsson",
    url: "/songs/009 - Zara Larsson - Lush Life (Official Video).mp3",
  },
  { title: "Easy On Me", artist: "Adele", url: "/songs/10 - Easy On Me.mp3" },
  {
    title: "Bad At Love",
    artist: "Halsey",
    url: "/songs/010 - Halsey - Bad At Love (Official Music Video).mp3",
  },
  {
    title: "Heartbreak Anthem",
    artist: "Galantis, David Guetta & Little Mix",
    url: "/songs/11 - Heartbreak Anthem.mp3",
  },
  {
    title: "What Do You Mean?",
    artist: "Justin Bieber",
    url: "/songs/011 - What Do You Mean? .mp3",
  },
  {
    title: "BED",
    artist: "Joel Corry, RAYE & David Guetta",
    url: "/songs/12 - BED.mp3",
  },
  {
    title: "Sorry",
    artist: "Justin Bieber",
    url: "/songs/012 - Justin Bieber - Sorry (PURPOSE :  The Movement).mp3",
  },
  {
    title: "STAY",
    artist: "The Kid LAROI & Justin Bieber",
    url: "/songs/13 - STAY.mp3",
  },
  { title: "Work", artist: "Rihanna ft. Drake", url: "/songs/013 - Work.mp3" },
  {
    title: "Remember",
    artist: "Becky Hill & David Guetta",
    url: "/songs/14 - Remember.mp3",
  },
  {
    title: "Unforgettable",
    artist: "French Montana ft. Swae Lee",
    url: "/songs/014 - Unforgettable.mp3",
  },
  { title: "abc (nicer)", artist: "GAYLE", url: "/songs/15 - abc (nicer).mp3" },
  {
    title: "Peru",
    artist: "Fireboy DML & Ed Sheeran",
    url: "/songs/015 - Fireboy DML & Ed Sheeran - Peru [Official Lyric Video].mp3",
  },
  {
    title: "Last Last",
    artist: "Burna Boy",
    url: "/songs/016 - Burna Boy - Last Last [Official Music Video].mp3",
  },
  {
    title: "Cold Heart (PNAU Remix)",
    artist: "Elton John & Dua Lipa",
    url: "/songs/16 - Cold Heart (PNAU Remix).mp3",
  },
  {
    title: "Heartless",
    artist: "Kanye West",
    url: "/songs/017 - Heartless.mp3",
  },
  {
    title: "My Universe",
    artist: "Coldplay x BTS",
    url: "/songs/17 - My Universe.mp3",
  },
  {
    title: "Before You Go",
    artist: "Lewis Capaldi",
    url: "/songs/18 - Before You Go.mp3",
  },
  { title: "Headlines", artist: "Drake", url: "/songs/018 - Headlines.mp3" },
  { title: "3005", artist: "Childish Gambino", url: "/songs/019 - 3005.mp3" },
  {
    title: "Anti-Hero",
    artist: "Taylor Swift",
    url: "/songs/19 - Anti-Hero.mp3",
  },
  {
    title: "Flashing Lights",
    artist: "Kanye West",
    url: "/songs/020 - Flashing Lights.mp3",
  },
  {
    title: "Unholy",
    artist: "Sam Smith ft. Kim Petras",
    url: "/songs/20 - Unholy.mp3",
  },
  { title: "20 Min", artist: "Lil Uzi Vert", url: "/songs/20_Min.mp3" },
  {
    title: "Pink + White",
    artist: "Frank Ocean",
    url: "/songs/021 - Pink + White.mp3",
  },
  {
    title: "Seventeen Going Under",
    artist: "Sam Fender",
    url: "/songs/21 - Seventeen Going Under (Edit).mp3",
  },
  {
    title: "As It Was",
    artist: "Harry Styles",
    url: "/songs/22 - As It Was.mp3",
  },
  {
    title: "Snooze",
    artist: "SZA",
    url: "/songs/022 - SZA - Snooze (Clean - Lyrics).mp3",
  },
  {
    title: "Hold On, We're Going Home",
    artist: "Drake ft. Majid Jordan",
    url: "/songs/023 - Hold On, We're Going Home (Album Version).mp3",
  },
  {
    title: "Where Are You Now",
    artist: "Lost Frequencies ft. Calum Scott",
    url: "/songs/23 - Where Are You Now.mp3",
  },
  {
    title: "About Damn Time",
    artist: "Lizzo",
    url: "/songs/24 - About Damn Time.mp3",
  },
  {
    title: "Save Your Tears",
    artist: "The Weeknd",
    url: "/songs/024 - Save Your Tears.mp3",
  },
  {
    title: "Afraid To Feel",
    artist: "LF SYSTEM",
    url: "/songs/25 - Afraid To Feel.mp3",
  },
  {
    title: "This Is What You Came For",
    artist: "Calvin Harris ft. Rihanna",
    url: "/songs/025 - Calvin Harris, Rihanna - This Is What You Came For (Official Video).mp3",
  },
  {
    title: "I Ain't Worried",
    artist: "OneRepublic",
    url: "/songs/26 - I Ain't Worried.mp3",
  },
  {
    title: "Light It Up (Remix)",
    artist: "Major Lazer ft. Nyla & Fuse ODG",
    url: "/songs/026 - Major Lazer - Light It Up (feat. Nyla & Fuse ODG) (Remix) [Official Lyric Video].mp3",
  },
  {
    title: "Forget Me",
    artist: "Lewis Capaldi",
    url: "/songs/27 - Forget Me.mp3",
  },
  {
    title: "Swalla",
    artist: "Jason Derulo ft. Nicki Minaj & Ty Dolla $ign",
    url: "/songs/027 - Jason Derulo - Swalla (feat. Nicki Minaj & Ty Dolla $ign) [Official Music Video].mp3",
  },
  {
    title: "California Gurls",
    artist: "Katy Perry ft. Snoop Dogg",
    url: "/songs/028 - Katy Perry - California Gurls (Official Music Video) ft. Snoop Dogg.mp3",
  },
  {
    title: "Made You Look",
    artist: "Meghan Trainor",
    url: "/songs/28 - Made You Look.mp3",
  },
  {
    title: "Don't Stop The Music",
    artist: "Rihanna",
    url: "/songs/029 - Don't Stop The Music.mp3",
  },
  {
    title: "Green Green Grass",
    artist: "George Ezra",
    url: "/songs/29 - Green Green Grass.mp3",
  },
  {
    title: "Meet Me Halfway",
    artist: "Black Eyed Peas",
    url: "/songs/030 - Meet Me Halfway.mp3",
  },
  {
    title: "vampire",
    artist: "Olivia Rodrigo",
    url: "/songs/30 - vampire.mp3",
  },
  {
    title: "Party In The U.S.A.",
    artist: "Miley Cyrus",
    url: "/songs/031 - Miley Cyrus - Party In The U.S.A. (Official Video).mp3",
  },
  {
    title: "Stressed Out",
    artist: "Twenty One Pilots",
    url: "/songs/twenty one pilots:  Stressed Out [OFFICIAL VIDEO].mp3",
  },
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
  const filterNodesRef = useRef([]);

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
      const highCut = await createHighCutNode(ctx, 10000);
      filters.push(highCut);
    }
    if (level >= 2) {
      const lowCut = await createLowCutNode(ctx, 2000);
      filters.push(lowCut);
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
