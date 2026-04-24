import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

type Material = 'Cobre' | 'Latão' | 'Alumínio';
type QuotationStatus = 'Aberta' | 'Fechada' | 'Cancelada';

interface Sale {
  id: string;
  date: string; // YYYY-MM
  material: Material;
  client: string;
  volumeKg: number;
  revenue: number;
  quotationStatus: QuotationStatus;
}

interface Filters {
  monthYear: string;
  material: string;
  client: string;
}

const mockSales: Sale[] = [
  { id: '1', date: '2024-10', material: 'Cobre', client: 'Cliente A', volumeKg: 1500, revenue: 75000, quotationStatus: 'Fechada' },
  { id: '2', date: '2024-10', material: 'Latão', client: 'Cliente B', volumeKg: 800, revenue: 48000, quotationStatus: 'Aberta' },
  { id: '3', date: '2024-10', material: 'Alumínio', client: 'Cliente A', volumeKg: 2000, revenue: 60000, quotationStatus: 'Fechada' },
  { id: '4', date: '2024-11', material: 'Cobre', client: 'Cliente C', volumeKg: 1200, revenue: 60000, quotationStatus: 'Fechada' },
  { id: '5', date: '2024-11', material: 'Latão', client: 'Cliente D', volumeKg: 900, revenue: 54000, quotationStatus: 'Cancelada' },
  { id: '6', date: '2024-10', material: 'Alumínio', client: 'Cliente E', volumeKg: 1100, revenue: 33000, quotationStatus: 'Aberta' },
  { id: '7', date: '2024-11', material: 'Cobre', client: 'Cliente B', volumeKg: 700, revenue: 35000, quotationStatus: 'Fechada' },
];

const COLORS = ['#FF6B35', '#FFD700', '#4682B4'];

