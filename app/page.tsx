"use client";

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-white via-purple-100 to-pink-200 bg-clip-text text-transparent drop-shadow-2xl mb-8">
            🚀 Dashboard Metalfama
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-white/90 font-semibold max-w-2xl mx-auto leading-relaxed">
            Bem-vindo, Gerente Comercial! Acompanhe e gerencie suas vendas com eficiência e precisão em tempo real.
          </p>
        </div>

        {/* Premium Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Card 1: Visão Geral */}
          <div className="group relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-10 shadow-2xl hover:shadow-3xl hover:shadow-purple-500/25 hover:-translate-y-4 hover:border-white/40 hover:ring-4 ring-white/30 transition-all duration-500 cursor-pointer overflow-hidden">
            <div className="text-6xl md:text-7xl mb-6 group-hover:scale-110 transition-transform duration-300">📊</div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 drop-shadow-lg">Visão Geral</h2>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">Acompanhe o desempenho geral das vendas em tempo real com métricas consolidadas.</p>
            <button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:from-purple-600 hover:to-blue-600 hover:shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300">
              Acessar Painel
            </button>
          </div>

          {/* Card 2: Diário */}
          <div className="group relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-10 shadow-2xl hover:shadow-3xl hover:shadow-blue-500/25 hover:-translate-y-4 hover:border-white/40 hover:ring-4 ring-white/30 transition-all duration-500 cursor-pointer overflow-hidden">
            <div className="text-6xl md:text-7xl mb-6 group-hover:scale-110 transition-transform duration-300">📈</div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 drop-shadow-lg">Diário</h2>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">Análise detalhada das vendas do dia com gráficos e insights rápidos.</p>
            <button className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-6 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:from-blue-600 hover:to-emerald-600 hover:shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300">
              Acessar Painel
            </button>
          </div>

          {/* Card 3: Mensal */}
          <div className="group relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-10 shadow-2xl hover:shadow-3xl hover:shadow-pink-500/25 hover:-translate-y-4 hover:border-white/40 hover:ring-4 ring-white/30 transition-all duration-500 cursor-pointer overflow-hidden">
            <div className="text-6xl md:text-7xl mb-6 group-hover:scale-110 transition-transform duration-300">📅</div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 drop-shadow-lg">Mensal</h2>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">Relatórios completos do mês com tendências e projeções futuras.</p>
            <button className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:from-pink-600 hover:to-orange-600 hover:shadow-2xl hover:shadow-pink-500/50 transform hover:scale-105 transition-all duration-300">
              Acessar Painel
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
