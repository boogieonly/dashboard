"use client"

import React from 'react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 p-8 overflow-hidden">
      {/* Banner Superior */}
      <div className="text-center mb-20">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent drop-shadow-2xl shadow-white/50">
          🚀 Hub Comercial de Inteligência
        </h1>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Card 1: Visão Geral (Azul) */}
        <div className="group h-96 bg-white/5 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 flex flex-col justify-between transition-all duration-500 ease-out hover:-translate-y-4 hover:shadow-[0_35px_60px_-15px_rgba(59,130,246,0.5)] hover:shadow-blue-500/60 hover:bg-white/10 shadow-xl">
          <div className="text-9xl self-center mb-6 opacity-90">📊</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center drop-shadow-md">Visão Geral</h2>
          <button className="w-full bg-gradient-to-r from-blue-500 via-blue-500 to-purple-600 text-white px-6 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl hover:shadow-blue-500/50 hover:scale-[1.02] transition-all duration-300 hover:from-blue-400 hover:to-purple-500">
            Acessar Painel
          </button>
        </div>

        {/* Card 2: Diário (Verde) */}
        <div className="group h-96 bg-white/5 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 flex flex-col justify-between transition-all duration-500 ease-out hover:-translate-y-4 hover:shadow-[0_35px_60px_-15px_rgba(34,197,94,0.5)] hover:shadow-emerald-500/60 hover:bg-white/10 shadow-xl">
          <div className="text-9xl self-center mb-6 opacity-90">📈</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center drop-shadow-md">Diário</h2>
          <button className="w-full bg-gradient-to-r from-blue-500 via-blue-500 to-purple-600 text-white px-6 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl hover:shadow-emerald-500/50 hover:scale-[1.02] transition-all duration-300 hover:from-blue-400 hover:to-purple-500">
            Acessar Painel
          </button>
        </div>

        {/* Card 3: Mensal (Roxo) */}
        <div className="group h-96 bg-white/5 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 flex flex-col justify-between transition-all duration-500 ease-out hover:-translate-y-4 hover:shadow-[0_35px_60px_-15px_rgba(168,85,247,0.5)] hover:shadow-purple-500/60 hover:bg-white/10 shadow-xl">
          <div className="text-9xl self-center mb-6 opacity-90">📉</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center drop-shadow-md">Mensal</h2>
          <button className="w-full bg-gradient-to-r from-blue-500 via-blue-500 to-purple-600 text-white px-6 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl hover:shadow-purple-500/50 hover:scale-[1.02] transition-all duration-300 hover:from-blue-400 hover:to-purple-500">
            Acessar Painel
          </button>
        </div>
      </div>
    </main>
  );
}
