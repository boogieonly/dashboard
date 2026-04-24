"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/30 to-purple-900/30 flex flex-col items-center justify-center p-8 overflow-hidden">
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-20 bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent drop-shadow-2xl text-center leading-tight">
        🚀 Hub de Inteligência Comercial
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl w-full px-4">
        {/* Visão Geral Card */}
        <div className="group bg-white/5 backdrop-blur-3xl border border-white/20 rounded-3xl p-10 md:p-12 h-[450px] flex flex-col justify-between hover:-translate-y-6 hover:shadow-2xl hover:shadow-blue-500/25 hover:border-white/40 hover:ring-4 hover:ring-white/30 transition-all duration-500 cursor-pointer overflow-hidden">
          <div>
            <div className="text-7xl md:text-8xl mb-8 group-hover:scale-110 transition-transform duration-300">📊</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 drop-shadow-lg">Visão Geral</h2>
            <p className="text-xl md:text-lg text-gray-200 leading-relaxed drop-shadow-md">
              Indicadores principais mencionados por Caique: Total de Vendas, Ticket Médio, Taxa de Conversão de Leads, Performance Geral da Equipe e KPIs Estratégicos.
            </p>
          </div>
          <Link
            href="/dashboard-geral"
            className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 hover:shadow-xl hover:scale-105 transition-all duration-300 self-start backdrop-blur-sm"
          >
            Acessar Dashboard
          </Link>
        </div>

        {/* Fechamento Diário Card */}
        <div className="group bg-white/5 backdrop-blur-3xl border border-white/20 rounded-3xl p-10 md:p-12 h-[450px] flex flex-col justify-between hover:-translate-y-6 hover:shadow-2xl hover:shadow-green-500/25 hover:border-white/40 hover:ring-4 hover:ring-white/30 transition-all duration-500 cursor-pointer overflow-hidden">
          <div>
            <div className="text-7xl md:text-8xl mb-8 group-hover:scale-110 transition-transform duration-300">💰</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 drop-shadow-lg">Fechamento Diário</h2>
            <p className="text-xl md:text-lg text-gray-200 leading-relaxed drop-shadow-md">
              Métricas diárias: Vendas do Dia, Quantidade de Fechamentos, Valor Total Fechado, Desempenho por Vendedor e Alertas de Performance.
            </p>
          </div>
          <Link
            href="/dashboard-diario"
            className="bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:from-green-600 hover:via-green-700 hover:to-emerald-700 hover:shadow-xl hover:scale-105 transition-all duration-300 self-start backdrop-blur-sm"
          >
            Acessar Dashboard
          </Link>
        </div>

        {/* Fechamento Mensal Card */}
        <div className="group bg-white/5 backdrop-blur-3xl border border-white/20 rounded-3xl p-10 md:p-12 h-[450px] flex flex-col justify-between hover:-translate-y-6 hover:shadow-2xl hover:shadow-purple-500/25 hover:border-white/40 hover:ring-4 hover:ring-white/30 transition-all duration-500 cursor-pointer overflow-hidden">
          <div>
            <div className="text-7xl md:text-8xl mb-8 group-hover:scale-110 transition-transform duration-300">📈</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 drop-shadow-lg">Fechamento Mensal</h2>
            <p className="text-xl md:text-lg text-gray-200 leading-relaxed drop-shadow-md">
              Análise mensal: Acumulado do Mês, Meta vs Realizado, Evolução Semanal, Ranking de Vendedores e Projeções Futuras.
            </p>
          </div>
          <Link
            href="/dashboard-mensal"
            className="bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:from-purple-600 hover:via-purple-700 hover:to-indigo-700 hover:shadow-xl hover:scale-105 transition-all duration-300 self-start backdrop-blur-sm"
          >
            Acessar Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
