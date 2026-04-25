'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import KPICard from '@/components/KPICard';
import MaterialCard from '@/components/MaterialCard';
import FilterSection from '@/components/FilterSection';
import BarChartComponent from '@/components/BarChartComponent';
import PieChartComponent from '@/components/PieChartComponent';

type ChartData = {
  name: string;
  value: number;
};

type Material = {
  name: string;
  quantity: number;
  price: number;
  totalValue: number;
};

type KPIProps = {
  title: string;
  value: string | number;
  suffix?: string;
  change?: string;
};

export default function Page() {
  const materials: Material[] = [
    {
      name: 'Cobre',
      quantity: 150,
      price: 25.5,
      totalValue: 3825,
    },
    {
      name: 'Latão',
      quantity: 80,
      price: 18.2,
      totalValue: 1456,
    },
    {
      name: 'Alumínio',
      quantity: 200,
      price: 12.1,
      totalValue: 2420,
    },
    {
      name: 'Inox',
      quantity: 120,
      price: 35.0,
      totalValue: 4200,
    },
  ];

  const totalQuantity = materials.reduce((sum, m) => sum + m.quantity, 0);
  const totalValue = materials.reduce((sum, m) => sum + m.totalValue, 0);
  const avgPrice = totalValue / totalQuantity;

  const kpis: KPIProps[] = [
    {
      title: 'Total Materiais',
      value: totalQuantity,
      suffix: ' kg',
      change: '+12%',
    },
    {
      title: 'Valor Total',
      value: totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      change: '+8.2%',
    },
    {
      title: 'Preço Médio',
      value: avgPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      suffix: ' /kg',
      change: '+3.1%',
    },
    {
      title: 'Crescimento Mensal',
      value: '12.5%',
      change: '+1.2%',
    },
  ];

  const chartData: ChartData[] = materials.map(({ name, totalValue }) => ({
    name,
    value: totalValue,
  }));

  return (
    <>
      <Sidebar />
      <Header />
      <div className="ml-64 pt-24 bg-gray-50 min-h-screen">
        <main className="p-4 sm:p-6 lg:p-8">
          <FilterSection />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 md:mb-12">
            {kpis.map((kpi, index) => (
              <KPICard key={index} {...kpi} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 lg:mb-12">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Gráfico de Barras (Valor por Material)</h2>
              <BarChartComponent data={chartData} />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Gráfico de Pizza (Distribuição)</h2>
              <PieChartComponent data={chartData} />
            </div>
          </div>
          <section>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-gray-800">Materiais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {materials.map((material) => (
                <MaterialCard key={material.name} {...material} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
