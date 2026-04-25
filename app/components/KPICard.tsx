'use client';

import React from 'react';

interface KPICardProps {
  title: string;
  value: string;
  emoji: string;
  gradient: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, emoji, gradient }) => {
  return (
    <div className={`group relative overflow-hidden rounded-3xl p-6 md:p-8 bg-white/10 backdrop-blur-3xl border border-white/20 shadow-2xl hover:shadow-[0_0_4rem_rgba(255,255,255,0.3)] hover:scale-105 transition-all duration-500 ease-out text-white text-center max-w-sm w-full mx-auto`}>
      {/* Dynamic gradient background layer */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60 blur-sm -z-10 animate-pulse`} />
      <div className="relative z-10 flex flex-col items-center justify-center space-y-4 min-h-[200px] md:min-h-[220px]">
        {/* Large emoji with glow */}
        <div className="text-5xl md:text-6xl drop-shadow-[0_25px_25px_rgba(0,0,0,0.3)] group-hover:drop-shadow-[0_0_2rem_rgba(255,255,255,0.6)] transition-all duration-500 mb-2 md:mb-4">
          {emoji}
        </div>
        {/* Value */}
        <div className="text-3xl md:text-4xl lg:text-5xl font-black drop-shadow-2xl leading-tight tracking-tight">
          {value}
        </div>
        {/* Title */}
        <div className="text-lg md:text-xl font-semibold opacity-90 drop-shadow-sm tracking-wide uppercase">
          {title}
        </div>
      </div>
    </div>
  );
};

export default KPICard;
