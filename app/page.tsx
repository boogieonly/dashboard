'use client';

import Link from 'next/link';

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 p-12 relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20" />
      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent mb-24 text-center drop-shadow-2xl animate-pulse">
          Hub de Inteligência
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1: Diária */}
          <div className="group h-96 bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-[0_35px_60px_-15px_rgba(168,85,247,0.4),inset_0_0_20px_rgba(168,85,247,0.2)] hover:-translate-y-4 hover:rotate-1 transition-all duration-700 flex flex-col justify-between overflow-hidden relative">
            <div>
              <div className="text-7xl mb-8 [text-shadow:0_1px_0_#ccc,0_2px_0_#c9c9c9,0_3px_0_#bbb,0_4px_0_#bbb,0_5px_5px_5px_rgba(0,0,0,0.3)] drop-shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                🧠
              </div>
              <h2 className="text-3xl font-black text-white mb-6 drop-shadow-xl group-hover:text-purple-200 transition-colors duration-300">
                Inteligência Diária
              </h2>
              <p className="text-xl text-slate-200 leading-relaxed drop-shadow-md">
                Acesse análises diárias detalhadas com insights acionáveis derivados de dados em tempo real. Monitore métricas chave, receba alertas inteligentes e otimize suas decisões cotidianas com precisão.
              </p>
            </div>
            <Link
              href="/diario"
              className="bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/50 hover:scale-110 hover:-translate-y-1 transition-all duration-300 self-start"
            >
              Explorar Diário →
            </Link>
          </div>

          {/* Card 2: Mensal */}
          <div className="group h-96 lg:col-span-1 bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-[0_35px_60px_-15px_rgba(59,130,246,0.4),inset_0_0_20px_rgba(59,130,246,0.2)] hover:-translate-y-4 hover:-rotate-1 transition-all duration-700 flex flex-col justify-between overflow-hidden relative md:col-span-1">
            <div>
              <div className="text-7xl mb-8 [text-shadow:0_1px_0_#ccc,0_2px_0_#c9c9c9,0_3px_0_#bbb,0_4px_0_#bbb,0_5px_5px_5px_rgba(0,0,0,0.3)] drop-shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                📊
              </div>
              <h2 className="text-3xl font-black text-white mb-6 drop-shadow-xl group-hover:text-blue-200 transition-colors duration-300">
                Análises Mensais
              </h2>
              <p className="text-xl text-slate-200 leading-relaxed drop-shadow-md">
                Visualize relatórios mensais abrangentes com tendências históricas, projeções e recomendações estratégicas baseadas em algoritmos avançados de machine learning.
              </p>
            </div>
            <Link
              href="/mensal"
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-blue-500/50 hover:scale-110 hover:-translate-y-1 transition-all duration-300 self-start"
            >
              Ver Mensal →
            </Link>
          </div>

          {/* Card 3: Estratégico */}
          <div className="group h-96 md:col-span-1 lg:col-span-1 bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-[0_35px_60px_-15px_rgba(34,197,94,0.4),inset_0_0_20px_rgba(34,197,94,0.2)] hover:-translate-y-4 hover:rotate-2 transition-all duration-700 flex flex-col justify-between overflow-hidden relative md:col-span-1 md:row-span-2">
            <div>
              <div className="text-7xl mb-8 [text-shadow:0_1px_0_#ccc,0_2px_0_#c9c9c9,0_3px_0_#bbb,0_4px_0_#bbb,0_5px_5px_5px_rgba(0,0,0,0.3)] drop-shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                🎯
              </div>
              <h2 className="text-3xl font-black text-white mb-6 drop-shadow-xl group-hover:text-emerald-200 transition-colors duration-300">
                Estratégias Avançadas
              </h2>
              <p className="text-xl text-slate-200 leading-relaxed drop-shadow-md">
                Desenvolva estratégias de longo prazo com simulações preditivas, análise de riscos e otimização de portfólios utilizando IA de vanguarda.
              </p>
            </div>
            <Link
              href="/estrategico"
              className="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-emerald-500/50 hover:scale-110 hover:-translate-y-1 transition-all duration-300 self-start"
            >
              Estratégias →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
