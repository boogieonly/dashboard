"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/50 to-indigo-900 p-8 md:p-12">
      {/* Banner de boas-vindas */}
      <div className="text-center mb-20 md:mb-32">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-2xl mb-6">
          Dashboard Metalfama
        </h1>
        <p className="text-xl md:text-2xl lg:text-3xl bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent opacity-90 max-w-3xl mx-auto leading-relaxed">
          Seu painel de controle premium para gerenciamento eficiente.
        </p>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
        {/* Card 1: Visão Geral */}
        <Link
          href="/"
          className="group relative h-64 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-[0_0_40px_rgba(147,51,234,0.6)] transition-all duration-500 hover:-translate-y-4 hover:scale-[1.02] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 group-hover:from-indigo-400/40 group-hover:via-purple-400/40 group-hover:to-pink-400/40 transition-all duration-500 rounded-3xl" />
          <div className="relative flex flex-col items-center justify-center h-full p-8 text-center z-10">
            <span className="text-6xl md:text-7xl mb-6 group-hover:scale-110 transition-transform duration-300">📊</span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent drop-shadow-lg">
              Visão Geral
            </h2>
          </div>
        </Link>

        {/* Card 2: Fechamento Diário */}
        <Link
          href="/diario"
          className="group relative h-64 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-[0_0_40px_rgba(147,51,234,0.6)] transition-all duration-500 hover:-translate-y-4 hover:scale-[1.02] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 group-hover:from-indigo-400/40 group-hover:via-purple-400/40 group-hover:to-pink-400/40 transition-all duration-500 rounded-3xl" />
          <div className="relative flex flex-col items-center justify-center h-full p-8 text-center z-10">
            <span className="text-6xl md:text-7xl mb-6 group-hover:scale-110 transition-transform duration-300">📅</span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent drop-shadow-lg">
              Fechamento Diário
            </h2>
          </div>
        </Link>

        {/* Card 3: Fechamento Mensal */}
        <Link
          href="/mensal"
          className="group relative h-64 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-[0_0_40px_rgba(147,51,234,0.6)] transition-all duration-500 hover:-translate-y-4 hover:scale-[1.02] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 group-hover:from-indigo-400/40 group-hover:via-purple-400/40 group-hover:to-pink-400/40 transition-all duration-500 rounded-3xl" />
          <div className="relative flex flex-col items-center justify-center h-full p-8 text-center z-10">
            <span className="text-6xl md:text-7xl mb-6 group-hover:scale-110 transition-transform duration-300">📈</span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent drop-shadow-lg">
              Fechamento Mensal
            </h2>
          </div>
        </Link>
      </div>
    </main>
  );
}
