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
    title: "BED",
    artist: "Joel Corry, RAYE & David Guetta",
    url: "/songs/12 - BED.mp3",
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
    title: "REACT",
    artist: "Switch Disco ft. Ella Henderson",
    url: "/songs/31 - REACT.mp3",
  },
  { title: "greedy", artist: "Tate McRae", url: "/songs/32 - greedy.mp3" },
  {
    title: "Timber",
    artist: "Pitbull ft. Ke$ha",
    url: "/songs/032 - Pitbull - Timber (Lyrics) ft. Ke$ha.mp3",
  },
  { title: "Flowers", artist: "Miley Cyrus", url: "/songs/33 - Flowers.mp3" },
  {
    title: "Watch Me (Whip/Nae Nae)",
    artist: "Silentó",
    url: "/songs/033 - Silentó - Watch Me (Whip/Nae Nae) (Official).mp3",
  },
  {
    title: "Eyes Closed",
    artist: "Ed Sheeran",
    url: "/songs/34 - Eyes Closed.mp3",
  },
  {
    title: "In My Feelings",
    artist: "Drake",
    url: "/songs/034 - In My Feelings.mp3",
  },
  {
    title: "Cruel Summer",
    artist: "Taylor Swift",
    url: "/songs/35 - Cruel Summer.mp3",
  },
  {
    title: "Life is Good",
    artist: "Future ft. Drake",
    url: "/songs/035 - Future, Drake - Life is Good (Clean - Lyrics).mp3",
  },
  { title: "Houdini", artist: "Dua Lipa", url: "/songs/36 - Houdini.mp3" },
  {
    title: "INDUSTRY BABY",
    artist: "Lil Nas X ft. Jack Harlow",
    url: "/songs/036 - Lil Nas X - INDUSTRY BABY (Clean - Lyrics) feat. Jack Harlow.mp3",
  },
  {
    title: "Stick Season",
    artist: "Noah Kahan",
    url: "/songs/37 - Stick Season.mp3",
  },
  {
    title: "FE!N",
    artist: "Travis Scott ft. Playboi Carti",
    url: "/songs/037 - Travis Scott - FE!N (Clean - Lyrics) feat. Playboi Carti.mp3",
  },
  {
    title: "EARFQUAKE",
    artist: "Tyler, The Creator",
    url: "/songs/038 - EARFQUAKE.mp3",
  },
  {
    title: "Pointless",
    artist: "Lewis Capaldi",
    url: "/songs/38 - Pointless.mp3",
  },
  {
    title: "Wait For U",
    artist: "Future ft. Drake & Tems",
    url: "/songs/039 - Future - Wait For U (Clean - Lyrics) feat. Drake & Tems.mp3",
  },
  { title: "Kill Bill", artist: "SZA", url: "/songs/39 - Kill Bill.mp3" },
  { title: "Don't", artist: "Ed Sheeran", url: "/songs/040 - Don't.mp3" },
  {
    title: "Espresso",
    artist: "Sabrina Carpenter",
    url: "/songs/41 - Espresso.mp3",
  },
  {
    title: "The Hills",
    artist: "The Weeknd",
    url: "/songs/041 - The Weeknd - The Hills.mp3",
  },
  {
    title: "Lose Control",
    artist: "Teddy Swims",
    url: "/songs/42 - Lose Control.mp3",
  },
  {
    title: "Starboy",
    artist: "The Weeknd ft. Daft Punk",
    url: "/songs/042 - Starboy.mp3",
  },
  { title: "APT.", artist: "ROSÉ & Bruno Mars", url: "/songs/43 - APT..mp3" },
  {
    title: "Dancing With A Stranger",
    artist: "Sam Smith & Normani",
    url: "/songs/043 - Sam Smith, Normani - Dancing With A Stranger (Official Music Video).mp3",
  },
  {
    title: "Beautiful Things",
    artist: "Benson Boone",
    url: "/songs/44 - Beautiful Things.mp3",
  },
  {
    title: "Levitating",
    artist: "Dua Lipa ft. DaBaby",
    url: "/songs/044 - Dua Lipa - Levitating Featuring DaBaby (Official Music Video).mp3",
  },
  {
    title: "HOT TO GO!",
    artist: "Chappell Roan",
    url: "/songs/45 - HOT TO GO!.mp3",
  },
  {
    title: "Die With A Smile",
    artist: "Lady Gaga & Bruno Mars",
    url: "/songs/46 - Die With A Smile.mp3",
  },
  {
    title: "Cooler Than Me",
    artist: "Mike Posner",
    url: "/songs/046 - Mike Posner - Cooler Than Me (Lyrics).mp3",
  },
  {
    title: "Beauty And A Beat",
    artist: "Justin Bieber ft. Nicki Minaj",
    url: "/songs/047 - Beauty And A Beat.mp3",
  },
  {
    title: "Sunroof",
    artist: "Nicky Youre & dazy",
    url: "/songs/048 - Nicky Youre, dazy - Sunroof (Lyrics).mp3",
  },
  {
    title: "Stargazing",
    artist: "Myles Smith",
    url: "/songs/48 - Stargazing.mp3",
  },
  {
    title: "Let Me Love You",
    artist: "DJ Snake ft. Justin Bieber",
    url: "/songs/049 - DJ Snake - Let Me Love You ft. Justin Bieber.mp3",
  },
  {
    title: "i like the way you kiss me",
    artist: "Artemas",
    url: "/songs/49 - i like the way you kiss me.mp3",
  },
  {
    title: "Havana",
    artist: "Camila Cabello ft. Young Thug",
    url: "/songs/050 - Camila Cabello - Havana (Lyrics) ft. Young Thug.mp3",
  },
  {
    title: "Strangers",
    artist: "Kenya Grace",
    url: "/songs/51 - Strangers.mp3",
  },
  {
    title: "No Scrubs",
    artist: "TLC",
    url: "/songs/051 - TLC - No Scrubs (Lyrics).mp3",
  },
  { title: "Foolish", artist: "Ashanti", url: "/songs/052 - Foolish.mp3" },
  {
    title: "Guess",
    artist: "Charli xcx ft. Billie Eilish",
    url: "/songs/52 - Guess feat. billie eilish.mp3",
  },
  {
    title: "Austin (Boots Stop Workin')",
    artist: "Dasha",
    url: "/songs/53 - Austin (Boots Stop Workin').mp3",
  },
  {
    title: "Return of the Mack",
    artist: "Mark Morrison",
    url: "/songs/053 - Mark Morrison - Return of the Mack (Official Music Video).mp3",
  },
  {
    title: "Finesse (Remix)",
    artist: "Bruno Mars ft. Cardi B",
    url: "/songs/054 - Bruno Mars - Finesse (Remix) (feat. Cardi B) (Official Music Video).mp3",
  },
  {
    title: "People Watching",
    artist: "Conan Gray",
    url: "/songs/54 - People Watching.mp3",
  },
  {
    title: "Wild Thoughts",
    artist: "DJ Khaled ft. Rihanna & Bryson Tiller",
    url: "/songs/055 - DJ Khaled - Wild Thoughts (Official Video) ft. Rihanna, Bryson Tiller.mp3",
  },
  {
    title: "Training Season",
    artist: "Dua Lipa",
    url: "/songs/55 - Training Season.mp3",
  },
  {
    title: "Lovin On Me",
    artist: "Jack Harlow",
    url: "/songs/056 - Jack Harlow - Lovin On Me [Official Music Video].mp3",
  },
  { title: "LUNCH", artist: "Billie Eilish", url: "/songs/56 - LUNCH.mp3" },
  { title: "Houdini", artist: "Eminem", url: "/songs/57 - Houdini.mp3" },
  {
    title: "All Falls Down",
    artist: "Kanye West ft. Syleena Johnson",
    url: "/songs/All Falls Down (Clean) - Kanye West (feat. Syleena Johnson).mp3",
  },
  { title: "Bad Habit", artist: "Steve Lacy", url: "/songs/Bad_Habit.mp3" },
  {
    title: "Beat It",
    artist: "Michael Jackson",
    url: "/songs/Beat It - Michael Jackson (Lyrics).mp3",
  },
  { title: "beside you", artist: "Keshi", url: "/songs/beside_you.mp3" },
  {
    title: "Best Part",
    artist: "Daniel Caesar ft. H.E.R.",
    url: "/songs/Best_Part.mp3",
  },
  {
    title: "Bound 2",
    artist: "Kanye West",
    url: "/songs/Bound 2 (Clean) - Kanye West (feat. Charlie Wilson & Brenda Lee).mp3",
  },
  {
    title: "ALL MINE",
    artist: "Brent Faiyaz",
    url: "/songs/Brent Faiyaz - ALL MINE (Clean) (Lyrics) - Full Audio, 4k Video.mp3",
  },
  {
    title: "Clouded",
    artist: "Brent Faiyaz",
    url: "/songs/Brent Faiyaz - Clouded CLEAN.mp3",
  },
  {
    title: "Grenade",
    artist: "Bruno Mars",
    url: "/songs/Bruno Mars - Grenade (Clean Version).mp3",
  },
  {
    title: "Talking To The Moon",
    artist: "Bruno Mars",
    url: "/songs/Bruno Mars - Talking To The Moon (Official Lyric Video).mp3",
  },
  {
    title: "Treasure",
    artist: "Bruno Mars",
    url: "/songs/Bruno Mars - Treasure (Official Music Video).mp3",
  },
  {
    title: "Chamber Of Reflection",
    artist: "Mac DeMarco",
    url: "/songs/Chamber_Of_Reflection.mp3",
  },
  {
    title: "Best I Ever Had",
    artist: "Drake",
    url: "/songs/Drake - Best I Ever Had (Clean Version).mp3",
  },
  {
    title: "God's Plan",
    artist: "Drake",
    url: "/songs/Drake - God's Plan (Clean - Lyrics).mp3",
  },
  {
    title: "Hotline Bling",
    artist: "Drake",
    url: "/songs/Drake - Hotline Bling (Super Clean).mp3",
  },
  {
    title: "Earfquake",
    artist: "Tyler, The Creator",
    url: "/songs/Earfquake.mp3",
  },
  {
    title: "Flashing Lights",
    artist: "Kanye West",
    url: "/songs/Flashing_Lights.mp3",
  },
  {
    title: "Chanel",
    artist: "Frank Ocean",
    url: "/songs/Frank Ocean - Chanel (Clean Version).mp3",
  },
  {
    title: "Thinkin Bout You",
    artist: "Frank Ocean",
    url: "/songs/Frank Ocean Thinkin Bout You Clean.mp3",
  },
  {
    title: "Gravity",
    artist: "Brent Faiyaz & DJ Dahi ft. Tyler, The Creator",
    url: "/songs/Gravity.mp3",
  },
  {
    title: "Homecoming",
    artist: "Kanye West ft. Chris Martin",
    url: "/songs/Homecoming (Clean) - Kanye West (feat. Chris Martin).mp3",
  },
  { title: "I Wonder", artist: "Kanye West", url: "/songs/I_Wonder.mp3" },
  {
    title: "Is There Someone Else?",
    artist: "The Weeknd",
    url: "/songs/Is_There_Someone_Else.mp3",
  },
  { title: "Ivy", artist: "Frank Ocean", url: "/songs/Ivy.mp3" },
  {
    title: "Empire State Of Mind",
    artist: "JAY-Z & Alicia Keys",
    url: "/songs/JAY-Z, Alicia Keys - Empire State Of Mind (Clean) | Lyrics.mp3",
  },
  {
    title: "Lost",
    artist: "Frank Ocean",
    url: "/songs/Lost (Clean) - Frank Ocean.mp3",
  },
  {
    title: "Payphone",
    artist: "Maroon 5 ft. Wiz Khalifa",
    url: "/songs/Maroon 5 - Payphone (Lyrics_Clean Version, No Rap).mp3",
  },
  {
    title: "Billie Jean",
    artist: "Michael Jackson",
    url: "/songs/Michael Jackson - Billie Jean (Lyrics).mp3",
  },
  {
    title: "Money Trees",
    artist: "Kendrick Lamar ft. Jay Rock",
    url: "/songs/Money_Trees.mp3",
  },
  {
    title: "Am I Wrong",
    artist: "Nico & Vinz",
    url: "/songs/Nico & Vinz - Am I Wrong [Official Music Video].mp3",
  },
  {
    title: "No Role Modelz",
    artist: "J. Cole",
    url: "/songs/No_Role_Modelz.mp3",
  },
  { title: "Passionfruit", artist: "Drake", url: "/songs/Passionfruit.mp3" },
  {
    title: "Pink + White",
    artist: "Frank Ocean",
    url: "/songs/Pink+White.mp3",
  },
  {
    title: "Rock With You",
    artist: "Michael Jackson",
    url: "/songs/Rock_With_You.mp3",
  },
  {
    title: "See You Again",
    artist: "Tyler, The Creator ft. Kali Uchis",
    url: "/songs/See_You_Again.mp3",
  },
  { title: "Snooze", artist: "SZA", url: "/songs/Snooze.mp3" },
  {
    title: "back to friends",
    artist: "sombr",
    url: "/songs/sombr - back to friends (official audio).mp3",
  },
  {
    title: "Kill Bill",
    artist: "SZA",
    url: "/songs/SZA - Kill Bill (Clean).mp3",
  },
  {
    title: "NIGHTS LIKE THIS",
    artist: "The Kid LAROI",
    url: "/songs/The Kid LAROI - NIGHTS LIKE THIS (Lyrics).mp3",
  },
  {
    title: "The Thrill",
    artist: "Wiz Khalifa ft. Empire of the Sun",
    url: "/songs/The_Thrill.mp3",
  },
  {
    title: "Too Good",
    artist: "Drake ft. Rihanna",
    url: "/songs/Too Good (Clean) - Drake (feat. Rihanna).mp3",
  },
  {
    title: "Stressed Out",
    artist: "Twenty One Pilots",
    url: "/songs/twenty one pilotsStressed Out.mp3",
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
    <div className="min-h-screen bg-white text-gray-900 flex items-start justify-center py-12 px-4 mb-48">
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
