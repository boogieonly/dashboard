'use client';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import KPICard from './components/KPICard';
import MaterialCard from './components/MaterialCard';
import FilterSection from './components/FilterSection';
import BarChartComponent from './components/BarChartComponent';
import PieChartComponent from './components/PieChartComponent';

type Material = {
  name: string;
  stock: number;
  usage: number;
  price: number;
};

type ChartData = {
  name: string;
  value: number;
};

type KPI = {
  title: string;
  value: string | number;
};

export default function Page() {
  const materials: Material[] = [
    { name: 'Cobre', stock: 1000, usage: 200, price: 50 },
    { name: 'Latão', stock: 800, usage: 150, price: 40 },
    { name: 'Alumínio', stock: 1200, usage: 300, price: 30 },
    { name: 'Inox', stock: 600, usage: 100, price: 60 },
  ];

  const totalStock = materials.reduce((sum, m) => sum + m.stock, 0);
  const totalUsage = materials.reduce((sum, m) => sum + m.usage, 0);
  const avgPrice = materials.reduce((sum, m) => sum + m.price, 0) / materials.length;

  const kpis: KPI[] = [
    { title: 'Total Stock', value: totalStock },
    { title: 'Total Usage', value: totalUsage },
    { title: 'Average Price', value: `R$ ${avgPrice.toFixed(2)}` },
    { title: 'Total Materials', value: materials.length },
  ];

  const barData: ChartData[] = materials.map((m) => ({
    name: m.name,
    value: m.stock,
  }));

  const pieData: ChartData[] = materials.map((m) => ({
    name: m.name,
    value: m.usage,
  }));

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="ml-64 pt-24 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, index) => (
              <KPICard key={index} title={kpi.title} value={kpi.value} />
            ))}
          </div>

          {/* Filters */}
          <FilterSection />

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChartComponent data={barData} />
            <PieChartComponent data={pieData} />
          </div>

          {/* Materials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {materials.map((material, index) => (
              <MaterialCard key={index} material={material} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
