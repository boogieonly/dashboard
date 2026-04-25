'use client';

import React from 'react';

interface KPICardProps {
  title: string;
  value: string;
  emoji: string;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, emoji, color }) => (
  <div className="w-full max-w-xs sm:max-w-sm mx-auto">
    <div
      className={`
        relative bg-gradient-to-br ${color} bg-opacity-20 backdrop-blur-3xl 
        border border-white/20 hover:border-white/40 
        rounded-3xl p-6 sm:p-8 lg:p-12 
        shadow-2xl hover:shadow-[0_35px_60px_rgba(0,0,0,0.3)] 
        ring-1 ring-white/10 hover:ring-2 hover:ring-white/30
        transition-all duration-500 ease-out 
        group hover:-translate-y-2 hover:scale-[1.02] hover:shadow-3xl
        min-h-[200px] sm:min-h-[240px] flex flex-col items-center justify-center gap-4
      `}
    >
      <div className="
        text-5xl sm:text-6xl lg:text-7xl 
        filter drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] 
        group-hover:drop-shadow-[0_0_35px_rgba(255,255,255,0.9)] 
        transition-all duration-500 ease-out
        animate-pulse
      ">
        {emoji}
      </div>
      <div className="
        text-3xl sm:text-4xl lg:text-5xl 
        font-black text-white tracking-tight drop-shadow-2xl
      ">
        {value}
      </div>
      <p className="
        text-lg sm:text-xl font-semibold 
        text-white/90 text-center tracking-wide drop-shadow-lg
        px-2
      ">
        {title}
      </p>
    </div>
  </div>
);

export default KPICard;
