'use client';

import BarChartComponent from './components/BarChartComponent';
import PieChartComponent from './components/PieChartComponent';
import KPICard from './components/KPICard';
import MaterialCard from './components/MaterialCard';
import FilterSection from './components/FilterSection';

interface BarData {
  name: string;
  estoque: number;
  uso: number;
}

interface PieData {
  name: string;
  value: number;
}

const barData: BarData[] = [
  { name: 'Produto A', estoque: 120, uso: 80 },
  { name: 'Produto B', estoque: 200, uso: 150 },
  { name: 'Produto C', estoque: 80, uso: 60 },
  { name: 'Produto D', estoque: 160, uso: 110 },
];

const dataKeys = ['estoque', 'uso'] as const;

const pieData: PieData[] = [
  { name: 'Uso Alto', value: 45 },
  { name: 'Uso Médio', value: 30 },
  { name: 'Uso Baixo', value: 25 },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 p-6 md:p-8 lg:p-12">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent mb-8 text-center md:text-left">
        Dashboard de Estoque
      </h1>

      <FilterSection />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 lg:mb-12">
        <KPICard
          title="Estoque Total"
          value="1.234"
          emoji="📦"
          gradient="from-emerald-400 to-teal-500"
        />
        <KPICard
          title="Receita"
          value="R$ 45K"
          emoji="💰"
          gradient="from-amber-400 to-orange-500"
        />
        <KPICard
          title="Vendas"
          value="1.2K"
          emoji="📊"
          gradient="from-blue-400 to-indigo-500"
        />
        <KPICard
          title="Crescimento"
          value="+15%"
          emoji="📈"
          gradient="from-purple-400 to-pink-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 lg:mb-12">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl">
          <h2 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-6 text-center">
            Estoque vs Uso
          </h2>
          <BarChartComponent data={barData} dataKeys={dataKeys} />
        </div>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl">
          <h2 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 text-center">
            Distribuição de Uso
          </h2>
          <PieChartComponent data={pieData} />
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl">
        <MaterialCard />
      </div>
    </div>
  );
}
