"use client";

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import * as XLSX from 'xlsx';

type KPI = {
  title: string;
  value: number;
  target: number;
  color: string;
  tooltip: string;
};

type ChartDataPoint = {
  month?: string;
  product?: string;
  region?: string;
  revenue?: number;
  sales?: number;
  value?: number;
  achieved?: number;
};

const kpiData: KPI[] = [
  {
    title: 'Receita Total',
    value: 1250000,
    target: 1500000,
    color: '#3b82f6',
    tooltip: 'Receita acumulada do ano em R$',
  },
  {
    title: 'Vendas Realizadas',
    value: 850,
    target: 1000,
    color: '#10b981',
    tooltip: 'Número total de unidades vendidas',
  },
  {
    title: 'Progresso de Metas',
    value: 85,
    target: 100,
    color: '#f59e0b',
    tooltip: 'Percentual médio de metas alcançadas',
  },
  {
    title: 'Produtos Vendidos',
    value: 12,
    target: 15,
    color: '#8b5cf6',
    tooltip: 'Número de produtos com vendas ativas',
  },
  {
    title: 'Cobertura Regional',
    value: 4,
    target: 5,
    color: '#ef4444',
    tooltip: 'Número de regiões com presença significativa',
  },
];

const revenueData: ChartDataPoint[] = [
  { month: 'Jan', revenue: 80000 },
  { month: 'Fev', revenue: 92000 },
  { month: 'Mar', revenue: 105000 },
  { month: 'Abr', revenue: 112000 },
  { month: 'Mai', revenue: 125000 },
  { month: 'Jun', revenue: 138000 },
  { month: 'Jul', revenue: 145000 },
  { month: 'Ago', revenue: 152000 },
  { month: 'Set', revenue: 148000 },
  { month: 'Out', revenue: 155000 },
  { month: 'Nov', revenue: 162000 },
  { month: 'Dez', revenue: 158000 },
];

const productData: ChartDataPoint[] = [
  { product: 'Estruturas Metálicas', sales: 350000 },
  { product: 'Portões', sales: 280000 },
  { product: 'Grades', sales: 220000 },
  { product: 'Cobertura', sales: 200000 },
  { product: 'Escadas', sales: 150000 },
  { product: 'Outros', sales: 50000 },
];

const regionData: ChartDataPoint[] = [
  { region: 'Sudeste', value: 45 },
  { region: 'Sul', value: 25 },
  { region: 'Nordeste', value: 20 },
  { region: 'Centro-Oeste', value: 5 },
  { region: 'Norte', value: 5 },
];

