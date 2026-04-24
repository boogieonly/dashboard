'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 [background:radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.4),rgba(79,70,229,0.2),transparent_70%)] p-8 md:p-16 flex flex-col items-center justify-center gap-16 md:gap-24 overflow-hidden">
      {/* Banner Superior */}
      <header className="text-center z-10">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
          Hub de Inteligência Comercial Metalfama
        </h1>
      </header>

      {/* Grid de Navegação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl px-4">
        {/* Card 1: Visão Geral */}
        <Link href="/visao-geral" className="group">
          <div className="group relative h-80 md:h-[450px] lg:h-[500px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 md:p-12 flex flex-col items-center justify-center gap-6 md:gap-8 transition-all duration-500 ease-out hover:-translate-y-4 hover:shadow-[0_0_60px_20px_rgba(99,102,241,0.3)] hover:border-white/20 hover:bg-white/10 overflow-hidden">
            <div className="text-[5rem] md:text-[7rem] lg:text-[8rem] opacity-90">📈</div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white text-center drop-shadow-xl group-hover:text-blue-300 transition-all duration-300 leading-tight">
              Visão Geral
            </h2>
            <p className="text-lg md:text-xl text-gray-300 text-center max-w-md leading-relaxed opacity-90">
              Visão integrada e em tempo real dos indicadores chave do negócio.
            </p>
          </div>
        </Link>

        {/* Card 2: Fechamento Diário */}
        <Link href="/diario" className="group">
          <div className="group relative h-80 md:h-[450px] lg:h-[500px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 md:p-12 flex flex-col items-center justify-center gap-6 md:gap-8 transition-all duration-500 ease-out hover:-translate-y-4 hover:shadow-[0_0_60px_20px_rgba(99,102,241,0.3)] hover:border-white/20 hover:bg-white/10 overflow-hidden">
            <div className="text-[5rem] md:text-[7rem] lg:text-[8rem] opacity-90">💰</div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white text-center drop-shadow-xl group-hover:text-blue-300 transition-all duration-300 leading-tight">
              Fechamento Diário
            </h2>
            <p className="text-lg md:text-xl text-gray-300 text-center max-w-md leading-relaxed opacity-90">
              Resumo diário de vendas, fechamentos e metas alcançadas.
            </p>
          </div>
        </Link>

        {/* Card 3: Fechamento Mensal */}
        <Link href="/mensal" className="group">
          <div className="group relative h-80 md:h-[450px] lg:h-[500px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 md:p-12 flex flex-col items-center justify-center gap-6 md:gap-8 transition-all duration-500 ease-out hover:-translate-y-4 hover:shadow-[0_0_60px_20px_rgba(99,102,241,0.3)] hover:border-white/20 hover:bg-white/10 overflow-hidden">
            <div className="text-[5rem] md:text-[7rem] lg:text-[8rem] opacity-90">📊</div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white text-center drop-shadow-xl group-hover:text-blue-300 transition-all duration-300 leading-tight">
              Fechamento Mensal
            </h2>
            <p className="text-lg md:text-xl text-gray-300 text-center max-w-md leading-relaxed opacity-90">
              Análise detalhada mensal de performance e tendências.
            </p>
          </div>
        </Link>
      </div>
    </main>
  )
}