const MensalPage: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filters, setFilters] = useState<Filters>({ monthYear: '', material: 'Todos', client: 'Todos' });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const data = localStorage.getItem('mensalData');
    if (data) {
      setSales(JSON.parse(data));
    } else {
      setSales(mockSales);
      localStorage.setItem('mensalData', JSON.stringify(mockSales));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mensalData', JSON.stringify(sales));
  }, [sales]);

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      if (filters.monthYear && sale.date !== filters.monthYear) return false;
      if (filters.material !== 'Todos' && sale.material !== filters.material) return false;
      if (filters.client !== 'Todos' && sale.client !== filters.client) return false;
      return true;
    });
  }, [sales, filters]);

  const uniqueClients = useMemo(() => {
    return Array.from(new Set(sales.map((s) => s.client))).sort();
  }, [sales]);

  const totalVolume = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + s.volumeKg, 0);
  }, [filteredSales]);

  const totalRevenue = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + s.revenue, 0);
  }, [filteredSales]);

  const avgTicket = useMemo(() => {
    return totalVolume > 0 ? totalRevenue / totalVolume : 0;
  }, [totalVolume, totalRevenue]);

  const openQuotes = useMemo(() => {
    return filteredSales.filter((s) => s.quotationStatus === 'Aberta').length;
  }, [filteredSales]);

  const donutData = useMemo(() => {
    const sums: Record<string, number> = {};
    filteredSales.forEach((s) => {
      sums[s.material] = (sums[s.material] || 0) + s.revenue;
    });
    return Object.entries(sums).map(([name, value]) => ({ name, value: Number(value) }));
  }, [filteredSales]);

  const topClientsData = useMemo(() => {
    const sums: Record<string, number> = {};
    filteredSales.forEach((s) => {
      sums[s.client] = (sums[s.client] || 0) + s.revenue;
    });
    return Object.entries(sums)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([client, revenue]) => ({ client, revenue: Number(revenue) }));
  }, [filteredSales]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result as string;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

      // Headers: ['Data', 'Material', 'Cliente', 'VolumeKg', 'Receita', 'Status']
      const newSales: Sale[] = data.slice(1).map((row) => ({
        id: crypto.randomUUID(),
        date: row[0] as string,
        material: row[1] as Material,
        client: row[2] as string,
        volumeKg: parseFloat(row[3] as string) || 0,
        revenue: parseFloat(row[4] as string) || 0,
        quotationStatus: row[5] as QuotationStatus,
      }));

      setSales((prev) => [...prev, ...newSales]);
      e.target.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const getMaterialColor = (material: Material) => {
    switch (material) {
      case 'Cobre': return 'bg-orange-100 text-orange-800';
      case 'Latão': return 'bg-yellow-100 text-yellow-800';
      case 'Alumínio': return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusColor = (status: QuotationStatus) => {
    if (status === 'Aberta') return 'bg-red-100 text-red-800';
    if (status === 'Cancelada') return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Banner */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white p-12 rounded-3xl shadow-2xl mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight drop-shadow-2xl">
            📊 Inteligência Mensal de Mercado - Metalfama
          </h1>
          <p className="text-xl mt-4 opacity-90 font-semibold">Fechamento Mensal Profissional</p>
        </div>

        {/* Filters and Upload */}
        <section className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl mb-12">
          <div className="flex flex-wrap items-end gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mês/Ano</label>
              <input
                type="month"
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 w-48"
                value={filters.monthYear}
                onChange={(e) => setFilters({ ...filters, monthYear: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Material</label>
              <select
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 w-48"
                value={filters.material}
                onChange={(e) => setFilters({ ...filters, material: e.target.value })}
              >
                <option>Todos</option>
                <option>Cobre</option>
                <option>Latão</option>
                <option>Alumínio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cliente</label>
              <select
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 w-64"
                value={filters.client}
                onChange={(e) => setFilters({ ...filters, client: e.target.value })}
              >
                <option>Todos</option>
                {uniqueClients.map((client) => (
                  <option key={client}>{client}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-3 rounded-2xl hover:from-emerald-600 font-bold shadow-lg hover:shadow-xl transition-all"
            >
              📁 Upload Excel
            </button>
            <input ref={fileRef} type="file" accept=".xlsx" onChange={handleUpload} className="hidden" />
          </div>
        </section>

        {/* KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 text-white p-8 rounded-3xl shadow-2xl border-4 border-orange-200/50 backdrop-blur-sm">
            <div className="text-5xl mb-4">⚖️</div>
            <h3 className="text-xl font-bold mb-2">Volume Total Vendido</h3>
            <p className="text-4xl font-black">{totalVolume.toLocaleString()} Kg</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-400 to-green-600 text-white p-8 rounded-3xl shadow-2xl border-4 border-emerald-200/50 backdrop-blur-sm">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">Receita Bruta</h3>
            <p className="text-4xl font-black">R$ {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-violet-600 text-white p-8 rounded-3xl shadow-2xl border-4 border-purple-200/50 backdrop-blur-sm">
            <div className="text-5xl mb-4">📈</div>
            <h3 className="text-xl font-bold mb-2">Ticket Médio por Kg</h3>
            <p className="text-4xl font-black">R$ {avgTicket.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-red-400 to-rose-600 text-white p-8 rounded-3xl shadow-2xl border-4 border-red-200/50 backdrop-blur-sm">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-bold mb-2">Cotações em Aberto</h3>
            <p className="text-4xl font-black">{openQuotes}</p>
          </div>
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Distribuição por Liga (Receita)</h2>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Top 10 Clientes por Faturamento</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart layout="vertical" data={topClientsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="client" type="category" width={200} />
                <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Faturamento']} />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Table */}
        <section className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Tabela de Inteligência</h2>
          {filteredSales.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-2xl text-gray-500 mb-4">📭 Nenhum dado encontrado</p>
              <p className="text-gray-400">Faça upload de um arquivo Excel ou ajuste os filtros.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Material</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Volume (Kg)</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Receita (R$)</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getMaterialColor(sale.material)}`}>
                          {sale.material}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.client}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.volumeKg.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        R$ {sale.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(sale.quotationStatus)}`}>
                          {sale.quotationStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default MensalPage;
