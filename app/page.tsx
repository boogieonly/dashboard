'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Inter } from 'next/font/google';
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import * as XLSX from 'xlsx';

const inter = Inter({ subsets: ['latin'] });

interface SalesData {
  date: string;
  product: string;
  region: string;
  seller: string;
  weight: number;
  total: number;
}

interface Filters {
  periodFrom: string;
  periodTo: string;
  region: string;
  product: string;
  seller: string;
}

type ChartLineData = { month: string; total: number }[];
type ChartBarData = { product: string; total: number }[];
type ChartPieData = { region: string; total: number }[];

interface KPIs {
  totalWeight: number;
  totalValue: number;
  orders: number;
  avgTicket: number;
  topProducts: { product: string; total: number }[];
}

const COLORS = ['#4f46e5', '#9333ea', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export default function SalesDashboard() {
  const [data, setData] = useState<SalesData[]>([]);
  const [filters, setFilters] = useState<Filters>({
    periodFrom: '',
    periodTo: '',
    region: '',
    product: '',
    seller: '',
  });
  const [showMenu, setShowMenu] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('salesData');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load data:', e);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('salesData', JSON.stringify(data));
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const dateOk =
        (!filters.periodFrom || item.date >= filters.periodFrom) &&
        (!filters.periodTo || item.date <= filters.periodTo);
      const regionOk = !filters.region || item.region === filters.region;
      const productOk = !filters.product || item.product === filters.product;
      const sellerOk = !filters.seller || item.seller === filters.seller;
      return dateOk && regionOk && productOk && sellerOk;
    });
  }, [data, filters]);

  const kpis: KPIs = useMemo(() => {
    const orders = filteredData.length;
    const totalValue = filteredData.reduce((sum, i) => sum + i.total, 0);
    const totalWeight = filteredData.reduce((sum, i) => sum + i.weight, 0);
    const avgTicket = orders ? totalValue / orders : 0;
    const prodTotals: Record<string, number> = {};
    filteredData.forEach((i) => {
      prodTotals[i.product] = (prodTotals[i.product] || 0) + i.total;
    });
    const topProducts = Object.entries(prodTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([product, total]) => ({ product, total }));
    return { totalWeight, totalValue, orders, avgTicket, topProducts };
  }, [filteredData]);

  const lineData: ChartLineData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredData.forEach((item) => {
      const month = item.date.substring(0, 7);
      grouped[month] = (grouped[month] || 0) + item.total;
    });
    return Object.entries(grouped)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, total]) => ({ month, total }));
  }, [filteredData]);

  const barData: ChartBarData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredData.forEach((item) => {
      grouped[item.product] = (grouped[item.product] || 0) + item.total;
    });
    return Object.entries(grouped)
      .map(([product, total]) => ({ product, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [filteredData]);

  const pieData: ChartPieData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredData.forEach((item) => {
      grouped[item.region] = (grouped[item.region] || 0) + item.total;
    });
    return Object.entries(grouped).map(([region, total]) => ({
      region,
      total,
    }));
  }, [filteredData]);

  const regions = useMemo(
    () => [...new Set(data.map((d) => d.region))].sort(),
    [data]
  );
  const products = useMemo(
    () => [...new Set(data.map((d) => d.product))].sort(),
    [data]
  );
  const sellers = useMemo(
    () => [...new Set(data.map((d) => d.seller))].sort(),
    [data]
  );

  const updateFilter =
    (key: keyof Filters) =>
    (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      setFilters((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet);

      if (jsonData.length === 0) {
        alert('Arquivo vazio');
        return;
      }

      const headers = Object.keys(jsonData[0]);
      const requiredHeaders = ['Data', 'Produto', 'Região', 'Vendedor', 'Peso', 'Total'];
      const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
      if (missingHeaders.length > 0) {
        alert(`Colunas obrigatórias ausentes: ${missingHeaders.join(', ')}`);
        return;
      }

      const parsedData: SalesData[] = jsonData
        .map((row) => ({
          date: String(row.Data || ''),
          product: String(row.Produto || ''),
          region: String(row.Região || ''),
          seller: String(row.Vendedor || ''),
          weight: parseFloat(String(row.Peso || '0')) || 0,
          total: parseFloat(String(row.Total || '0')) || 0,
        }))
        .filter(
          (d) =>
            d.date &&
            d.product &&
            d.region &&
            d.seller &&
            d.weight > 0 &&
            d.total > 0 &&
            !isNaN(new Date(d.date).getTime())
        );

      if (parsedData.length === 0) {
        alert('Nenhum dado válido encontrado');
        return;
      }

      setData(parsedData);
      e.target.value = '';
      alert(`${parsedData.length} linhas carregadas com sucesso!`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erro ao processar o arquivo. Verifique se é um Excel válido.');
    }
  };

  const handleExport = useCallback(() => {
    if (filteredData.length === 0) {
      alert('Nenhum dado para exportar');
      return;
    }
    const exportData = filteredData.map((d) => ({
      Data: d.date,
      Produto: d.product,
      Região: d.region,
      Vendedor: d.seller,
      Peso: d.weight.toFixed(2),
      Total: d.total.toFixed(2),
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas Filtradas');
    XLSX.writeFile(workbook, `vendas_filtradas_${new Date().toISOString().slice(0,10)}.xlsx`);
  }, [filteredData]);

  const handleMonthlyClose = () => {
    if (filteredData.length === 0) {
      alert('Nenhum dado para fechar');
      return;
    }
    // Simulate monthly closing
    alert('Fechamento mensal realizado com sucesso! Total: R$ ' + kpis.totalValue.toLocaleString('pt-BR'));
  };

  return (
    <div className={`${inter.className} min-h-screen bg-gradient-to-br from-[#0f172a] via-slate-900 to-[#9333ea]/10 text-[#f1f5f9] font-sans antialiased`}>
      {/* Navbar fixa */}
      <nav className="fixed top-0 w-full bg-black/40 backdrop-blur-xl border-b border-white/10 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
                Metalfama
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-8 text-lg font-medium">
              <a href="#" className="text-indigo-300 hover:text-white transition-colors duration-200 py-2 border-b-2 border-transparent hover:border-indigo-300">
                Dashboard
              </a>
              <a href="#" className="hover:text-indigo-300 transition-colors duration-200 py-2 border-b-2 border-transparent hover:border-indigo-300">
                Relatórios
              </a>
              <a href="#" className="hover:text-indigo-300 transition-colors duration-200 py-2 border-b-2 border-transparent hover:border-indigo-300">
                Configurações
              </a>
            </div>
            <button
              className="md:hidden p-2 rounded-lg backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-all duration-200"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        {showMenu && (
          <div className="md:hidden bg-black/80 backdrop-blur-xl border-t border-white/10 p-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
            <a
              href="#"
              className="block px-4 py-3 text-lg font-semibold hover:text-indigo-300 transition-colors rounded-xl hover:bg-white/10"
              onClick={() => setShowMenu(false)}
            >
              Dashboard
            </a>
            <a
              href="#"
              className="block px-4 py-3 text-lg font-semibold hover:text-indigo-300 transition-colors rounded-xl hover:bg-white/10"
              onClick={() => setShowMenu(false)}
            >
              Relatórios
            </a>
            <a
              href="#"
              className="block px-4 py-3 text-lg font-semibold hover:text-indigo-300 transition-colors rounded-xl hover:bg-white/10"
              onClick={() => setShowMenu(false)}
            >
              Configurações
            </a>
          </div>
        )}
      </nav>

      <main className="pt-20 p-4 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="text-center mb-16 md:mb-20">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl mb-4">
              Dashboard de Vendas
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 font-light drop-shadow-lg">
              Metalfama - Análises Profissionais e Insights em Tempo Real
            </p>
          </header>

          {/* Upload, Export e Fechamento */}
          <div className="flex flex-col lg:flex-row gap-4 mb-16 justify-center lg:justify-start">
            <label className="flex-1 max-w-md bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-8 py-6 rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 cursor-pointer text-center">
              📁 Upload Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={handleExport}
              className="px-8 py-6 bg-emerald-500/90 hover:bg-emerald-600 text-white font-semibold rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 whitespace-nowrap"
              disabled={filteredData.length === 0}
            >
              💾 Export Excel
            </button>
            <button
              onClick={handleMonthlyClose}
              className="px-8 py-6 bg-orange-500/90 hover:bg-orange-600 text-white font-semibold rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
              disabled={filteredData.length === 0}
            >
              🔒 Fechamento Mensal
            </button>
          </div>

          {/* KPIs Cards - Sempre visíveis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-20">
            {/* Total Weight */}
            <div className="group p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-300">
              <div className="text-4xl mb-4">⚖️</div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-2">Peso Total</p>
              <p className="text-4xl lg:text-5xl font-black text-[#f1f5f9]">
                {kpis.totalWeight.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg
              </p>
            </div>

            {/* Total Value */}
            <div className="group p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-300">
              <div className="text-4xl mb-4">💰</div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-2">Valor Total</p>
              <p className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {kpis.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>

            {/* Pedidos */}
            <div className="group p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-300">
              <div className="text-4xl mb-4">📦</div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-2">Pedidos</p>
              <p className="text-4xl lg:text-5xl font-black text-[#f1f5f9]">
                {kpis.orders.toLocaleString('pt-BR')}
              </p>
            </div>

            {/* Ticket Médio */}
            <div className="group p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-300">
              <div className="text-4xl mb-4">🎫</div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-2">Ticket Médio</p>
              <p className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                {kpis.avgTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>

            {/* Top 3 Produtos - Span full on smaller screens */}
            <div className="col-span-1 lg:col-span-1 p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-300">
              <p className="text-slate-300 text-lg font-semibold uppercase tracking-wide mb-6 flex items-center gap-2">
                🏆 Top 3 Produtos
              </p>
              <div className="space-y-3">
                {kpis.topProducts.length === 0 ? (
                  <p className="text-slate-500 italic">Sem dados</p>
                ) : (
                  kpis.topProducts.map((p, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                      <span className="font-medium">{p.product}</span>
                      <span className="font-bold text-indigo-400">
                        R$ {p.total.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Filtros Colapsáveis */}
          <section className="mb-20">
            <details className="group open:mb-0">
              <summary className="cursor-pointer p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 font-semibold text-lg flex items-center gap-3 hover:scale-[1.01]">
                ⚙️ Filtros Dinâmicos
                <svg className="w-5 h-5 transition-transform group-open:-rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="p-8 mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl animate-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-slate-300">Período De</label>
                    <input
                      type="date"
                      value={filters.periodFrom}
                      onChange={updateFilter('periodFrom')}
                      className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-xl text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-200 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-slate-300">Período Até</label>
                    <input
                      type="date"
                      value={filters.periodTo}
                      onChange={updateFilter('periodTo')}
                      className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-xl text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-200 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-slate-300">Região</label>
                    <select
                      value={filters.region}
                      onChange={updateFilter('region')}
                      className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-xl text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-200 font-medium appearance-none bg-no-repeat bg-right"
                    >
                      <option value="">Todas Regiões</option>
                      {regions.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-slate-300">Produto</label>
                    <select
                      value={filters.product}
                      onChange={updateFilter('product')}
                      className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-xl text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-200 font-medium appearance-none bg-no-repeat bg-right"
                    >
                      <option value="">Todos Produtos</option>
                      {products.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="lg:col-span-2 md:col-span-2">
                    <label className="block text-sm font-semibold mb-3 text-slate-300">Vendedor</label>
                    <select
                      value={filters.seller}
                      onChange={updateFilter('seller')}
                      className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-xl text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-200 font-medium appearance-none bg-no-repeat bg-right"
                    >
                      <option value="">Todos Vendedores</option>
                      {sellers.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </details>
          </section>

          {/* Gráficos em Coluna (100% largura) */}
          <section className="space-y-12 mb-20">
            {/* Evolução de Vendas - LineChart */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <h3 className="text-2xl lg:text-3xl font-bold mb-8 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
                📈 Evolução de Vendas
              </h3>
              <div className="h-96">
                {lineData.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-lg font-medium">
                    <div className="text-6xl mb-4">📊</div>
                    Sem dados para exibir. Faça upload!
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="hsla(0,0%,100%,0.1)" />
                      <XAxis
                        dataKey="month"
                        stroke="#f1f5f9"
                        tickFormatter={(value) =>
                          new Date(`${value}-01`).toLocaleDateString('pt-BR', {
                            month: 'short',
                            year: 'numeric',
                          })
                        }
                      />
                      <YAxis
                        stroke="#f1f5f9"
                        tickFormatter={(value: number) =>
                          `R$ ${value.toLocaleString('pt-BR')}`
                        }
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          `R$ ${value.toLocaleString('pt-BR')}`,
                          'Total Vendas',
                        ]}
                        labelFormatter={(label) =>
                          new Date(`${label}-01`).toLocaleDateString('pt-BR', {
                            month: 'long',
                            year: 'numeric',
                          })
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#4f46e5"
                        strokeWidth={4}
                        dot={{ fill: '#9333ea', strokeWidth: 3 }}
                        activeDot={{ r: 10, strokeWidth: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Distribuição por Produto - BarChart */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <h3 className="text-2xl lg:text-3xl font-bold mb-8 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent drop-shadow-lg">
                📊 Distribuição por Produto
              </h3>
              <div className="h-96">
                {barData.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-lg font-medium">
                    <div className="text-6xl mb-4">📈</div>
                    Sem dados para exibir. Faça upload!
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsla(0,0%,100%,0.1)" />
                      <XAxis
                        dataKey="product"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        stroke="#f1f5f9"
                      />
                      <YAxis
                        stroke="#f1f5f9"
                        tickFormatter={(value: number) =>
                          `R$ ${value.toLocaleString('pt-BR')}`
                        }
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          `R$ ${value.toLocaleString('pt-BR')}`,
                          'Total por Produto',
                        ]}
                      />
                      <Bar dataKey="total" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Distribuição por Região - PieChart */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <h3 className="text-2xl lg:text-3xl font-bold mb-8 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent drop-shadow-lg">
                🗺️ Distribuição por Região
              </h3>
              <div className="h-96 flex items-center justify-center">
                {pieData.length === 0 ? (
                  <div className="flex flex-col items-center text-slate-500 text-lg font-medium">
                    <div className="text-6xl mb-4">🧭</div>
                    Sem dados para exibir. Faça upload!
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="total"
                        nameKey="region"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          `R$ ${value.toLocaleString('pt-BR')}`,
                          'Total por Região',
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </section>

          {/* Tabela Responsiva */}
          <section>
            <div className="bg-white/10 backdrop-blur-3xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent drop-shadow-lg flex items-center gap-3">
                  📋 Tabela de Dados ({filteredData.length})
                </h3>
              </div>
              {filteredData.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="text-8xl mb-8 opacity-50">📋</div>
                  <h4 className="text-2xl font-semibold text-slate-400 mb-4">Nenhum dado carregado</h4>
                  <p className="text-slate-500 text-lg max-w-md mx-auto">
                    Faça upload de um arquivo Excel com as colunas corretas para visualizar a tabela.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full divide-y divide-white/10">
                    <thead className="sticky top-0 bg-white/20 backdrop-blur-xl z-10">
                      <tr>
                        <th className="px-8 py-6 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Data</th>
                        <th className="px-8 py-6 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Produto</th>
                        <th className="px-8 py-6 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Região</th>
                        <th className="px-8 py-6 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Vendedor</th>
                        <th className="px-8 py-6 text-right text-xs font-bold text-slate-300 uppercase tracking-wider">Peso (kg)</th>
                        <th className="px-8 py-6 text-right text-xs font-bold text-slate-300 uppercase tracking-wider">Total (R$)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-white/5">
                      {filteredData.map((row, index) => (
                        <tr
                          key={index}
                          className="hover:bg-white/10 transition-all duration-200 group"
                        >
                          <td className="px-8 py-6 whitespace-nowrap text-slate-300 font-medium">
                            {new Date(row.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-8 py-6 font-semibold text-slate-200 group-hover:text-white">
                            {row.product}
                          </td>
                          <td className="px-8 py-6">
                            <span className="inline-flex px-4 py-2 bg-indigo-500/30 border border-indigo-500/50 text-indigo-200 text-sm font-medium rounded-2xl backdrop-blur-sm">
                              {row.region}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-slate-300 font-medium">
                            {row.seller}
                          </td>
                          <td className="px-8 py-6 text-right font-mono text-slate-200">
                            {row.weight.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-8 py-6 text-right font-bold text-indigo-400 text-xl">
                            R$ {row.total.toLocaleString('pt-BR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
