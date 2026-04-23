'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

type Filters = {
  startDate: string;
  endDate: string;
  regions: string[];
  products: string[];
  sellers: string[];
};

type FilterKey = 'period' | 'region' | 'product' | 'seller';

interface DataRow {
  Product: string;
  Region: string;
  Seller: string;
  Date: string;
  Total: number;
  Quantity: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Page = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [filters, setFilters] = useState<Filters>({
    startDate: '',
    endDate: '',
    regions: [],
    products: [],
    sellers: [],
  });
  const [filterOpen, setFilterOpen] = useState<Record<FilterKey, boolean>>({
    period: true,
    region: false,
    product: false,
    seller: false,
  });

  // Carrega dados do localStorage no mount
  useEffect(() => {
    const saved = localStorage.getItem('salesData');
    if (saved) {
      try {
        const parsed: DataRow[] = JSON.parse(saved);
        setData(parsed);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    }
  }, []);

  // Persiste dados no localStorage
  useEffect(() => {
    localStorage.setItem('salesData', JSON.stringify(data));
  }, [data]);

  // Dados filtrados com base nos filtros ativos
  const filteredData = useMemo((): DataRow[] => {
    let res = data;
    if (filters.startDate) {
      res = res.filter((r) => r.Date >= filters.startDate);
    }
    if (filters.endDate) {
      res = res.filter((r) => r.Date <= filters.endDate);
    }
    if (filters.regions.length > 0) {
      res = res.filter((r) => filters.regions.includes(r.Region));
    }
    if (filters.products.length > 0) {
      res = res.filter((r) => filters.products.includes(r.Product));
    }
    if (filters.sellers.length > 0) {
      res = res.filter((r) => filters.sellers.includes(r.Seller));
    }
    return res;
  }, [data, filters]);

  // Listas únicas para filtros
  const uniqueRegions = useMemo(
    (): string[] => Array.from(new Set(data.map((d) => d.Region))).sort(),
    [data]
  );
  const uniqueProducts = useMemo(
    (): string[] => Array.from(new Set(data.map((d) => d.Product))).sort(),
    [data]
  );
  const uniqueSellers = useMemo(
    (): string[] => Array.from(new Set(data.map((d) => d.Seller))).sort(),
    [data]
  );

  // Calcula KPIs principais
  const kpis = useMemo(() => {
    const totalVendas = filteredData.reduce((sum, row) => sum + row.Total, 0);
    const totalPedidos = filteredData.length;
    const ticketMedio =
      totalPedidos > 0 ? Number((totalVendas / totalPedidos).toFixed(2)) : 0;

    const productTotals: Record<string, number> = {};
    filteredData.forEach((row) => {
      productTotals[row.Product] =
        (productTotals[row.Product] || 0) + row.Total;
    });

    const entries = Object.entries(productTotals);
    let produtoTop = 'Nenhum';
    if (entries.length > 0) {
      produtoTop = entries.reduce(
        (max: [string, number], curr: [string, number]) =>
          curr[1] > max[1] ? curr : max,
        ['', 0]
      )[0];
    }

    return { totalVendas, totalPedidos, ticketMedio, produtoTop };
  }, [filteredData]);

  // Dados para gráfico de linha: evolução de vendas por data
  const lineData = useMemo(() => {
    const daily: Record<string, number> = {};
    filteredData.forEach((row) => {
      daily[row.Date] = (daily[row.Date] || 0) + row.Total;
    });
    // Usa Object.entries para converter Record em array
    return Object.entries(daily)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData]);

  // Dados para gráfico de barras: volume por produto
  const barData = useMemo(() => {
    const prodVol: Record<string, number> = {};
    filteredData.forEach((row) => {
      prodVol[row.Product] = (prodVol[row.Product] || 0) + row.Quantity;
    });
    // Usa Object.entries para converter Record em array
    return Object.entries(prodVol).map(([product, quantity]) => ({
      product,
      quantity,
    }));
  }, [filteredData]);

  // Dados para gráfico de pizza: distribuição por região
  const pieData = useMemo(() => {
    const regTotal: Record<string, number> = {};
    filteredData.forEach((row) => {
      regTotal[row.Region] = (regTotal[row.Region] || 0) + row.Total;
    });
    // Usa Object.entries para converter Record em array
    return Object.entries(regTotal).map(([region, total]) => ({
      name: region,
      value: total,
    }));
  }, [filteredData]);

  // Alterna abertura dos filtros colapsáveis
  const toggleFilter = useCallback((key: FilterKey) => {
    setFilterOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Atualiza filtros
  const updateFilters = useCallback((updates: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  // Manipula upload de Excel com validação
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const buffer = ev.target?.result as ArrayBuffer;
      const wb = XLSX.read(buffer, { type: 'array' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const aoa = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

      const headers = aoa[0] as string[];
      const expectedHeaders = ['Product', 'Region', 'Seller', 'Date', 'Total', 'Quantity'];

      if (!expectedHeaders.every((h, i) => headers[i]?.trim() === h)) {
        alert('Arquivo inválido: cabeçalhos devem ser exatamente Product, Region, Seller, Date, Total, Quantity');
        return;
      }

      const newData: DataRow[] = aoa
        .slice(1)
        .map((row) => {
          const product = String(row[0] ?? '').trim();
          const region = String(row[1] ?? '').trim();
          const seller = String(row[2] ?? '').trim();
          const dateStr = String(row[3] ?? '').trim();
          const total = parseFloat(String(row[4] ?? '0'));
          const quantity = parseFloat(String(row[5] ?? '0'));

          if (
            isNaN(total) ||
            isNaN(quantity) ||
            !dateStr.match(/^\d{4}-\d{2}-\d{2}$/)
          ) {
            return null;
          }

          return {
            Product: product,
            Region: region,
            Seller: seller,
            Date: dateStr,
            Total: total,
            Quantity: quantity,
          };
        })
        .filter((row): row is DataRow => row !== null);

      setData((prev) => [...prev, ...newData]);
      e.target.value = '';
    };
    reader.readAsArrayBuffer(file);
  }, []);

  // Limpa todos os dados
  const clearData = useCallback(() => {
    setData([]);
    localStorage.removeItem('salesData');
  }, []);

  // Exporta dados filtrados para Excel
  const exportExcel = useCallback(() => {
    if (filteredData.length === 0) return;

    const wb = XLSX.utils.book_new();
    const headers = [['Product', 'Region', 'Seller', 'Date', 'Total', 'Quantity']];
    const rows = filteredData.map((r) => [
      r.Product,
      r.Region,
      r.Seller,
      r.Date,
      r.Total,
      r.Quantity,
    ]);
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, 'Vendas');
    XLSX.writeFile(wb, 'vendas_filtradas.xlsx');
  }, [filteredData]);

  const glassKpi =
    'backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl p-6 shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 text-center';
  const glassCard =
    'backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl shadow-2xl shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-300 p-8';
  const glassFilter =
    'backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl shadow-xl shadow-indigo-500/10 p-6 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300';

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho com botões */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
            Dashboard de Vendas
          </h1>
          <div className="flex flex-wrap gap-3">
            <label className="px-6 py-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer font-medium">
              Upload Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={clearData}
              className="px-6 py-3 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              Limpar Dados
            </button>
            <button
              onClick={exportExcel}
              disabled={filteredData.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Exportar Excel
            </button>
            <Link
              href="/fechamento"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 text-white font-bold rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 text-lg border-2 border-white/20"
            >
              📊 Ir para Fechamento Mensal
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className={glassKpi}>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
              {kpis.totalVendas.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
            <div className="text-sm opacity-75 uppercase tracking-wide text-gray-700">
              Total Vendas
            </div>
          </div>
          <div className={glassKpi}>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 mb-2">
              {kpis.totalPedidos.toLocaleString()}
            </div>
            <div className="text-sm opacity-75 uppercase tracking-wide text-gray-700">
              Total Pedidos
            </div>
          </div>
          <div className={glassKpi}>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-600 mb-2">
              {kpis.ticketMedio.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
            <div className="text-sm opacity-75 uppercase tracking-wide text-gray-700">
              Ticket Médio
            </div>
          </div>
          <div className={glassKpi}>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-indigo-600 mb-2 truncate max-w-[150px] mx-auto">
              {kpis.produtoTop}
            </div>
            <div className="text-sm opacity-75 uppercase tracking-wide text-gray-700">
              Produto Top
            </div>
          </div>
        </div>

        {/* Filtros colapsáveis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-16">
          {/* Filtro Período */}
          <div className={glassFilter}>
            <button
              className="w-full flex justify-between items-center mb-6 p-2 rounded-xl hover:bg-white/20 transition-all"
              onClick={() => toggleFilter('period')}
            >
              <span className="font-semibold text-lg">Período</span>
              <svg
                className={`w-6 h-6 transition-transform duration-300 ${
                  filterOpen.period ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {filterOpen.period && (
              <div className="space-y-3">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => updateFilters({ startDate: e.target.value })}
                  className="w-full p-3 border border-white/30 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => updateFilters({ endDate: e.target.value })}
                  className="w-full p-3 border border-white/30 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
              </div>
            )}
          </div>

          {/* Filtro Região */}
          <div className={glassFilter + ' lg:col-span-1 xl:col-span-1'}>
            <button
              className="w-full flex justify-between items-center mb-6 p-2 rounded-xl hover:bg-white/20 transition-all"
              onClick={() => toggleFilter('region')}
            >
              <span className="font-semibold text-lg">Região</span>
              <svg
                className={`w-6 h-6 transition-transform duration-300 ${
                  filterOpen.region ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {filterOpen.region && (
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {uniqueRegions.map((region) => (
                  <label
                    key={region}
                    className="flex items-center p-2 rounded-xl cursor-pointer hover:bg-white/30 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={filters.regions.includes(region)}
                      onChange={(e) => {
                        const newRegions = e.target.checked
                          ? [
                              ...filters.regions,
                              region,
                            ].filter((r, i, a) => a.indexOf(r) === i)
                          : filters.regions.filter((r) => r !== region);
                        updateFilters({ regions: newRegions });
                      }}
                      className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-gray-800 font-medium">{region}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Filtro Produto */}
          <div className={glassFilter + ' lg:col-span-1 xl:col-span-1'}>
            <button
              className="w-full flex justify-between items-center mb-6 p-2 rounded-xl hover:bg-white/20 transition-all"
              onClick={() => toggleFilter('product')}
            >
              <span className="font-semibold text-lg">Produto</span>
              <svg
                className={`w-6 h-6 transition-transform duration-300 ${
                  filterOpen.product ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {filterOpen.product && (
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {uniqueProducts.map((product) => (
                  <label
                    key={product}
                    className="flex items-center p-2 rounded-xl cursor-pointer hover:bg-white/30 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={filters.products.includes(product)}
                      onChange={(e) => {
                        const newProducts = e.target.checked
                          ? [
                              ...filters.products,
                              product,
                            ].filter((p, i, a) => a.indexOf(p) === i)
                          : filters.products.filter((p) => p !== product);
                        updateFilters({ products: newProducts });
                      }}
                      className="mr-3 w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="text-gray-800 font-medium truncate">{product}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Filtro Vendedor */}
          <div className={glassFilter + ' lg:col-span-1 xl:col-span-1'}>
            <button
              className="w-full flex justify-between items-center mb-6 p-2 rounded-xl hover:bg-white/20 transition-all"
              onClick={() => toggleFilter('seller')}
            >
              <span className="font-semibold text-lg">Vendedor</span>
              <svg
                className={`w-6 h-6 transition-transform duration-300 ${
                  filterOpen.seller ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {filterOpen.seller && (
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {uniqueSellers.map((seller) => (
                  <label
                    key={seller}
                    className="flex items-center p-2 rounded-xl cursor-pointer hover:bg-white/30 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={filters.sellers.includes(seller)}
                      onChange={(e) => {
                        const newSellers = e.target.checked
                          ? [...filters.sellers, seller].filter((s, i, a) => a.indexOf(s) === i)
                          : filters.sellers.filter((s) => s !== seller);
                        updateFilters({ sellers: newSellers });
                      }}
                      className="mr-3 w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                    />
                    <span className="text-gray-800 font-medium truncate">{seller}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Gráficos em coluna, um abaixo do outro */}
        <div className="space-y-16 mb-16">
          {/* Evolução de Vendas por Data */}
          <section>
            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-lg">
              Evolução de Vendas por Data
            </h2>
            <div className={`${glassCard} h-[350px] sm:h-[400px] lg:h-[450px]`}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="white/30" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    formatter={(value: number) =>
                      [`R$ ${value.toLocaleString('pt-BR')}`, 'Vendas']
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#3B82F6"
                    strokeWidth={4}
                    dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Volume por Produto */}
          <section>
            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
              Volume por Produto
            </h2>
            <div className={`${glassCard} h-[350px] sm:h-[400px] lg:h-[450px]`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="white/30" />
                  <XAxis dataKey="product" stroke="#64748b" angle={-45} height={80} />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Distribuição por Região */}
          <section>
            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent drop-shadow-lg">
              Distribuição por Região
            </h2>
            <div className={`${glassCard} h-[350px] sm:h-[400px] lg:h-[450px]`}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Tabela responsiva */}
        <div className={`${glassCard} overflow-hidden shadow-3xl`}>
          <h2 className="text-3xl font-bold p-8 border-b border-white/20 bg-white/10 text-gray-800">
            Dados de Vendas
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-white/10">
              <thead className="bg-white/20 backdrop-blur-sm">
                <tr>
                  <th className="px-8 py-6 text-left text-xl font-bold text-gray-800 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-8 py-6 text-left text-xl font-bold text-gray-800 uppercase tracking-wider">
                    Região
                  </th>
                  <th className="px-8 py-6 text-left text-xl font-bold text-gray-800 uppercase tracking-wider">
                    Vendedor
                  </th>
                  <th className="px-8 py-6 text-left text-xl font-bold text-gray-800 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-8 py-6 text-right text-xl font-bold text-gray-800 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-8 py-6 text-right text-xl font-bold text-gray-800 uppercase tracking-wider">
                    Quantidade
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-white/10">
                {filteredData.map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-white/30 transition-all duration-200"
                  >
                    <td className="px-8 py-6 whitespace-nowrap text-lg font-semibold text-gray-800">
                      {row.Product}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-lg text-gray-700">
                      {row.Region}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-lg text-gray-700">
                      {row.Seller}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-lg font-mono text-gray-700">
                      {row.Date}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right text-2xl font-bold text-blue-600">
                      R$ {row.Total.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right text-xl font-mono text-purple-600">
                      {row.Quantity.toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-8 py-20 text-center text-2xl text-gray-500 font-medium"
                    >
                      Nenhum dado para exibir. Faça upload de um arquivo Excel.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
