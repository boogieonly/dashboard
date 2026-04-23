'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

interface Sale {
  date: string;
  weight: number;
  value: number;
  region: string;
  seller: string;
}

interface MonthlySummary {
  month: string;
  weight: number;
  value: number;
  orders: number;
  avgTicket: number;
  topRegion: string;
  topSeller: string;
  regions: Record<string, number>;
  sellers: Record<string, number>;
}

const MonthlyPage = () => {
  const router = useRouter();
  const [rawSales, setRawSales] = useState<Sale[]>([]);
  const [history, setHistory] = useState<MonthlySummary[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [currentSummary, setCurrentSummary] = useState<MonthlySummary | null>(null);
  const [regionData, setRegionData] = useState<{ name: string; value: number }[]>([]);
  const [sellerData, setSellerData] = useState<{ name: string; value: number }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const glass = 'backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl rounded-3xl';

  useEffect(() => {
    const dataStr = localStorage.getItem('salesData');
    if (dataStr) {
      const sales: Sale[] = JSON.parse(dataStr);
      setRawSales(sales);
      const monthsMap = new Map<string, {
        weight: number;
        value: number;
        orders: number;
        regions: Record<string, number>;
        sellers: Record<string, number>;
      }>();
      sales.forEach((sale) => {
        const monthKey = sale.date.slice(0, 7);
        if (!monthsMap.has(monthKey)) {
          monthsMap.set(monthKey, { weight: 0, value: 0, orders: 0, regions: {}, sellers: {} });
        }
        const monthData = monthsMap.get(monthKey)!;
        monthData.weight += sale.weight;
        monthData.value += sale.value;
        monthData.orders += 1;
        monthData.regions[sale.region] = (monthData.regions[sale.region] || 0) + sale.value;
        monthData.sellers[sale.seller] = (monthData.sellers[sale.seller] || 0) + sale.value;
      });
      const historyList: MonthlySummary[] = Array.from(monthsMap.entries())
        .map(([month, data]) => {
          const regionsEntries = Object.entries(data.regions).sort(([, a], [, b]) => b - a);
          const topRegion = regionsEntries[0]?.[0] || '';
          const sellersEntries = Object.entries(data.sellers).sort(([, a], [, b]) => b - a);
          const topSeller = sellersEntries[0]?.[0] || '';
          return {
            month,
            weight: data.weight,
            value: data.value,
            orders: data.orders,
            avgTicket: data.orders > 0 ? data.value / data.orders : 0,
            topRegion,
            topSeller,
            regions: data.regions,
            sellers: data.sellers,
          };
        })
        .sort((a, b) => b.month.localeCompare(a.month));
      setHistory(historyList);
      if (historyList.length > 0) {
        setSelectedMonth(historyList[0].month);
      }
    }
  }, []);

  useEffect(() => {
    const summary = history.find((h) => h.month === selectedMonth);
    if (summary) {
      setCurrentSummary(summary);
      const regionsTop = Object.entries(summary.regions)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }));
      setRegionData(regionsTop);
      const sellersTop = Object.entries(summary.sellers)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }));
      setSellerData(sellersTop);
    } else {
      setCurrentSummary(null);
      setRegionData([]);
      setSellerData([]);
    }
  }, [selectedMonth, history]);

  const paginatedHistory = history.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(history.length / itemsPerPage);

  const exportToExcel = () => {
    if (!currentSummary) return;
    const wb = XLSX.utils.book_new();
    // Resumo
    const resumoData = [
      ['Fechamento Mensal', selectedMonth],
      ['Peso Total', `${currentSummary.weight.toLocaleString()} kg`],
      ['Valor Total', currentSummary.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['Total de Pedidos', currentSummary.orders],
      ['Ticket Médio', currentSummary.avgTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['Melhor Região', currentSummary.topRegion],
      ['Melhor Vendedor', currentSummary.topSeller],
    ];
    const resumoWs = XLSX.utils.aoa_to_sheet(resumoData);
    XLSX.utils.book_append_sheet(wb, resumoWs, 'Resumo');
    // Regiões
    const regioesWs = XLSX.utils.json_to_sheet(regionData);
    XLSX.utils.book_append_sheet(wb, regioesWs, 'Regioes');
    // Vendedores
    const vendedoresWs = XLSX.utils.json_to_sheet(sellerData);
    XLSX.utils.book_append_sheet(wb, vendedoresWs, 'Vendedores');
    // Dados brutos
    const filteredSales = rawSales.filter((sale) => sale.date.startsWith(selectedMonth));
    const rawData = filteredSales.map((sale) => ({
      Data: sale.date,
      Peso: sale.weight,
      Valor: sale.value,
      Regiao: sale.region,
      Vendedor: sale.seller,
    }));
    const rawWs = XLSX.utils.json_to_sheet(rawData);
    XLSX.utils.book_append_sheet(wb, rawWs, 'Dados');
    XLSX.writeFile(wb, `Fechamento_Mensal_${selectedMonth}.xlsx`);
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatWeight = (weight: number) => `${weight.toLocaleString()} kg`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-orange-900/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center pt-12 pb-8">
          <h1 className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent text-4xl md:text-6xl font-black drop-shadow-2xl">
            📅 Fechamento Mensal
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mt-4 backdrop-blur-sm bg-white/10 px-6 py-3 rounded-2xl inline-block border border-white/20">
            Analise seus fechamentos mensais de forma consolidada
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex justify-center">
          <div className={`${glass} p-4 max-w-md w-full shadow-3xl`}>
            <label className="block text-white font-semibold mb-2 text-lg">Selecione o Mês:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-4 bg-white/30 border border-white/40 rounded-2xl text-white placeholder-white/70 backdrop-blur-xl focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition-all duration-300 text-lg font-mono shadow-inner"
            />
          </div>
        </div>

        {currentSummary ? (
          // KPIs
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={`${glass} p-8 text-center group hover:scale-[1.02] transition-all duration-300 hover:shadow-green-500/50 shadow-xl cursor-default`}>
              <div className="text-5xl mb-4 animate-pulse">⚖️</div>
              <h3 className="text-white font-bold text-xl mb-4">Peso Total Mês</h3>
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent drop-shadow-2xl">
                {formatWeight(currentSummary.weight)}
              </div>
            </div>
            <div className={`${glass} p-8 text-center group hover:scale-[1.02] transition-all duration-300 hover:shadow-yellow-500/50 shadow-xl cursor-default`}>
              <div className="text-5xl mb-4 animate-pulse">💰</div>
              <h3 className="text-white font-bold text-xl mb-4">Valor Total Mês</h3>
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl">
                {formatCurrency(currentSummary.value)}
              </div>
            </div>
            <div className={`${glass} p-8 text-center group hover:scale-[1.02] transition-all duration-300 hover:shadow-blue-500/50 shadow-xl cursor-default`}>
              <div className="text-5xl mb-4 animate-pulse">📦</div>
              <h3 className="text-white font-bold text-xl mb-4">Total de Pedidos</h3>
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl">
                {currentSummary.orders.toLocaleString()}
              </div>
            </div>
            <div className={`${glass} p-8 text-center group hover:scale-[1.02] transition-all duration-300 hover:shadow-purple-500/50 shadow-xl cursor-default`}>
              <div className="text-5xl mb-4 animate-pulse">💵</div>
              <h3 className="text-white font-bold text-xl mb-4">Ticket Médio</h3>
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent drop-shadow-2xl">
                {formatCurrency(currentSummary.avgTicket)}
              </div>
            </div>
            <div className={`${glass} p-8 text-center group hover:scale-[1.02] transition-all duration-300 hover:shadow-orange-500/50 shadow-xl cursor-default`}>
              <div className="text-5xl mb-4 animate-pulse">🏆</div>
              <h3 className="text-white font-bold text-xl mb-4">Melhor Região</h3>
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent drop-shadow-2xl">
                {currentSummary.topRegion || 'N/A'}
              </div>
            </div>
            <div className={`${glass} p-8 text-center group hover:scale-[1.02] transition-all duration-300 hover:shadow-amber-500/50 shadow-xl cursor-default`}>
              <div className="text-5xl mb-4 animate-pulse">⭐</div>
              <h3 className="text-white font-bold text-xl mb-4">Melhor Vendedor</h3>
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent drop-shadow-2xl">
                {currentSummary.topSeller || 'N/A'}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 ${glass} p-12">
            <p className="text-white/70 text-2xl">Selecione um mês válido para visualizar os KPIs</p>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className={`${glass} p-8 shadow-3xl`}>
            <h2 className="text-3xl font-black mb-8 bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-xl">
              📊 Vendas por Região (Top 5)
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#e2e8f0" tick={{ fontSize: 14, fill: '#e2e8f0' }} />
                <YAxis stroke="#e2e8f0" tick={{ fontSize: 14, fill: '#e2e8f0' }} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Valor']} />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={`${glass} p-8 shadow-3xl`}>
            <h2 className="text-3xl font-black mb-8 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent drop-shadow-xl">
              📈 Vendas por Vendedor (Top 5)
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={sellerData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#e2e8f0" tick={{ fontSize: 14, fill: '#e2e8f0' }} />
                <YAxis stroke="#e2e8f0" tick={{ fontSize: 14, fill: '#e2e8f0' }} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Valor']} />
                <Legend />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* History Table */}
        {history.length > 0 && (
          <div className={`${glass} p-8 shadow-3xl`}>
            <h2 className="text-4xl font-black mb-12 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent drop-shadow-2xl text-center">
              📋 Histórico de Fechamentos
            </h2>
            <div className="max-h-[500px] overflow-auto rounded-3xl border-2 border-white/20 shadow-2xl">
              <table className="w-full text-sm md:text-base">
                <thead className="sticky top-0 bg-white/40 backdrop-blur-2xl z-20">
                  <tr>
                    <th className="px-6 py-5 text-left font-bold text-xl bg-gradient-to-r from-gray-100/50 to-transparent text-slate-200">Mês</th>
                    <th className="px-6 py-5 text-right font-bold text-xl bg-gradient-to-r from-green-500/20 to-transparent text-emerald-200">Peso</th>
                    <th className="px-6 py-5 text-right font-bold text-xl bg-gradient-to-r from-yellow-500/20 to-transparent text-amber-200">Valor</th>
                    <th className="px-6 py-5 text-right font-bold text-xl bg-gradient-to-r from-blue-500/20 to-transparent text-sky-200">Pedidos</th>
                    <th className="px-6 py-5 text-right font-bold text-xl bg-gradient-to-r from-purple-500/20 to-transparent text-violet-200">Ticket Médio</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistory.map((row) => (
                    <tr
                      key={row.month}
                      onClick={() => setSelectedMonth(row.month)}
                      className="cursor-pointer hover:bg-white/30 active:bg-white/40 transition-all duration-200 border-b border-white/10 hover:border-white/30 hover:scale-[1.01]"
                    >
                      <td className="px-6 py-5 font-bold text-lg text-white/90 border-r border-white/10">{row.month}</td>
                      <td className="px-6 py-5 text-right text-green-400 font-bold text-lg border-r border-white/10">{formatWeight(row.weight)}</td>
                      <td className="px-6 py-5 text-right text-yellow-400 font-bold text-lg border-r border-white/10">{formatCurrency(row.value)}</td>
                      <td className="px-6 py-5 text-right text-blue-400 font-bold text-lg border-r border-white/10">{row.orders.toLocaleString()}</td>
                      <td className="px-6 py-5 text-right text-purple-400 font-bold text-lg">{formatCurrency(row.avgTicket)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`${glass} px-8 py-3 text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-3xl disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100`}
                >
                  ← Anterior
                </button>
                <span className="text-2xl font-bold text-white/90 px-8 py-3 ${glass}">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`${glass} px-8 py-3 text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-3xl disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100`}
                >
                  Próxima →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center pb-12">
          <button
            onClick={exportToExcel}
            disabled={!currentSummary}
            className="px-12 py-6 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:from-purple-700 hover:via-pink-600 hover:to-orange-600 text-white font-black text-xl rounded-3xl shadow-3xl hover:shadow-purple-500/50 hover:scale-[1.05] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex-1 max-w-sm mx-auto md:max-w-none"
          >
            📊 Exportar Fechamento Excel
          </button>
          <button
            onClick={() => router.push('/app')}
            className={`${glass} px-12 py-6 text-white font-black text-xl rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-[1.05] hover:bg-white/30 border-2 border-white/40 transition-all duration-300 flex-1 max-w-sm mx-auto md:max-w-none`}
          >
            ← Voltar para Visão Geral
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonthlyPage;
