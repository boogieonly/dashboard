'use client';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import KPICard from './components/KPICard';
import MaterialCard from './components/MaterialCard';
import FilterSection from './components/FilterSection';
import BarChartComponent from './components/BarChartComponent';
import PieChartComponent from './components/PieChartComponent';

type MaterialData = {
  name: string;
  estoque: number;
  uso: number;
};

type PieData = {
  name: string;
  value: number;
};

export default function DashboardPage() {
  const materials: MaterialData[] = [
    { name: 'Cobre', estoque: 1000, uso: 200 },
    { name: 'Latão', estoque: 800, uso: 150 },
    { name: 'Alumínio', estoque: 1200, uso: 300 },
    { name: 'Inox', estoque: 600, uso: 100 },
  ];

  const barData: MaterialData[] = materials;
  const pieData: PieData[] = materials.map((m) => ({
    name: m.name,
    value: m.estoque,
  }));

  const totalEstoque = materials.reduce((sum, m) => sum + m.estoque, 0);
  const totalUso = materials.reduce((sum, m) => sum + m.uso, 0);
  const avgEstoque = Math.round(totalEstoque / materials.length);
  const avgUso = Math.round(totalUso / materials.length);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 ml-64 pt-24 p-6 overflow-auto">
        <Header />
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard title="Total Estoque" value={totalEstoque.toLocaleString()} />
          <KPICard title="Total Uso" value={totalUso.toLocaleString()} />
          <KPICard title="Estoque Médio" value={avgEstoque.toLocaleString()} />
          <KPICard title="Uso Médio" value={avgUso.toLocaleString()} />
        </div>
        {/* Filter Section */}
        <FilterSection />
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Estoque vs Uso por Material</h2>
            <BarChartComponent data={barData} dataKeys={['estoque', 'uso']} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Distribuição de Estoque</h2>
            <PieChartComponent data={pieData} />
          </div>
        </div>
        {/* Material Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {materials.map((material) => (
            <MaterialCard
              key={material.name}
              name={material.name}
              estoque={material.estoque}
              uso={material.uso}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
