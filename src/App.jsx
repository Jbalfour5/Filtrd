import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import PlayerCard from "./components/PlayerCard";
import GuessInput from "./components/GuessInput";
import GuessHistory from "./components/GuessHistory";
import RevealedAnswer from "./components/RevealedAnswer";
import { redirectToAuthCodeFlow } from "./backend/spotifyAuth";

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const PLAYLIST_ID = "37i9dQZF1DX0XUsuxWHRQd";
const TOTAL_ROUNDS = 6;
const FILTER_LEVELS = [6, 5, 4, 3, 2, 0];
const ALL_FILTERS = [
  { name: "Low Cut", description: "Removes low frequencies" },
  { name: "High Cut", description: "Removes high frequencies" },
  { name: "Bit Crusher", description: "Reduces audio quality" },
  { name: "Reverb", description: "Adds echo effect" },
  { name: "Distortion", description: "Adds gritty distortion" },
  { name: "Band Pass", description: "Narrows frequency range" },
  { name: "Phaser", description: "Creates sweeping effect" },
  { name: "Flanger", description: "Adds jet-like sound" },
  { name: "Chorus", description: "Thickens the sound" },
  { name: "EQ Cut", description: "Reduces specific frequencies" },
];

export default function App() {
  const [round, setRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [guessText, setGuessText] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [revealedAnswer, setRevealedAnswer] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [songData, setSongData] = useState(null);
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);

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
    const token = localStorage.getItem("spotify_access_token");

    if (!token && window.location.pathname !== "/auth/callback") {
      redirectToAuthCodeFlow(CLIENT_ID);
      return;
    }
    if (!token) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: "Filtrd Game Player",
        getOAuthToken: (cb) => cb(token),
        volume: 0.5,
      });

      spotifyPlayer.addListener("ready", ({ device_id }) => {
        console.log("Spotify ready with device:", device_id);
        setPlayer(spotifyPlayer);
        setDeviceId(device_id);
      });

      spotifyPlayer.connect();
    };
  }, []);

  useEffect(() => {
    if (!deviceId) return;

    async function fetchTrack() {
      const token = localStorage.getItem("spotify_access_token");
      const res = await fetch(
        `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks?limit=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      const tracks = data.items
        .map((item) => item.track)
        .filter((track) => track && track.is_playable);
      if (!tracks.length) return console.error("No playable tracks");

      const track = tracks[Math.floor(Math.random() * tracks.length)];

      setSongData({
        title: track.name,
        artist: track.artists.map((a) => a.name).join(", "),
        uri: track.uri,
      });

      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          body: JSON.stringify({ uris: [track.uri] }),
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    }

    fetchTrack();
  }, [deviceId]);

  function togglePlay() {
    if (!player) return;
    player.togglePlay().then(() => setIsPlaying((p) => !p));
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

    if (isCorrect) {
      setRevealedAnswer(songData);
    } else if (round < TOTAL_ROUNDS - 1) {
      setRound((r) => r + 1);
    } else {
      setRevealedAnswer(songData);
    }
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
            playerReady={!!player && !!deviceId}
            songData={songData}
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
