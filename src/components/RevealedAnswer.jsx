import React from 'react';

export default function RevealedAnswer({ revealedAnswer, guesses }) {
  return (
    <div className="p-4 rounded-xl border border-green-300 bg-green-50 text-green-800">
      <div className="font-semibold mb-1">
        {guesses.some(g => g.correct) ? '🎉 Correct!' : 'Game Over - Answer Revealed:'}
      </div>
      <div className="text-lg">{revealedAnswer.title} — {revealedAnswer.artist}</div>
      <div className="text-xs mt-2 text-green-600">
        {guesses.some(g => g.correct) 
          ? `You guessed it in round ${guesses.find(g => g.correct).round}!` 
          : 'Better luck next time!'}
      </div>
    </div>
  );
}