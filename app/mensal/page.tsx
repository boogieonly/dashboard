'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

type Sale = {
  id: string;
  date: string; // YYYY-MM-DD
  region: string;
  product: string;
  seller: string;
  material: string;
  volume: number;
  value: number;
};

export default function MensalPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const stored = localStorage.getItem('salesData');
    if (stored) {
      setSales(JSON.parse(stored));
    }

    // Set current month as default
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${year}-${month}`);
  }, []);

  const filterByMonth = () => {
    if (!selectedMonth || !sales.length) {
      setFilteredSales([]);
      return;
    }

    const [year, month] = selectedMonth.split('-').map(Number);
    const filtered = sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      return (
        saleDate.getFullYear() === year &&
        saleDate.getMonth() + 1 === month
      );
    });
    setFilteredSales(filtered);
    setCurrentPage(1);
  };

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.value, 0);
  const totalVolume = filteredSales.reduce((sum, sale) => sum + sale.volume, 0);
  const numOrders = filteredSales.length;
  const avgValue = numOrders > 0 ? totalSales / numOrders : 0;

  const chartData = useMemo(() => {
    const data: Record<string, number> = {};
    filteredSales.forEach((sale) => {
      const day = sale.date.slice(8, 10);
      data[day] = (data[day] || 0) + sale.value;
    });
    return Object.keys(data)
      .sort((a, b) => a.localeCompare(b))
      .map((day) => ({ day, value: data[day] }));
  }, [filteredSales]);

  const topRegionsData = useMemo(() => {
    const data: Record<string, number> = {};
    filteredSales.forEach((sale) => {
      data[sale.region] = (data[sale.region] || 0) + sale.volume;
    });
    return Object.entries(data)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([region, volume]) => ({ region, volume }));
  }, [filteredSales]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredSales.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const formatVolume = (volume: number) => `${volume.toFixed(2)} kg`;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR');

  const exportCSV = () => {
    if (!selectedMonth || filteredSales.length === 0) return;

    const headers = [
      'Data',
      'Região',
      'Produto',
      'Vendedor',
      'Material',
      'Volume (kg)',
      'Valor (R$)',
    ];
    const rows = filteredSales.map((sale) => [
      formatDate(sale.date),
      sale.region,
      sale.product,
      sale.seller,
      sale.material,
      formatVolume(sale.volume),
      formatCurrency(sale.value),
    ]);
    const csvContent = [headers, ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vendas_${selectedMonth}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const glassClass =
    'bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl hover:scale-[1.02] transition-all duration-300';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 p-8 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-12 mb-12 shadow-2xl text-white">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-2xl">
          Fechamento Mensal
        </h1>
        <p className="text-2xl opacity-90 drop-shadow-lg">
          Análise de Vendas por Mês
        </p>
      </div>

      {/* Month Selector */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center mb-12 bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
        <div className="flex-1">
          <label className="block text-white mb-2 font-semibold">Selecione o Mês:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full lg:w-auto bg-white/20 border border-white/30 rounded-2xl px-6 py-4 text-lg text-white placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition-all"
          />
        </div>
        <button
          onClick={filterByMonth}
          disabled={!selectedMonth}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          Filtrar Dados
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className={glassClass}>
          <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
            {formatCurrency(totalSales)}
          </div>
          <div className="text-gray-300 text-lg font-semibold">Total de Vendas</div>
        </div>
        <div className={glassClass}>
          <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
            {formatVolume(totalVolume)}
          </div>
          <div className="text-gray-300 text-lg font-semibold">Volume Vendido</div>
        </div>
        <div className={glassClass}>
          <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
            {numOrders.toLocaleString('pt-BR')}
          </div>
          <div className="text-gray-300 text-lg font-semibold">Quantidade de Pedidos</div>
        </div>
        <div className={glassClass}>
          <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
            {formatCurrency(avgValue)}
          </div>
          <div className="text-gray-300 text-lg font-semibold">Valor Médio por Pedido</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <div className={`${glassClass} h-[500px] p-8 flex flex-col`}>
          <h2 className="text-3xl font-bold mb-6 text-white">Evolução Diária de Vendas</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="5 5" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="day" stroke="#ffffff" fontSize={14} />
              <YAxis stroke="#ffffff" fontSize={14} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Vendas (R$)']}
                labelFormatter={(label) => `Dia ${label}`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8B5CF6"
                strokeWidth={4}
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#ffffff', strokeWidth: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className={`${glassClass} h-[500px] p-8 flex flex-col`}>
          <h2 className="text-3xl font-bold mb-6 text-white">Top 5 Regiões por Volume</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topRegionsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis
                dataKey="region"
                stroke="#ffffff"
                fontSize={13}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#ffffff" fontSize={14} />
              <Tooltip
                formatter={(value: number) => [formatVolume(value), 'Volume (kg)']}
              />
              <Bar dataKey="volume" fill="#EC4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className={`${glassClass} mb-12 overflow-hidden shadow-2xl`}>
        <h2 className="text-4xl font-bold mb-8 text-white">Histórico de Vendas</h2>
        {filteredSales.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-400 mb-4">Nenhum dado encontrado</p>
            <p className="text-lg text-gray-500">Selecione um mês e clique em Filtrar para visualizar os dados.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-white/30">
                    <th className="text-left p-6 font-bold text-white uppercase tracking-wider">Data</th>
                    <th className="text-left p-6 font-bold text-white uppercase tracking-wider">Região</th>
                    <th className="text-left p-6 font-bold text-white uppercase tracking-wider">Produto</th>
                    <th className="text-left p-6 font-bold text-white uppercase tracking-wider">Vendedor</th>
                    <th className="text-left p-6 font-bold text-white uppercase tracking-wider">Material</th>
                    <th className="text-left p-6 font-bold text-white uppercase tracking-wider">Volume (kg)</th>
                    <th className="text-right p-6 font-bold text-white uppercase tracking-wider">Valor (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((sale, index) => (
                    <tr
                      key={sale.id || index}
                      className="hover:bg-white/20 cursor-pointer transition-all border-b border-white/10 last:border-b-0"
                      onClick={() => console.log('Row clicked:', sale)}
                    >
                      <td className="p-6 font-medium text-white">{formatDate(sale.date)}</td>
                      <td className="p-6 text-gray-200">{sale.region}</td>
                      <td className="p-6 text-gray-200">{sale.product}</td>
                      <td className="p-6 text-gray-200">{sale.seller}</td>
                      <td className="p-6 text-gray-200">{sale.material}</td>
                      <td className="p-6 font-mono text-white">{formatVolume(sale.volume)}</td>
                      <td className="p-6 text-right font-bold text-white">{formatCurrency(sale.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-3 mt-10 p-6 bg-white/5 rounded-2xl">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-6 justify-end">
        <Link
          href="/"
          className="px-12 py-4 bg-white/20 backdrop-blur-sm border border-white/20 hover:bg-white/30 text-white font-bold text-lg rounded-3xl shadow-xl hover:shadow-2xl transition-all text-center flex-1 sm:flex-none"
        >
          Voltar para Visão Geral
        </Link>
        <button
          onClick={exportCSV}
          disabled={!selectedMonth || filteredSales.length === 0}
          className="px-12 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-lg rounded-3xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Exportar Dados do Mês (CSV)
        </button>
      </div>
    </div>
  );
}
