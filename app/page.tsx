'use client';

import { useState, useEffect } from 'react';
import FechamentoMensal from './componentes/FechamentoMensal';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer
} from 'recharts';

type DataPoint = {
  name: string;
  vendas: number;
  lucro: number;
  data: string;
};

const initialData: DataPoint[] = [
  { name: 'Jan 2024', vendas: 400, lucro: 240, data: '2024-01-01' },
  { name: 'Fev 2024', vendas: 300, lucro: 139, data: '2024-02-01' },
  { name: 'Mar 2024', vendas: 200, lucro: 380, data: '2024-03-01' },
  { name: 'Abr 2024', vendas: 278, lucro: 390, data: '2024-04-01' },
  { name: 'Mai 2024', vendas: 189, lucro: 200, data: '2024-05-01' },
  { name: 'Jun 2024', vendas: 239, lucro: 380, data: '2024-06-01' },
  { name: 'Jul 2024', vendas: 349, lucro: 430, data: '2024-07-01' },
];

export default function DashboardPage() {
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [filteredData, setFilteredData] = useState<DataPoint[]>(initialData);

  useEffect(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const filtered = initialData.filter((item) => {
      const itemDate = new Date(item.data);
      return itemDate >= start && itemDate <= end;
    });
    setFilteredData(filtered);
  }, [startDate, endDate]);

  const totalVendas = filteredData.reduce((sum, item) => sum + item.vendas, 0);
  const totalLucro = filteredData.reduce((sum, item) => sum + item.lucro, 0);
  const qtdMeses = filteredData.length;
  const avgLucro = qtdMeses > 0 ? Math.round(totalLucro / qtdMeses) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6 md:p-12 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-2xl">
              Dashboard Financeiro
            </h1>
            <p className="text-white/70 text-lg drop-shadow-xl">Visão geral das vendas e lucros mensais</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-white/80 mb-2 font-medium">Data Inicial</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-3 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent w-full sm:w-48 transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-white/80 mb-2 font-medium">Data Final</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-3 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent w-full sm:w-48 transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">💰</span>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-1 drop-shadow-xl group-hover:text-green-400 transition-colors">
              R$ {totalVendas.toLocaleString()}
            </h3>
            <p className="text-white/70 text-sm uppercase tracking-wide">Total Vendas</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">📈</span>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-1 drop-shadow-xl group-hover:text-blue-400 transition-colors">
              R$ {totalLucro.toLocaleString()}
            </h3>
            <p className="text-white/70 text-sm uppercase tracking-wide">Total Lucro</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">📊</span>
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-1 drop-shadow-xl group-hover:text-purple-400 transition-colors">
              {qtdMeses}
            </h3>
            <p className="text-white/70 text-sm uppercase tracking-wide">Meses Analisados</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">⚡</span>
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-1 drop-shadow-xl group-hover:text-yellow-400 transition-colors">
              R$ {avgLucro.toLocaleString()}
            </h3>
            <p className="text-white/70 text-sm uppercase tracking-wide">Lucro Médio</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-xl">Vendas Mensais (Linha)</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="vendas" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-xl">Vendas vs Lucro (Barra)</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Legend />
                <Bar dataKey="vendas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lucro" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabela Responsiva */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl overflow-hidden">
          <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-xl">Dados Detalhados</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-4 font-semibold uppercase tracking-wide text-white/80">Mês</th>
                  <th className="text-right p-4 font-semibold uppercase tracking-wide text-white/80">Vendas (R$)</th>
                  <th className="text-right p-4 font-semibold uppercase tracking-wide text-white/80">Lucro (R$)</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium">{item.name}</td>
                    <td className="p-4 text-right font-mono">{item.vendas.toLocaleString()}</td>
                    <td className="p-4 text-right font-mono text-green-400">{item.lucro.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Integração FechamentoMensal */}
        <div className="mt-12">
          <FechamentoMensal />
        </div>
      </div>
    </main>
  );
}
