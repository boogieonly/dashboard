'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
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

type Filters = {
  period?: string;
  region?: string;
  product?: string;
  seller?: string;
};

type ChartDataPoint = {
  month: string;
  value: number;
};

type TopProduct = {
  name: string;
  value: number;
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('pt-BR');

const formatMonth = (monthKey: string): string => {
  const date = new Date(`${monthKey}-01`);
  return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
};

const getMonthKey = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const AppPage: React.FC = () => {
  const [data, setData] = useState<Transaction[]>([]);
  const [filteredData, setFilteredData] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [selectedTab, setSelectedTab] = useState('Todas');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [prevFilteredLength, setPrevFilteredLength] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs: string[] = ['Todas', 'Aço Inox', 'Cobre', 'Latão', 'Alumínio', 'Ligas Especiais'];

  const itemsPerPage = 10;

  // Load from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('salesData');
    if (savedData) {
      setData(JSON.parse(savedData));
    }
    const savedTab = localStorage.getItem('selectedTab');
    if (savedTab && tabs.includes(savedTab)) {
      setSelectedTab(savedTab);
    }
    const savedPage = localStorage.getItem('currentPage');
    if (savedPage) {
      setCurrentPage(parseInt(savedPage));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('salesData', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('selectedTab', selectedTab);
  }, [selectedTab]);

  useEffect(() => {
    localStorage.setItem('currentPage', currentPage.toString());
  }, [currentPage]);

  // Filtered data
  const computedFilteredData = useMemo(() => {
    let res = data;
    if (filters.period) {
      res = res.filter((t) => getMonthKey(t.date) === filters.period);
    }
    if (filters.region) {
      res = res.filter((t) => t.region === filters.region);
    }
    if (filters.product) {
      res = res.filter((t) => t.product === filters.product);
    }
    if (filters.seller) {
      res = res.filter((t) => t.seller === filters.seller);
    }
    if (selectedTab !== 'Todas') {
      const tabLower = selectedTab.toLowerCase().normalize('NFD').replace(/['\u0300-\u036f]/g, '');
      res = res.filter((t) =>
        t.product.toLowerCase().normalize('NFD').replace(/['\u0300-\u036f]/g, '').includes(tabLower)
      );
    }
    return res;
  }, [data, filters, selectedTab]);

  useEffect(() => {
    setFilteredData(computedFilteredData);
    if (computedFilteredLength !== prevFilteredLength) {
      setCurrentPage(1);
      setPrevFilteredLength(computedFilteredData.length);
    }
  }, [computedFilteredData]);

  // Options for filters
  const filterOptions = useMemo(() => {
    const periods = Array.from(new Set(data.map(getMonthKey))).sort((a, b) => b.localeCompare(a));
    const regions = Array.from(new Set(data.map((t) => t.region))).sort();
    const products = Array.from(new Set(data.map((t) => t.product))).sort();
    const sellers = Array.from(new Set(data.map((t) => t.seller))).sort();
    return { periods, regions, products, sellers };
  }, [data]);

  // KPIs
  const kpis = useMemo(() => {
    const totalWeight = filteredData.reduce((sum, t) => sum + t.quantity, 0);
    const totalValue = filteredData.reduce((sum, t) => sum + t.total, 0);
    const numOrders = filteredData.length;
    const avgTicket = numOrders > 0 ? totalValue / numOrders : 0;
    return { totalWeight, totalValue, numOrders, avgTicket };
  }, [filteredData]);

  // Chart data
  const lineChartData: ChartDataPoint[] = useMemo(() => {
    const monthly: Record<string, number> = {};
    filteredData.forEach((t) => {
      const month = getMonthKey(t.date);
      monthly[month] = (monthly[month] || 0) + t.total;
    });
    return Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, value]) => ({
        month: formatMonth(month),
        value,
      }));
  }, [filteredData]);

  const topProducts: TopProduct[] = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredData.forEach((t) => {
      grouped[t.product] = (grouped[t.product] || 0) + t.total;
    });
    return Object.entries(grouped)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setLoading(true);
      setStatus('');
      processFile(file);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setLoading(true);
      setStatus('');
      processFile(file);
    }
  }, []);

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws);

      if (json.length === 0) {
        setStatus('Arquivo vazio!');
        setLoading(false);
        return;
      }

      const row0 = json[0];
      const headerMap: Record<string, string> = {};
      const required = [
        'data',
        'descrição',
        'região',
        'produto',
        'quantidade',
        'valor unitário',
        'total',
        'vendedor',
      ];
      Object.keys(row0).forEach((key) => {
        const norm = key.toString().trim().toLowerCase();
        const idx = required.indexOf(norm);
        if (idx !== -1) {
          headerMap[required[idx] as keyof Transaction] = key;
        }
      });

      if (Object.keys(headerMap).length < required.length) {
        setStatus('Colunas obrigatórias não encontradas! Verifique: Data, Descrição, Região, Produto, Quantidade, Valor Unitário, Total, Vendedor');
        setLoading(false);
        return;
      }

      const transactions: Transaction[] = json.map((row: Record<string, any>, idx: number) => ({
        id: `tx-${Date.now()}-${idx}`,
        date: (row[headerMap['date'] as string] || '').toString(),
        description: (row[headerMap['description'] as string] || '').toString(),
        region: (row[headerMap['region'] as string] || '').toString(),
        product: (row[headerMap['product'] as string] || '').toString(),
        quantity: parseFloat((row[headerMap['quantity'] as string] || '0') as string) || 0,
        unitPrice: parseFloat((row[headerMap['unitPrice'] as string] || '0') as string) || 0,
        total: parseFloat((row[headerMap['total'] as string] || '0') as string) || 0,
        seller: (row[headerMap['seller'] as string] || '').toString(),
      }));

      const validTransactions = transactions.filter(
        (t) => !isNaN(t.quantity) && !isNaN(t.unitPrice) && !isNaN(t.total) && t.total > 0 && new Date(t.date).toString() !== 'Invalid Date'
      );

      setData(validTransactions);
      setStatus(`✅ Carregado ${validTransactions.length} transações com sucesso!`);
      setLoading(false);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const exportExcel = useCallback(() => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vendas');
    XLSX.writeFile(wb, 'vendas-metalfama.xlsx');
  }, [data]);

  const exportReport = useCallback(() => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
    XLSX.writeFile(wb, 'relatorio-vendas-filtrado.xlsx');
  }, [filteredData]);

  const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSelectedTab('Todas');
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setSelectedTab(tab);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const hasData = data.length > 0;

  const glassCard = 'bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl p-6 md:p-8 hover:shadow-2xl transition-all duration-300 hover:bg-white/15 group';

  const kpiCard = 'p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.05] cursor-pointer relative overflow-hidden';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4 md:p-8 font-sans text-white">
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl mb-4">
          Visão Geral de Vendas
        </h1>
        <p className="text-xl md:text-2xl text-white/90 font-medium">
          Acompanhe o desempenho de vendas em tempo real
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
        <div className={`${kpiCard} bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-white/20 group-hover:from-blue-400/30`}>
          <div className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-2">
            {kpis.totalWeight.toLocaleString('pt-BR')}
          </div>
          <div className="text-xs md:text-sm uppercase tracking-wider text-white/70 font-medium">📦 Peso Total Vendido (kg)</div>
        </div>
        <div className={`${kpiCard} bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-white/20 group-hover:from-emerald-400/30`}>
          <div className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent mb-2">
            {formatCurrency(kpis.totalValue)}
          </div>
          <div className="text-xs md:text-sm uppercase tracking-wider text-white/70 font-medium">💰 Valor Total (R$)</div>
        </div>
        <div className={`${kpiCard} bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-white/20 group-hover:from-purple-400/30`}>
          <div className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent mb-2">
            {kpis.numOrders.toLocaleString('pt-BR')}
          </div>
          <div className="text-xs md:text-sm uppercase tracking-wider text-white/70 font-medium">📋 Quantidade de Pedidos</div>
        </div>
        <div className={`${kpiCard} bg-gradient-to-br from-pink-500/20 to-pink-600/20 border-white/20 group-hover:from-pink-400/30`}>
          <div className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent mb-2">
            {formatCurrency(kpis.avgTicket)}
          </div>
          <div className="text-xs md:text-sm uppercase tracking-wider text-white/70 font-medium">💳 Ticket Médio (R$)</div>
        </div>
      </div>

      {/* Upload and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 md:mb-12">
        {/* Upload */}
        <div className="lg:col-span-1">
          <div
            className={`${glassCard} border-2 border-dashed border-white/30 hover:border-white/50 text-center cursor-pointer transition-all duration-300 min-h-[200px] flex flex-col items-center justify-center ${loading ? 'opacity-50' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-lg font-medium">Carregando...</p>
              </>
            ) : (
              <>
                <span className="text-5xl mb-4">📁</span>
                <p className="text-xl md:text-2xl font-bold mb-2">Arraste seu Excel aqui</p>
                <p className="text-white/70 text-sm md:text-base">ou clique para selecionar</p>
              </>
            )}
          </div>
        </div>

        {/* Actions and Filters */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={exportExcel}
              disabled={!hasData}
              className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl ${
                hasData
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:scale-105 hover:shadow-2xl text-white'
                  : 'bg-white/10 text-white/50 cursor-not-allowed'
              }`}
            >
              📥 Exportar Excel
            </button>
            <button
              onClick={exportReport}
              disabled={!hasData}
              className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl ${
                hasData
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:scale-105 hover:shadow-2xl text-white'
                  : 'bg-white/10 text-white/50 cursor-not-allowed'
              }`}
            >
              📊 Gerar Relatório
            </button>
          </div>

          {/* Filters */}
          <div className={glassCard}>
            <button
              onClick={() => setExpandedFilters(!expandedFilters)}
              className="w-full flex justify-between items-center text-left mb-4 md:mb-6"
            >
              <span className="text-xl font-bold">Filtros Avançados</span>
              <span className={`transition-transform duration-300 ${expandedFilters ? 'rotate-180' : ''}`}>▼</span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                <select
                  value={filters.period || ''}
                  onChange={(e) => handleFilterChange('period' as keyof Filters, e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white/90 focus:outline-none focus:border-blue-400 transition-colors w-full"
                >
                  <option value="">Todas Períodos</option>
                  {filterOptions.periods.map((p) => (
                    <option key={p} value={p}>
                      {formatMonth(p)}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.region || ''}
                  onChange={(e) => handleFilterChange('region' as keyof Filters, e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white/90 focus:outline-none focus:border-blue-400 transition-colors w-full"
                >
                  <option value="">Todas Regiões</option>
                  {filterOptions.regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.product || ''}
                  onChange={(e) => handleFilterChange('product' as keyof Filters, e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white/90 focus:outline-none focus:border-blue-400 transition-colors w-full"
                >
                  <option value="">Todos Produtos</option>
                  {filterOptions.products.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.seller || ''}
                  onChange={(e) => handleFilterChange('seller' as keyof Filters, e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white/90 focus:outline-none focus:border-blue-400 transition-colors w-full"
                >
                  <option value="">Todos Vendedores</option>
                  {filterOptions.sellers.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={clearFilters}
                className="mt-4 w-full py-2 px-4 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 font-medium flex items-center justify-center gap-2"
              >
                🧹 Limpar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      {status && (
        <div className="mb-8 p-4 bg-white/10 border border-white/20 rounded-xl backdrop-blur-xl text-center font-medium">
          {status}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex overflow-x-auto pb-4 gap-2 bg-white/5 border-b border-white/20 rounded-t-xl px-4 -mx-4 sm:-mx-0 sm:px-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-6 py-3 rounded-t-lg mx-1 min-w-[120px] font-bold transition-all duration-300 whitespace-nowrap ${
                selectedTab === tab
                  ? 'bg-white/10 border-b-2 border-blue-400 shadow-md'
                  : 'hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-8 md:mb-12">
        {/* Line Chart */}
        <div className={glassCard}>
          <h2 className="text-2xl font-bold mb-6">📈 Evolução de Vendas (R$)</h2>
          {lineChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={lineChartData}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0088FE" />
                    <stop offset="100%" stopColor="#00C49F" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="white/10" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'white' }} />
                <YAxis tick={{ fill: 'white' }} tickFormatter={(v: number) => formatCurrency(v)} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Receita']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="url(#lineGradient)"
                  strokeWidth={4}
                  dot={{ fill: '#0088FE', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center text-white/50">
              <span className="text-6xl mb-4">📊</span>
              <p className="text-xl">Sem dados para exibir</p>
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className={glassCard}>
          <h2 className="text-2xl font-bold mb-6">📊 Top 10 Produtos por Valor (R$)</h2>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topProducts}>
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="white/10" />
                <XAxis dataKey="name" tick={{ fill: 'white', fontSize: 12 }} angle={-45} height={80} />
                <YAxis tick={{ fill: 'white' }} tickFormatter={(v: number) => formatCurrency(v)} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Valor']} />
                <Legend />
                <Bar dataKey="value" fill="url(#purpleGradient)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center text-white/50">
              <span className="text-6xl mb-4">📊</span>
              <p className="text-xl">Sem dados para exibir</p>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className={glassCard}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">📋 Transações Completas</h2>
          <span className="text-sm text-white/70">Página {currentPage} de {totalPages}</span>
        </div>
        {filteredData.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm md:text-base">
                <thead className="sticky top-0 bg-white/10 backdrop-blur-sm border-b border-white/20">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-white w-[80px]">ID</th>
                    <th className="px-4 py-3 text-left font-bold text-white w-[120px]">Data</th>
                    <th className="px-4 py-3 text-left font-bold text-white w-[200px]">Descrição</th>
                    <th className="px-4 py-3 text-left font-bold text-white w-[120px]">Região</th>
                    <th className="px-4 py-3 text-left font-bold text-white w-[150px]">Produto</th>
                    <th className="px-4 py-3 text-left font-bold text-white w-[100px]">Qtd (kg)</th>
                    <th className="px-4 py-3 text-left font-bold text-white w-[120px]">Valor Unit.</th>
                    <th className="px-4 py-3 text-left font-bold text-white w-[120px]">Total (R$)</th>
                    <th className="px-4 py-3 text-left font-bold text-white w-[120px]">Vendedor</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="group hover:bg-white/10 hover:scale-[1.01] transition-all duration-300 border-b border-white/10 last:border-b-0"
                    >
                      <td className="px-4 py-3 font-mono text-white/90">{transaction.id.slice(-8)}</td>
                      <td className="px-4 py-3 text-white/90">{formatDate(transaction.date)}</td>
                      <td className="px-4 py-3 text-white/90 max-w-[200px] truncate">{transaction.description}</td>
                      <td className="px-4 py-3 text-white/90">{transaction.region}</td>
                      <td className="px-4 py-3 text-white/90 max-w-[150px] truncate">{transaction.product}</td>
                      <td className="px-4 py-3 text-white/90">{transaction.quantity.toLocaleString('pt-BR')}</td>
                      <td className="px-4 py-3 text-white/90">{formatCurrency(transaction.unitPrice)}</td>
                      <td className="px-4 py-3 text-white/90 font-bold">{formatCurrency(transaction.total)}</td>
                      <td className="px-4 py-3 text-white/90">{transaction.seller}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/20">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                ← Anterior
              </button>
              <span className="font-bold text-lg">Página {currentPage} de {totalPages}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Próxima →
              </button>
            </div>
          </>
        ) : (
          <div className="h-[400px] flex flex-col items-center justify-center text-white/50">
            <span className="text-6xl mb-4">📋</span>
            <p className="text-xl">Nenhuma transação encontrada. Faça upload de um Excel.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppPage;
