"use client";

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

type SalesData = {
  name: string;
  vendas: number;
};

type EvolutionData = {
  hora: string;
  valor: number;
};

type TableRow = {
  vendedor: string;
  vendas: number;
  faturado: string;
  atrasos: number;
  previsao: string;
};

const kpis = [
  { title: 'Faturado', value: 'R$ 45.230', color: 'from-green-400 to-green-600' },
  { title: 'Vendas', value: '1.245', color: 'from-blue-400 to-blue-600' },
  { title: 'Atrasos', value: '23', color: 'from-red-400 to-red-600' },
  { title: 'Previsão', value: 'R$ 52.100', color: 'from-purple-400 to-purple-600' },
];

const salesData: SalesData[] = [
  { name: 'João Silva', vendas: 400 },
  { name: 'Maria Santos', vendas: 300 },
  { name: 'Pedro Oliveira', vendas: 500 },
  { name: 'Ana Costa', vendas: 280 },
  { name: 'Carlos Lima', vendas: 450 },
];

const evolutionData: EvolutionData[] = [
  { hora: '08:00', valor: 100 },
  { hora: '10:00', valor: 200 },
  { hora: '12:00', valor: 350 },
  { hora: '14:00', valor: 450 },
  { hora: '16:00', valor: 500 },
  { hora: '18:00', valor: 480 },
];

const tableData: TableRow[] = [
  { vendedor: 'João Silva', vendas: 400, faturado: 'R$ 12.000', atrasos: 2, previsao: 'R$ 15.000' },
  { vendedor: 'Maria Santos', vendas: 300, faturado: 'R$ 9.500', atrasos: 0, previsao: 'R$ 11.200' },
  { vendedor: 'Pedro Oliveira', vendas: 500, faturado: 'R$ 15.800', atrasos: 5, previsao: 'R$ 18.000' },
  { vendedor: 'Ana Costa', vendas: 280, faturado: 'R$ 8.900', atrasos: 1, previsao: 'R$ 10.500' },
  { vendedor: 'Carlos Lima', vendas: 450, faturado: 'R$ 14.200', atrasos: 3, previsao: 'R$ 16.800' },
  { vendedor: 'Fernanda Souza', vendas: 320, faturado: 'R$ 10.100', atrasos: 4, previsao: 'R$ 12.300' },
];

export default function DiarioPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeFilter, setActiveFilter] = useState('todos');

  const filters = ['todos', 'vendedor', 'produto', 'regiao'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-2xl">
          📅 Fechamento Diário Comercial
        </h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 font-semibold text-lg min-w-[200px]"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 backdrop-blur-md border-2 ${
              activeFilter === filter
                ? 'bg-white/20 border-white/50 shadow-2xl scale-105'
                : 'bg-white/10 border-white/30 hover:bg-white/20 hover:border-white/50 hover:shadow-xl hover:scale-105'
            }`}
          >
            {filter.toUpperCase()}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className={`p-8 rounded-3xl backdrop-blur-xl bg-gradient-to-br ${kpi.color} bg-opacity-20 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group`}
          >
            <h3 className="text-lg font-semibold opacity-90 mb-2 group-hover:opacity-100">{kpi.title}</h3>
            <p className="text-3xl md:text-4xl font-bold drop-shadow-lg">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Bar Chart */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Vendas por Vendedor</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="white" />
              <YAxis stroke="white" />
              <Tooltip />
              <Legend />
              <Bar dataKey="vendas" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Evolução do Dia</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="hora" stroke="white" />
              <YAxis stroke="white" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="valor" stroke="#8884d8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/20 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-bold border-b border-white/30 sticky left-0 bg-white/20 z-20 whitespace-nowrap">Vendedor</th>
                <th className="px-6 py-4 font-bold border-b border-white/30 whitespace-nowrap">Vendas</th>
                <th className="px-6 py-4 font-bold border-b border-white/30 whitespace-nowrap">Faturado</th>
                <th className="px-6 py-4 font-bold border-b border-white/30 whitespace-nowrap">Atrasos</th>
                <th className="px-6 py-4 font-bold border-b border-white/30 whitespace-nowrap">Previsão</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/10 transition-colors border-b border-white/20 last:border-b-0">
                  <td className="px-6 py-4 font-semibold sticky left-0 bg-white/10 z-10 whitespace-nowrap">{row.vendedor}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.vendas}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.faturado}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.atrasos}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.previsao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
