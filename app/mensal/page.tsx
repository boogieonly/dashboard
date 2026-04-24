'use client';

import React, { useState, useEffect } from 'react';
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
  Legend,
} from 'recharts';
import * as XLSX from 'xlsx';

type Status = 'pendente' | 'aprovado' | 'rejeitado';

interface Record {
  data: string;
  material: string;
  cliente: string;
  peso: number;
  valor: number;
  status: Status;
}

export default function MensalPage() {
  const [data, setData] = useState<Record[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mensalData');
      if (stored) {
        setData(JSON.parse(stored));
      } else {
        const sampleData: Record[] = [
          { data: '2024-10-01', material: 'Liga A', cliente: 'Cliente 1', peso: 150, valor: 1500, status: 'aprovado' },
          { data: '2024-10-02', material: 'Liga B', cliente: 'Cliente 2', peso: 200, valor: 2200, status: 'pendente' },
          { data: '2024-10-03', material: 'Liga A', cliente: 'Cliente 1', peso: 100, valor: 1000, status: 'aprovado' },
          { data: '2024-10-04', material: 'Liga C', cliente: 'Cliente 3', peso: 180, valor: 1900, status: 'rejeitado' },
          { data: '2024-10-05', material: 'Liga B', cliente: 'Cliente 4', peso: 120, valor: 1300, status: 'aprovado' },
          { data: '2024-10-06', material: 'Liga A', cliente: 'Cliente 5', peso: 250, valor: 2600, status: 'pendente' },
          { data: '2024-10-07', material: 'Liga D', cliente: 'Cliente 1', peso: 90, valor: 950, status: 'aprovado' },
          { data: '2024-10-08', material: 'Liga C', cliente: 'Cliente 2', peso: 160, valor: 1700, status: 'aprovado' },
          { data: '2024-10-09', material: 'Liga B', cliente: 'Cliente 3', peso: 210, valor: 2300, status: 'rejeitado' },
          { data: '2024-10-10', material: 'Liga A', cliente: 'Cliente 4', peso: 140, valor: 1450, status: 'aprovado' },
        ];
        localStorage.setItem('mensalData', JSON.stringify(sampleData));
        setData(sampleData);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && data.length > 0) {
      localStorage.setItem('mensalData', JSON.stringify(data));
    }
  }, [data]);

  const volumeKg = data.reduce((sum, r) => sum + r.peso, 0);
  const receita = data.reduce((sum, r) => sum + r.valor, 0);
  const ticketMedio = data.length > 0 ? receita / data.length : 0;
  const cotacoes = data.length;

  const ligasMap = data.reduce((acc: Record<string, number>, r) => {
    acc[r.material] = (acc[r.material] || 0) + r.peso;
    return acc;
  }, {});
  const ligasData = Object.entries(ligasMap)
    .map(([name, value]) => ({ name, value: Number(value) }))
    .slice(0, 6);

  const clientsMap = data.reduce((acc: Record<string, number>, r) => {
    acc[r.cliente] = (acc[r.cliente] || 0) + r.peso;
    return acc;
  }, {});
  const clientsData = Object.entries(clientsMap)
    .map(([cliente, peso]) => ({ cliente, peso: Number(peso) }))
    .sort((a, b) => b.peso - a.peso)
    .slice(0, 5);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const StatusBadge = ({ status }: { status: Status }) => {
    const colorMap: Record<Status, string> = {
      pendente: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      aprovado: 'bg-green-100 text-green-800 border border-green-200',
      rejeitado: 'bg-red-100 text-red-800 border border-red-200',
    };
    return (
      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorMap[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const exportExcel = () => {
    const wsData = data.map((r) => ({
      Data: r.data,
      Material: r.material,
      Cliente: r.cliente,
      'Peso (Kg)': r.peso,
      'Valor (R$)': r.valor,
      Status: r.status,
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mensal');
    XLSX.writeFile(wb, `mensal-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const tableData = [...data].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-12 text-center">
          Relatório Mensal
        </h1>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-white/50 hover:shadow-3xl transition-all duration-300">
            <div className="text-4xl md:text-5xl font-black text-blue-600 mb-2">
              {volumeKg.toLocaleString()}
            </div>
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-widest">Volume Kg</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-white/50 hover:shadow-3xl transition-all duration-300">
            <div className="text-4xl md:text-5xl font-black text-green-600 mb-2">
              {formatCurrency(receita)}
            </div>
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-widest">Receita R$</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-white/50 hover:shadow-3xl transition-all duration-300">
            <div className="text-4xl md:text-5xl font-black text-purple-600 mb-2">
              {formatCurrency(ticketMedio)}
            </div>
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-widest">Ticket Médio</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-white/50 hover:shadow-3xl transition-all duration-300">
            <div className="text-4xl md:text-5xl font-black text-orange-600 mb-2">
              {cotacoes.toLocaleString()}
            </div>
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-widest">Cotações</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-white/50">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Distribuição de Ligas (Volume Kg)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={ligasData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {ligasData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-white/50">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Top Clientes (Volume Kg)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={clientsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="cliente" angle={-45} height={80} textAnchor="end" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="peso" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/50 overflow-hidden">
          <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-3xl font-bold text-gray-900">Registros Detalhados</h3>
              <button
                onClick={exportExcel}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
              >
                📊 Exportar Excel
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                <tr>
                  <th className="px-8 py-6 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Data</th>
                  <th className="px-8 py-6 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Material</th>
                  <th className="px-8 py-6 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Cliente</th>
                  <th className="px-8 py-6 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Peso (Kg)</th>
                  <th className="px-8 py-6 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Valor (R$)</th>
                  <th className="px-8 py-6 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50 transition-all duration-200">
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.data}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {row.material}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900">
                      {row.cliente}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {row.peso.toLocaleString()}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatCurrency(row.valor)}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm">
                      <StatusBadge status={row.status} />
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
