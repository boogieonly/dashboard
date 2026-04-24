'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  Line
} from 'recharts';
import { Upload, Calendar, User, Package, Filter } from 'lucide-react';

type Row = {
  data: string;
  vendedor: string;
  produto: string;
  faturado: number;
  vendas: number;
  atraso: number;
};

const excelDateToJSDate = (serial: number): string => {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  const date_str = date_info.toISOString().split('T')[0];
  return date_str;
};

const DiarioPage: React.FC = () => {
  const [data, setData] = useState<Row[]>([]);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedVendedor, setSelectedVendedor] = useState<string>('');
  const [selectedProduto, setSelectedProduto] = useState<string>('');

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('diarioData');
      if (saved) {
        setData(JSON.parse(saved));
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('diarioData', JSON.stringify(data));
    }
  }, [data]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

      const parsedData: Row[] = jsonData.map((row) => ({
        data:
          typeof row.Data === 'number'
            ? excelDateToJSDate(row.Data)
            : new Date(row.Data as string).toISOString().split('T')[0],
        vendedor: String(row.Vendedor || ''),
        produto: String(row.Produto || ''),
        faturado: parseFloat(String(row.Faturado || 0)) || 0,
        vendas: parseFloat(String(row.Vendas || 0)) || 0,
        atraso: parseFloat(String(row.Atraso || 0)) || 0,
      })).filter((row) => row.faturado > 0 || row.vendas > 0);

      setData(parsedData);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const rowDate = row.data;
      if (dateFrom && rowDate < dateFrom) return false;
      if (dateTo && rowDate > dateTo) return false;
      if (selectedVendedor && row.vendedor !== selectedVendedor) return false;
      if (selectedProduto && row.produto !== selectedProduto) return false;
      return true;
    });
  }, [data, dateFrom, dateTo, selectedVendedor, selectedProduto]);

  const uniqueVendedores = useMemo(
    () => Array.from(new Set(data.map((d) => d.vendedor).filter(Boolean))).sort(),
    [data]
  );

  const uniqueProdutos = useMemo(
    () => Array.from(new Set(data.map((d) => d.produto).filter(Boolean))).sort(),
    [data]
  );

  const kpis = useMemo(() => {
    const totalFaturado = filteredData.reduce((sum, row) => sum + row.faturado, 0);
    const totalVendas = filteredData.reduce((sum, row) => sum + row.vendas, 0);
    const totalAtrasos = filteredData.reduce((sum, row) => sum + row.atraso, 0);
    const previsao = totalFaturado * 1.1;
    return { faturado: totalFaturado, vendido: totalVendas, atrasos: totalAtrasos, previsao };
  }, [filteredData]);

  const chart1Data = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredData.forEach((row) => {
      grouped[row.vendedor] = (grouped[row.vendedor] || 0) + row.faturado;
    });
    return Object.entries(grouped)
      .map(([vendedor, faturado]) => ({ vendedor, faturado }))
      .sort((a, b) => b.faturado - a.faturado);
  }, [filteredData]);

  const chart2Data = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredData.forEach((row) => {
      const month = row.data.substring(0, 7);
      grouped[month] = (grouped[month] || 0) + row.faturado;
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, faturado]) => ({ month, faturado }));
  }, [filteredData]);

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedVendedor('');
    setSelectedProduto('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-4">
            Diário Dashboard
          </h1>
          <p className="text-xl text-white/70">Power BI Style Analytics</p>
        </div>

        {/* Upload & Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <div>
            <label
              htmlFor="file-upload"
              className="block w-full p-8 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl cursor-pointer transition-all duration-300 group"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-indigo-400 group-hover:scale-110 transition" />
              <div className="text-2xl font-bold text-white text-center mb-2">Upload Excel (xlsx)</div>
              <p className="text-white/60 text-center">Colunas: Data, Vendedor, Produto, Faturado, Vendas, Atraso</p>
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <Filter className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xl font-bold text-white">Filtros</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> De
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full p-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Até
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full p-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-1">
                    <User className="w-4 h-4" /> Vendedor
                  </label>
                  <select
                    value={selectedVendedor}
                    onChange={(e) => setSelectedVendedor(e.target.value)}
                    className="w-full p-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  >
                    <option value="">Todos</option>
                    {uniqueVendedores.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-1">
                    <Package className="w-4 h-4" /> Produto
                  </label>
                  <select
                    value={selectedProduto}
                    onChange={(e) => setSelectedProduto(e.target.value)}
                    className="w-full p-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  >
                    <option value="">Todos</option>
                    {uniqueProdutos.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={clearFilters}
                className="mt-4 w-full bg-indigo-500/80 hover:bg-indigo-400 text-white py-2 px-6 rounded-xl font-semibold transition shadow-lg hover:shadow-2xl"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg rounded-3xl p-8 border border-green-500/30 shadow-2xl hover:scale-[1.02] transition-all duration-300">
            <div className="text-4xl font-black text-green-400 mb-2">R$ {kpis.faturado.toLocaleString('pt-BR')}</div>
            <div className="text-white/80 font-semibold text-lg">Faturado</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg rounded-3xl p-8 border border-blue-500/30 shadow-2xl hover:scale-[1.02] transition-all duration-300">
            <div className="text-4xl font-black text-blue-400 mb-2">{kpis.vendido.toLocaleString('pt-BR')}</div>
            <div className="text-white/80 font-semibold text-lg">Vendido</div>
          </div>
          <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-lg rounded-3xl p-8 border border-red-500/30 shadow-2xl hover:scale-[1.02] transition-all duration-300">
            <div className="text-4xl font-black text-red-400 mb-2">{kpis.atrasos.toLocaleString('pt-BR')}</div>
            <div className="text-white/80 font-semibold text-lg">Atrasos</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-lg rounded-3xl p-8 border border-yellow-500/30 shadow-2xl hover:scale-[1.02] transition-all duration-300">
            <div className="text-4xl font-black text-yellow-400 mb-2">R$ {kpis.previsao.toLocaleString('pt-BR')}</div>
            <div className="text-white/80 font-semibold text-lg">Previsão</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              Faturado por Vendedor
            </h2>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={chart1Data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="white/10" />
                <XAxis dataKey="vendedor" stroke="white" fontSize={14} />
                <YAxis stroke="white" fontSize={14} />
                <Tooltip />
                <Legend />
                <Bar dataKey="faturado" fill="url(#gradient)" />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8884d8" />
                    <stop offset="100%" stopColor="#a48ef8" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              Evolução Faturado Mensal
            </h2>
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={chart2Data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="white/10" />
                <XAxis dataKey="month" stroke="white" fontSize={14} />
                <YAxis stroke="white" fontSize={14} />
                <Tooltip />
                <Line type="monotone" dataKey="faturado" stroke="#8884d8" strokeWidth={4} dot={{ fill: '#8884d8', strokeWidth: 2 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              Tabela Premium ({filteredData.length} registros)
            </h2>
          </div>
          {filteredData.length === 0 ? (
            <div className="text-center py-20 text-white/50">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Nenhum dado carregado ou filtrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/10 backdrop-blur-sm sticky top-0 z-10">
                    <th className="p-4 text-left font-bold text-white uppercase tracking-wider border-b border-white/20">Data</th>
                    <th className="p-4 text-left font-bold text-white uppercase tracking-wider border-b border-white/20">Vendedor</th>
                    <th className="p-4 text-left font-bold text-white uppercase tracking-wider border-b border-white/20">Produto</th>
                    <th className="p-4 text-left font-bold text-white uppercase tracking-wider border-b border-white/20">Faturado</th>
                    <th className="p-4 text-left font-bold text-white uppercase tracking-wider border-b border-white/20">Vendas</th>
                    <th className="p-4 text-left font-bold text-white uppercase tracking-wider border-b border-white/20">Atraso</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, index) => (
                    <tr
                      key={index}
                      className="hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
                    >
                      <td className="p-4 font-mono text-white/90">{row.data}</td>
                      <td className="p-4 font-semibold text-white/90">{row.vendedor}</td>
                      <td className="p-4 text-white/80">{row.produto}</td>
                      <td className="p-4 font-mono text-green-400 font-bold">R$ {row.faturado.toLocaleString('pt-BR')}</td>
                      <td className="p-4 font-mono text-blue-400">{row.vendas.toLocaleString('pt-BR')}</td>
                      <td className={`p-4 font-mono ${row.atraso > 0 ? 'text-red-400 font-bold' : 'text-white/70'}`}>
                        {row.atraso} dias
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiarioPage;
