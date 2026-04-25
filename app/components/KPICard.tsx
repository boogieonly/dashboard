'use client';

import React from 'react';

interface KPICardProps {
  title: string;
  value: number;
  emoji: string;
  gradient: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, emoji, gradient }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] p-8 flex flex-col items-center justify-center min-h-[220px] text-white ${gradient}`}>
      <div className="text-6xl mb-6 animate-bounce">{emoji}</div>
      <h3 className="text-2xl font-bold mb-2 text-center tracking-tight">{title}</h3>
      <p className="text-5xl font-black drop-shadow-lg">{value.toLocaleString()}</p>
    </div>
  );
};

export default KPICard;
