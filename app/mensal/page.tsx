'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

type Status = 'PREMIUM' | 'REGULAR' | 'BASIC';

interface VendaRecord {
  id: number;
  cliente: string;
  liga: string;
  volumeKg: number;
  receita: number;
  ticketMedio: number;
  cotacao: number;
  status: Status;
}

export default function MensalPage() {
  const [vendas, setVendas] = useState<VendaRecord[]>([]);

  useEffect(() => {
    const mockData: VendaRecord[] = [
      { id: 1, cliente: 'Indústria X', liga: 'Liga Ouro', volumeKg: 250, receita: 45000, ticketMedio: 180, cotacao: 8, status: 'PREMIUM' },
      { id: 2, cliente: 'Fábrica Y', liga: 'Liga Prata', volumeKg: 180, receita: 32000, ticketMedio: 177.78, cotacao: 6, status: 'REGULAR' },
      { id: 3, cliente: 'Indústria X', liga: 'Liga Bronze', volumeKg: 120, receita: 21000, ticketMedio: 175, cotacao: 4, status: 'PREMIUM' },
      { id: 4, cliente: 'Cliente Z', liga: 'Liga Ouro', volumeKg: 300, receita: 52000, ticketMedio: 173.33, cotacao: 10, status: 'PREMIUM' },
      { id: 5, cliente: 'Fábrica Y', liga: 'Liga Prata', volumeKg: 200, receita: 35000, ticketMedio: 175, cotacao: 7, status: 'REGULAR' },
      { id: 6, cliente: 'Empresa W', liga: 'Liga Bronze', volumeKg: 150, receita: 26000, ticketMedio: 173.33, cotacao: 5, status: 'BASIC' },
      { id: 7, cliente: 'Cliente Z', liga: 'Liga Ouro', volumeKg: 220, receita: 38000, ticketMedio: 172.73, cotacao: 9, status: 'PREMIUM' },
      { id: 8, cliente: 'Empresa W', liga: 'Liga Prata', volumeKg: 160, receita: 28000, ticketMedio: 175, cotacao: 6, status: 'REGULAR' },
      { id: 9, cliente: 'Indústria X', liga: 'Liga Bronze', volumeKg: 140, receita: 24000, ticketMedio: 171.43, cotacao: 5, status: 'PREMIUM' },
      { id: 10, cliente: 'Fábrica Y', liga: 'Liga Ouro', volumeKg: 280, receita: 48000, ticketMedio: 171.43, cotacao: 8, status: 'REGULAR' }
    ];
    setVendas(mockData);
  }, []);

  const volumeTotal = useMemo(
    () => vendas.reduce((sum, v) => sum + v.volumeKg, 0),
    [vendas]
  );

  const receitaTotal = useMemo(
    () => vendas.reduce((sum, v) => sum + v.receita, 0),
    [vendas]
  );

  const ticketMedioGlobal = useMemo(
    () => (vendas.length > 0 ? receitaTotal / vendas.length : 0),
    [vendas, receitaTotal]
  );

  const totalCotações = useMemo(
    () => vendas.reduce((sum, v) => sum + v.cotacao, 0),
    [vendas]
  );

  const ligaData = useMemo(() => {
    const grouped: { [key: string]: number } = {};
    vendas.forEach((v) => {
      grouped[v.liga] = (grouped[v.liga] || 0) + v.volumeKg;
    });
    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value: Number(value),
    }));
  }, [vendas]);

  const clientData = useMemo(() => {
    const grouped: { [key: string]: number } = {};
    vendas.forEach((v) => {
      grouped[v.cliente] = (grouped[v.cliente] || 0) + v.receita;
    });
    return Object.entries(grouped)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, receita]) => ({ name, receita: Number(receita) }));
  }, [vendas]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden relative">
      <div className="container mx-auto px-6 py-16 md:px-12 lg:px-24">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-2xl leading-tight">
            Fechamento Mensal
          </h1>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <div className="group relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-3">Volume Kg</p>
              <p className="text-4xl md:text-5xl font-black text-white drop-shadow-lg">
                {volumeTotal.toLocaleString()}
              </p>
              <p className="text-white/50 text-sm mt-2">kg</p>
            </div>
          </div>
          <div className="group relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-3">Receita</p>
              <p className="text-4xl md:text-5xl font-black text-white drop-shadow-lg">
                {receitaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
          <div className="group relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-3">Ticket Médio</p>
              <p className="text-4xl md:text-5xl font-black text-white drop-shadow-lg">
                {ticketMedioGlobal.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
          <div className="group relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-3">Cotações</p>
              <p className="text-4xl md:text-5xl font-black text-white drop-shadow-lg">
                {totalCotações.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {/* Donut Chart - Ligas */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">Distribuição por Ligas</h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={ligaData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={60}
                >
                  {ligaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ color: 'white', fontSize: 14 }} verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart - Clientes */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">Top Clientes por Receita</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={clientData}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#667eea" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#764ba2" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                  unit=" R$"
                />
                <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']} />
                <Bar dataKey="receita" fill="url(#colorReceita)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl overflow-hidden">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-8">Vendas Detalhadas</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-4 px-6 font-semibold text-white/90">Cliente</th>
                  <th className="text-left py-4 px-6 font-semibold text-white/90">Liga</th>
                  <th className="text-left py-4 px-6 font-semibold text-white/90">Volume Kg</th>
                  <th className="text-left py-4 px-6 font-semibold text-white/90">Receita</th>
                  <th className="text-left py-4 px-6 font-semibold text-white/90">Ticket Médio</th>
                  <th className="text-left py-4 px-6 font-semibold text-white/90">Cotações</th>
                  <th className="text-left py-4 px-6 font-semibold text-white/90">Status</th>
                </tr>
              </thead>
              <tbody>
                {vendas.map((venda) => (
                  <tr key={venda.id} className="border-b border-white/10 hover:bg-white/5 transition-colors duration-200">
                    <td className="py-4 px-6 font-medium text-white">{venda.cliente}</td>
                    <td className="py-4 px-6 text-white/80">{venda.liga}</td>
                    <td className="py-4 px-6 text-white/80">{venda.volumeKg.toLocaleString()} kg</td>
                    <td className="py-4 px-6 text-white/80">
                      R$ {venda.receita.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-4 px-6 text-white/80">
                      R$ {venda.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 text-white/80">{venda.cotacao.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-4 py-2 rounded-full text-xs font-bold border-2 shadow-lg ${
                          venda.status === 'PREMIUM'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/50'
                            : venda.status === 'REGULAR'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-400/50'
                            : 'bg-gray-500/20 text-gray-400 border-gray-400/50'
                        }`}
                      >
                        {venda.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
