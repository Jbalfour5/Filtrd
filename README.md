<h1 align="center">
Filtrd
</h1>

<h2 align="center">A Filter-Reveal Music Guessing Game</h2>

<div align="center">

[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)](#)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3+-38B2AC?logo=tailwindcss&logoColor=white)](#)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-Enabled-blue)](#)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen)](#)

</div>

<br/>

---

## 🎵 Introduction

**Filtrd** is an interactive audio-guessing game inspired by titles like **Heardle** and **Bandle**—but with a unique twist.

Each round begins with a **heavily filtered version** of a song. Players guess the **song title** or **artist**, and with every incorrect or partial guess, one of six audio filters is removed. The track becomes progressively clearer until the player either identifies it—or all filters are gone.

Filtrd runs entirely **client-side**, leveraging the **Web Audio API** for real-time effects and a simple **JSON file** for song storage.

---

## ✨ Features

- 🎧 Progressive audio reveal using live Web Audio filters  
- 🎚️ 6 custom DSP audio effects  
- 🔍 Smart guessing system (title match / artist match / incorrect)  
- 📈 Guess history tracking  
- 📱 Fully responsive UI  
- ⚡ Fast, client-side performance (no backend required)  
- 🎵 Expandable song list (via JSON)  

---

## 🧠 Core Gameplay

1. The player starts a new round.
2. A **fully filtered** version of the song plays.
3. The player submits a guess or chooses to skip.
4. The system evaluates:
   - ✅ **Correct (Title Match):** Instant win  
   - 🔶 **Partial Correct (Artist Match):** Hint given, remove one filter  
   - ❌ **Incorrect:** Remove one filter  
5. The updated audio (with one fewer filter) plays.
6. Repeat until:
   - 🎉 Correct guess  
   - ⚠️ All filters removed  

This progression-based reveal makes each round tense, challenging, and rewarding.

---

## 🎚️ Audio Filters

Filtrd’s signature experience is built using six distinct Web Audio API effects:

- **Reverb** — Adds space and echo, masking detail  
- **Distortion** — Alters timbre with saturation  
- **Pitch Shift** — Raises/lowers pitch for confusion  
- **Modulated Delay** — Adds rhythmic smearing  
- **Low Cut** — Removes low frequencies  
- **High Cut** — Removes high frequencies  

Filters are removed **one at a time**, revealing the true audio beneath.

---

## 🎨 UI & UX

- Clean, minimal interface to emphasize listening  
- Filter tracker showing remaining audio effects  
- Mobile and desktop responsive layout  
- Immediate feedback for correct, partial, or wrong guesses  
- Smooth transitions and intuitive user flow  

---

## 🛠️ Technology Stack

- **Frontend:** React, Tailwind CSS  
- **Audio Processing:** Web Audio API  
- **Data Storage:** Local JSON file for songs and metadata  
- **State Management:** React hooks  

Filtrd requires **no backend server** and runs fully in-browser.

---

## 📂 Project Structure
```plaintext
FILTRD/
├── public/
│   ├── songs/
│   ├── worklets/
│   │   ├── distortion-processor.js
│   │   ├── highcut-processor.js
│   │   ├── lowcut-processor.js
│   │   ├── pitchshifter-processor.js
│   │   └── reverb-processor.js
│   │
│   ├── songs.json
│   └── vite.svg
│
├── src/
│   ├── components/
│   │   ├── icons/
│   │   │   ├── IconFilter.jsx
│   │   │   ├── IconPause.jsx
│   │   │   └── IconPlay.jsx
│   │   ├── ActiveFilters.jsx
│   │   ├── GuessHistory.jsx
│   │   ├── GuessInput.jsx
│   │   ├── Header.jsx
│   │   ├── PlayerCard.jsx
│   │   ├── RevealedAnswer.jsx
│   │   └── TinyWaveform.jsx
│   │
│   ├── filters/
│   │   ├── distortionnode.js
│   │   ├── highcutnode.js
│   │   ├── lowcutnode.js
│   │   ├── pitchshifternode.js
│   │   └── reverbnode.js
│   │
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   ├── index.jsx
│   └── main.jsx
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

---

## 🚀 Installation & Setup

```bash
# Clone the repository
git clone https://github.com/Jbalfour5/filtrd.git
cd filtrd

# Install dependencies
npm install

# Start the development server
npm run dev
```

---

## ➕ Adding New Songs

To add new tracks to the game:

1. Drop your audio file in `public/songs/`
2. Update `public/songs.json` with:

```json
{
  "title": "Song Name",
  "artist": "Artist Name",
  "file": "song-filename.mp3"
}
```
Be sure the file name matches exactly.




