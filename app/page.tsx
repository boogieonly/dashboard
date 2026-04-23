'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar
} from 'recharts';
import * as XLSX from 'xlsx';

interface SalesData {
  id: number;
  date: string;
  region: string;
  product: string;
  seller: string;
  client: string;
  value: number;
  stage: 'prospect' | 'negotiation' | 'proposal' | 'closed';
}

interface Filters {
  startDate: string;
  endDate: string;
  region: string;
  product: string;
  seller: string;
}

interface SellerStat {
  seller: string;
  sales: number;
  deals: number;
}

const rawData: SalesData[] = [
  { id: 1, date: '2024-01-10', region: 'São Paulo', product: 'Estrutura Metálica', seller: 'Ana Silva', client: 'Construtora ABC', value: 25000, stage: 'closed' },
  { id: 2, date: '2024-01-15', region: 'Rio de Janeiro', product: 'Telhado', seller: 'João Santos', client: 'Reforma RJ Ltda', value: 12000, stage: 'proposal' },
  { id: 3, date: '2024-01-20', region: 'Minas Gerais', product: 'Portão Automático', seller: 'Maria Oliveira', client: 'Minas Obras', value: 18000, stage: 'closed' },
  { id: 4, date: '2024-02-05', region: 'Bahia', product: 'Cerca', seller: 'Pedro Costa', client: 'Bahia Construções', value: 9000, stage: 'negotiation' },
  { id: 5, date: '2024-02-12', region: 'São Paulo', product: 'Pórtico', seller: 'Luiza Ferreira', client: 'SP Estruturas', value: 32000, stage: 'closed' },
  { id: 6, date: '2024-02-18', region: 'Rio Grande do Sul', product: 'Estrutura Metálica', seller: 'Ana Silva', client: 'Sul Metal', value: 15000, stage: 'proposal' },
  { id: 7, date: '2024-03-03', region: 'Rio de Janeiro', product: 'Telhado', seller: 'João Santos', client: 'Rio Coberturas', value: 11000, stage: 'closed' },
  { id: 8, date: '2024-03-10', region: 'Minas Gerais', product: 'Portão Automático', seller: 'Maria Oliveira', client: 'MG Portões', value: 22000, stage: 'closed' },
  { id: 9, date: '2024-03-22', region: 'Bahia', product: 'Cerca', seller: 'Pedro Costa', client: 'Nordeste Ceras', value: 7500, stage: 'prospect' },
  { id: 10, date: '2024-04-01', region: 'São Paulo', product: 'Pórtico', seller: 'Luiza Ferreira', client: 'Elite Construções', value: 28000, stage: 'closed' },
  { id: 11, date: '2024-04-14', region: 'Rio Grande do Sul', product: 'Estrutura Metálica', seller: 'Ana Silva', client: 'Gaúcha Metalworks', value: 19000, stage: 'negotiation' },
  { id: 12, date: '2024-04-20', region: 'Rio de Janeiro', product: 'Telhado', seller: 'João Santos', client: 'Copacabana Obras', value: 14000, stage: 'closed' },
  { id: 13, date: '2024-05-05', region: 'Minas Gerais', product: 'Portão Automático', seller: 'Maria Oliveira', client: 'Belo Horizonte Gates', value: 16000, stage: 'proposal' },
  { id: 14, date: '2024-05-12', region: 'Bahia', product: 'Cerca', seller: 'Pedro Costa', client: 'Salvador Fence', value: 8500, stage: 'closed' },
  { id: 15, date: '2024-05-25', region: 'São Paulo', product: 'Pórtico', seller: 'Luiza Ferreira', client: 'Metalfama SP', value: 35000, stage: 'closed' },
  { id: 16, date: '2024-06-02', region: 'Rio Grande do Sul', product: 'Estrutura Metálica', seller: 'Ana Silva', client: 'Porto Alegre Steel', value: 21000, stage: 'closed' },
  { id: 17, date: '2024-06-10', region: 'Rio de Janeiro', product: 'Telhado', seller: 'João Santos', client: 'Fluminense Roofs', value: 13000, stage: 'negotiation' },
  { id: 18, date: '2024-06-18', region: 'Minas Gerais', product: 'Portão Automático', seller: 'Maria Oliveira', client: 'Ouro Preto Portas', value: 20000, stage: 'closed' },
  { id: 19, date: '2024-01-25', region: 'Bahia', product: 'Cerca', seller: 'Pedro Costa', client: 'Feira de Santana Fence', value: 10000, stage: 'proposal' },
  { id: 20, date: '2024-02-28', region: 'São Paulo', product: 'Estrutura Metálica', seller: 'Luiza Ferreira', client: 'Capital Structures', value: 27000, stage: 'closed' },
  // Additional data for completeness
  { id: 21, date: '2024-03-15', region: 'Rio Grande do Sul', product: 'Telhado', seller: 'Ana Silva', client: 'Pampa Coberturas', value: 9500, stage: 'prospect' },
  { id: 22, date: '2024-04-08', region: 'São Paulo', product: 'Portão Automático', seller: 'João Santos', client: 'São Paulo Gates', value: 17500, stage: 'closed' },
  { id: 23, date: '2024-05-03', region: 'Minas Gerais', product: 'Pórtico', seller: 'Maria Oliveira', client: 'Juiz de Fora Portais', value: 24000, stage: 'closed' },
  { id: 24, date: '2024-06-07', region: 'Bahia', product: 'Estrutura Metálica', seller: 'Pedro Costa', client: 'Recôncavo Steel', value: 15500, stage: 'negotiation' },
  { id: 25, date: '2024-01-30', region: 'Rio de Janeiro', product: 'Cerca', seller: 'Luiza Ferreira', client: 'Niterói Fences', value: 6500, stage: 'closed' }
];

