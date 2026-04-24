"use client";

import React from 'react';

type CardData = {
  title: string;
  desc: string;
};

const cards: CardData[] = [
  {
    title: "Visão Geral",
    desc: "Indicadores de performance global",
  },
  {
    title: "Diário",
    desc: "Faturamento, vendas e atrasos diários",
  },
  {
    title: "Mensal",
    desc: "Leads, principais clientes e cotações",
  },
];

function Card({ title, desc }: CardData) {
  return (
    <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-80 flex flex-col justify-between shadow-2xl hover:-translate-y-4 hover:shadow-2xl hover:shadow-blue-500/25 hover:border-white/20 transition-all duration-500 cursor-pointer overflow-hidden">
      <div>
        <h3 className="text-3xl font-black text-white mb-6 group-hover:text-blue-400 transition-all duration-300 drop-shadow-lg">
          {title}
        </h3>
        <p className="text-gray-300 text-xl leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
          {desc}
        </p>
      </div>
      <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 w-full group-hover:scale-105 mt-4">
        Acessar Painel
      </button>
    </div>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 flex flex-col items-center justify-center p-8 sm:p-12 lg:p-24 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent mb-8 lg:mb-12 z-10 drop-shadow-2xl animate-pulse">
        🚀 Hub Comercial Metalfama
      </h1>
      <p className="text-lg sm:text-xl lg:text-2xl text-center max-w-2xl mx-auto text-gray-300 font-light mb-16 lg:mb-24 leading-relaxed z-10 px-4">
        Bem-vindo ao painel de gestão comercial da Metalfama. Monitore e otimize suas operações com insights em tempo real e dashboards intuitivos.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl w-full z-10">
        {cards.map((card, index) => (
          <Card key={index} {...card} />
        ))}
      </div>
    </main>
  );
}
