'use client';

import { useState } from 'react';

type Commodity = {
  name: string;
  price: string;
  variation: number;
};

const commodities: string[] = ['Cobre', 'Alumínio', 'Níquel', 'Zinco', 'Chumbo', 'Estanho', 'Dólar'];

const dailyData: Commodity[] = [
  { name: 'Cobre', price: '$9.520', variation: 1.23 },
  { name: 'Alumínio', price: '$2.450', variation: -0.45 },
  { name: 'Níquel', price: '$17.500', variation: 2.10 },
  { name: 'Zinco', price: '$2.850', variation: -1.20 },
  { name: 'Chumbo', price: '$2.150', variation: 0.80 },
  { name: 'Estanho', price: '$26.500', variation: -0.90 },
  { name: 'Dólar', price: 'R$ 5,52', variation: 0.18 },
];

const weeklyData: Commodity[] = [
  { name: 'Cobre', price: '$9.480', variation: 0.95 },
  { name: 'Alumínio', price: '$2.440', variation: -0.60 },
  { name: 'Níquel', price: '$17.400', variation: 1.80 },
  { name: 'Zinco', price: '$2.830', variation: -0.90 },
  { name: 'Chumbo', price: '$2.140', variation: 0.65 },
  { name: 'Estanho', price: '$26.400', variation: -1.10 },
  { name: 'Dólar', price: 'R$ 5,50', variation: 0.10 },
];

const monthlyData: Commodity[] = [
  { name: 'Cobre', price: '$9.450', variation: 0.75 },
  { name: 'Alumínio', price: '$2.430', variation: -0.80 },
  { name: 'Níquel', price: '$17.300', variation: 1.50 },
  { name: 'Zinco', price: '$2.820', variation: -1.00 },
  { name: 'Chumbo', price: '$2.130', variation: 0.50 },
  { name: 'Estanho', price: '$26.300', variation: -1.30 },
  { name: 'Dólar', price: 'R$ 5,48', variation: 0.05 },
];

const data: Commodity[][] = [dailyData, weeklyData, monthlyData];

const tabs = ['Fechamento Diário', 'Média Semanal', 'Média Mensal'];

export default function Page() {
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-md py-20 px-4 text-center border-b border-white/10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-2xl mb-4">
          Cotações LME e Dólar
        </h1>
        <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto px-4">
          Acompanhe as cotações atualizadas da LME e Dólar em tempo real.
        </p>
      </section>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Tabs */}
        <div className="flex flex-wrap gap-3 sm:gap-4 justify-center mb-12 md:mb-16">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold text-sm sm:text-base transition-all duration-300 shadow-xl backdrop-blur-md border border-white/20 ${
                activeTab === index
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-blue-500/50 scale-105'
                  : 'bg-white/20 text-white/90 hover:bg-white/40 hover:text-white hover:shadow-2xl hover:scale-105'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-gradient-to-r from-blue-500/30 to-purple-500/30 backdrop-blur-sm sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Ativo</th>
                  <th className="px-6 py-5 text-right text-xs font-bold text-white uppercase tracking-wider">Preço</th>
                  <th className="px-6 py-5 text-right text-xs font-bold text-white uppercase tracking-wider">Variação (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-white/5">
                {data[activeTab].map((item, index) => (
                  <tr key={index} className="hover:bg-white/20 transition-colors duration-200">
                    <td className="px-6 py-6 whitespace-nowrap text-sm sm:text-base font-semibold text-white/95">
                      {item.name}
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap text-right text-lg sm:text-xl font-bold text-white/90">
                      {item.price}
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap text-right">
                      <span
                        className={`flex items-center justify-end gap-1 text-lg sm:text-xl font-bold ${
                          item.variation >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {item.variation >= 0 ? '↑' : '↓'}
                        <span>{Math.abs(item.variation).toFixed(2)}%</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
