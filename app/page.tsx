"use client";

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
} from 'recharts';
import { Upload, Filter, Download, Package, DollarSign, Target, Users, TrendingUp, Activity } from 'lucide-react';

type SalesData = {
  Data: string;
  Regiao: string;
  Produto: string;
  Vendedor: string;
  Cliente: string;
  Valor: number;
  Meta: number;
  Etapa: string;
  Material: string;
  Peso: number;
};

type Filters = {
  inicio: string;
  fim: string;
  regiao: string;
  produto: string;
  vendedor: string;
  material: string;
};

type KPIs = {
  volumeTotal: number;
  valorTotal: number;
  atingimento: number;
  oportunidades: number;
};

export default function DashboardPage() {
  const [data, setData] = useState<SalesData[]>([]);
  const [filters, setFilters] = useState<Filters>({
    inicio: '',
    fim: '',
    regiao: '',
    produto: '',
    vendedor: '',
    material: '',
  });

  const parseDate = useCallback((dateStr: string): Date | null => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) return date;
    const parts = dateStr.split(/[\-\/\.]/);
    if (parts.length === 3) {
      return new Date(
        parseInt(parts[2]),
        parseInt(parts[1]) - 1,
        parseInt(parts[0])
      );
    }
    return null;
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((d) => {
      // Date filter
      const rowDate = parseDate(d.Data);
      const inicioDate = filters.inicio ? new Date(filters.inicio) : null;
      const fimDate = filters.fim ? new Date(filters.fim) : null;
      if (rowDate) {
        if (inicioDate && rowDate < inicioDate) return false;
        if (fimDate && rowDate > fimDate) return false;
      }

      // Other filters
      if (filters.regiao && d.Regiao !== filters.regiao) return false;
      if (filters.produto && d.Produto !== filters.produto) return false;
      if (filters.vendedor && d.Vendedor !== filters.vendedor) return false;
      if (filters.material && d.Material !== filters.material) return false;

      return true;
    });
  }, [data, filters, parseDate]);

  const kpis: KPIs = useMemo(() => {
    const volumeTotal = filteredData.reduce((sum, d) => sum + (d.Peso || 0), 0);
    const valorTotal = filteredData.reduce((sum, d) => sum + (d.Valor || 0), 0);
    const metaTotal = filteredData.reduce((sum, d) => sum + (d.Meta || 0), 0);
    const oportunidades = filteredData.length;
    const atingimento = metaTotal > 0 ? Math.min((valorTotal / metaTotal) * 100, 100) : 0;
    return { volumeTotal, valorTotal, atingimento, oportunidades };
  }, [filteredData]);

  const materialStats = useMemo(() => {
    const stats: Record<string, { volume: number; valor: number }> = {
      Cobre: { volume: 0, valor: 0 },
      Latão: { volume: 0, valor: 0 },
      Alumínio: { volume: 0, valor: 0 },
      Inox: { volume: 0, valor: 0 },
      Outros: { volume: 0, valor: 0 },
    };
    filteredData.forEach((d) => {
      let cat = d.Material;
      if (!['Cobre', 'Latão', 'Alumínio', 'Inox'].includes(cat)) {
        cat = 'Outros';
      }
      stats[cat].volume += d.Peso || 0;
      stats[cat].valor += d.Valor || 0;
    });
    return stats;
  }, [filteredData]);

  const faturamentoPorData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredData.forEach((d) => {
      const dateKey = parseDate(d.Data)?.toISOString().split('T')[0] || '';
      if (dateKey) {
        grouped[dateKey] = (grouped[dateKey] || 0) + (d.Valor || 0);
      }
    });
    return Object.entries(grouped)
      .map(([date, valor]) => ({ date, valor: Number(valor.toFixed(2)) }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredData, parseDate]);

  const etapasData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredData.forEach((d) => {
      const etapa = d.Etapa || 'Sem Etapa';
      grouped[etapa] = (grouped[etapa] || 0) + 1;
    });
    return Object.entries(grouped).map(([etapa, count]) => ({ etapa, count }));
  }, [filteredData]);

  const topClientes = useMemo(() => {
    const grouped: Record<string, { volume: number; valor: number }> = {};
    filteredData.forEach((d) => {
      const cliente = d.Cliente || 'Desconhecido';
      if (!grouped[cliente]) {
        grouped[cliente] = { volume: 0, valor: 0 };
      }
      grouped[cliente].volume += d.Peso || 0;
      grouped[cliente].valor += d.Valor || 0;
    });
    return Object.entries(grouped)
      .map(([cliente, stats]) => ({ cliente, ...stats }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);
  }, [filteredData]);

  const uniqueOptions = useMemo(() => ({
    regioes: Array.from(new Set(data.map((d) => d.Regiao).filter(Boolean))),
    produtos: Array.from(new Set(data.map((d) => d.Produto).filter(Boolean))),
    vendedores: Array.from(new Set(data.map((d) => d.Vendedor).filter(Boolean))),
    materiais: Array.from(new Set(data.map((d) => d.Material).filter(Boolean))),
  }), [data]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const arrayBuffer = evt.target?.result as ArrayBuffer;
      if (arrayBuffer) {
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet) || [];

        const parsedData: SalesData[] = jsonData.map((row) => ({
          Data: row.Data?.toString() || '',
          Regiao: row.Regiao?.toString() || '',
          Produto: row.Produto?.toString() || '',
          Vendedor: row.Vendedor?.toString() || '',
          Cliente: row.Cliente?.toString() || '',
          Valor: parseFloat(row.Valor?.toString() || '0'),
          Meta: parseFloat(row.Meta?.toString() || '0'),
          Etapa: row.Etapa?.toString() || '',
          Material: row.Material?.toString() || '',
          Peso: parseFloat(row.Peso?.toString() || '0'),
        }));
        setData(parsedData);
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const updateFilter = useCallback((key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const exportToCSV = useCallback(() => {
    const headers = ['Data', 'Regiao', 'Produto', 'Vendedor', 'Cliente', 'Valor', 'Meta', 'Etapa', 'Material', 'Peso'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map((row) =>
        headers.map((header) => `"${String((row as any)[header] || '')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dashboard_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredData]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('pt-BR');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-500 text-white p-8 rounded-3xl mb-12 text-center shadow-2xl backdrop-blur-xl border border-white/20">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">Dashboard Comercial</h1>
          <p className="text-xl opacity-90">Métricas de Volume, Valor e Performance</p>
        </header>

        {/* Upload Section */}
        <div className="mb-12 p-12 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl text-center transition-all hover:shadow-3xl">
          <Upload className="w-16 h-16 mx-auto mb-6 text-blue-400" />
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 mx-auto block"
          />
          {data.length === 0 ? (
            <p className="text-gray-400 mt-4">Carregue um arquivo Excel para visualizar as métricas</p>
          ) : (
            <p className="text-green-400 mt-4">{data.length} registros carregados</p>
          )}
        </div>

        {/* Filters */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <Filter className="w-6 h-6 mr-3 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Filtros</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20">
              <label className="block text-sm font-medium text-gray-300 mb-2">Período Início</label>
              <input
                type="date"
                value={filters.inicio}
                onChange={(e) => updateFilter('inicio', e.target.value)}
                className="w-full p-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20">
              <label className="block text-sm font-medium text-gray-300 mb-2">Período Fim</label>
              <input
                type="date"
                value={filters.fim}
                onChange={(e) => updateFilter('fim', e.target.value)}
                className="w-full p-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20">
              <label className="block text-sm font-medium text-gray-300 mb-2">Região</label>
              <select
                value={filters.regiao}
                onChange={(e) => updateFilter('regiao', e.target.value)}
                className="w-full p-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                {uniqueOptions.regioes.map((regiao) => (
                  <option key={regiao} value={regiao}>
                    {regiao}
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20">
              <label className="block text-sm font-medium text-gray-300 mb-2">Produto</label>
              <select
                value={filters.produto}
                onChange={(e) => updateFilter('produto', e.target.value)}
                className="w-full p-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                {uniqueOptions.produtos.map((produto) => (
                  <option key={produto} value={produto}>
                    {produto}
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20">
              <label className="block text-sm font-medium text-gray-300 mb-2">Vendedor</label>
              <select
                value={filters.vendedor}
                onChange={(e) => updateFilter('vendedor', e.target.value)}
                className="w-full p-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                {uniqueOptions.vendedores.map((vendedor) => (
                  <option key={vendedor} value={vendedor}>
                    {vendedor}
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20">
              <label className="block text-sm font-medium text-gray-300 mb-2">Material</label>
              <select
                value={filters.material}
                onChange={(e) => updateFilter('material', e.target.value)}
                className="w-full p-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                {uniqueOptions.materiais.map((material) => (
                  <option key={material} value={material}>
                    {material}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={exportToCSV}
              disabled={filteredData.length === 0}
              className="flex items-center px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-2xl hover:from-green-600 hover:to-emerald-700 shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5 mr-2" />
              Exportar Dados Filtrados ({filteredData.length})
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl hover:shadow-3xl transition-all text-center">
            <Package className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-1">{formatNumber(kpis.volumeTotal)}</div>
            <div className="text-gray-300">Volume Total (kg)</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl hover:shadow-3xl transition-all text-center">
            <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-1">{formatCurrency(kpis.valorTotal)}</div>
            <div className="text-gray-300">Valor Total (R$)</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl hover:shadow-3xl transition-all text-center">
            <Target className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-1">{kpis.atingimento.toFixed(1)}%</div>
            <div className="text-gray-300">Atingimento de Meta</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl hover:shadow-3xl transition-all text-center">
            <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-1">{kpis.oportunidades}</div>
            <div className="text-gray-300">Oportunidades</div>
          </div>
        </div>

        {/* Material Cards */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
            <TrendingUp className="w-8 h-8 mr-3 text-blue-400" />
            Materiais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {Object.entries(materialStats).map(([material, stats]) => {
              const progress = kpis.volumeTotal > 0 ? (stats.volume / kpis.volumeTotal) * 100 : 0;
              return (
                <div key={material} className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-2xl hover:shadow-3xl transition-all">
                  <h3 className="text-xl font-bold text-white mb-4 capitalize">{material}</h3>
                  <div className="text-2xl font-bold text-white mb-2">{formatNumber(stats.volume)} kg</div>
                  <div className="text-lg text-gray-300 mb-4">{formatCurrency(stats.valor)}</div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-right text-sm text-gray-400 mt-1">{progress.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Volume por Material */}
          <div className="lg:col-span-1 bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Activity className="w-6 h-6 mr-2 text-blue-400" />
              Volume por Material (kg)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(materialStats).map(([name, s]) => ({ name, volume: s.volume }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="volume" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Evolução Faturamento */}
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-green-400" />
              Evolução Faturamento (R$)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={faturamentoPorData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="valor" stroke="#10B981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Fluxo Comercial (Funil) */}
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Activity className="w-6 h-6 mr-2 text-purple-400" />
              Fluxo Comercial
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={etapasData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="etapa" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Clientes Table */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
            <Users className="w-8 h-8 mr-3 text-indigo-400" />
            Top 10 Clientes
          </h2>
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-white/20">
                  <th className="p-6 text-left text-lg font-bold text-white">Cliente</th>
                  <th className="p-6 text-right text-lg font-bold text-white">Volume (kg)</th>
                  <th className="p-6 text-right text-lg font-bold text-white">Valor (R$)</th>
                </tr>
              </thead>
              <tbody>
                {topClientes.map(({ cliente, volume, valor }, index) => (
                  <tr key={cliente} className="border-t border-white/10 hover:bg-white/5 transition">
                    <td className="p-6 font-semibold text-white">{cliente}</td>
                    <td className="p-6 text-right text-gray-300">{formatNumber(volume)}</td>
                    <td className="p-6 text-right text-green-400 font-bold">{formatCurrency(valor)}</td>
                  </tr>
                ))}
                {topClientes.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-12 text-center text-gray-500">
                      Sem dados para exibir
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
}
