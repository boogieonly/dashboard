'use client'

import React from 'react';

interface MaterialCardProps {
  title: string;
  children: React.ReactNode;
}

const MaterialCard: React.FC<MaterialCardProps> = ({ title, children }) => {
  return (
    <div className="bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/30 shadow-2xl rounded-3xl p-8 border border-white/30 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 pb-6 border-b border-gray-200/50">
        {title}
      </h2>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

export default MaterialCard;
