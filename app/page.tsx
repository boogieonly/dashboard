'use client';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import KPICard from './components/KPICard';
import MaterialCard from './components/MaterialCard';
import FilterSection from './components/FilterSection';
import BarChartComponent from './components/BarChartComponent';
import PieChartComponent from './components/PieChartComponent';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      <Header />
      <div className="flex min-h-[calc(100vh-80px)]">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 overflow-y-auto">
          {/* Premium Title Section */}
          <div className="mb-8 md:mb-12 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl mb-4 animate-pulse">
              Dashboard Premium
            </h1>
            <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto md:mx-0">
              Analytics e métricas em tempo real com design glassmorphism luxuoso.
            </p>
          </div>

          {/* Filter Section */}
          <FilterSection />

          {/* KPI Cards Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 md:mb-12">
            <div className="group">
              <KPICard
                title="Pacotes"
                value="1,234"
                emoji="📦"
                gradient="from-emerald-500 to-teal-600"
              />
            </div>
            <div className="group">
              <KPICard
                title="Receita"
                value="$56K"
                emoji="💰"
                gradient="from-amber-500 to-orange-600"
              />
            </div>
            <div className="group">
              <KPICard
                title="Usuários"
                value="12,456"
                emoji="📊"
                gradient="from-blue-500 to-indigo-600"
              />
            </div>
            <div className="group">
              <KPICard
                title="Crescimento"
                value="+24%"
                emoji="📈"
                gradient="from-purple-500 to-violet-600"
              />
            </div>
          </section>

          {/* Material and Bar Chart Row */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 lg:mb-12">
            <div className="glassmorphism p-6 sm:p-8 backdrop-blur-xl hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(139,92,246,0.3)] transition-all duration-500 ease-in-out group">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text text-transparent mb-6 text-center lg:text-left">
                Materiais
              </h2>
              <MaterialCard />
            </div>
            <div className="glassmorphism p-6 sm:p-8 backdrop-blur-xl hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all duration-500 ease-in-out group">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text text-transparent mb-6 text-center lg:text-left">
                Gráfico de Barras
              </h2>
              <BarChartComponent />
            </div>
          </section>

          {/* Pie Chart Full Width */}
          <section className="glassmorphism p-6 sm:p-8 lg:p-12 backdrop-blur-xl hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(168,85,247,0.4)] transition-all duration-500 ease-in-out group">
            <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text text-transparent mb-8 text-center">
              Distribuição de Materiais
            </h2>
            <PieChartComponent />
          </section>
        </main>
      </div>
    </div>
  );
}

/* Glassmorphism utility class - applied inline */
/* Add to tailwind.config.js if needed: utilities for glassmorphism */
/* But native Tailwind supports all used classes */
