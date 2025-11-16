import React from 'react';

export default function TinyWaveform({ progress = 0 }) {
  const barHeights = [20, 30, 40].map(height => height * progress);
  
  return (
    <div className="relative w-full h-14 flex items-center justify-center overflow-hidden">
      <canvas id="tinyWaveCanvas" className="absolute inset-0 w-full h-full"></canvas>
      <div className="absolute inset-0 flex items-end gap-2 px-2 opacity-40">
        {barHeights.map((height, i) => (
          <div
            key={i}
            className="flex-1 bg-indigo-500 rounded-full transition-all"
            style={{ height: `${height}px` }}
          />
        ))}
      </div>
    </div>
  );
}