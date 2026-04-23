'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
  Peso: number;
  Valor: number;
  Material: string;
  Meta: number;
  Etapa: string;
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
  peso: number;
  valor: number;
};

type MaterialCard = {
  material: string;
  peso: number;
  perc: string;
};

export default function DashboardPage() {
  const [data, setData] = useState<Row[]>([]);
  const [filteredData, setFilteredData] = useState<Row[]>([]);
  const [totals, setTotals] = useState<Totals>({ peso: 0, valor: 0 });
  const [materials, setMaterials] = useState<MaterialCard[]>([]);
  const [barData, setBarData] = useState<{ name: string; peso: number }[]>([]);
  const [lineData, setLineData] = useState<{ name: string; valor: number }[]>([]);
  const [pieData, setPieData] = useState<{ name: string; value: number }[]>([]);
  const [filters, setFilters] = useState<Filters>({
    periodoFrom: '',
    periodoTo: '',
    regiao: '',
    produto: '',
    vendedor: '',
    material: '',
  });
  const [lastUpdate, setLastUpdate] = useState('');

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat('pt-BR'),
    []
  );
  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
    []
  );

  const regioesOptions = useMemo(
    () => (data.length ? Array.from(new Set(data.map((r) => r.Regiao))).sort() : []),
    [data]
  );
  const produtosOptions = useMemo(
    () => (data.length ? Array.from(new Set(data.map((r) => r.Produto))).sort() : []),
    [data]
  );
  const vendedoresOptions = useMemo(
    () => (data.length ? Array.from(new Set(data.map((r) => r.Vendedor))).sort() : []),
    [data]
  );
  const materiaisOptions = useMemo(
    () => (data.length ? Array.from(new Set(data.map((r) => r.Material))).sort() : []),
    [data]
  );

  const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const applyFilters = useCallback((rows: Row[], f: Filters): Row[] => {
    return rows.filter((row) => {
      if (f.regiao && row.Regiao !== f.regiao) return false;
      if (f.produto && row.Produto !== f.produto) return false;
      if (f.vendedor && row.Vendedor !== f.vendedor) return false;
      if (f.material && row.Material !== f.material) return false;
      if (f.periodoFrom) {
        const from = new Date(f.periodoFrom);
        const rowDate = parseDate(row.Data);
        if (rowDate < from) return false;
      }
      if (f.periodoTo) {
        const to = new Date(f.periodoTo);
        to.setHours(23, 59, 59);
        const rowDate = parseDate(row.Data);
        if (rowDate > to) return false;
      }
      return true;
    });
  }, []);

  const computeTotals = (rows: Row[]): Totals => {
    return {
      peso: rows.reduce((acc, row) => acc + (row.Peso || 0), 0),
      valor: rows.reduce((acc, row) => acc + (row.Valor || 0), 0),
    };
  };

  const computeMaterials = (rows: Row[]): MaterialCard[] => {
    if (rows.length === 0) {
      return Array(5).fill({ material: '--', peso: 0, perc: '--' });
    }
    const matMap = new Map<string, number>();
    rows.forEach((r) => {
      matMap.set(r.Material, (matMap.get(r.Material) || 0) + (r.Peso || 0));
    });
    const matList = Array.from(matMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const totalPeso = rows.reduce((sum, r) => sum + (r.Peso || 0), 0);
    const list: MaterialCard[] = matList.map(([material, peso]) => ({
      material,
      peso,
      perc: totalPeso > 0 ? Math.round((peso / totalPeso) * 100) + '%' : '--',
    }));
    while (list.length < 5) {
      list.push({ material: '--', peso: 0, perc: '--' });
    }
    return list;
  };

  const computeLineData = (rows: Row[]): { name: string; valor: number }[] => {
    if (rows.length === 0) return [];
    const monthMap = new Map<string, number>();
    rows.forEach((r) => {
      const d = parseDate(r.Data);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, (monthMap.get(key) || 0) + (r.Valor || 0));
    });
    return Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, valor]) => ({ name, valor }));
  };

  const computePieData = (rows: Row[]): { name: string; value: number }[] => {
    if (rows.length === 0) return [];
    const etapaMap = new Map<string, number>();
    rows.forEach((r) => {
      etapaMap.set(r.Etapa, (etapaMap.get(r.Etapa) || 0) + (r.Valor || 0));
    });
    return Array.from(etapaMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  useEffect(() => {
    const filtered = applyFilters(data, filters);
    setFilteredData(filtered);
    const tot = computeTotals(filtered);
    setTotals(tot);
    const mats = computeMaterials(filtered);
    setMaterials(mats);
    const bars = mats.map((m) => ({ name: m.material, peso: m.peso }));
    setBarData(bars);
    const lines = computeLineData(filtered);
    setLineData(lines);
    const pies = computePieData(filtered);
    setPieData(pies);
  }, [data, filters, applyFilters]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const buffer = ev.target?.result as ArrayBuffer;
      const wb = XLSX.read(buffer, { type: 'array' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const json = XLSX.utils.sheet_to_json<Row>(ws);
      setData(json as Row[]);
      setLastUpdate(
        new Date().toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    reader.readAsArrayBuffer(file);
  };

  const clearData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados?')) {
      setData([]);
      setFilters({
        periodoFrom: '',
        periodoTo: '',
        regiao: '',
        produto: '',
        vendedor: '',
        material: '',
      });
      setLastUpdate('');
    }
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dados Filtrados');
    XLSX.writeFile(
      wb,
      `dados_filtrados_${new Date().toLocaleDateString('pt-BR')}.xlsx`
    );
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const glassCard =
    'bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-br from-white/5 to-white/10';

  const glassBtn =
    'backdrop-blur-xl border border-white/30 rounded-2xl px-6 py-3 font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white/10 hover:bg-white/20 flex items-center gap-2';

  const glassInput =
    'w-full p-3 rounded-xl border border-white/30 bg-white/10 backdrop-blur-xl text-white placeholder-white/50 focus:outline-none focus:border-white/50 focus:ring-2 focus:ring-white/30 transition-all duration-300';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-4">
            <span className="text-6xl hover:scale-110 transition-all duration-300 cursor-default">📊</span>
            Dashboard Premium
          </h1>
          <div className="flex flex-wrap gap-3">
            <label className={`${glassBtn} bg-blue-500/20 hover:bg-blue-500/40 border-blue-400/50 cursor-pointer`}>
              📁 Importar Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              className={`${glassBtn} bg-orange-500/20 hover:bg-orange-500/40 border-orange-400/50`}
              onClick={clearData}
            >
              🗑️ Limpar Dados
            </button>
            <button
              className={`${glassBtn} bg-emerald-500/20 hover:bg-emerald-500/40 border-emerald-400/50`}
              onClick={exportExcel}
              disabled={filteredData.length === 0}
            >
              💾 Exportar Excel
            </button>
          </div>
        </div>
        <div className="text-right text-white/70 text-lg">
          Última atualização: {lastUpdate || 'Aguardando carregamento...'}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={glassCard}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl hover:scale-110 transition-all duration-300">⚖️</span>
              <h3 className="text-2xl font-bold text-white">Peso Total</h3>
            </div>
            <p className="text-4xl md:text-5xl font-black text-white">
              {numberFormatter.format(totals.peso)} kg
            </p>
          </div>
          <div className={glassCard}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl hover:scale-110 transition-all duration-300">💰</span>
              <h3 className="text-2xl font-bold text-white">Valor Total</h3>
            </div>
            <p className="text-4xl md:text-5xl font-black text-white">
              {currencyFormatter.format(totals.valor)}
            </p>
          </div>
        </div>

        {/* Materiais Cards */}
        <div className={`${glassCard} p-0 overflow-hidden`}>
          <div className="p-8 border-b border-white/20">
            <h3 className="text-3xl font-bold text-white flex items-center gap-4">
              <span className="text-4xl hover:scale-110 transition-all duration-300">🏭</span>
              Materiais
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 p-8 pt-0">
            {materials.map((m, i) => (
              <div key={i} className={`${glassCard} p-6 text-center hover:scale-105`}>
                <p className="text-xl font-semibold text-white mb-2 truncate">
                  {m.material}
                </p>
                <p className="text-2xl font-bold text-white">
                  {numberFormatter.format(m.peso)} kg
                </p>
                <p className="text-lg text-white/70 mt-1">{m.perc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filtros */}
        <details open className={glassCard}>
          <summary className="p-8 cursor-pointer font-bold text-2xl flex items-center gap-4 list-none">
            <span className="text-4xl hover:scale-110 transition-all duration-300">🔧</span>
            Filtros
          </summary>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-0">
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">Período De</label>
              <input
                type="date"
                value={filters.periodoFrom}
                onChange={(e) =>
                  setFilters({ ...filters, periodoFrom: e.target.value })
                }
                className={glassInput}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">Período Até</label>
              <input
                type="date"
                value={filters.periodoTo}
                onChange={(e) =>
                  setFilters({ ...filters, periodoTo: e.target.value })
                }
                className={glassInput}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">Região</label>
              <select
                value={filters.regiao}
                onChange={(e) =>
                  setFilters({ ...filters, regiao: e.target.value })
                }
                className={glassInput}
              >
                <option value="">Todas</option>
                {regioesOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">Produto</label>
              <select
                value={filters.produto}
                onChange={(e) =>
                  setFilters({ ...filters, produto: e.target.value })
                }
                className={glassInput}
              >
                <option value="">Todos</option>
                {produtosOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">Vendedor</label>
              <select
                value={filters.vendedor}
                onChange={(e) =>
                  setFilters({ ...filters, vendedor: e.target.value })
                }
                className={glassInput}
              >
                <option value="">Todos</option>
                {vendedoresOptions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">Material</label>
              <select
                value={filters.material}
                onChange={(e) =>
                  setFilters({ ...filters, material: e.target.value })
                }
                className={glassInput}
              >
                <option value="">Todos</option>
                {materiaisOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </details>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className={glassCard}>
            <h3 className="flex items-center gap-4 mb-6 p-0 text-2xl font-bold text-white border-b-0">
              <span className="text-3xl hover:scale-110 transition-all duration-300">📊</span>
              Volume por Material
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="white/10" />
                <XAxis dataKey="name" tick={{ fill: 'white' }} />
                <YAxis tick={{ fill: 'white' }} />
                <Tooltip />
                <Bar dataKey="peso" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={glassCard}>
            <h3 className="flex items-center gap-4 mb-6 p-0 text-2xl font-bold text-white border-b-0">
              <span className="text-3xl hover:scale-110 transition-all duration-300">📈</span>
              Evolução de Faturamento
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="white/10" />
                <XAxis dataKey="name" tick={{ fill: 'white' }} />
                <YAxis tick={{ fill: 'white' }} />
                <Tooltip />
                <Line type="monotone" dataKey="valor" stroke="#8884d8" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={glassCard}>
          <h3 className="flex items-center gap-4 mb-6 p-0 text-2xl font-bold text-white border-b-0">
            <span className="text-3xl hover:scale-110 transition-all duration-300">🥧</span>
            Fluxo Comercial (por Etapa)
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tabela */}
        <div className={`${glassCard} overflow-hidden ${filteredData.length === 0 ? '' : ''}`}>
          <div className="p-8 border-b border-white/20">
            <h3 className="text-3xl font-bold text-white flex items-center gap-4">
              <span className="text-4xl hover:scale-110 transition-all duration-300">📋</span>
              Dados Filtrados ({filteredData.length})
            </h3>
          </div>
          {filteredData.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-6xl mb-4 block text-white/30">📭</span>
              <p className="text-xl text-white/50">Sem dados para exibir</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5 uppercase text-xs tracking-wider">
                    <th className="p-4 text-left font-bold text-white/80">Data</th>
                    <th className="p-4 text-left font-bold text-white/80">Região</th>
                    <th className="p-4 text-left font-bold text-white/80">Produto</th>
                    <th className="p-4 text-left font-bold text-white/80">Vendedor</th>
                    <th className="p-4 text-left font-bold text-white/80">Peso (kg)</th>
                    <th className="p-4 text-left font-bold text-white/80">Valor</th>
                    <th className="p-4 text-left font-bold text-white/80">Material</th>
                    <th className="p-4 text-left font-bold text-white/80">Meta</th>
                    <th className="p-4 text-left font-bold text-white/80">Etapa</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, i) => (
                    <tr key={i} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                      <td className="p-4 font-medium text-white/90">{row.Data}</td>
                      <td className="p-4 text-white/80">{row.Regiao}</td>
                      <td className="p-4 text-white/80">{row.Produto}</td>
                      <td className="p-4 text-white/80">{row.Vendedor}</td>
                      <td className="p-4 font-mono text-white/90">
                        {numberFormatter.format(row.Peso || 0)}
                      </td>
                      <td className="p-4 font-mono text-white/90">
                        {currencyFormatter.format(row.Valor || 0)}
                      </td>
                      <td className="p-4 text-white/80">{row.Material}</td>
                      <td className="p-4 font-mono text-white/80">
                        {numberFormatter.format(row.Meta || 0)}
                      </td>
                      <td className="p-4 font-semibold text-white/90 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-lg px-3 py-1">
                        {row.Etapa}
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
}
