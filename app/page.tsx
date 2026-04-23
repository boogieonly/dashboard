'use client';

import React, { useState, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

type Row = {
  Data: string;
  Regiao: string;
  Produto: string;
  Vendedor: string;
  Cliente: string;
  Valor: number;
  Peso: number;
  Meta: number;
  Etapa: string;
};

type Filters = {
  produto: string;
  regiao: string;
  etapa: string;
};

const materials = ['Aço', 'Alumínio', 'Cobre', 'Latão', 'Inox'];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const glassStyle = "bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-300";

const Page: React.FC = () => {
  const [data, setData] = useState<Row[]>([]);
  const [filters, setFilters] = useState<Filters>({ produto: '', regiao: '', etapa: '' });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<Row>(sheet);
      setData(jsonData);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((row) =>
      (!filters.produto || row.Produto === filters.produto) &&
      (!filters.regiao || row.Regiao === filters.regiao) &&
      (!filters.etapa || row.Etapa === filters.etapa)
    );
  }, [data, filters]);

  const totalPeso = useMemo(() => filteredData.reduce((sum, row) => sum + row.Peso, 0), [filteredData]);
  const totalValor = useMemo(() => filteredData.reduce((sum, row) => sum + row.Valor, 0), [filteredData]);

  const aggMaterials = useMemo(() => {
    const agg: Record<string, { peso: number; valor: number }> = {};
    filteredData.forEach((row) => {
      if (!agg[row.Produto]) {
        agg[row.Produto] = { peso: 0, valor: 0 };
      }
      agg[row.Produto].peso += row.Peso;
      agg[row.Produto].valor += row.Valor;
    });
    return agg;
  }, [filteredData]);

  const barData = useMemo(() =>
    materials.map((m) => ({
      name: m,
      volume: aggMaterials[m]?.peso ?? 0,
    }))
  , [aggMaterials]);

  const revenueByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach((row) => {
      const date = new Date(row.Data);
      if (isNaN(date.getTime())) return;
      const month = date.toISOString().slice(0, 7);
      map[month] = (map[month] || 0) + row.Valor;
    });
    return Object.entries(map)
      .map(([month, valor]) => ({ month, valor: Number(valor) }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredData]);

  const fluxoByEtapa = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach((row) => {
      map[row.Etapa] = (map[row.Etapa] || 0) + row.Valor;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value: Number(value) }));
  }, [filteredData]);

  const uniqueProdutos = useMemo(() => Array.from(new Set(data.map((r) => r.Produto))).sort(), [data]);
  const uniqueRegioes = useMemo(() => Array.from(new Set(data.map((r) => r.Regiao))).sort(), [data]);
  const uniqueEtapas = useMemo(() => Array.from(new Set(data.map((r) => r.Etapa))).sort(), [data]);

  const headers = data.length ? Object.keys(data[0]) : [];

  if (!data.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-blue-900/50 flex items-center justify-center p-8">
        <div className={`${glassStyle} bg-gradient-to-r from-blue-500/20 to-purple-500/20 max-w-2xl mx-auto text-center`}>
          <h2 className="text-3xl font-bold text-white mb-6">Dashboard Metalfama</h2>
          <p className="text-xl text-gray-300 mb-8">Importe o arquivo Excel para visualizar os dados.</p>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:backdrop-blur-sm w-full max-w-md mx-auto block px-6 py-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-blue-900/50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-12 text-center">
          Dashboard Metalfama
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className={`${glassStyle} bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-center`}>
            <h3 className="text-2xl font-bold text-white mb-4">Peso Total</h3>
            <p className="text-5xl font-black text-blue-400 mb-2">{totalPeso.toLocaleString()}</p>
            <p className="text-xl text-gray-300">kg</p>
          </div>
          <div className={`${glassStyle} bg-gradient-to-r from-green-500/20 to-green-600/20 text-center`}>
            <h3 className="text-2xl font-bold text-white mb-4">Valor Total</h3>
            <p className="text-5xl font-black text-green-400 mb-2">{totalValor.toLocaleString()}</p>
            <p className="text-xl text-gray-300">R$</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {materials.map((material, index) => {
            const peso = aggMaterials[material]?.peso ?? 0;
            const valor = aggMaterials[material]?.valor ?? 0;
            const colorIndex = index % COLORS.length;
            return (
              <div
                key={material}
                className={`${glassStyle} bg-gradient-to-br from-[${COLORS[colorIndex]}]/20 to-[${COLORS[colorIndex]}]50`}
              >
                <h4 className="text-xl font-bold text-white mb-3 capitalize">{material}</h4>
                <p className="text-3xl font-black text-blue-400 mb-2">{peso.toLocaleString()} kg</p>
                <p className="text-xl font-semibold text-green-400">R$ {valor.toLocaleString()}</p>
              </div>
            );
          })}
        </div>

        <div className={`${glassStyle} mb-12`}>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex w-full items-center justify-between text-2xl font-bold text-white p-6 hover:scale-105 transition-transform"
          >
            Filtros {filtersOpen ? '▲' : '▼'}
          </button>
          {filtersOpen && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white/5 rounded-2xl">
              <div>
                <label className="block text-white font-semibold mb-2">Produto</label>
                <select
                  value={filters.produto}
                  onChange={(e) => setFilters((prev) => ({ ...prev, produto: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {uniqueProdutos.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Região</label>
                <select
                  value={filters.regiao}
                  onChange={(e) => setFilters((prev) => ({ ...prev, regiao: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas</option>
                  {uniqueRegioes.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Etapa</label>
                <select
                  value={filters.etapa}
                  onChange={(e) => setFilters((prev) => ({ ...prev, etapa: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas</option>
                  {uniqueEtapas.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setFilters({ produto: '', regiao: '', etapa: '' })}
                className="md:col-span-3 bg-gradient-to-r from-red-500/80 to-red-600/80 hover:from-red-600/90 hover:to-red-700/90 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-300 col-span-1 md:col-span-1"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </div>

        <div className="space-y-12 mb-12">
          <div className={`${glassStyle} h-[450px]`}>
            <h3 className="text-3xl font-bold text-white mb-8 text-center">Volume por Material</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="white/10" />
                <XAxis dataKey="name" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Legend />
                <Bar dataKey="volume" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={`${glassStyle} h-[450px]`}>
            <h3 className="text-3xl font-bold text-white mb-8 text-center">Evolução de Faturamento</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="white/10" />
                <XAxis dataKey="month" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Line type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={4} dot={{ fill: '#10b981', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className={`${glassStyle} h-[450px]`}>
            <h3 className="text-3xl font-bold text-white mb-8 text-center">Fluxo Comercial</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fluxoByEtapa}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  dataKey="value"
                  nameKey="name"
                  label
                >
                  {fluxoByEtapa.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${glassStyle} overflow-x-auto max-h-[500px] overflow-y-auto`}>
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-white/20 uppercase tracking-wider">
                {headers.map((header) => (
                  <th key={header} className="p-6 text-left text-white font-bold bg-white/5 sticky top-0">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={index} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                  {headers.map((header) => {
                    const value = row[header as keyof Row];
                    const displayValue =
                      typeof value === 'number' ? value.toLocaleString('pt-BR') : String(value);
                    return (
                      <td key={header} className="p-6 align-top">
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-xl">Nenhum dado encontrado com os filtros aplicados.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
