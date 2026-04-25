'use client';

import BarChartComponent from './components/BarChartComponent';
import PieChartComponent from './components/PieChartComponent';
import KPICard from './components/KPICard';
import MaterialCard from './components/MaterialCard';
import FilterSection from './components/FilterSection';

type BarData = {
  name: string;
  estoque: number;
  uso: number;
};

type PieData = {
  name: string;
  value: number;
};

type KPIProps = {
  title: string;
  value: string;
  emoji: string;
  gradient: string;
};

export default function DashboardPage() {
  const barData: BarData[] = [
    { name: 'Produto A', estoque: 120, uso: 80 },
    { name: 'Produto B', estoque: 200, uso: 150 },
    { name: 'Produto C', estoque: 180, uso: 120 },
    { name: 'Produto D', estoque: 90, uso: 70 },
    { name: 'Produto E', estoque: 250, uso: 200 },
  ];

  const pieData: PieData[] = [
    { name: 'Em Estoque', value: 65 },
    { name: 'Em Uso', value: 35 },
  ];

  const kpis: KPIProps[] = [
    {
      title: 'Total em Estoque',
      value: '840',
      emoji: '📦',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Total em Uso',
      value: '620',
      emoji: '🔧',
      gradient: 'from-orange-500 to-red-600',
    },
    {
      title: 'Disponível',
      value: '220',
      emoji: '✅',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Taxa de Uso',
      value: '74%',
      emoji: '⚡',
      gradient: 'from-purple-500 to-pink-600',
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900/30 to-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-2xl mb-4">
            Dashboard de Estoque
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
            Monitore seu estoque e uso em tempo real com visualizações interativas.
          </p>
        </div>

        <FilterSection />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {kpis.map((kpi, index) => (
            <KPICard
              key={index}
              title={kpi.title}
              value={kpi.value}
              emoji={kpi.emoji}
              gradient={kpi.gradient}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          <MaterialCard />
          <div className="lg:col-span-1 xl:col-span-1">
            <BarChartComponent data={barData} dataKeys={['estoque', 'uso']} />
          </div>
          <div className="lg:col-span-1 xl:col-span-1">
            <PieChartComponent data={pieData} />
          </div>
        </div>
      </div>
    </main>
  );
}
