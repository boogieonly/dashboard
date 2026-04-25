'use client'

import React from 'react';

interface MaterialCardProps {
  name: string;
  estoque: number;
  uso: number;
}

const MaterialCard: React.FC<MaterialCardProps> = ({ name, estoque, uso }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 w-full max-w-sm mx-auto hover:shadow-xl transition-all duration-300 sm:max-w-md md:max-w-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 truncate">{name}</h3>
      <div className="space-y-2">
        <p className="text-lg text-gray-700 font-medium">
          Estoque: <span className="text-green-600 font-semibold">{estoque}</span>
        </p>
        <p className="text-lg text-gray-700 font-medium">
          Uso: <span className="text-blue-600 font-semibold">{uso}</span>
        </p>
      </div>
    </div>
  );
};

export default MaterialCard;
