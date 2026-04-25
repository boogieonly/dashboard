'use client';

import React from 'react';

type Material = {
  name: string;
  emoji: string;
  percent: number;
};

const materials: Material[] = [
  { name: 'Cobre', emoji: '🟡', percent: 85 },
  { name: 'Latão', emoji: '🟠', percent: 45 },
  { name: 'Alumínio', emoji: '⚪', percent: 25 },
  { name: 'Inox', emoji: '🟤', percent: 90 },
  { name: 'Aço', emoji: '🔩', percent: 60 },
  { name: 'Bronze', emoji: '🟣', percent: 10 },
];

function getBarColor(percent: number): string {
  if (percent >= 70) return 'fill-emerald-400';
  if (percent >= 30) return 'fill-amber-400';
  return 'fill-rose-400';
}

export default function MaterialCard() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
        {materials.map((mat, index) => (
          <div
            key={index}
            className="group relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-xl hover:scale-[1.02] hover:shadow-2xl hover:ring-4 hover:ring-white/30 transition-all duration-500 overflow-hidden"
          >
            {/* Shine overlay */}
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 h-full w-[200%]" />
            </div>
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="text-5xl sm:text-6xl mb-4 drop-shadow-lg">{mat.emoji}</div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 drop-shadow-md tracking-wide">
                {mat.name}
              </h3>
              <svg viewBox="0 0 100 20" className="w-full max-w-xs h-5 sm:h-6 mb-6 flex-shrink-0">
                <rect
                  x="1"
                  y="1"
                  width="98"
                  height="18"
                  rx="9"
                  className="fill-slate-300/20"
                />
                <rect
                  x="1"
                  y="1"
                  width="98"
                  height="18"
                  rx="9"
                  className={getBarColor(mat.percent)}
                >
                  <animate
                    attributeName="width"
                    from="0"
                    to={`${mat.percent}`}
                    dur="1.2s"
                    begin={`${(index * 0.15).toFixed(1)}s`}
                    fill="freeze"
                  />
                </rect>
              </svg>
              <div className="text-3xl sm:text-4xl font-black text-white drop-shadow-2xl">
                {mat.percent}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
