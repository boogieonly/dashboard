'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
} from 'recharts';

type DailyData = {
  date: string;
  vendedor: string;
  produto: string;
  faturado: number;
  vendido: number;
  atrasos: number;
  previsao: number;
};

type Filters = {
  date: string;
  vendedor: string;
  produto: string;
};

export default function DiarioPage() {
  const [data, setData] = useState<DailyData[]>([]);
  const [filteredData, setFilteredData] = useState<DailyData[]>([]);
  const [filters, setFilters] = useState<Filters>({ date: '', vendedor: '', produto: '' });
  const [isDragging, setIsDragging] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dailyData');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading data:', e);
      }
    }
  }, []);

  // Filter data
  useEffect(() => {
    let filtered = data;
    if (filters.date) {
      filtered = filtered.filter((d) => d.date === filters.date);
    }
    if (filters.vendedor) {
      filtered = filtered.filter((d) => d.vendedor === filters.vendedor);
    }
    if (filters.produto) {
      filtered = filtered.filter((d) => d.produto === filters.produto);
    }
    setFilteredData(filtered);
  }, [data, filters]);

  const kpis = useMemo(() => ({
    faturado: filteredData.reduce((sum, d) => sum + d.faturado, 0),
    vendido: filteredData.reduce((sum, d) => sum + d.vendido, 0),
    atrasos: filteredData.reduce((sum, d) => sum + d.atrasos, 0),
    previsao: filteredData.reduce((sum, d) => sum + d.previsao, 0),
  }), [filteredData]);

  const salesBySeller = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredData.forEach((d) => {
      grouped[d.vendedor] = (grouped[d.vendedor] || 0) + d.vendido;
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, vendas: value }));
  }, [filteredData]);

  const evolutionData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredData.forEach((d) => {
      grouped[d.date] = (grouped[d.date] || 0) + d.faturado;
    });
    return Object.entries(grouped)
      .map(([date, value]) => ({ date, faturamento: value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData]);

  const vendedores = useMemo(
    () => Array.from(new Set(data.map((d) => d.vendedor))).sort(),
    [data]
  );
  const produtos = useMemo(
    () => Array.from(new Set(data.map((d) => d.produto))).sort(),
    [data]
  );

  const handleFiltersChange = useCallback((key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file || (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls'))) {
      alert('Por favor, selecione um arquivo Excel válido (.xlsx ou .xls).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt: ProgressEvent<FileReader>) => {
      const target = evt.target as FileReader;
      if (!target.result) return;
      const workbook = XLSX.read(target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(sheet);
      const parsed: DailyData[] = json
        .map((row: any) => ({
          date: String(row.data || ''),
          vendedor: String(row.vendedor || ''),
          produto: String(row.produto || ''),
          faturado: Number(row.faturado) || 0,
          vendido: Number(row.vendido) || 0,
          atrasos: Number(row.atrasos) || 0,
          previsao: Number(row.previsao) || 0,
        }))
        .filter((d) => d.vendedor.trim());
      setData(parsed);
      localStorage.setItem('dailyData', JSON.stringify(parsed));
    };
    reader.readAsBinaryString(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const clearData = useCallback(() => {
    setData([]);
    localStorage.removeItem('dailyData');
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 p-6">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Banner Superior */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
            📊 Fechamento Diário Comercial
          </h1>
        </div>

        {/* Seção de Upload */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div
            className={`relative p-12 border-2 border-dashed rounded-3xl transition-all duration-300 cursor-pointer group hover:scale-105 backdrop-blur-xl ${
              isDragging
                ? 'bg-blue-500/20 border-blue-400 scale-105 shadow-2xl shadow-blue-500/25'
                : 'bg-white/10 border-white/20 hover:border-white/40 hover:bg-white/20'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDragEnter={handleDragOver}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-2xl font-bold text-white mb-2">Arraste seu arquivo Excel aqui</h3>
              <p className="text-gray-300 mb-6">ou clique para selecionar</p>
              <p className="text-sm text-gray-400">Suporte a .xlsx e .xls</p>
            </div>
          </div>
          {data.length > 0 && (
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Dados Carregados</h3>
              <p className="text-gray-300">
                Total de registros:{' '}
                <span className="font-bold text-blue-400">{data.length}</span>
              </p>
              <button
                onClick={clearData}
                className="mt-4 px-6 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-xl transition-all"
              >
                Limpar Dados
              </button>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Filtros</h2>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Data</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => handleFiltersChange('date', e.target.value)}
                className="px-4 py-2 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Vendedor</label>
              <select
                value={filters.vendedor}
                onChange={(e) => handleFiltersChange('vendedor', e.target.value)}
                className="px-4 py-2 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                {vendedores.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Produto</label>
              <select
                value={filters.produto}
                onChange={(e) => handleFiltersChange('produto', e.target.value)}
                className="px-4 py-2 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                {produtos.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-400/20 to-green-600/20 backdrop-blur-xl rounded-3xl p-8 border border-green-400/30 hover:scale-105 transition-all">
            <div className="text-3xl font-bold text-green-400 mb-2">
              R$ {kpis.faturado.toLocaleString()}
            </div>
            <div className="text-gray-300 font-medium">Faturado</div>
          </div>
          <div className="bg-gradient-to-br from-blue-400/20 to-blue-600/20 backdrop-blur-xl rounded-3xl p-8 border border-blue-400/30 hover:scale-105 transition-all">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {kpis.vendido.toLocaleString()}
            </div>
            <div className="text-gray-300 font-medium">Vendido</div>
          </div>
          <div className="bg-gradient-to-br from-red-400/20 to-red-600/20 backdrop-blur-xl rounded-3xl p-8 border border-red-400/30 hover:scale-105 transition-all">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {kpis.atrasos.toLocaleString()}
            </div>
            <div className="text-gray-300 font-medium">Atrasos</div>
          </div>
          <div className="bg-gradient-to-br from-purple-400/20 to-purple-600/20 backdrop-blur-xl rounded-3xl p-8 border border-purple-400/30 hover:scale-105 transition-all">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              R$ {kpis.previsao.toLocaleString()}
            </div>
            <div className="text-gray-300 font-medium">Previsão</div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Vendas por Vendedor</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={salesBySeller}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.8)" />
                <YAxis stroke="rgba(255,255,255,0.8)" />
                <Tooltip />
                <Legend />
                <Bar dataKey="vendas" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Evolução do Faturamento</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.8)" />
                <YAxis stroke="rgba(255,255,255,0.8)" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="faturamento" stroke="#8B5CF6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabela de Dados */}
        {filteredData.length > 0 && (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">
                Tabela de Dados ({filteredData.length} registros)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/20 sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-bold text-sm uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-4 text-left text-white font-bold text-sm uppercase tracking-wider">
                      Vendedor
                    </th>
                    <th className="px-6 py-4 text-left text-white font-bold text-sm uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-6 py-4 text-right text-white font-bold text-sm uppercase tracking-wider">
                      Faturado
                    </th>
                    <th className="px-6 py-4 text-right text-white font-bold text-sm uppercase tracking-wider">
                      Vendido
                    </th>
                    <th className="px-6 py-4 text-right text-white font-bold text-sm uppercase tracking-wider">
                      Atrasos
                    </th>
                    <th className="px-6 py-4 text-right text-white font-bold text-sm uppercase tracking-wider">
                      Previsão
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/10 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{row.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{row.vendedor}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{row.produto}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-green-400 font-medium">
                        R$ {row.faturado.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-blue-400 font-medium">
                        {row.vendido.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-red-400 font-medium">
                        {row.atrasos.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-purple-400 font-medium">
                        R$ {row.previsao.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {data.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-3xl font-bold text-white mb-4">Nenhum dado carregado</h2>
            <p className="text-gray-400 text-lg mb-8">
              Arraste um arquivo Excel para começar a análise do Fechamento Diário.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
