'use client';

import React, { useEffect, useState } from 'react';

type MaterialCardProps = {
  name: string;
  stock: number;
  total: number;
  emoji: string;
};

const MaterialCard: React.FC<MaterialCardProps> = ({ name, stock, total, emoji }) => {
  const percent = total > 0 ? Math.min(100, Math.max(0, (stock / total) * 100)) : 0;
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    setBarWidth(percent);
  }, [percent]);

  const getGradient = (p: number): string => {
    if (p >= 70) return 'from-emerald-400 via-emerald-500 to-emerald-600';
    if (p >= 30) return 'from-amber-400 via-amber-500 to-amber-600';
    return 'from-rose-400 via-rose-500 to-rose-600';
  };

  const getTextColor = (p: number): string => {
    if (p >= 70) return 'text-emerald-100';
    if (p >= 30) return 'text-amber-100';
    return 'text-rose-100';
  };

  return (
    <div className="group relative max-w-sm w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/30 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] hover:shadow-emerald-500/20 hover:scale-[1.02] transition-all duration-500 ease-out overflow-hidden">
      {/* Shine overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
        {/* Emoji bubble */}
        <div className="flex-shrink-0 p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg hover:shadow-emerald-500/30 transition-shadow duration-300">
          <span className="text-4xl sm:text-5xl select-none">{emoji}</span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-3 sm:mb-4 truncate pr-4">{name}</h3>

          {/* Progress bar container */}
          <div className="relative w-full h-3 sm:h-4 bg-white/20 rounded-full overflow-hidden border border-white/30 shadow-inner">
            <div
              className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getGradient(percent)} shadow-lg transition-all duration-1500 ease-out origin-left group-hover:brightness-110 group-hover:shadow-[0_0_1rem_rgba(255,255,255,0.5)]`}
              style={{ width: `${barWidth}%` }}
            />
          </div>

          {/* Stock info */}
          <div className="flex justify-between items-center mt-4 text-sm sm:text-base font-semibold">
            <span className="text-white/90">{stock}/{total}</span>
            <span className={`${getTextColor(percent)} text-lg sm:text-xl font-bold drop-shadow-md`}>
              {percent.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialCard;
