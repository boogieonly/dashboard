'use client';

import { useState, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

type SalesData = {
  data: string;
  material: string;
  volume: number;
  faturamento: number;
  etapa: string;
};

type Filters = {
  material: string;
  dateFrom: string;
  dateTo: string;
};

export default function Dashboard() {
  const [data, setData] = useState<SalesData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    material: '',
    dateFrom: '',
    dateTo: '',
  });

  const glassClass = 'bg-white/20 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 md:p-12';
  const glassMiniClass = 'bg-white/30 backdrop-blur-lg border border-white/30 rounded-2xl shadow-xl p-6 text-center hover:scale-[1.02] transition-transform duration-200';
  const btnClass = 'px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 backdrop-blur-sm border border-white/20 inline-flex items-center gap-2';
  const inputClass = 'w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200';

  const parseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date(NaN);
    const parts = dateStr.split('/');
    if (parts.length !== 3) return new Date(NaN);
    const [day, month, year] = parts.map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return new Date(NaN);
    const date = new Date(year, month - 1, day);
    if (date.getDate() !== day || date.getMonth() !== month - 1) return new Date(NaN);
    return date;
  };

  const isValidDate = (date: Date): boolean => !isNaN(date.getTime());

  const getMonthKey = (date: Date): string => {
    if (!isValidDate(date)) return '';
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  const filteredData = useMemo(() => {
    let fd = [...data];
    if (filters.material) {
      const search = filters.material.toLowerCase();
      fd = fd.filter((d) => d.material.toLowerCase().includes(search));
    }
    if (filters.dateFrom) {
      const from = parseDate(filters.dateFrom);
      if (isValidDate(from)) {
        fd = fd.filter((d) => {
          const dDate = parseDate(d.data);
          return isValidDate(dDate) && dDate >= from;
        });
      }
    }
    if (filters.dateTo) {
      const to = parseDate(filters.dateTo);
      if (isValidDate(to)) {
        fd = fd.filter((d) => {
          const dDate = parseDate(d.data);
          return isValidDate(dDate) && dDate <= to;
        });
      }
    }
    return fd;
  }, [data, filters]);

  const kpis = useMemo(() => {
    const totalVolume = filteredData.reduce((sum, d) => sum + d.volume, 0);
    const totalFaturamento = filteredData.reduce((sum, d) => sum + d.faturamento, 0);
    const uniqueMaterials = new Set(filteredData.map((d) => d.material)).size;
    const totalRecords = filteredData.length;
    return { totalVolume, totalFaturamento, uniqueMaterials, totalRecords };
  }, [filteredData]);

  const materialCards = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredData.forEach((d) => {
      grouped[d.material] = (grouped[d.material] || 0) + d.volume;
    });
    return Object.entries(grouped)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, volume]) => ({ name, volume }));
  }, [filteredData]);

  const volumeData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredData.forEach((d) => {
      grouped[d.material] = (grouped[d.material] || 0) + d.volume;
    });
    return Object.entries(grouped)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, volume]) => ({ name, volume: Number(volume.toFixed(0)) }));
  }, [filteredData]);

  const evolucaoData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredData.forEach((d) => {
      const date = parseDate(d.data);
      if (isValidDate(date)) {
        const key = getMonthKey(date);
        grouped[key] = (grouped[key] || 0) + d.faturamento;
      }
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }));
  }, [filteredData]);

  const fluxoData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredData.forEach((d) => {
      grouped[d.etapa] = (grouped[d.etapa] || 0) + 1;
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#9966FF'];

  const lastUpdateStr = lastUpdate
    ? new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(lastUpdate)
    : 'Nenhuma atualização ainda';

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const bstr = ev.target?.result as string;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const json = XLSX.utils.sheet_to_json<any>(ws);
      /* eslint-enable @typescript-eslint/no-explicit-any */
      const parsed: SalesData[] = json.map((row: any) => ({
        data: row.data || '',
        material: row.material || '',
        volume: Number(row.volume) || 0,
        faturamento: Number(row.faturamento) || 0,
        etapa: row.etapa || '',
      })).filter((d) => d.material && d.volume > 0);
      setData(parsed);
      setLastUpdate(new Date());
      setFilters({ material: '', dateFrom: '', dateTo: '' });
      // Reset file input
      e.target.value = '';
    };
    reader.readAsBinaryString(file);
  }, []);

  const handleClear = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados?')) {
      setData([]);
      setLastUpdate(null);
      setFilters({ material: '', dateFrom: '', dateTo: '' });
      setShowFilters(false);
    }
  };

  const updateFilter = (newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className={glassClass}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2">
                Dashboard de Vendas
              </h1>
              <p className="text-xl text-white/80">Gerencie seus dados de materiais e faturamento 📊</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="text-lg md:text-xl font-semibold text-white/90">
                Última atualização: <span className="font-bold text-blue-300">{lastUpdateStr}</span>
              </div>
              <label className={btnClass}>
                Importar Excel
                <input
                  type="file"
                  hidden
                  accept=".xlsx,.xls"
                  onChange={handleFile}
                />
              </label>
              <button className={`${btnClass} bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600`} onClick={handleClear}>
                Limpar Dados
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className={glassClass}>
          <div className="flex items-center mb-8">
            <span className="text-5xl mr-6 hover:scale-110 transition-transform duration-300">🔍</span>
            <h2 className="text-3xl md:text-4xl font-bold">Filtros</h2>
          </div>
          <button
            className={btnClass}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Fechar Filtros' : 'Abrir Filtros'} {showFilters ? '✕' : '▶️'}
          </button>
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div>
                <label className="block text-white/90 mb-2 font-semibold">Material</label>
                <input
                  type="text"
                  placeholder="Digite o nome do material..."
                  value={filters.material}
                  onChange={(e) => updateFilter({ material: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-white/90 mb-2 font-semibold">Data Inicial (DD/MM/YYYY)</label>
                <input
                  type="text"
                  placeholder="01/01/2024"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilter({ dateFrom: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-white/90 mb-2 font-semibold">Data Final (DD/MM/YYYY)</label>
                <input
                  type="text"
                  placeholder="31/12/2024"
                  value={filters.dateTo}
                  onChange={(e) => updateFilter({ dateTo: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
          )}
        </div>

        {/* KPIs */}
        <div className={glassClass}>
          <div className="flex items-center mb-8">
            <span className="text-5xl mr-6 hover:scale-110 transition-transform duration-300">📊</span>
            <h2 className="text-3xl md:text-4xl font-bold">KPIs Principais</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={glassMiniClass}>
              <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">{kpis.totalVolume.toLocaleString()}</div>
              <div className="text-white/90 text-lg">Volume Total</div>
            </div>
            <div className={glassMiniClass}>
              <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">
                R$ {kpis.totalFaturamento.toLocaleString()}
              </div>
              <div className="text-white/90 text-lg">Faturamento Total</div>
            </div>
            <div className={glassMiniClass}>
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">{kpis.uniqueMaterials}</div>
              <div className="text-white/90 text-lg">Materiais Únicos</div>
            </div>
            <div className={glassMiniClass}>
              <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">{kpis.totalRecords}</div>
              <div className="text-white/90 text-lg">Registros</div>
            </div>
          </div>
        </div>

        {/* Cards de Materiais */}
        <div className={glassClass}>
          <div className="flex items-center mb-8">
            <span className="text-5xl mr-6 hover:scale-110 transition-transform duration-300">🏭</span>
            <h2 className="text-3xl md:text-4xl font-bold">Cards de Materiais (Top 5)</h2>
          </div>
          {materialCards.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materialCards.map((m, i) => (
                <div key={i} className={glassMiniClass}>
                  <h3 className="font-bold text-xl text-white mb-2 truncate">{m.name}</h3>
                  <div className="text-3xl font-bold text-blue-400">{m.volume.toLocaleString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 opacity-50">
              <p className="text-2xl">Sem materiais para exibir</p>
            </div>
          )}
        </div>

        {/* Volume por Material */}
        <div className={glassClass}>
          <div className="flex items-center mb-8">
            <span className="text-5xl mr-6 hover:scale-110 transition-transform duration-300">📈</span>
            <h2 className="text-3xl md:text-4xl font-bold">Volume por Material (Top 10)</h2>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="white/10" />
              <XAxis dataKey="name" angle={-45} height={80} tick={{ fill: 'white' }} />
              <YAxis tick={{ fill: 'white' }} />
              <Tooltip />
              <Bar dataKey="volume" fill="#8884d8" name="Volume" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Evolução de Faturamento */}
        <div className={glassClass}>
          <div className="flex items-center mb-8">
            <span className="text-5xl mr-6 hover:scale-110 transition-transform duration-300">💹</span>
            <h2 className="text-3xl md:text-4xl font-bold">Evolução de Faturamento</h2>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={evolucaoData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="white/10" />
              <XAxis dataKey="name" tick={{ fill: 'white' }} />
              <YAxis tick={{ fill: 'white' }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={3} dot={{ fill: '#8884d8', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Fluxo Comercial */}
        <div className={glassClass}>
          <div className="flex items-center mb-8">
            <span className="text-5xl mr-6 hover:scale-110 transition-transform duration-300">🎯</span>
            <h2 className="text-3xl md:text-4xl font-bold">Fluxo Comercial</h2>
          </div>
          {fluxoData.length ? (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={fluxoData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label
                >
                  {fluxoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-96 opacity-50">
              <p className="text-2xl">Sem dados de fluxo</p>
            </div>
          )}
        </div>

        {/* Tabela de Dados */}
        <div className={glassClass}>
          <div className="flex items-center mb-8">
            <span className="text-5xl mr-6 hover:scale-110 transition-transform duration-300">📋</span>
            <h2 className="text-3xl md:text-4xl font-bold">Tabela de Dados (Top 50)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20 rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-white/10">
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Data</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Material</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Volume</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Faturamento</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Etapa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredData.length > 0 ? (
                  filteredData.slice(0, 50).map((d, i) => (
                    <tr key={i} className="hover:bg-white/10 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{d.data}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/90 max-w-xs truncate">{d.material}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-300 font-semibold">{d.volume.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-semibold">R$ {d.faturamento.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">{d.etapa}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-xl font-semibold text-white/50">
                      📋 Sem dados para exibir. Importe um Excel!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
