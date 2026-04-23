"use client";

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import * as XLSX from 'xlsx';

const kpiData = [
  {
    name: 'Receita Total',
    value: 12500000,
    progress: 85,
    color: '#10b981',
    tooltip: 'Receita acumulada do ano (R$)',
  },
  {
    name: 'Produção',
    value: 150,
    progress: 92,
    color: '#3b82f6',
    tooltip: 'Toneladas produzidas',
  },
  {
    name: 'Pedidos',
    value: 250,
    progress: 78,
    color: '#f59e0b',
    tooltip: 'Pedidos processados',
  },
  {
    name: 'Margem de Lucro',
    value: 22,
    progress: 88,
    color: '#ef4444',
    tooltip: 'Margem atual (%)',
  },
  {
    name: 'Satisfação',
    value: 4.8,
    progress: 95,
    color: '#8b5cf6',
    tooltip: 'NPS dos clientes (/5)',
  },
];

const lineData = [
  { month: 'Jan', revenue: 800000 },
  { month: 'Fev', revenue: 950000 },
  { month: 'Mar', revenue: 1100000 },
  { month: 'Abr', revenue: 1200000 },
  { month: 'Mai', revenue: 1400000 },
  { month: 'Jun', revenue: 1300000 },
  { month: 'Jul', revenue: 1600000 },
  { month: 'Ago', revenue: 1700000 },
  { month: 'Set', revenue: 1900000 },
  { month: 'Out', revenue: 2100000 },
  { month: 'Nov', revenue: 2300000 },
  { month: 'Dez', revenue: 2500000 },
];

const productData = [
  { product: 'Aço Carbono', sales: 500 },
  { product: 'Aço Inox', sales: 350 },
  { product: 'Alumínio', sales: 420 },
  { product: 'Cobre', sales: 280 },
  { product: 'Ligas Especiais', sales: 150 },
];

const regionData = [
  { region: 'Sudeste', value: 45 },
  { region: 'Sul', value: 25 },
  { region: 'Nordeste', value: 20 },
  { region: 'Norte', value: 5 },
  { region: 'Centro-Oeste', value: 5 },
];

const goalData = [
  { name: 'Produção', progress: 92, pv: 92 },
  { name: 'Vendas', progress: 78, pv: 78 },
  { name: 'Qualidade', progress: 95, pv: 95 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const glassCard = `bg-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden hover:shadow-white/20 hover:border-white/40 transition-all duration-500 relative group`;

const Page = () => {
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    const kpiExport = kpiData.map((kpi) => ({
      KPI: kpi.name,
      Valor: kpi.value,
      Progresso: `${kpi.progress}%`,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(kpiExport), 'KPIs');

    const lineExport = lineData.map((d) => ({
      Mês: d.month,
      Receita: d.revenue,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(lineExport), 'Receita');

    const productExport = productData.map((d) => ({
      Produto: d.product,
      Vendas: d.sales,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(productExport), 'Produtos');

    const regionExport = regionData.map((d) => ({
      Região: d.region,
      Participação: `${d.value}%`,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(regionExport), 'Regiões');

    const goalExport = goalData.map((d) => ({
      Objetivo: d.name,
      Progresso: `${d.pv}%`,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(goalExport), 'Metas');

    XLSX.writeFile(wb, 'Metalfama_Dashboard.xlsx');
  };

  const formatKPI = (name: string, value: number): string => {
    if (name === 'Receita Total') return `R$ ${value.toLocaleString()}`;
    if (name === 'Produção') return `${value} ton`;
    if (name === 'Pedidos') return `${value}`;
    if (name === 'Margem de Lucro') return `${value}%`;
    if (name === 'Satisfação') return `${value}/5`;
    return value.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900/20 to-slate-900 p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-4 drop-shadow-2xl">
            Metalfama Dashboard
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light">
            Visão completa das operações
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          {kpiData.map((kpi, index) => (
            <div key={kpi.name} className={`${glassCard} h-48 p-8 text-center cursor-default`}>
              <div
                className="absolute inset-0 opacity-20 blur rounded-3xl"
                style={{ backgroundColor: `${kpi.color}20` }}
              />
              <div className="relative z-10 space-y-3">
                <div className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                  {formatKPI(kpi.name, kpi.value)}
                </div>
                <div className="text-lg font-semibold text-gray-200 capitalize">
                  {kpi.name}
                </div>
                <div className="w-full bg-gray-800/50 rounded-full h-3">
                  <div
                    className="h-3 bg-gradient-to-r rounded-full shadow-lg transition-all duration-1000 ease-out"
                    style={{ width: `${kpi.progress}%`, backgroundColor: kpi.color }}
                  />
                </div>
                <div className="text-sm font-medium text-gray-400">
                  {kpi.progress}%
                </div>
              </div>
              <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute left-1/2 -translate-x-1/2 -translate-y-full mb-3 px-4 py-2 bg-slate-900/95 backdrop-blur-xl rounded-xl text-xs text-white shadow-2xl whitespace-nowrap z-20 transition-all duration-200 pointer-events-none">
                {kpi.tooltip}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className={`${glassCard} p-8 col-span-1`}>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 drop-shadow-lg">Receita ao Longo do Tempo</h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="5 5" stroke="#374151" vertical={false} />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={14} />
                <YAxis stroke="#9ca3af" fontSize={14} />
                <RechartsTooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={4}
                  dot={{ fill: '#10b981', strokeWidth: 3 }}
                  activeDot={{ r: 8, strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className={`${glassCard} p-8 col-span-1`}>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 drop-shadow-lg">Vendas por Produto</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="5 5" stroke="#374151" vertical={false} />
                <XAxis
                  dataKey="product"
                  stroke="#9ca3af"
                  fontSize={13}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis stroke="#9ca3af" fontSize={14} />
                <RechartsTooltip />
                <Bar dataKey="sales" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className={`${glassCard} p-8`}>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 drop-shadow-lg">Participação por Região</h2>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={regionData}
                  dataKey="value"
                  nameKey="region"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {regionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={`${glassCard} p-8`}>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 drop-shadow-lg">Progresso das Metas</h2>
            <ResponsiveContainer width="100%" height={350}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="20%"
                outerRadius="80%"
                barSize={20}
                data={goalData}
              >
                <RadialBar
                  minAngle={15}
                  background
                  clockWise
                  dataKey="pv"
                  cornerRadius={50}
                  fill="#f59e0b"
                />
                <RechartsTooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-20 text-center">
          <button
            onClick={exportToExcel}
            className="inline-flex items-center gap-3 px-10 py-6 bg-gradient-to-r from-emerald-500/90 to-teal-600/90 backdrop-blur-xl border border-emerald-400/50 text-white font-bold text-xl rounded-3xl shadow-2xl hover:from-emerald-600 hover:to-teal-700 hover:border-emerald-500/70 hover:shadow-emerald-500/30 hover:-translate-y-2 transition-all duration-300 active:scale-95"
          >
            📊 Exportar para Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
