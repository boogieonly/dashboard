"use client";

import React, { useState, useMemo, useCallback } from 'react';
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
  AreaChart,
  Area
} from 'recharts';
import * as XLSX from 'xlsx';

interface Sale {
  id: number;
  date: string;
  region: string;
  product: string;
  seller: string;
  client: string;
  revenue: number;
}

type PeriodFilter = "Última semana" | "Mês" | "Trimestre" | "Ano" | "Customizado";
type RegionFilter = "Todos" | "Sudeste" | "Sul" | "Nordeste" | "Centro-Oeste" | "Norte";
type ProductFilter = "Todos" | "Estruturas" | "Portões" | "Grades" | "Cobertura" | "Escadas";
type SellerFilter = "Todas as opções" | "Caique" | "João" | "Maria" | "Pedro" | "Rafael";

interface SellerStat {
  name: string;
  revenue: number;
  clients: number;
  growth: number;
  meta: number;
}

interface ClientStat {
  name: string;
  revenue: number;
  growth: number;
  status: string;
}

interface FunnelData {
  name: string;
  count: number;
  value: number;
}

export default function Home() {
  const [period, setPeriod] = useState<PeriodFilter>("Mês");
  const [region, setRegion] = useState<RegionFilter>("Todos");
  const [product, setProduct] = useState<ProductFilter>("Todos");
  const [sellerFilter, setSellerFilter] = useState<SellerFilter>("Todas as opções");

  const sellers = ["Caique", "João", "Maria", "Pedro", "Rafael"] as const;
  const regions = ["Sudeste", "Sul", "Nordeste", "Centro-Oeste", "Norte"] as const;
  const products = ["Estruturas", "Portões", "Grades", "Cobertura", "Escadas"] as const;
  const clientsList = [
    "Construtora São Paulo",
    "Metais do Sul Ltda",
    "Nordeste Estruturas",
    "Fazenda Centro-Oeste",
    "Norte Coberturas",
    "João Silva Construções",
    "Empresa ABC",
    "Indústria XYZ",
    "Comercial DEF",
    "Residencial GHI",
    "Industrial JKL",
    "Construções MNO",
    "Portões PQR",
    "Grades STU",
    "Escadas VWX"
  ] as const;

  const generateMockSales = useCallback((sellersArr: string[], regs: string[], prods: string[], clis: string[]): Sale[] => {
    const sales: Sale[] = [];
    for (let i = 0; i < 300; i++) {
      const year = 2023 + Math.floor(Math.random() * 2);
      const month = 1 + Math.floor(Math.random() * 12);
      const day = 1 + Math.floor(Math.random() * 28);
      const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const seller = sellersArr[Math.floor(Math.random() * sellersArr.length)];
      const reg = regs[Math.floor(Math.random() * regs.length)];
      const prod = prods[Math.floor(Math.random() * prods.length)];
      const cli = clis[Math.floor(Math.random() * clis.length)];
      const revenue = 8000 + Math.random() * 92000;
      sales.push({ id: i + 1, date, region: reg, product: prod, seller, client: cli, revenue });
    }
    return sales;
  }, []);

  const mockSales = useMemo(
    () => generateMockSales(sellers, regions, products, clientsList),
    [generateMockSales, sellers, regions, products, clientsList]
  );

  const formatCurrency = useCallback((value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    });
  }, []);

  const getDateRange = useCallback((p: PeriodFilter) => {
    const to = new Date();
    to.setHours(23, 59, 59, 999);
    let from = new Date(to);
    switch (p) {
      case 'Última semana':
        from.setDate(to.getDate() - 7);
        break;
      case 'Mês':
        from.setDate(1);
        break;
      case 'Trimestre':
        const month = to.getMonth();
        from.setMonth(month - (month % 3));
        from.setDate(1);
        break;
      case 'Ano':
        from.setMonth(0);
        from.setDate(1);
        break;
      case 'Customizado':
        from.setFullYear(to.getFullYear() - 1);
        break;
    }
    from.setHours(0, 0, 0, 0);
    return { from, to };
  }, []);

  const dateRange = useMemo(() => getDateRange(period), [period, getDateRange]);

  const previousDateRange = useMemo(() => {
    const { from, to } = dateRange;
    const duration = to.getTime() - from.getTime();
    const prevTo = new Date(from.getTime() - 86400000);
    const prevFrom = new Date(prevTo.getTime() - duration);
    return { from: prevFrom, to: prevTo };
  }, [dateRange]);

  const filteredSales = useMemo(() =>
    mockSales.filter((s) => {
      const d = new Date(s.date);
      const inPeriod = d >= dateRange.from && d <= dateRange.to;
      const inRegion = region === 'Todos' || s.region === region;
      const inProduct = product === 'Todos' || s.product === product;
      const inSeller = sellerFilter === 'Todas as opções' || s.seller === sellerFilter;
      return inPeriod && inRegion && inProduct && inSeller;
    }),
    [mockSales, dateRange, region, product, sellerFilter]
  );

  const previousFilteredSales = useMemo(() =>
    mockSales.filter((s) => {
      const d = new Date(s.date);
      const inPrevPeriod = d >= previousDateRange.from && d <= previousDateRange.to;
      const inRegion = region === 'Todos' || s.region === region;
      const inProduct = product === 'Todos' || s.product === product;
      const inSeller = sellerFilter === 'Todas as opções' || s.seller === sellerFilter;
      return inPrevPeriod && inRegion && inProduct && inSeller;
    }),
    [mockSales, previousDateRange, region, product, sellerFilter]
  );

  const totalRevenue = useMemo(
    () => filteredSales.reduce((sum, s) => sum + s.revenue, 0),
    [filteredSales]
  );

  const totalPrevRevenue = useMemo(
    () => previousFilteredSales.reduce((sum, s) => sum + s.revenue, 0),
    [previousFilteredSales]
  );

  const uniqueClientsCount = useMemo(
    () => new Set(filteredSales.map((s) => s.client)).size,
    [filteredSales]
  );

  const kpiGrowth = totalPrevRevenue > 0 ? ((totalRevenue - totalPrevRevenue) / totalPrevRevenue) * 100 : 0;

  const currentSellerRev = useMemo(() =>
    filteredSales.reduce((acc: Record<string, number>, s) => {
      acc[s.seller] ??= 0;
      acc[s.seller] += s.revenue;
      return acc;
    }, {}),
    [filteredSales]
  );

  const currentSellerClients = useMemo(() =>
    filteredSales.reduce((acc: Record<string, Set<string>>, s) => {
      if (!acc[s.seller]) acc[s.seller] = new Set();
      acc[s.seller].add(s.client);
      return acc;
    }, {}),
    [filteredSales]
  );

  const prevSellerRev = useMemo(() =>
    previousFilteredSales.reduce((acc: Record<string, number>, s) => {
      acc[s.seller] ??= 0;
      acc[s.seller] += s.revenue;
      return acc;
    }, {}),
    [previousFilteredSales]
  );

  const sellerStats = useMemo<SellerStat[]>(() =>
    sellers.map((name) => {
      const revenue = currentSellerRev[name] || 0;
      const clients = currentSellerClients[name]?.size || 0;
      const prevRev = prevSellerRev[name] || 0;
      const growth = prevRev > 0 ? ((revenue - prevRev) / prevRev) * 100 : 0;
      const meta = 150000;
      return { name, revenue, clients, growth, meta };
    }).sort((a, b) => b.revenue - a.revenue),
    [sellers, currentSellerRev, currentSellerClients, prevSellerRev]
  );

  const clientStats = useMemo<ClientStat[]>(() => {
    const stats: Record<string, ClientStat> = {};
    filteredSales.forEach((s) => {
      if (!stats[s.client]) {
        stats[s.client] = {
          name: s.client,
          revenue: 0,
          growth: (Math.random() - 0.5) * 50,
          status: (['Novo', 'Ativo', 'Em Risco', 'Cancelado'] as string[])[Math.floor(Math.random() * 4)]
        };
      }
      stats[s.client].revenue += s.revenue;
    });
    return Object.values(stats).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [filteredSales]);

  const lineData = useMemo(() => {
    const monthly: Record<string, number> = {};
    filteredSales.forEach((s) => {
      const month = s.date.substring(0, 7);
      monthly[month] = (monthly[month] || 0) + s.revenue;
    });
    return Object.keys(monthly)
      .sort()
      .map((month) => ({ month, revenue: monthly[month] }));
  }, [filteredSales]);

  const productData = useMemo(() => {
    const data: Record<string, number> = {};
    filteredSales.forEach((s) => {
      data[s.product] = (data[s.product] || 0) + s.revenue;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [filteredSales]);

  const regionData = useMemo(() => {
    const data: Record<string, number> = {};
    filteredSales.forEach((s) => {
      data[s.region] = (data[s.region] || 0) + s.revenue;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [filteredSales]);

  const areaData = useMemo(() =>
    sellerStats.map((s) => ({
      name: s.name.substring(0, 3),
      uv: s.revenue,
      pv: s.meta,
      amt: s.clients * 10000
    })),
    [sellerStats]
  );

  const funnelData = useMemo<FunnelData[]>(() => [
    { name: 'Leads', count: Math.floor(uniqueClientsCount * 8 + 50), value: totalRevenue * 2.5 },
    { name: 'Propostas', count: Math.floor(uniqueClientsCount * 4 + 20), value: totalRevenue * 1.8 },
    { name: 'Contratos', count: Math.floor(uniqueClientsCount * 2 + 10), value: totalRevenue * 1.2 },
    { name: 'Faturado', count: uniqueClientsCount, value: totalRevenue }
  ], [uniqueClientsCount, totalRevenue]);

  const openOpportunities = useMemo(() => funnelData[1].value - funnelData[2].value, [funnelData]);

  const kpiConversion = useMemo(
    () => Math.round((funnelData[3].count / (funnelData[0].count || 1)) * 100 * 10) / 10,
    [funnelData]
  );

  const kpis = useMemo(
    () => [
      { title: 'Receita Total', value: formatCurrency(totalRevenue), icon: '💰' },
      { title: 'Clientes Atendidos', value: uniqueClientsCount.toLocaleString(), icon: '👥' },
      {
        title: 'Receita Média / Cliente',
        value: formatCurrency(totalRevenue / uniqueClientsCount || 0),
        icon: '📊'
      },
      { title: 'Taxa de Conversão', value: `${kpiConversion}%`, icon: '🔄' },
      {
        title: 'Crescimento vs. Anterior',
        value: `${kpiGrowth > 0 ? '+' : ''}${Math.round(kpiGrowth)}%`,
        icon: '📈'
      }
    ],
    [totalRevenue, uniqueClientsCount, kpiConversion, kpiGrowth, formatCurrency]
  );

  const exportToExcel = useCallback(() => {
    const wb = XLSX.utils.book_new();

    const kpiData = [
      ['Métrica', 'Valor'],
      ['Receita Total', totalRevenue],
      ['Clientes Atendidos', uniqueClientsCount],
      ['Receita Média por Cliente', totalRevenue / uniqueClientsCount || 0],
      ['Taxa de Conversão (%)', kpiConversion],
      ['Crescimento (%)', kpiGrowth]
    ];
    const kpiWs = XLSX.utils.aoa_to_sheet(kpiData);
    XLSX.utils.book_append_sheet(wb, kpiWs, 'KPIs');

    const sellerData = [
      ['Vendedor', 'Receita Realizada', 'Meta', '% Realizado', 'Clientes Atendidos', 'Crescimento %'],
      ...sellerStats.map((s) => [
        s.name,
        s.revenue,
        s.meta,
        Math.round((s.revenue / s.meta) * 100 * 10) / 10,
        s.clients,
        Math.round(s.growth * 10) / 10
      ])
    ];
    const sellerWs = XLSX.utils.aoa_to_sheet(sellerData);
    XLSX.utils.book_append_sheet(wb, sellerWs, 'Vendedores');

    const clientData = [
      ['Cliente', 'Receita', '% Crescimento', 'Status'],
      ...clientStats.map((c) => [c.name, c.revenue, c.growth, c.status])
    ];
    const clientWs = XLSX.utils.aoa_to_sheet(clientData);
    XLSX.utils.book_append_sheet(wb, clientWs, 'Clientes');

    const funnelDataExport = [
      ['Estágio', 'Contagem', 'Valor'],
      ...funnelData.map((f) => [f.name, f.count, f.value])
    ];
    const funnelWs = XLSX.utils.aoa_to_sheet(funnelDataExport);
    XLSX.utils.book_append_sheet(wb, funnelWs, 'Funil');

    const salesData = filteredSales.map((s) => ({
      ID: s.id,
      Data: s.date,
      'Região': s.region,
      Produto: s.product,
      Vendedor: s.seller,
      Cliente: s.client,
      Receita: s.revenue
    }));
    const salesWs = XLSX.utils.json_to_sheet(salesData);
    XLSX.utils.book_append_sheet(wb, salesWs, 'Vendas');

    XLSX.writeFile(
      wb,
      `dashboard_metalfama_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  }, [
    totalRevenue,
    uniqueClientsCount,
    kpiConversion,
    kpiGrowth,
    sellerStats,
    clientStats,
    funnelData,
    filteredSales
  ]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Dashboard Metalfama
          </h1>
          <button
            onClick={exportToExcel}
            className="bg-green-600/80 hover:bg-green-500/90 backdrop-blur-xl border border-green-500/50 px-8 py-4 rounded-2xl font-semibold transition-all shadow-2xl hover:shadow-3xl hover:-translate-y-0.5 whitespace-nowrap"
          >
            📊 Exportar Excel
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-300">Período</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
              className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-4 text-white font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all hover:bg-white/20"
            >
              <option>Última semana</option>
              <option>Mês</option>
              <option>Trimestre</option>
              <option>Ano</option>
              <option>Customizado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-300">Região</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as RegionFilter)}
              className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-4 text-white font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all hover:bg-white/20"
            >
              <option>Todos</option>
              {regions.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-300">Produto</label>
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value as ProductFilter)}
              className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-4 text-white font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all hover:bg-white/20"
            >
              <option>Todos</option>
              {products.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-300">Vendedor</label>
            <select
              value={sellerFilter}
              onChange={(e) => setSellerFilter(e.target.value as SellerFilter)}
              className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-4 text-white font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all hover:bg-white/20"
            >
              <option>Todas as opções</option>
              {sellers.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {kpis.map((kpi, i) => (
            <div
              key={i}
              className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl hover:bg-white/10 hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                  {kpi.icon}
                </span>
              </div>
              <h3 className="text-gray-400 font-medium mb-2 text-sm uppercase tracking-wide">
                {kpi.title}
              </h3>
              <p className="text-4xl lg:text-3xl font-black text-white drop-shadow-lg">
                {kpi.value}
              </p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Receita ao Longo do Tempo</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="5 5" stroke="hsla(0,0%,100%,0.1)" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#00C49F"
                  strokeWidth={4}
                  dot={{ fill: '#00C49F', strokeWidth: 2 }}
                  activeDot={{ r: 8, stroke: '#00C49F', strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Receita por Produto</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="5 5" stroke="hsla(0,0%,100%,0.1)" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#8884d8"
                  radius={[8, 8, 0, 0]}
                  className="hover:fill-opacity-80"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Distribuição por Região</h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={regionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label
                >
                  {regionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Performance Acumulada Vendedores</h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={areaData}>
                <CartesianGrid strokeDasharray="5 5" stroke="hsla(0,0%,100%,0.1)" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="uv"
                  stroke="#00C49F"
                  fill="url(#areaGradient)"
                  strokeWidth={3}
                />
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00C49F" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#00C49F" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Seller Performance */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Performance dos Vendedores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {sellerStats.map((stat, index) => {
              const rank = index < 3 ? (['🥇', '🥈', '🥉'] as string[])[index] : `${index + 1}º`;
              const pct = stat.revenue / stat.meta * 100;
              let bgClass = '';
              let ringClass = '';
              if (pct >= 100) {
                bgClass = 'bg-green-500/20 border-green-400/40 ';
                ringClass = 'ring-green-500/30 ring-offset-green-500/20';
              } else if (pct >= 80) {
                bgClass = 'bg-yellow-500/20 border-yellow-400/40 ';
                ringClass = 'ring-yellow-500/30 ring-offset-yellow-500/20';
              } else {
                bgClass = 'bg-red-500/20 border-red-400/40 ';
                ringClass = 'ring-red-500/30 ring-offset-red-500/20';
              }
              return (
                <div
                  key={stat.name}
                  className={`p-8 rounded-3xl border shadow-2xl backdrop-blur-xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-3 hover:scale-[1.02] group ${bgClass}${ringClass} ring-4 ring-offset-4 ring-offset-gray-900/50`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-4xl font-black drop-shadow-lg group-hover:scale-110 transition-transform">
                      {rank}
                    </span>
                    <span className="text-3xl">👨‍💼</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-6 text-white drop-shadow-lg">{stat.name}</h3>
                  <div className="space-y-3 text-lg">
                    <p>
                      Receita: <span className="font-black text-2xl">{formatCurrency(stat.revenue)}</span>
                    </p>
                    <p>
                      vs. Meta <span className={`font-black ${pct >= 100 ? 'text-green-400' : pct >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>({Math.round(pct)}%)</span>
                    </p>
                    <p>Clientes: <span className="font-bold text-xl">{stat.clients}</span></p>
                    <p>
                      Crescimento:{' '}
                      <span className={`font-black text-xl ${stat.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stat.growth > 0 ? '+' : ''}{Math.round(stat.growth)}%
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clients Analysis & Funnel */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Top 10 Clientes por Receita
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5 backdrop-blur border-b border-white/20">
                    <th className="text-left p-5 font-bold text-lg">Nome</th>
                    <th className="text-right p-5 font-bold text-lg">Receita</th>
                    <th className="text-right p-5 font-bold text-lg">% Cresc.</th>
                    <th className="text-right p-5 font-bold text-lg">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {clientStats.map((client, i) => (
                    <tr
                      key={i}
                      className={`hover:bg-white/10 transition-all border-b border-white/5 last:border-b-0 ${
                        (client.status === 'Em Risco' || client.status === 'Cancelado')
                          ? 'bg-red-500/10 border-r-4 border-red-500/50'
                          : ''
                      }`}
                    >
                      <td className="p-5 font-semibold text-lg">{client.name}</td>
                      <td className="p-5 text-right font-black text-2xl text-white">
                        {formatCurrency(client.revenue)}
                      </td>
                      <td className="p-5 text-right font-bold text-xl">
                        <span
                          className={`px-3 py-1 rounded-full ${
                            client.growth >= 0 ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'
                          }`}
                        >
                          {client.growth > 0 ? '+' : ''}{Math.round(client.growth)}%
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-bold ${
                            client.status === 'Novo'
                              ? 'bg-green-500/30 text-green-300 border border-green-400/50'
                              : client.status === 'Ativo'
                              ? 'bg-blue-500/30 text-blue-300 border border-blue-400/50'
                              : client.status === 'Em Risco'
                              ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-400/50'
                              : 'bg-red-500/30 text-red-300 border border-red-400/50'
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Funil de Vendas
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="5 5" stroke="hsla(0,0%,100%,0.1)" vertical={false} />
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis type="category" dataKey="name" stroke="#9CA3AF" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Valor" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="count" fill="#00C49F" name="Contagem" radius={[6, 6, 0, 0]} maxBarSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gradient-to-r from-orange-500/20 via-yellow-500/20 to-orange-500/20 backdrop-blur-xl border-2 border-yellow-500/40 rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all hover:scale-[1.02] hover:border-yellow-400/60">
              <h3 className="text-3xl font-bold mb-4 text-yellow-300 drop-shadow-lg">🚨 Oportunidades em Aberto</h3>
              <p className="text-6xl lg:text-5xl font-black text-yellow-400 drop-shadow-2xl mb-2">
                {formatCurrency(openOpportunities)}
              </p>
              <p className="text-xl text-yellow-200 font-semibold">Valor total de propostas pendentes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
