"use client";

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/50 to-blue-900/50">
      {/* Banner Superior */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 text-white py-24 text-center shadow-2xl">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-2xl bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            Hub de Inteligência Comercial
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl font-medium drop-shadow-lg">
            Metalfama - Gestão de Metais Não Ferrosos
          </p>
        </div>
      </div>

      {/* Bento Grid */}
      <main className="container mx-auto px-6 py-24 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card 1: Visão Geral (Azul, 📈) - Non-linked for now */}
          <div className="group rounded-3xl bg-white/5 backdrop-blur-3xl border border-white/20 p-10 h-72 flex flex-col justify-center items-center text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/60 shadow-lg cursor-pointer hover:scale-[1.02]">
            <span className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">📈</span>
            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-md">Visão Geral</h2>
            <p className="text-lg text-gray-200 leading-relaxed max-w-md">
              Dashboard consolidado com os principais KPIs e indicadores de performance em tempo real.
            </p>
          </div>

          {/* Card 2: Fechamento Diário (Verde, 💰) */}
          <Link
            href="/diario"
            className="group rounded-3xl bg-white/5 backdrop-blur-3xl border border-white/20 p-10 h-72 flex flex-col justify-center items-center text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/60 shadow-lg no-underline hover:scale-[1.02]"
          >
            <span className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">💰</span>
            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-md group-hover:text-green-300 transition-colors">Fechamento Diário</h2>
            <p className="text-lg text-gray-200 leading-relaxed max-w-md">
              Registre e visualize relatórios detalhados das transações e fechamentos diários.
            </p>
          </Link>

          {/* Card 3: Fechamento Mensal (Roxa, 📊) */}
          <Link
            href="/mensal"
            className="group rounded-3xl bg-white/5 backdrop-blur-3xl border border-white/20 p-10 h-72 flex flex-col justify-center items-center text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/60 shadow-lg no-underline hover:scale-[1.02]"
          >
            <span className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">📊</span>
            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-md group-hover:text-purple-300 transition-colors">Fechamento Mensal</h2>
            <p className="text-lg text-gray-200 leading-relaxed max-w-md">
              Análises completas mensais com gráficos, insights e resumo de performance.
            </p>
          </Link>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="bg-gradient-to-r from-purple-800/80 to-blue-800/80 backdrop-blur-md border-t border-white/10 py-8 mt-16">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xl font-semibold text-white/90 drop-shadow-md">
            Dashboard Premium v1.0
          </p>
        </div>
      </footer>
    </div>
  );
}
