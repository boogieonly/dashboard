'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

type Transaction = {
  id: number;
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

const Page = () => {
  const router = useRouter();

  const [data, setData] = useState<Transaction[]>([]);
  const [filteredData, setFilteredData] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Persist data
  useEffect(() => {
    const saved = localStorage.getItem('salesData');
    if (saved) {
      const parsed: Transaction[] = JSON.parse(saved);
      setData(parsed);
    }
  }, []);

  useEffect(() => {
    if (data.length) {
      localStorage.setItem('salesData', JSON.stringify(data));
    }
  }, [data]);

  // Filtered data
  const filteredDataMemo = useMemo(() => {
    return data.filter((t) => {
      const periodMatch = !filters.period || t.date.startsWith(filters.period);
      const regionMatch = !filters.region || t.region === filters.region;
      const productMatch = !filters.product || t.product === filters.product;
      const sellerMatch = !filters.seller || t.seller === filters.seller;
      return periodMatch && regionMatch && productMatch && sellerMatch;
    });
  }, [data, filters]);

  useEffect(() => {
    setFilteredData(filteredDataMemo);
    setCurrentPage(1);
  }, [filteredDataMemo]);

  // Filter options
  const periods = useMemo(
    () => Array.from(new Set(data.map((t) => t.date.slice(0, 7)))).sort((a, b) => b.localeCompare(a)),
    [data]
  );
  const regions = useMemo(() => Array.from(new Set(data.map((t) => t.region))).sort(), [data]);
  const products = useMemo(() => Array.from(new Set(data.map((t) => t.product))).sort(), [data]);
  const sellers = useMemo(() => Array.from(new Set(data.map((t) => t.seller))).sort(), [data]);

  // KPIs
  const kpis = useMemo(() => {
    const items = filteredData.length > 0 ? filteredData : data;
    const totalValue = items.reduce((sum, t) => sum + t.total, 0);
    const totalOrders = items.length;
    const totalSold = items.reduce((sum, t) => sum + t.quantity, 0);
    const avgTicket = totalOrders > 0 ? totalValue / totalOrders : 0;
    return { totalSold, totalValue, totalOrders, avgTicket };
  }, [data, filteredData]);

  // Chart data
  const lineData = useMemo(() => {
    const monthly: Record<string, number> = {};
    filteredData.forEach((t) => {
      const month = t.date.slice(0, 7);
      monthly[month] = (monthly[month] || 0) + t.total;
    });
    return Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({ month, revenue }));
  }, [filteredData]);

  const topProducts = useMemo(() => {
    const prodTotals: Record<string, number> = {};
    filteredData.forEach((t) => {
      prodTotals[t.product] = (prodTotals[t.product] || 0) + t.total;
    });
    return Object.entries(prodTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([product, value]) => ({ product, value }));
  }, [filteredData]);

  const regionData = useMemo(() => {
    const total = filteredData.reduce((sum, t) => sum + t.total, 0);
    const regTotals: Record<string, number> = {};
    filteredData.forEach((t) => {
      regTotals[t.region] = (regTotals[t.region] || 0) + t.total;
    });
    return Object.entries(regTotals).map(([name, value]) => ({
      name,
      value: total > 0 ? (value / total) * 100 : 0,
    }));
  }, [filteredData]);

  // Pagination
  const totalPages = useMemo(
    () => Math.ceil(filteredData.length / rowsPerPage),
    [filteredData.length]
  );
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIdx, startIdx + rowsPerPage);
  }, [filteredData, currentPage]);

  const formatPeriod = (p: string) =>
    new Date(`${p}-01`).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });

  const formatMonth = (value: string) =>
    new Date(`${value}-01`).toLocaleDateString('pt-BR', {
      month: 'short',
      year: 'numeric',
    });

  const handleFilterChange =
    useCallback((field: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilters((prev) => ({ ...prev, [field]: e.target.value || undefined }));
    }, []);

  const clearFilters = () => setFilters({});

  const handleFile = (file: File) => {
    if (!file.name.match(/\.xlsx?$/)) {
      alert('Apenas arquivos Excel (.xlsx, .xls) são permitidos.');
      return;
    }
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbookData = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(workbookData, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

        if (!json.length) {
          alert('Arquivo Excel vazio.');
          setLoading(false);
          return;
        }

        const headers = Object.keys(json[0]);
        const required = [
          'Data',
          'Descrição',
          'Região',
          'Produto',
          'Quantidade',
          'Valor Unitário',
          'Total',
          'Vendedor',
        ];
        if (!required.every((col) => headers.includes(col))) {
          alert('Colunas obrigatórias ausentes: ' + required.join(', '));
          setLoading(false);
          return;
        }

        const transactions: Transaction[] = json.map((row: any, idx: number) => ({
          id: row.ID || idx + 1,
          date: String(row.Data),
          description: String(row.Descrição),
          region: String(row.Região),
          product: String(row.Produto),
          quantity: Number(row.Quantidade) || 0,
          unitPrice: Number(row['Valor Unitário']) || 0,
          total: Number(row.Total) || 0,
          seller: String(row.Vendedor),
        }));

        const validTransactions = transactions.filter(
          (t) => !isNaN(t.quantity) && !isNaN(t.unitPrice) && !isNaN(t.total) && t.total > 0
        );

        if (validTransactions.length === 0) {
          alert('Nenhuma transação válida encontrada. Verifique os dados numéricos.');
          setLoading(false);
          return;
        }

        setData(validTransactions);
        setFilters({});
      } catch (err) {
        alert('Erro ao processar arquivo: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const exportExcel = () => {
    const exportData = filteredData.length > 0 ? filteredData : data;
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vendas');
    const dateStr = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    XLSX.writeFile(wb, `Dashboard_Vendas_Metalfama_${dateStr}.xlsx`);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const glassClass =
    'backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl hover:bg-white/15 hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 rounded-3xl p-6 md:p-8';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 py-24 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <h1 className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent text-4xl md:text-5xl lg:text-6xl font-black drop-shadow-2xl mb-6">
            Dashboard de Vendas Metalfama
          </h1>
          <p className="text-xl md:text-2xl text-white/80 font-light max-w-2xl mx-auto leading-relaxed">
            Acompanhe o desempenho das vendas em tempo real com análises avançadas e relatórios detalhados.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 lg:mb-20">
          <div className={glassClass}>
            <div className="text-3xl lg:text-4xl mb-3">📦</div>
            <div className="text-3xl lg:text-4xl font-black text-white mb-1">
              {kpis.totalSold.toLocaleString()}
            </div>
            <div className="text-white/70 uppercase tracking-wider text-sm font-medium">Total Vendido</div>
          </div>
          <div className={glassClass}>
            <div className="text-3xl lg:text-4xl mb-3">💰</div>
            <div className="text-3xl lg:text-4xl font-black text-emerald-400 mb-1">
              {kpis.totalValue.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
            <div className="text-white/70 uppercase tracking-wider text-sm font-medium">Valor Total</div>
          </div>
          <div className={glassClass}>
            <div className="text-3xl lg:text-4xl mb-3">📋</div>
            <div className="text-3xl lg:text-4xl font-black text-white mb-1">
              {kpis.totalOrders.toLocaleString()}
            </div>
            <div className="text-white/70 uppercase tracking-wider text-sm font-medium">Qtd Pedidos</div>
          </div>
          <div className={glassClass}>
            <div className="text-3xl lg:text-4xl mb-3">💳</div>
            <div className="text-3xl lg:text-4xl font-black text-purple-400 mb-1">
              {kpis.avgTicket.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
            <div className="text-white/70 uppercase tracking-wider text-sm font-medium">Ticket Médio</div>
          </div>
        </div>

        {/* Upload & Actions */}
        <div className="flex flex-col lg:flex-row gap-6 mb-16 lg:mb-20 items-start lg:items-center">
          <div className="flex-1 max-w-md">
            <label
              htmlFor="file-upload"
              className={`${glassClass} block w-full cursor-pointer text-center ${loading ? 'cursor-wait' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={(e) => e.preventDefault()}
              onDragLeave={(e) => e.preventDefault()}
            >
              {loading ? (
                <>
                  <div className="text-4xl mb-4 animate-spin">🔄</div>
                  <div className="text-lg font-semibold text-white mb-2">Carregando...</div>
                  <div className="text-white/60 text-sm">Processando arquivo Excel</div>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-6">📁</div>
                  <div className="text-xl font-bold text-white mb-3">Arraste seu Excel aqui</div>
                  <div className="text-white/70 mb-4 text-sm">ou clique para selecionar</div>
                  <div className="text-xs text-white/50 bg-white/10 px-4 py-2 rounded-xl font-mono">.xlsx / .xls</div>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                  />
                </>
              )}
            </label>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1 justify-end">
            <button
              onClick={exportExcel}
              disabled={!data.length || loading}
              className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 border-2 shadow-xl ${
                !data.length || loading
                  ? 'opacity-50 cursor-not-allowed border-white/30 bg-white/5'
                  : 'bg-gradient-to-r from-emerald-500/20 hover:from-emerald-500/40 border-emerald-400/40 hover:border-emerald-400/60 hover:shadow-emerald-500/25 text-emerald-100 hover:text-emerald-50 hover:scale-105'
              }`}
            >
              📥 Exportar Excel
            </button>
            <button
              onClick={() => router.push('/fechamento')}
              className="group px-10 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-white shadow-2xl hover:shadow-3xl hover:scale-105 hover:from-purple-500 hover:via-pink-400 hover:to-purple-500 transition-all duration-300"
            >
              📊 Fechamento Mensal
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-16 lg:mb-20">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`${glassClass.replace('p-6 md:p-8', 'p-2')} mb-4 w-full !rounded-2xl flex items-center justify-between !shadow-xl`}
          >
            <span className="text-2xl font-bold text-white">Filtros Avançados</span>
            <span className="text-2xl transition-transform duration-300">{showFilters ? '▲' : '▼'}</span>
          </button>
          <div
            className={`overflow-hidden transition-all duration-700 ease-in-out ${
              showFilters ? 'max-h-[600px] opacity-100 py-8' : 'max-h-0 opacity-0 py-0'
            }`}
          >
            <div className={`${glassClass} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8 !rounded-3xl shadow-3xl`}>
              <div>
                <label className="block text-white/90 mb-3 font-semibold text-sm uppercase tracking-wide">Período</label>
                <select
                  value={filters.period || ''}
                  onChange={handleFilterChange('period')}
                  className="glassClass w-full p-4 rounded-2xl bg-white/5 border-white/30 text-white font-medium focus:outline-none focus:ring-4 focus:ring-purple-500/30 transition-all"
                >
                  <option value="">Todos os períodos</option>
                  {periods.map((p) => (
                    <option key={p} value={p}>
                      {formatPeriod(p)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/90 mb-3 font-semibold text-sm uppercase tracking-wide">Região</label>
                <select
                  value={filters.region || ''}
                  onChange={handleFilterChange('region')}
                  className="glassClass w-full p-4 rounded-2xl bg-white/5 border-white/30 text-white font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all"
                >
                  <option value="">Todas regiões</option>
                  {regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/90 mb-3 font-semibold text-sm uppercase tracking-wide">Produto</label>
                <select
                  value={filters.product || ''}
                  onChange={handleFilterChange('product')}
                  className="glassClass w-full p-4 rounded-2xl bg-white/5 border-white/30 text-white font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all"
                >
                  <option value="">Todos produtos</option>
                  {products.map((prod) => (
                    <option key={prod} value={prod}>
                      {prod}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/90 mb-3 font-semibold text-sm uppercase tracking-wide">Vendedor</label>
                <select
                  value={filters.seller || ''}
                  onChange={handleFilterChange('seller')}
                  className="glassClass w-full p-4 rounded-2xl bg-white/5 border-white/30 text-white font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all"
                >
                  <option value="">Todos vendedores</option>
                  {sellers.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/20">
              <button
                onClick={clearFilters}
                className="glassClass px-8 py-3 rounded-2xl font-semibold hover:bg-white/20 transition-all inline-flex items-center gap-2"
              >
                🧹 Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-12 lg:space-y-16 mb-20">
          {/* Line Chart */}
          <div className={`${glassClass} !p-8 md:!p-12 rounded-3xl shadow-3xl`}>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center drop-shadow-lg">
              📈 Evolução de Vendas por Mês
            </h2>
            {lineData.length ? (
              <ResponsiveContainer width="100%" height={420}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="5 5" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="month" stroke="#ffffff90" tickFormatter={formatMonth} fontSize={12} />
                  <YAxis stroke="#ffffff90" tickFormatter={(val) => `R$ ${Number(val).toLocaleString('pt-BR')}`} fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.2)' }}
                    formatter={(value: number) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Receita']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#00C49F"
                    strokeWidth={4}
                    dot={{ fill: '#00C49F', strokeWidth: 3 }}
                    activeDot={{ r: 10, strokeWidth: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[420px] flex flex-col items-center justify-center text-white/60 p-12">
                <div className="text-6xl mb-8 opacity-30">📈</div>
                <h3 className="text-2xl font-bold mb-4">Sem dados para exibir</h3>
                <p className="text-lg">Carregue um arquivo Excel para visualizar a evolução das vendas.</p>
              </div>
            )}
          </div>

          {/* Bar Chart */}
          <div className={`${glassClass} !p-8 md:!p-12 rounded-3xl shadow-3xl`}>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center drop-shadow-lg">
              🏆 Top 10 Produtos mais Vendidos
            </h2>
            {topProducts.length ? (
              <ResponsiveContainer width="100%" height={420}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="5 5" stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    dataKey="product"
                    stroke="#ffffff90"
                    angle={-45}
                    textAnchor="end"
                    height={90}
                    fontSize={12}
                  />
                  <YAxis stroke="#ffffff90" tickFormatter={(val) => `R$ ${Number(val).toLocaleString('pt-BR')}`} fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.2)' }}
                    formatter={(value: number) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Valor']}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" radius={[8, 8, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[420px] flex flex-col items-center justify-center text-white/60 p-12">
                <div className="text-6xl mb-8 opacity-30">📊</div>
                <h3 className="text-2xl font-bold mb-4">Sem dados para exibir</h3>
                <p className="text-lg">Carregue um arquivo Excel para visualizar os top produtos.</p>
              </div>
            )}
          </div>

          {/* Pie Chart */}
          <div className={`${glassClass} !p-8 md:!p-12 rounded-3xl shadow-3xl`}>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center drop-shadow-lg">
              🗺️ Distribuição por Região
            </h2>
            {regionData.length ? (
              <ResponsiveContainer width="100%" height={420}>
                <PieChart>
                  <Pie
                    data={regionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={140}
                    innerRadius={60}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  >
                    {regionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.2)' }}
                    formatter={(value) => [`${value.toFixed(1)}%`, 'Porcentagem']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[420px] flex flex-col items-center justify-center text-white/60 p-12">
                <div className="text-6xl mb-8 opacity-30">🗺️</div>
                <h3 className="text-2xl font-bold mb-4">Sem dados para exibir</h3>
                <p className="text-lg">Carregue um arquivo Excel para visualizar a distribuição por região.</p>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className={`${glassClass.replace('p-6 md:p-8', 'overflow-hidden')} rounded-3xl shadow-3xl`}>
          <div className="p-8 border-b border-white/10 bg-white/5">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">📋 Transações Completas</h2>
            <p className="text-white/70 text-lg">
              {filteredData.length} de {data.length} transações {filters.period && `(filtradas)`}
            </p>
          </div>
          {data.length === 0 ? (
            <div className="p-20 text-center text-white/50">
              <div className="text-7xl mb-8 opacity-20">📋</div>
              <h3 className="text-3xl font-bold mb-4">Nenhum dado carregado</h3>
              <p className="text-xl max-w-md mx-auto">
                Faça upload de um arquivo Excel para visualizar as transações completas.
              </p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="p-20 text-center text-white/50">
              <div className="text-7xl mb-8 opacity-20">🔍</div>
              <h3 className="text-3xl font-bold mb-4">Nenhuma transação encontrada</h3>
              <p className="text-xl max-w-md mx-auto">
                Ajuste os filtros ou carregue novos dados.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-white/10">
                <table className="w-full divide-y divide-white/10">
                  <thead className="sticky top-0 bg-white/10 backdrop-blur-sm z-10">
                    <tr>
                      <th className="p-6 text-left text-xs font-bold text-white/80 uppercase tracking-wider">ID</th>
                      <th className="p-6 text-left text-xs font-bold text-white/80 uppercase tracking-wider">Data</th>
                      <th className="p-6 text-left text-xs font-bold text-white/80 uppercase tracking-wider">Descrição</th>
                      <th className="p-6 text-left text-xs font-bold text-white/80 uppercase tracking-wider">Região</th>
                      <th className="p-6 text-left text-xs font-bold text-white/80 uppercase tracking-wider">Produto</th>
                      <th className="p-6 text-left text-xs font-bold text-white/80 uppercase tracking-wider">Qtd</th>
                      <th className="p-6 text-left text-xs font-bold text-white/80 uppercase tracking-wider">Vl. Unit.</th>
                      <th className="p-6 text-left text-xs font-bold text-white/80 uppercase tracking-wider">Total</th>
                      <th className="p-6 text-left text-xs font-bold text-white/80 uppercase tracking-wider">Vendedor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {paginatedData.map((t) => (
                      <tr
                        key={t.id}
                        className="hover:bg-white/15 transition-all duration-200 group cursor-pointer hover:scale-[1.01] hover:shadow-inner"
                      >
                        <td className="p-6 font-mono text-sm font-bold text-white/90">#{t.id}</td>
                        <td className="p-6 text-white/90 font-medium">
                          {new Date(t.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-6 max-w-md truncate text-white/80" title={t.description}>
                          {t.description}
                        </td>
                        <td className="p-6 text-emerald-400 font-semibold">{t.region}</td>
                        <td className="p-6 max-w-xs truncate text-white/90 font-medium" title={t.product}>
                          {t.product}
                        </td>
                        <td className="p-6 text-blue-400 font-bold text-lg">{t.quantity.toLocaleString()}</td>
                        <td className="p-6 text-white/70">R$ {t.unitPrice.toLocaleString('pt-BR')}</td>
                        <td className="p-6 text-emerald-400 font-bold text-xl">
                          R$ {t.total.toLocaleString('pt-BR')}
                        </td>
                        <td className="p-6 text-purple-400 font-semibold">{t.seller}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="p-8 bg-white/5 border-t border-white/20 flex items-center justify-center gap-4 flex-wrap">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      currentPage === 1 ? 'bg-white/10 border-white/20' : 'glassClass hover:bg-white/20 border hover:border-white/40'
                    }`}
                  >
                    ← Anterior
                  </button>
                  <span className="text-white/80 font-bold text-lg min-w-[120px] text-center">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      currentPage === totalPages
                        ? 'bg-white/10 border-white/20'
                        : 'glassClass hover:bg-white/20 border hover:border-white/40'
                    }`}
                  >
                    Próxima →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
