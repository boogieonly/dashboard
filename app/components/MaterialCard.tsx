'use client';

import React from 'react';

type Material = {
  name: string;
  emoji: string;
  percentage: number;
};

const materials: Material[] = [
  { name: 'Cobre', emoji: '🟡', percentage: 85 },
  { name: 'Latão', emoji: '🟠', percentage: 45 },
  { name: 'Alumínio', emoji: '⚪', percentage: 25 },
  { name: 'Inox', emoji: '🟤', percentage: 90 },
  { name: 'Aço', emoji: '🔩', percentage: 60 },
  { name: 'Bronze', emoji: '🟣', percentage: 10 },
];

const MaterialCard = () => {
  const getColorClass = (percentage: number): string => {
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {materials.map((material, index) => (
          <div
            key={index}
            className="group relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-white/30 hover:scale-[1.02] hover:bg-white/20 transition-all duration-500 overflow-hidden cursor-pointer"
          >
            {/* Emoji and Percentage */}
            <div className="flex items-start justify-between mb-6">
              <div className="text-5xl flex-shrink-0">{material.emoji}</div>
              <div className="text-3xl font-bold bg-black/20 px-4 py-2 rounded-xl text-white ml-4">
                {material.percentage}%
              </div>
            </div>

            {/* Material Name */}
            <h3 className="text-2xl font-bold text-white mb-8 drop-shadow-lg">
              {material.name}
            </h3>

            {/* Progress Bar */}
            <div className="w-full bg-white/30 rounded-full h-6 overflow-hidden shadow-inner">
              <div
                className={`h-6 rounded-full ${getColorClass(material.percentage)} shadow-lg transition-all duration-1500 ease-out origin-left`}
                style={{ width: `${material.percentage}%` }}
              />
            </div>

            {/* Hover Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -skew-x-12 -rotate-2 origin-bottom-left scale-x-[3]" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaterialCard;
