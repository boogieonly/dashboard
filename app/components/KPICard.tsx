'use client'

import React from 'react';

type KPICardProps = {
  title: string;
  value: string | number;
};

const KPICard: React.FC<KPICardProps> = ({ title, value }) => {
  return (
    <div className="group relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 sm:p-8 rounded-3xl shadow-2xl hover:shadow-3xl border border-white/20 backdrop-blur-xl max-w-sm w-full mx-auto transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]">
      <h3 className="text-white/90 text-sm font-semibold uppercase tracking-wider mb-4 drop-shadow-md">
        {title}
      </h3>
      <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white drop-shadow-2xl">
        {value}
      </div>
    </div>
  );
};

export default KPICard;
