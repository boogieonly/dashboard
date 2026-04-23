'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
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

type Transaction = {
  id: string;
  date: string;
  description: string;
  region: string;
  product: string;
  quantity: number;
  unitPrice: number;
  total: number;
  seller: string;
};

type MonthlyData = {
  month: string;
  weight: number;
  value: number;
  orders: number;
  avgTicket: number;
};

export default function MensalPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [data, setData] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const currentMonth = useMemo(() => new Date().toISOString().slice(0, 7), []);

  const formatMonth = useCallback((monthStr: string): string => {
    const date = new Date(`${monthStr}-01`);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }, []);

  const generateData = useCallback((): void => {
    const transactions: Transaction[] = [];
    const now = new Date();
    const products = ['Bobina de Aço', 'Chapa de Alumínio', 'Barra de Cobre', 'Tubos de Aço', 'Perfil de Alumínio'];
    const regions = ['SP', 'MG', 'RJ'];
    const sellers = ['João', 'Maria', 'Pedro'];

    for (let m = 0; m < 24; m++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const monthStr = monthDate.toISOString().slice(0, 7);
      const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

      for (let d = 1; d <= daysInMonth; d += Math.random() > 0.6 ? 1 : 2) {
        const dateStr = `${monthStr}-${String(d).padStart(2, '0')}T12:00:00.000Z`;
        const quantity = 20 + Math.random() * 180;
        const unitPrice = 10 + Math.random() * 50;
        const total = quantity * unitPrice;

        transactions.push({
          id: crypto.randomUUID(),
          date: dateStr,
          description: 'Venda de metal',
          region: regions[Math.floor(Math.random() * regions.length)],
          product: products[Math.floor(Math.random() * products.length)],
          quantity,
          unitPrice,
          total,
          seller: sellers[Math.floor(Math.random() * sellers.length)],
        });
      }
    }
    setData(transactions);
  }, []);

  useEffect(() => {
    const savedDataStr = localStorage.getItem('monthlyData');
    const savedMonth = localStorage.getItem('selectedMonth');

    if (savedDataStr) {
      try {
        const parsedData = JSON.parse(savedDataStr) as Transaction[];
        setData(parsedData);
        if (savedMonth) {
          setSelectedMonth(savedMonth);
        } else {
          setSelectedMonth(currentMonth);
        }
      } catch {
        generateData();
      }
    } else {
      generateData();
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('monthlyData', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (selectedMonth) {
      localStorage.setItem('selectedMonth', selectedMonth);
    }
  }, [selectedMonth]);

  const kpis = useMemo(() => {
    if (!selectedMonth || !data.length) {
      return { weight: 0, value: 0, orders: 0, avgTicket: 0 };
    }
    const monthData = data.filter((t) => t.date.startsWith(selectedMonth));
    const weight = monthData.reduce((sum, t) => sum + t.quantity, 0);
    const value = monthData.reduce((sum, t) => sum + t.total, 0);
    const orders = monthData.length;
    const avgTicket = orders ? value / orders : 0;
    return { weight, value, orders, avgTicket };
  }, [selectedMonth, data]);

  const dailyData = useMemo(() => {
    if (!selectedMonth || !data.length) return [];
    const monthData = data.filter((t) => t.date.startsWith(selectedMonth));
    const daily: Record<string, number> = {};
    monthData.forEach((t) => {
      const day = t.date.slice(8, 10);
      daily[day] = (daily[day] || 0) + t.total;
    });
    const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
    return days.map((day) => ({
      day: parseInt(day),
      value: daily[day] || 0,
    }));
  }, [selectedMonth, data]);

  const topProducts = useMemo(() => {
    if (!selectedMonth || !data.length) return [];
    const monthData = data.filter((t) => t.date.startsWith(selectedMonth));
    const prodSum: Record<string, number> = {};
    monthData.forEach((t) => {
      prodSum[t.product] = (prodSum[t.product] || 0) + t.total;
    });
    return Object.entries(prodSum)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([product, value]) => ({ product, value: Number(value) }));
  }, [selectedMonth, data]);

  const monthlyData = useMemo(() => {
    const months = new Map<string, { weight: number; value: number; orders: number; totals: number[] }>();
    data.forEach((t) => {
      const month = t.date.slice(0, 7);
      if (!months.has(month)) {
        months.set(month, { weight: 0, value: 0, orders: 0, totals: [] });
      }
      const m = months.get(month)!;
      m.weight += t.quantity;
      m.value += t.total;
      m.orders += 1;
      m.totals.push(t.total);
    });
    const res: MonthlyData[] = Array.from(months.values()).map((m) => ({
      month: m.month ?? '',
      weight: m.weight,
      value: m.value,
      orders: m.orders,
      avgTicket: m.totals.length ? m.value / m.totals.length : 0,
    }));
    return res.sort((a, b) => new Date(b.month + '-01').getTime() - new Date(a.month + '-01').getTime()).slice(0, 12);
  }, [data]);

  const currentData = useMemo(
    () => data.filter((t) => t.date.startsWith(selectedMonth)),
    [data, selectedMonth]
  );

  const totalPages = useMemo(() => Math.ceil(monthlyData.length / 6), [monthlyData]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * 6;
    return monthlyData.slice(start, start + 6);
  }, [monthlyData, currentPage]);

  const exportCSV = useCallback((exportData: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dados');
    XLSX.writeFile(wb, `${filename}.csv`, { bookType: 'csv' });
  }, []);

  const selectedMonthDisplay = selectedMonth ? formatMonth(selectedMonth) : 'Selecione um mês';

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4 md:p-6 lg:p-8 font-sans">
      {/* Header */}
      <div className="flex flex-col items-center mb-12 md:mb-16">
        <h1 className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent text-3xl md:text-4xl lg:text-5xl font-black mb-4 text-center drop-shadow-lg">
          Fechamento Mensal
        </h1>
        <p className="text-white/80 text-lg md:text-xl mb-8 text-center max-w-2xl">
          Análise consolidada de vendas por mês
        </p>
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 shadow-xl">
          <label className="text-white font-semibold text-lg whitespace-nowrap">Mês:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setCurrentPage(1);
            }}
            max={currentMonth}
            className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
          />
          <p className="text-white text-xl font-semibold bg-white/10 px-4 py-2 rounded-lg">
            {selectedMonthDisplay}
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 md:mb-16">
        <div className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8 cursor-default hover:scale-105 hover:bg-white/15 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center">
          <span className="text-4xl md:text-5xl mb-4">📦</span>
          <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Peso Total
          </h2>
          <p className="text-white/70 text-lg md:text-xl">{kpis.weight.toLocaleString('pt-BR')} kg</p>
        </div>
        <div className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8 cursor-default hover:scale-105 hover:bg-white/15 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center">
          <span className="text-4xl md:text-5xl mb-4">💰</span>
          <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
            Valor Total Vendido
          </h2>
          <p className="text-white/70 text-lg md:text-xl">{kpis.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
        <div className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8 cursor-default hover:scale-105 hover:bg-white/15 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center">
          <span className="text-4xl md:text-5xl mb-4">📋</span>
          <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Total de Pedidos
          </h2>
          <p className="text-white/70 text-lg md:text-xl">{kpis.orders.toLocaleString('pt-BR')}</p>
        </div>
        <div className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8 cursor-default hover:scale-105 hover:bg-white/15 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center">
          <span className="text-4xl md:text-5xl mb-4">💳</span>
          <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
            Ticket Médio
          </h2>
          <p className="text-white/70 text-lg md:text-xl">{kpis.avgTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 md:mb-16">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8">
          <h3 className="text-white text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            📈 Evolução Diária de Vendas do Mês
          </h3>
          {dailyData.length > 0 && dailyData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#1D4ED8" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="white" strokeOpacity={0.2} vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'white' }} tickLine={false} />
                <YAxis tickFormatter={(v) => `R$ ${Number(v).toLocaleString('pt-BR')}`} tick={{ fill: 'white' }} tickLine={false} />
                <Tooltip
                  labelFormatter={(label) => `Dia ${label}`}
                  formatter={(value: number) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Receita']}
                  labelStyle={{ color: 'black' }}
                  contentStyle={{ background: 'white', border: 'none', borderRadius: '8px' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="url(#lineGradient)"
                  strokeWidth={3}
                  dot={{ fill: 'white', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 8, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center bg-white/5 rounded-xl">
              <p className="text-white/50 text-xl md:text-2xl text-center">📈 Sem dados de vendas para este período</p>
            </div>
          )}
        </div>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8">
          <h3 className="text-white text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            📊 Top 5 Produtos do Mês
          </h3>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topProducts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="white" strokeOpacity={0.2} vertical={false} />
                <XAxis dataKey="product" tick={{ fill: 'white' }} tickLine={false} angle={-45} height={80} />
                <YAxis tickFormatter={(v) => `R$ ${Number(v).toLocaleString('pt-BR')}`} tick={{ fill: 'white' }} tickLine={false} />
                <Tooltip
                  formatter={(value: number) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Valor']}
                  labelStyle={{ color: 'black' }}
                  contentStyle={{ background: 'white', border: 'none', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center bg-white/5 rounded-xl">
              <p className="text-white/50 text-xl md:text-2xl text-center">📦 Sem produtos vendidos neste período</p>
            </div>
          )}
        </div>
      </div>

      {/* Historical Table */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8 mb-12 md:mb-16 overflow-hidden">
        <h3 className="text-white text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
          📋 Histórico dos Últimos 12 Meses
        </h3>
        {monthlyData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/50 text-xl">Sem dados históricos disponíveis</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm md:text-base">
                <thead>
                  <tr className="border-b border-white/20 bg-white/5">
                    <th className="p-4 text-left font-semibold text-white">Mês</th>
                    <th className="p-4 text-right font-semibold text-white">Peso Total (kg)</th>
                    <th className="p-4 text-right font-semibold text-white">Valor Total (R$)</th>
                    <th className="p-4 text-right font-semibold text-white">Qtd Pedidos</th>
                    <th className="p-4 text-right font-semibold text-white">Ticket Médio (R$)</th>
                    <th className="p-4 text-center font-semibold text-white w-20">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row) => (
                    <tr
                      key={row.month}
                      className="border-b border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                      onClick={() => {
                        setSelectedMonth(row.month);
                        setCurrentPage(1);
                      }}
                    >
                      <td className="p-4 font-medium text-white">{formatMonth(row.month)}</td>
                      <td className="p-4 text-right text-white/90">{row.weight.toLocaleString('pt-BR')}</td>
                      <td className="p-4 text-right text-white/90">{row.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td className="p-4 text-right text-white/90">{row.orders.toLocaleString('pt-BR')}</td>
                      <td className="p-4 text-right text-white/90">{row.avgTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td className="p-4 text-center">
                        <span className="text-blue-400 hover:text-blue-300 text-lg transition-colors">👁️ Ver</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 p-4 bg-white/5 rounded-xl">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-6 py-2 bg-white/20 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/30 disabled:opacity-50 transition-all disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-white font-semibold text-lg">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-6 py-2 bg-white/20 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/30 disabled:opacity-50 transition-all disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button
          disabled={!selectedMonth || currentData.length === 0}
          onClick={() => exportCSV(currentData, `Vendas_${selectedMonth}`)}
          className="px-8 py-4 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold text-lg rounded-xl hover:from-emerald-500 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 min-w-[200px]"
        >
          📥 Exportar CSV do Mês
        </button>
        <button
          disabled={monthlyData.length === 0}
          onClick={() => exportCSV(monthlyData, 'Fechamento_12Meses')}
          className="px-8 py-4 bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold text-lg rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 min-w-[200px]"
        >
          📊 Exportar Todos os Meses
        </button>
      </div>
    </main>
  );
}
