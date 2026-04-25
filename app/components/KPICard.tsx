'use client';

import React from 'react';

type KPICardProps = {
  title: string;
  value: string;
  emoji: string;
  gradient: string;
};

export default function KPICard({ title, value, emoji, gradient }: KPICardProps) {
  return (
    <div
      className={`group flex flex-col items-center justify-center min-h-[200px] p-6 sm:p-8 md:p-10 lg:p-12 rounded-3xl
        border-2 border-white/20
        bg-gradient-to-br ${gradient}
        bg-white/10 backdrop-blur-3xl
        shadow-2xl
        hover:scale-105 hover:-translate-y-2 hover:shadow-[0_0_3rem_rgba(255,255,255,0.5)]
        hover:border-white/40
        transition-all duration-500 ease-out
        cursor-pointer select-none
        active:scale-95
        sm:min-h-[220px]
        md:min-h-[240px]
        lg:min-h-[280px]`}
    >
      <div className="mb-4 sm:mb-6 text-4xl sm:text-5xl lg:text-6xl drop-shadow-2xl drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-pulse">
        {emoji}
      </div>
      <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white drop-shadow-xl mb-2 sm:mb-3 text-center leading-tight tracking-tight">
        {value}
      </div>
      <p className="text-base sm:text-lg md:text-xl font-semibold uppercase tracking-widest text-white/90 text-center drop-shadow-md">
        {title}
      </p>
    </div>
  );
}
