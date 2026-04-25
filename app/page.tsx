'use client';

import { useState } from 'react';
import { Upload, FileUp } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KPICard from './components/KPICard';
import MaterialCard from './components/MaterialCard';
import FilterSection from './components/FilterSection';
import BarChartComponent from './components/BarChartComponent';
import PieChartComponent from './components/PieChartComponent';

export default function Home() {
  const [materials] = useState([
    {
      name: 'Cobre',
      quantity: 195.7,
      unit: 'kg',
      value: 1567.15,
      currency: 'R$',
      color: 'from-orange-400 to-orange-600',
      percentageOfTotal: 28.7,
    },
    {
      name: 'Latão',
      quantity: 110.2,
      unit: 'kg',
      value: 1242.36,
      currency: 'R$',
      color: 'from-yellow-400 to-yellow-600',
      percentageOfTotal: 16.2,
    },
    {
      name: 'Alumínio',
      quantity: 300.6,
      unit: 'kg',
      value: 902.80,
      currency: 'R$',
      color: 'from-cyan-400 to-cyan-600',
      percentageOfTotal: 44.1,
    },
    {
      name: 'Inox',
      quantity: 75.3,
      unit: 'kg',
      value: 1278.55,
      currency: 'R$',
      color: 'from-gray-400 to-gray-600',
      percentageOfTotal: 11.0,
    },
  ]);

  const totalWeight = 681.8;
  const totalValue = 4990.86;
  const averageValue = 1247.72;
  const growthRate = 12.5;

  return (
    <div className="flex bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="pt-24 pb-12 px-8">
          {/* Upload Section */}
          <div className="mb-8 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-md border-2 border-dashed border-blue-500/30 rounded-xl p-8 hover:border-blue-500/60 transition-all cursor-pointer">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="p-4 rounded-full bg-blue-500/10">
                <Upload size={32} className="text-blue-400" />
              </div>
              <div className="text-center">
                <h3 className="text-white font-semibold text-lg mb-1">
                  Upload de Arquivo
                </h3>
                <p className="text-white/60 text-sm">
                  Arraste um arquivo Excel ou clique para selecionar
                </p>
              </div>
              <button className="mt-4 flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all">
                <FileUp size={18} />
                Selecionar Arquivo
              </button>
            </div>
          </div>

          {/* Filters */}
          <FilterSection />

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Total em Peso"
              value={totalWeight}
              unit="kg"
              backgroundColor="from-blue-500 to-blue-600"
              trend={5.2}
            />
            <KPICard
              title="Valor Total"
              value={`R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              backgroundColor="from-purple-500 to-purple-600"
              trend={8.3}
            />
            <KPICard
              title="Valor Médio"
              value={`R$ ${averageValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              backgroundColor="from-pink-500 to-pink-600"
              trend={-2.1}
            />
            <KPICard
              title="Taxa de Crescimento"
              value={`${growthRate}%`}
              backgroundColor="from-green-500 to-green-600"
              trend={growthRate}
            />
          </div>

          {/* Materials Section */}
          <div className="mb-8">
            <h2 className="text-white text-2xl font-bold mb-6">
              Materiais em Estoque
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {materials.map((material, index) => (
                <MaterialCard key={index} {...material} />
              ))}
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <BarChartComponent
              title="Vendas Mensais vs Meta"
              data={[
                { month: 'Jan', vendas: 4000, meta: 5000 },
                { month: 'Fev', vendas: 3000, meta: 4500 },
                { month: 'Mar', vendas: 5000, meta: 5000 },
                { month: 'Abr', vendas: 6000, meta: 5500 },
                { month: 'Mai', vendas: 5500, meta: 5000 },
                { month: 'Jun', vendas: 7000, meta: 6500 },
              ]}
              dataKey="vendas"
            />
            <PieChartComponent
              title="Distribuição por Material (kg)"
              data={[
                { name: 'Cobre', value: 195.7 },
                { name: 'Latão', value: 110.2 },
                { name: 'Alumínio', value: 300.6 },
                { name: 'Inox', value: 75.3 },
              ]}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
