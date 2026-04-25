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
  value: number;
  emoji: string;
  gradient: string;
};

const barData: BarData[] = [
  { name: 'Arroz', estoque: 200, uso: 150 },
  { name: 'Feijão', estoque: 250, uso: 120 },
  { name: 'Macarrão', estoque: 180, uso: 140 },
  { name: 'Óleo', estoque: 120, uso: 110 },
  { name: 'Açúcar', estoque: 90, uso: 100 },
];

const pieData: PieData[] = [
  { name: 'Estoque', value: 840 },
  { name: 'Uso', value: 620 },
];

const kpis: KPIProps[] = [
  {
    title: 'Total Estoque',
    value: 840,
    emoji: '📦',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    title: 'Total Uso',
    value: 620,
    emoji: '📉',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    title: 'Produtos Críticos',
    value: 220,
    emoji: '⚠️',
    gradient: 'from-orange-500 to-red-600',
  },
  {
    title: 'Eficiência (%)',
    value: 74,
    emoji: '📊',
    gradient: 'from-purple-500 to-pink-600',
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 drop-shadow-lg">
            Dashboard de Estoque
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Monitore o estoque, uso e eficiência dos produtos em tempo real com visualizações interativas.
          </p>
        </div>

        <FilterSection />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {kpis.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <MaterialCard title="Estoque vs Uso por Produto">
            <BarChartComponent data={barData} dataKeys={['estoque', 'uso']} />
          </MaterialCard>
          <MaterialCard title="Distribuição Geral de Estoque">
            <PieChartComponent data={pieData} />
          </MaterialCard>
        </div>
      </div>
    </main>
  );
}