const goalData: ChartDataPoint[] = [
  { month: 'Jan', achieved: 15 },
  { month: 'Fev', achieved: 28 },
  { month: 'Mar', achieved: 38 },
  { month: 'Abr', achieved: 48 },
  { month: 'Mai', achieved: 58 },
  { month: 'Jun', achieved: 65 },
  { month: 'Jul', achieved: 72 },
  { month: 'Ago', achieved: 78 },
  { month: 'Set', achieved: 83 },
  { month: 'Out', achieved: 87 },
  { month: 'Nov', achieved: 92 },
  { month: 'Dez', achieved: 95 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28EFF'];

const glassClasses =
  'bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-6 hover:shadow-3xl transition-all duration-300 group-hover:scale-[1.02] hover:-translate-y-1';

const KPICard = ({ title, value, target, color, tooltip }: KPI) => {
  const progress = Math.min((value / target) * 100, 100);

  return (
    <div className={glassClasses}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-white font-semibold text-lg flex-1 pr-4">{title}</h3>
        <div
          className="text-white/60 text-sm cursor-help flex-shrink-0"
          title={tooltip}
        >
          ℹ️
        </div>
      </div>
      <p className="text-3xl font-bold text-white mb-2">
        {value.toLocaleString()}
      </p>
      <p className="text-white/60 text-sm mb-6">Meta: {target.toLocaleString()}</p>
      <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
        <div
          className="h-4 rounded-full transition-all duration-1000 ease-out shadow-lg"
          style={{ width: `${progress}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const commonTooltipProps = {
  contentStyle: {
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
  },
  labelStyle: { color: 'white' },
  itemStyle: { color: 'white' },
};

const commonCartesianGridProps = {
  strokeDasharray: '5 5',
  stroke: 'rgba(255, 255, 255, 0.08)',
  vertical: false,
};

const exportExcel = () => {
  const wb = XLSX.utils.book_new();

  // KPIs
  const kpiExport = kpiData.map(({ title, value, target }) => ({
    Título: title,
    Valor: value,
    Meta: target,
  }));
  const kpiSheet = XLSX.utils.json_to_sheet(kpiExport);
  XLSX.utils.book_append_sheet(wb, kpiSheet, 'KPIs');

  // Receita
  const revenueSheet = XLSX.utils.json_to_sheet(revenueData);
  XLSX.utils.book_append_sheet(wb, revenueSheet, 'Receita');

  // Produtos
  const productSheet = XLSX.utils.json_to_sheet(productData);
  XLSX.utils.book_append_sheet(wb, productSheet, 'Produtos');

  // Regiões
  const regionSheet = XLSX.utils.json_to_sheet(regionData);
  XLSX.utils.book_append_sheet(wb, regionSheet, 'Regioes');

  // Metas
  const goalSheet = XLSX.utils.json_to_sheet(goalData);
  XLSX.utils.book_append_sheet(wb, goalSheet, 'Metas');

  XLSX.writeFile(wb, 'Dashboard_Metalfama.xlsx');
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900/50 to-slate-950 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white via-blue-100/50 to-purple-100/50 bg-clip-text text-transparent drop-shadow-2xl mb-4">
            Dashboard Metalfama
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Visão geral completa das métricas e progresso da Metalfama.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {kpiData.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className={glassClasses.replace('p-6', 'p-8')}>
            <h2 className="text-2xl font-bold text-white mb-6">Receita ao Longo do Tempo</h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={revenueData}>
                <CartesianGrid {...commonCartesianGridProps} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
                <YAxis stroke="rgba(255,255,255,0.6)" tickFormatter={(v) => `R$ ${v.toLocaleString()}`} />
                <Tooltip
                  formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Receita']}
                  {...commonTooltipProps}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                  activeDot={{ r: 8, strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className={glassClasses.replace('p-6', 'p-8')}>
            <h2 className="text-2xl font-bold text-white mb-6">Progressão de Metas</h2>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={goalData}>
                <defs>
                  <linearGradient id="achievedColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...commonCartesianGridProps} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
                <YAxis stroke="rgba(255,255,255,0.6)" />
                <Tooltip {...commonTooltipProps} />
                <Area
                  type="monotone"
                  dataKey="achieved"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#achievedColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className={glassClasses.replace('p-6', 'p-8')}>
            <h2 className="text-2xl font-bold text-white mb-6">Vendas por Produto</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={productData}>
                <CartesianGrid {...commonCartesianGridProps} />
                <XAxis dataKey="product" stroke="rgba(255,255,255,0.6)" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="rgba(255,255,255,0.6)" tickFormatter={(v) => `R$ ${v.toLocaleString()}`} />
                <Tooltip
                  formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Vendas']}
                  {...commonTooltipProps}
                />
                <Legend />
                <Bar dataKey="sales" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={glassClasses.replace('p-6', 'p-8')}>
            <h2 className="text-2xl font-bold text-white mb-6">Participação por Região</h2>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={regionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {regionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...commonTooltipProps} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-16 flex justify-center">
          <button
            onClick={exportExcel}
            className="group bg-gradient-to-r from-blue-600/20 to-emerald-600/20 backdrop-blur-xl border-2 border-white/30 px-12 py-6 rounded-3xl text-xl font-bold text-white shadow-2xl hover:from-blue-500/40 hover:to-emerald-500/40 hover:border-white/50 hover:shadow-4xl hover:scale-105 transition-all duration-300 hover:-translate-y-2"
          >
            📊 Exportar para Excel
          </button>
        </div>
      </div>
    </div>
  );
}
