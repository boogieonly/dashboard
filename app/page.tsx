'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
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

type Sale = {
  Data: string;
  Regiao: string;
  Produto: string;
  Vendedor: string;
  Peso: number;
  Valor: number;
  Material: string;
  Meta: number;
  Etapa: string;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384'];

const glassStyle = "backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]";

const Page = () => {
  const [data, setData] = useState<Sale[]>([]);
  const [filteredData, setFilteredData] = useState<Sale[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filterRegiao, setFilterRegiao] = useState('');
  const [filterProduto, setFilterProduto] = useState('');
  const [filterVendedor, setFilterVendedor] = useState('');
  const [filterMaterial, setFilterMaterial] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pesoTotal = useMemo(
    () => filteredData.reduce((sum, d) => sum + d.Peso, 0),
    [filteredData]
  );
  const valorTotal = useMemo(
    () => filteredData.reduce((sum, d) => sum + d.Valor, 0),
    [filteredData]
  );

  const materialVolumes = useMemo(() => {
    const groups: Record<string, number> = {};
    filteredData.forEach((d) => {
      groups[d.Material] = (groups[d.Material] || 0) + d.Peso;
    });
    return Object.entries(groups)
      .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  const evolutionData = useMemo(() => {
    const groups: Record<string, number> = {};
    filteredData.forEach((d) => {
      const date = new Date(d.Data);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      groups[month] = (groups[month] || 0) + d.Valor;
    });
    return Object.keys(groups)
      .sort()
      .map((month) => ({ month, valor: Number(groups[month].toFixed(2)) }));
  }, [filteredData]);

  const fluxoData = useMemo(() => {
    const groups: Record<string, number> = {};
    filteredData.forEach((d) => {
      groups[d.Etapa] = (groups[d.Etapa] || 0) + d.Valor;
    });
    const total = Object.values(groups).reduce((s, v) => s + v, 0);
    return Object.entries(groups)
      .map(([name, value]) => ({ name, value: total > 0 ? (value / total) * 100 : 0 }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  const topMaterials = useMemo(() => materialVolumes.slice(0, 5), [materialVolumes]);

  React.useEffect(() => {
    const newFiltered = data.filter((d) =>
      (!fromDate || d.Data >= fromDate) &&
      (!toDate || d.Data <= toDate) &&
      (!filterRegiao || d.Regiao.toLowerCase().includes(filterRegiao.toLowerCase())) &&
      (!filterProduto || d.Produto.toLowerCase().includes(filterProduto.toLowerCase())) &&
      (!filterVendedor || d.Vendedor.toLowerCase().includes(filterVendedor.toLowerCase())) &&
      (!filterMaterial || d.Material.toLowerCase().includes(filterMaterial.toLowerCase()))
    );
    setFilteredData(newFiltered);
  }, [data, fromDate, toDate, filterRegiao, filterProduto, filterVendedor, filterMaterial]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const arrayBuffer = evt.target?.result as ArrayBuffer;
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const json: any[] = XLSX.utils.sheet_to_json(ws);

      const parsed: Sale[] = json.map((row) => ({
        Data: row.Data?.toString() || '',
        Regiao: row.Regiao?.toString() || '',
        Produto: row.Produto?.toString() || '',
        Vendedor: row.Vendedor?.toString() || '',
        Peso: parseFloat(row.Peso?.toString() || '0'),
        Valor: parseFloat(row.Valor?.toString() || '0'),
        Material: row.Material?.toString() || '',
        Meta: parseFloat(row.Meta?.toString() || '0'),
        Etapa: row.Etapa?.toString() || '',
      }));
      setData(parsed);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleClearData = () => {
    setData([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vendas');
    XLSX.writeFile(wb, 'dashboard_vendas.xlsx');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 md:py-12 space-y-8">
        {/* Header */}
        <div className={`${glassStyle} p-6 md:p-8 rounded-3xl`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-8">
            <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl">
              📊 Dashboard de Vendas
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`${glassStyle} px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 text-lg hover:bg-white/20 transition-all`}
              >
                🚀 Importar Excel
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={handleClearData}
                className={`${glassStyle} px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 text-lg hover:bg-white/20 transition-all`}
                disabled={!data.length}
              >
                🧹 Limpar Dados
              </button>
              <button
                onClick={handleExportExcel}
                className={`${glassStyle} px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 text-lg hover:bg-white/20 transition-all`}
                disabled={!data.length}
              >
                📤 Exportar Excel
              </button>
            </div>
          </div>
        </div>

        {data.length === 0 ? (
          <div className={`${glassStyle} text-center py-20 text-2xl md:text-4xl font-bold text-white/80`}>
            Carregue uma planilha Excel para começar 📊
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`${glassStyle} p-8 text-center`}>
                <div className="text-4xl md:text-6xl font-black text-green-400 mb-2">⚖️</div>
                <div className="text-2xl md:text-3xl font-bold text-white">Peso Total</div>
                <div className="text-5xl md:text-7xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mt-4">
                  {pesoTotal.toLocaleString('pt-BR')} kg
                </div>
              </div>
              <div className={`${glassStyle} p-8 text-center`}>
                <div className="text-4xl md:text-6xl font-black text-yellow-400 mb-2">💰</div>
                <div className="text-2xl md:text-3xl font-bold text-white">Valor Total</div>
                <div className="text-5xl md:text-7xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mt-4">
                  {valorTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </div>
              </div>
            </div>

            {/* Top Materials Cards */}
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6 text-center">
                Top Materiais
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {topMaterials.map((mat, idx) => (
                  <div key={mat.name} className={`${glassStyle} p-6 text-center`}>
                    <div className="text-4xl mb-4">📦</div>
                    <div className="font-bold text-xl text-white mb-2 truncate">{mat.name}</div>
                    <div className="text-2xl font-black text-green-400">
                      {mat.value.toLocaleString('pt-BR')} kg
                    </div>
                  </div>
                ))}
                {topMaterials.length === 0 && (
                  <div className={`${glassStyle} p-6 col-span-full text-center text-xl text-white/80`}>
                    Sem materiais nos filtros
                  </div>
                )}
              </div>
            </div>

            {/* Filters */}
            <details className={`${glassStyle} p-0`} open>
              <summary className="p-6 md:p-8 text-2xl font-bold bg-gradient-to-r from-purple-500/50 to-pink-500/50 rounded-t-3xl cursor-pointer hover:bg-white/10 transition-all">
                🔍 Filtros ({filteredData.length} registros)
              </summary>
              <div className="p-6 md:p-8 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[250px]">
                  <label className="block text-lg font-semibold text-white mb-2">📅 Período</label>
                  <div className="flex gap-2 flex-wrap">
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="px-4 py-2 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full max-w-[140px]"
                    />
                    <span className="text-white/70 self-center">até</span>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="px-4 py-2 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full max-w-[140px]"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-lg font-semibold text-white mb-2">🌍 Região</label>
                  <input
                    value={filterRegiao}
                    onChange={(e) => setFilterRegiao(e.target.value)}
                    placeholder="Filtrar região..."
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-lg font-semibold text-white mb-2">📦 Produto</label>
                  <input
                    value={filterProduto}
                    onChange={(e) => setFilterProduto(e.target.value)}
                    placeholder="Filtrar produto..."
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-lg font-semibold text-white mb-2">👤 Vendedor</label>
                  <input
                    value={filterVendedor}
                    onChange={(e) => setFilterVendedor(e.target.value)}
                    placeholder="Filtrar vendedor..."
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-lg font-semibold text-white mb-2">🔨 Material</label>
                  <input
                    value={filterMaterial}
                    onChange={(e) => setFilterMaterial(e.target.value)}
                    placeholder="Filtrar material..."
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
            </details>

            {/* Charts */}
            <div className="space-y-8">
              <div className={`${glassStyle} p-2 md:p-6`}>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-6 text-center">
                  📊 Volume por Material
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={materialVolumes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="white/10" />
                    <XAxis dataKey="name" stroke="white" />
                    <YAxis stroke="white" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className={`${glassStyle} p-2 md:p-6`}>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-6 text-center">
                  📈 Evolução de Faturamento
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="white/10" />
                    <XAxis dataKey="month" stroke="white" />
                    <YAxis stroke="white" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="valor" stroke="#8884d8" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className={`${glassStyle} p-2 md:p-6`}>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-6 text-center">
                  🥧 Fluxo Comercial
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={fluxoData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      nameKey="name"
                      label
                    >
                      {fluxoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Table */}
            <div className={`${glassStyle} overflow-hidden`}>
              <h3 className="p-6 md:p-8 text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                📋 Tabela de Dados Filtrados ({filteredData.length})
              </h3>
              {filteredData.length === 0 ? (
                <div className="p-12 text-center text-xl text-white/80">
                  Sem dados com os filtros aplicados 🔍
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm md:text-base">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="p-4 text-left font-bold text-white border-b border-white/20">Data</th>
                        <th className="p-4 text-left font-bold text-white border-b border-white/20">Região</th>
                        <th className="p-4 text-left font-bold text-white border-b border-white/20">Produto</th>
                        <th className="p-4 text-left font-bold text-white border-b border-white/20">Vendedor</th>
                        <th className="p-4 text-left font-bold text-white border-b border-white/20">Peso (kg)</th>
                        <th className="p-4 text-left font-bold text-white border-b border-white/20">Valor (R$)</th>
                        <th className="p-4 text-left font-bold text-white border-b border-white/20">Material</th>
                        <th className="p-4 text-left font-bold text-white border-b border-white/20">Meta</th>
                        <th className="p-4 text-left font-bold text-white border-b border-white/20">Etapa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/10 transition-colors border-b border-white/10">
                          <td className="p-4 text-white/90">{row.Data}</td>
                          <td className="p-4 text-white/90">{row.Regiao}</td>
                          <td className="p-4 text-white/90">{row.Produto}</td>
                          <td className="p-4 text-white/90">{row.Vendedor}</td>
                          <td className="p-4 text-white/90 font-mono">{row.Peso.toLocaleString('pt-BR')}</td>
                          <td className="p-4 text-white/90 font-mono">{row.Valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                          <td className="p-4 text-white/90">{row.Material}</td>
                          <td className="p-4 text-white/90 font-mono">{row.Meta.toLocaleString('pt-BR')}</td>
                          <td className="p-4 text-white/90">{row.Etapa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Final Button */}
            <Link
              href="/fechamento"
              className={`${glassStyle} w-full block p-8 md:p-12 text-center text-2xl md:text-3xl font-black bg-gradient-to-r from-emerald-500/80 to-green-500/80 hover:from-emerald-400 hover:to-green-400 text-white rounded-3xl flex items-center justify-center gap-4 shadow-3xl hover:shadow-4xl max-w-2xl mx-auto`}
            >
              📅 Ir para Fechamento Mensal
            </Link>
          </>
        )}
      </div>
    </main>
  );
};

export default Page;