export default function Dashboard() {
  const [filters, setFilters] = useState<Filters>({
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    region: '',
    product: '',
    seller: ''
  });

  const data = useMemo(() => rawData, []);

  const sellers: string[] = useMemo(
    () => Array.from(new Set(data.map((d) => d.seller))).sort((a, b) => a.localeCompare(b)),
    [data]
  );

  const regions: string[] = useMemo(
    () => Array.from(new Set(data.map((d) => d.region))).sort((a, b) => a.localeCompare(b)),
    [data]
  );

  const products: string[] = useMemo(
    () => Array.from(new Set(data.map((d) => d.product))).sort((a, b) => a.localeCompare(b)),
    [data]
  );

  const clientsList: string[] = useMemo(
    () => Array.from(new Set(data.map((d) => d.client))).sort((a, b) => a.localeCompare(b)),
    [data]
  );

  const filteredData: SalesData[] = useMemo(() => {
    return data.filter((d) => {
      const date = new Date(d.date);
      return (
        (!filters.startDate || date >= new Date(filters.startDate)) &&
        (!filters.endDate || date <= new Date(filters.endDate)) &&
        (!filters.region || d.region === filters.region) &&
        (!filters.product || d.product === filters.product) &&
        (!filters.seller || d.seller === filters.seller)
      );
    });
  }, [data, filters]);

  const totalSales = useMemo(
    () => filteredData.reduce((sum, d) => sum + d.value, 0),
    [filteredData]
  );

  const avgTicket = useMemo(
    () => (filteredData.length > 0 ? totalSales / filteredData.length : 0),
    [filteredData, totalSales]
  );

  const closedDeals = useMemo(
    () => filteredData.filter((d) => d.stage === 'closed').length,
    [filteredData]
  );

  const sellerStats: SellerStat[] = useMemo(() => {
    const stats: Record<string, { sales: number; deals: number }> = {};
    filteredData.forEach((d) => {
      if (!stats[d.seller]) {
        stats[d.seller] = { sales: 0, deals: 0 };
      }
      stats[d.seller]!.sales += d.value;
      stats[d.seller]!.deals += 1;
    });
    return Object.entries(stats)
      .map(([seller, s]) => ({ seller, ...s }))
      .sort((a, b) => b.sales - a.sales);
  }, [filteredData]);

  const timeSeries = useMemo(() => {
    const monthly: Record<string, number> = {};
    filteredData.forEach((d) => {
      const month = d.date.slice(0, 7);
      monthly[month] = (monthly[month] || 0) + d.value;
    });
    return Object.entries(monthly)
      .map(([month, sales]) => ({ month, sales: Number(sales) }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredData]);

  const regionSales = useMemo(
    () =>
      regions.map((r) => ({
        region: r,
        sales: filteredData
          .filter((d) => d.region === r)
          .reduce((s, d) => s + d.value, 0)
      })),
    [filteredData, regions]
  );

  const productSales = useMemo(
    () =>
      products.map((p) => ({
        product: p,
        sales: filteredData
          .filter((d) => d.product === p)
          .reduce((s, d) => s + d.value, 0)
      })),
    [filteredData, products]
  );

  const funnelData = useMemo(() => {
    const stages = ['prospect', 'negotiation', 'proposal', 'closed'] as const;
    return stages.map((stage) => ({
      stage,
      count: filteredData.filter((d) => d.stage === stage).length,
      sales: filteredData
        .filter((d) => d.stage === stage)
        .reduce((s, d) => s + d.value, 0)
    }));
  }, [filteredData]);

  const topClients = useMemo(() => {
    const clientStats: Record<string, number> = {};
    filteredData.forEach((d) => {
      clientStats[d.client] = (clientStats[d.client] || 0) + d.value;
    });
    return Object.entries(clientStats)
      .map(([client, sales]) => ({ client, sales: Number(sales) }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);
  }, [filteredData]);

  const sellerColorMap = useMemo(() => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    return Object.fromEntries(
      sellers.map((s, i) => [s, colors[i % colors.length]])
    );
  }, [sellers]);

  const updateFilter = useCallback((key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const exportExcel = useCallback(() => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dados de Vendas');
    XLSX.writeFile(wb, 'metalfama_vendas.xlsx');
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-base-100 p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-12 text-center text-primary">Dashboard Metalfama</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mb-12 items-end">
        <div>
          <label className="label">
            <span className="label-text">Início</span>
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => updateFilter('startDate', e.target.value)}
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text">Fim</span>
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => updateFilter('endDate', e.target.value)}
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text">Região</span>
          </label>
          <select
            value={filters.region}
            onChange={(e) => updateFilter('region', e.target.value)}
            className="select select-bordered w-full"
          >
            <option value="">Todas</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">
            <span className="label-text">Produto</span>
          </label>
          <select
            value={filters.product}
            onChange={(e) => updateFilter('product', e.target.value)}
            className="select select-bordered w-full"
          >
            <option value="">Todos</option>
            {products.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">
            <span className="label-text">Vendedor</span>
          </label>
          <select
            value={filters.seller}
            onChange={(e) => updateFilter('seller', e.target.value)}
            className="select select-bordered w-full"
          >
            <option value="">Todos</option>
            {sellers.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <button onClick={exportExcel} className="btn btn-primary w-full lg:w-auto">
          Exportar Excel
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="card bg-base-100 shadow-xl border border-primary/50">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-lg">Vendas Totais</h2>
            <p className="text-4xl font-bold text-primary">R$ {totalSales.toLocaleString()}</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl border border-secondary/50">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-lg">Ticket Médio</h2>
            <p className="text-4xl font-bold text-secondary">R$ {avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl border border-success/50">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-lg">Fechamentos</h2>
            <p className="text-4xl font-bold text-success">{closedDeals}</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl border border-accent/50">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-lg">Total Oportunidades</h2>
            <p className="text-4xl font-bold text-accent">{filteredData.length}</p>
          </div>
        </div>
      </div>

      {/* Seller Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-2xl font-bold mb-6">Ranking de Vendedores</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Posição</th>
                  <th>Vendedor</th>
                  <th>Vendas</th>
                  <th>Oportunidades</th>
                </tr>
              </thead>
              <tbody>
                {sellerStats.map((s, i) => (
                  <tr
                    key={s.seller}
                    style={{ backgroundColor: `${sellerColorMap[s.seller as keyof typeof sellerColorMap]}20` }}
                    className={i < 3 ? 'font-bold' : ''}
                  >
                    <td>{i + 1}</td>
                    <td style={{ color: sellerColorMap[s.seller as keyof typeof sellerColorMap] }}>
                      {s.seller}
                    </td>
                    <td>R$ {s.sales.toLocaleString()}</td>
                    <td>{s.deals}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-6">Vendas ao Longo do Tempo</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={timeSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-2xl font-bold mb-6">Vendas por Região</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={regionSales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-6">Vendas por Produto</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={productSales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="product" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Clients & Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-6">Top 10 Clientes</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Vendas</th>
                </tr>
              </thead>
              <tbody>
                {topClients.map((c) => (
                  <tr key={c.client}>
                    <td>{c.client}</td>
                    <td>R$ {c.sales.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-6">Funil de Vendas</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="stage" type="category" />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
