'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import FechamentoMensal from './components/FechamentoMensal';

type Row = {
  data: string;
  regiao: string;
  produto: string;
  vendedor: string;
  material: string;
  peso: number;
  valor: number;
};

type Filters = {
  periodoFrom: string;
  periodoTo: string;
  regiao: string;
  produto: string;
  vendedor: string;
  material: string;
};

type Totals = {
  totalPeso: number;
  totalValor: number;
};

type MaterialCard = {
  material: string;
  peso: number;
  valor: number;
};

type BarDatum = {
  name: string;
  volume: number;
};

type LineDatum = {
  date: string;
  faturamento: number;
};

type PieDatum = {
  name: string;
  value: number;
  fill: string;
};

export default function Dashboard() {
  const [salesData, setSalesData] = useState<Row[]>([]);
  const [filters, setFilters] = useState<Filters>({
    periodoFrom: '',
    periodoTo: '',
    regiao: '',
    produto: '',
    vendedor: '',
    material: '',
  });
  const [totals, setTotals] = useState<Totals>({ totalPeso: 0, totalValor: 0 });
  const [materials, setMaterials] = useState<MaterialCard[]>([]);
  const [barData, setBarData] = useState<BarDatum[]>([]);
  const [lineData, setLineData] = useState<LineDatum[]>([]);
  const [pieData, setPieData] = useState<PieDatum[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const parseDate = useCallback((dateStr: string): Date => {
    if (!dateStr) return new Date(0);
    const parts = dateStr.split('/').map(Number);
    if (parts.length !== 3) return new Date(0);
    const [dd, mm, yyyy] = parts;
    return new Date(yyyy, mm - 1, dd);
  }, []);

  const formatToDDMM = useCallback((dateStr: string): string => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }, []);

  const applyFilters = useCallback((data: Row[], f: Filters): Row[] => {
    return data.filter((row) => {
      const date = parseDate(row.data);
      const fromDate = f.periodoFrom ? parseDate(f.periodoFrom) : null;
      const toDate = f.periodoTo ? parseDate(f.periodoTo) : null;

      if (fromDate && date < fromDate) return false;
      if (toDate && date > toDate) return false;
      if (f.regiao && row.regiao !== f.regiao) return false;
      if (f.produto && row.produto !== f.produto) return false;
      if (f.vendedor && row.vendedor !== f.vendedor) return false;
      if (f.material && row.material !== f.material) return false;
      return true;
    });
  }, [parseDate]);

  const computeTotals = useCallback((data: Row[]): Totals => {
    return data.reduce(
      (acc, row) => ({
        totalPeso: acc.totalPeso + row.peso,
        totalValor: acc.totalValor + row.valor,
      }),
      { totalPeso: 0, totalValor: 0 }
    );
  }, []);

  const computeMaterials = useCallback((data: Row[]): MaterialCard[] => {
    const map = new Map<string, { peso: number; valor: number }>();
    for (const row of data) {
      const entry = map.get(row.material) || { peso: 0, valor: 0 };
      entry.peso += row.peso;
      entry.valor += row.valor;
      map.set(row.material, entry);
    }
    return Array.from(map.entries())
      .map(([material, { peso, valor }]) => ({ material, peso, valor }))
      .sort((a, b) => b.peso - a.peso);
  }, []);

  const computeBarData = useCallback((data: Row[]): BarDatum[] => {
    const map = new Map<string, number>();
    for (const row of data) {
      const vol = map.get(row.regiao) || 0;
      map.set(row.regiao, vol + row.peso);
    }
    return Array.from(map.entries())
      .map(([name, volume]) => ({ name, volume }))
      .sort((a, b) => b.volume - a.volume);
  }, []);

  const computeLineData = useCallback((data: Row[]): LineDatum[] => {
    const map = new Map<string, number>();
    for (const row of data) {
      const date = parseDate(row.data);
      const key = date.toISOString().slice(0, 7);
      const fat = map.get(key) || 0;
      map.set(key, fat + row.valor);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, faturamento]) => ({ date, faturamento }));
  }, [parseDate]);

  const computePieData = useCallback((data: Row[]): PieDatum[] => {
    const map = new Map<string, number>();
    for (const row of data) {
      const val = map.get(row.produto) || 0;
      map.set(row.produto, val + row.peso);
    }
    const COLORS = [
      '#0088FE',
      '#00C49F',
      '#FFBB28',
      '#FF8042',
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40',
    ];
    const entries = Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    return entries.map((entry, i) => ({
      ...entry,
      fill: COLORS[i % COLORS.length],
    }));
  }, []);

  const filteredData = useMemo(
    () => applyFilters(salesData, filters),
    [salesData, filters, applyFilters]
  );

  useEffect(() => {
    setTotals(computeTotals(filteredData));
    setMaterials(computeMaterials(filteredData));
    setBarData(computeBarData(filteredData));
    setLineData(computeLineData(filteredData));
    setPieData(computePieData(filteredData));
  }, [filteredData, computeTotals, computeMaterials, computeBarData, computeLineData, computePieData]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result as string;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json<Row>(ws);
      setSalesData(jsonData as Row[]);
      setLastUpdate(new Date());
    };
    reader.readAsBinaryString(file);
  };

  const handleClear = () => {
    setSalesData([]);
    setLastUpdate(null);
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dados Filtrados');
    XLSX.writeFile(wb, `dashboard-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const regioes = useMemo(
    () => Array.from(new Set(salesData.map((r) => r.regiao))).sort(),
    [salesData]
  );
  const produtos = useMemo(
    () => Array.from(new Set(salesData.map((r) => r.produto))).sort(),
    [salesData]
  );
  const vendedores = useMemo(
    () => Array.from(new Set(salesData.map((r) => r.vendedor))).sort(),
    [salesData]
  );
  const materiais = useMemo(
    () => Array.from(new Set(salesData.map((r) => r.material))).sort(),
    [salesData]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-4 sm:p-8 lg:p-12 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between">
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => fileRef.current?.click()}
              className="backdrop-blur-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white px-6 py-3 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 font-medium"
            >
              Importar Excel 📁
            </button>
            <button
              onClick={handleClear}
              className="backdrop-blur-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white px-6 py-3 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 font-medium"
              disabled={salesData.length === 0}
            >
              Limpar Dados 🗑️
            </button>
            <button
              onClick={handleExport}
              className="backdrop-blur-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border border-white/30 text-white px-6 py-3 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 font-medium"
              disabled={filteredData.length === 0}
            >
              Exportar Excel 💾
            </button>
          </div>
          <div className="text-white/80 text-sm">
            Última atualização: {lastUpdate ? lastUpdate.toLocaleString('pt-BR') : 'Nenhuma'}
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleUpload}
          className="hidden"
        />

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 group">
            <div
              className="text-5xl cursor-pointer mb-4 group-hover:scale-110 transition-transform"
              onClick={() => copyToClipboard(totals.totalPeso.toLocaleString())}
              title="Copiar peso total"
            >
              ⚖️
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Peso Total</h3>
            <p className="text-4xl font-black text-white/90">
              {totals.totalPeso.toLocaleString()} kg
            </p>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 group">
            <div
              className="text-5xl cursor-pointer mb-4 group-hover:scale-110 transition-transform"
              onClick={() => copyToClipboard(totals.totalValor.toLocaleString())}
              title="Copiar valor total"
            >
              💰
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Valor Total</h3>
            <p className="text-4xl font-black text-white/90">
              R$ {totals.totalValor.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Filters */}
        <details className="mb-8 backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl shadow-2xl">
          <summary className="p-6 text-xl font-bold text-white cursor-pointer list-none hover:bg-white/10 rounded-2xl transition-all">
            Filtros 🔍
          </summary>
          <div className="p-8 border-t border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-white/80 mb-2 font-medium">Período De</label>
                <input
                  type="date"
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      periodoFrom: e.target.value ? formatToDDMM(e.target.value) : '',
                    }))
                  }
                  className="w-full backdrop-blur-xl bg-white/20 border border-white/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2 font-medium">Período Até</label>
                <input
                  type="date"
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      periodoTo: e.target.value ? formatToDDMM(e.target.value) : '',
                    }))
                  }
                  className="w-full backdrop-blur-xl bg-white/20 border border-white/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2 font-medium">Região</label>
                <select
                  value={filters.regiao}
                  onChange={(e) => setFilters((prev) => ({ ...prev, regiao: e.target.value }))}
                  className="w-full backdrop-blur-xl bg-white/20 border border-white/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="">Todas Regiões</option>
                  {regioes.map((regiao) => (
                    <option key={regiao} value={regiao}>
                      {regiao}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/80 mb-2 font-medium">Produto</label>
                <select
                  value={filters.produto}
                  onChange={(e) => setFilters((prev) => ({ ...prev, produto: e.target.value }))}
                  className="w-full backdrop-blur-xl bg-white/20 border border-white/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="">Todos Produtos</option>
                  {produtos.map((produto) => (
                    <option key={produto} value={produto}>
                      {produto}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/80 mb-2 font-medium">Vendedor</label>
                <select
                  value={filters.vendedor}
                  onChange={(e) => setFilters((prev) => ({ ...prev, vendedor: e.target.value }))}
                  className="w-full backdrop-blur-xl bg-white/20 border border-white/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="">Todos Vendedores</option>
                  {vendedores.map((vendedor) => (
                    <option key={vendedor} value={vendedor}>
                      {vendedor}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/80 mb-2 font-medium">Material</label>
                <select
                  value={filters.material}
                  onChange={(e) => setFilters((prev) => ({ ...prev, material: e.target.value }))}
                  className="w-full backdrop-blur-xl bg-white/20 border border-white/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="">Todos Materiais</option>
                  {materiais.map((material) => (
                    <option key={material} value={material}>
                      {material}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </details>

        {/* Materials Grid */}
        {materials.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">Materiais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {materials.map((item, index) => (
                <div
                  key={item.material}
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
                >
                  <h4 className="font-bold text-white text-lg mb-2 truncate">{item.material}</h4>
                  <p className="text-white/80 mb-1">{item.peso.toLocaleString()} kg</p>
                  <p className="text-white/90 font-semibold">R$ {item.valor.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {/* Bar Chart - Volume por Região */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl lg:col-span-1 xl:col-span-1">
            <h3 className="text-2xl font-bold text-white mb-6">Volume por Região</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="white/20" vertical={false} />
                <XAxis dataKey="name" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Legend />
                <Bar dataKey="volume" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart - Faturamento Mensal */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl lg:col-span-1 xl:col-span-1">
            <h3 className="text-2xl font-bold text-white mb-6">Faturamento Mensal</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="white/20" vertical={false} />
                <XAxis dataKey="date" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="faturamento" stroke="#8884d8" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Fluxo por Produto */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl lg:col-span-1 xl:col-span-1">
            <h3 className="text-2xl font-bold text-white mb-6">Fluxo por Produto</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Table */}
        {filteredData.length > 0 && (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden mb-12">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-3xl font-bold text-white">Dados Filtrados ({filteredData.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="bg-white/5">
                    <th className="p-4 text-left font-bold">Data</th>
                    <th className="p-4 text-left font-bold">Região</th>
                    <th className="p-4 text-left font-bold">Produto</th>
                    <th className="p-4 text-left font-bold">Vendedor</th>
                    <th className="p-4 text-left font-bold">Material</th>
                    <th className="p-4 text-right font-bold">Peso (kg)</th>
                    <th className="p-4 text-right font-bold">Valor (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, index) => (
                    <tr key={`${row.data}-${row.vendedor}-${index}`} className="border-t border-white/10 hover:bg-white/10 transition-all">
                      <td className="p-4">{row.data}</td>
                      <td className="p-4">{row.regiao}</td>
                      <td className="p-4">{row.produto}</td>
                      <td className="p-4">{row.vendedor}</td>
                      <td className="p-4">{row.material}</td>
                      <td className="p-4 text-right">{row.peso.toLocaleString()}</td>
                      <td className="p-4 text-right font-semibold">R$ {row.valor.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Fechamento Mensal */}
        <FechamentoMensal />
      </div>
    </div>
  );
}
