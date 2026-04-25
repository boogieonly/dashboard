'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

type IndicatorKey = "faturamento" | "vendas" | "atrasos" | "carteiraTotal" | "previsaoMesAtual" | "previsaoMesSeguinte";

interface DailyEntry {
  id: string;
  date: string;
  faturamento: number;
  vendas: number;
  atrasos: number;
  carteiraTotal: number;
  previsaoMesAtual: number;
  previsaoMesSeguinte: number;
}

type Metas = {
  [K in IndicatorKey]: number;
};

type FormData = Omit<DailyEntry, 'id'>;

interface Config {
  key: IndicatorKey;
  title: string;
  emoji: string;
  isMoney: boolean;
  inverse: boolean;
}

const indicatorConfig: Config[] = [
  { key: 'faturamento', title: 'Faturamento', emoji: '💰', isMoney: true, inverse: false },
  { key: 'vendas', title: 'Vendas', emoji: '🛒', isMoney: false, inverse: false },
  { key: 'atrasos', title: 'Atrasos', emoji: '⏰', isMoney: false, inverse: true },
  { key: 'carteiraTotal', title: 'Carteira Total', emoji: '💳', isMoney: true, inverse: false },
  { key: 'previsaoMesAtual', title: 'Previsão Mês Atual', emoji: '🔮', isMoney: true, inverse: false },
  { key: 'previsaoMesSeguinte', title: 'Previsão Mês Seguinte', emoji: '📈', isMoney: true, inverse: false },
];

const defaultMetas: Metas = {
  faturamento: 100000,
  vendas: 1000,
  atrasos: 50,
  carteiraTotal: 50000,
  previsaoMesAtual: 120000,
  previsaoMesSeguinte: 150000,
};

const generateId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const formatValue = (value: number, isMoney: boolean): string => {
  return isMoney
    ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : value.toLocaleString('pt-BR');
};

function Sparkline({ data, color = 'blue' }: { data: number[]; color?: string }) {
  const maxV = Math.max(0, ...data);
  if (maxV === 0) {
    return <div className="h-10 bg-gray-200 rounded-full"></div>;
  }
  return (
    <div className="flex h-10 bg-gray-200/50 rounded-full p-1">
      {data.map((v, i) => (
        <div
          key={i}
          className={`flex-1 rounded-full ${color}-400 mx-[1px] shadow-sm`}
          style={{ height: `${Math.max((v / maxV) * 100, 2)}%` }}
        />
      ))}
    </div>
  );
}

export default function DiarioPage() {
  const today = new Date().toISOString().split('T')[0];
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);
  const [metas, setMetas] = useState<Metas>(defaultMetas);
  const [currentMonthRecords, setCurrentMonthRecords] = useState<DailyEntry[]>([]);
  const [formData, setFormData] = useState<FormData>({
    date: today,
    faturamento: 0,
    vendas: 0,
    atrasos: 0,
    carteiraTotal: 0,
    previsaoMesAtual: 0,
    previsaoMesSeguinte: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showMetasModal, setShowMetasModal] = useState(false);
  const [tempMetas, setTempMetas] = useState<Metas>(defaultMetas);

  // Load from localStorage
  useEffect(() => {
    try {
      const entriesStr = localStorage.getItem('diarioEntries');
      if (entriesStr) {
        setDailyEntries(JSON.parse(entriesStr));
      }
      const metasStr = localStorage.getItem('diarioMetas');
      if (metasStr) {
        const loaded = JSON.parse(metasStr) as Metas;
        setMetas({ ...defaultMetas, ...loaded });
      }
    } catch (e) {
      console.error('Error loading data:', e);
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('diarioEntries', JSON.stringify(dailyEntries));
  }, [dailyEntries]);

  useEffect(() => {
    localStorage.setItem('diarioMetas', JSON.stringify(metas));
  }, [metas]);

  // Current month records
  const updateCurrentMonthRecords = useCallback(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const filtered = dailyEntries
      .filter((e) => {
        const d = new Date(e.date + 'T00:00:00');
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setCurrentMonthRecords(filtered);
  }, [dailyEntries]);

  useEffect(() => {
    updateCurrentMonthRecords();
  }, [updateCurrentMonthRecords]);

  // Monthly totals
  const monthlyTotals = useMemo(() => {
    const totals: Record<IndicatorKey, number> = {
      faturamento: 0,
      vendas: 0,
      atrasos: 0,
      carteiraTotal: 0,
      previsaoMesAtual: 0,
      previsaoMesSeguinte: 0,
    };
    for (const config of indicatorConfig) {
      totals[config.key] = currentMonthRecords.reduce((sum, entry) => sum + entry[config.key], 0);
    }
    return totals;
  }, [currentMonthRecords]);

  // Spark data
  const getSparkData = useCallback((key: IndicatorKey): number[] => {
    const now = new Date();
    const dates: string[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
    return dates.map((date) => {
      const entry = dailyEntries.find((e) => e.date === date);
      return entry ? (entry as any)[key] : 0;
    });
  }, [dailyEntries]);

  const getProgress = (config: Config, value: number, metaValue: number): number => {
    if (metaValue === 0) return 0;
    if (config.inverse) {
      return Math.max(0, Math.min(100, (1 - value / metaValue) * 100));
    } else {
      return Math.min(100, (value / metaValue) * 100);
    }
  };

  const getBarColorClass = (percent: number): string => {
    if (percent >= 80) return 'from-emerald-400 to-emerald-600';
    if (percent >= 50) return 'from-amber-400 to-amber-600';
    return 'from-rose-400 to-rose-600';
  };

  const getTrendIcon = (config: Config, curr: number, prev: number) => {
    const delta = curr - prev;
    const isImproving = config.inverse ? delta < 0 : delta > 0;
    const icon = isImproving ? '↑' : '↓';
    const cls = isImproving ? 'text-emerald-500' : 'text-rose-500';
    return <span className={cls + ' font-bold text-lg'}>{icon}</span>;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data: DailyEntry = {
      id: editingId || generateId(),
      date: formData.date,
      ...formData,
    };
    if (editingId) {
      setDailyEntries((prev) =>
        prev.map((entry) => (entry.id === editingId ? data : entry))
      );
    } else {
      setDailyEntries((prev) => [...prev, data]);
    }
    // Reset form
    setFormData({
      date: today,
      faturamento: 0,
      vendas: 0,
      atrasos: 0,
      carteiraTotal: 0,
      previsaoMesAtual: 0,
      previsaoMesSeguinte: 0,
    });
    setEditingId(null);
  };

  const handleEdit = (id: string) => {
    const entry = dailyEntries.find((e) => e.id === id);
    if (entry) {
      const { id: _, ...fd } = entry;
      setFormData(fd as FormData);
      setEditingId(id);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este registro?')) {
      setDailyEntries((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleOpenMetas = () => {
    setTempMetas(metas);
    setShowMetasModal(true);
  };

  const handleSaveMetas = () => {
    setMetas(tempMetas);
    setShowMetasModal(false);
  };

  const handleCloseMetas = () => {
    setShowMetasModal(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-12">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Diário Financeiro
            </h1>
            <button
              onClick={handleOpenMetas}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-blue-500 hover:to-purple-600 text-white font-semibold py-3 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              ⚙️ Configurar Metas
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto space-y-16">
        {/* KPI Cards */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">KPIs Mensais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {indicatorConfig.map((config) => {
              const total = monthlyTotals[config.key];
              const percent = getProgress(config, total, metas[config.key]);
              const colorClass = getBarColorClass(percent);
              return (
                <div
                  key={config.key}
                  className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="text-4xl mb-2">{config.emoji}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{config.title}</h3>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                    {formatValue(total, config.isMoney)}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">{percent.toFixed(0)}% da meta</div>
                  <div className="w-full bg-gray-200/50 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full shadow-md bg-gradient-to-r ${colorClass} transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Resumo Mensal */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Resumo Mensal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {indicatorConfig.map((config) => {
              const total = monthlyTotals[config.key];
              const percent = getProgress(config, total, metas[config.key]);
              const sparkData = getSparkData(config.key);
              const curr = sparkData[sparkData.length - 1];
              const prev = sparkData[sparkData.length - 2] || 0;
              const trendIcon = getTrendIcon(config, curr, prev);
              return (
                <div
                  key={config.key}
                  className="bg-white/70 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">{config.title}</h3>
                  <Sparkline data={sparkData} color="indigo" />
                  <div className="mt-4 text-center space-y-2">
                    <div className="text-lg font-bold text-gray-900">
                      {formatValue(total, config.isMoney)} <span className="text-sm text-gray-600">({percent.toFixed(0)}%)</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-lg">
                      {trendIcon}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Form */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            {editingId ? 'Editar Registro' : 'Novo Registro'}
          </h2>
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50 max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="md:col-span-1 lg:col-span-1">
                <label className="block text-lg font-semibold text-gray-800 mb-2">Data</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-lg focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>
              {indicatorConfig.map((config) => (
                <div key={config.key}>
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    {config.emoji} {config.title}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData[config.key] || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, [config.key]: Number(e.target.value) || 0 })
                    }
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                  />
                </div>
              ))}
              <div className="md:col-span-2 lg:col-span-3">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-green-500 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                >
                  {editingId ? 'Atualizar Registro' : 'Salvar Registro'}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* History Table */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Histórico do Mês</h2>
          {currentMonthRecords.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-xl">Nenhum registro neste mês. Adicione o primeiro!</div>
          ) : (
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-white/50">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-600 text-white">
                    <th className="p-6 text-left font-semibold text-lg">Data</th>
                    {indicatorConfig.map((config) => (
                      <th key={config.key} className="p-6 text-left font-semibold text-lg">
                        {config.emoji} {config.title}
                      </th>
                    ))}
                    <th className="p-6 text-left font-semibold text-lg">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMonthRecords.map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="p-6 font-medium text-gray-900">
                        {new Date(entry.date).toLocaleDateString('pt-BR')}
                      </td>
                      {indicatorConfig.map((config) => (
                        <td key={config.key} className="p-6 text-gray-700">
                          {formatValue(entry[config.key], config.isMoney)}
                        </td>
                      ))}
                      <td className="p-6">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(entry.id)}
                            className="p-2 hover:bg-blue-100 rounded-xl transition-all text-blue-600 hover:text-blue-800"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-2 hover:bg-red-100 rounded-xl transition-all text-red-600 hover:text-red-800"
                            title="Deletar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Metas Modal */}
      {showMetasModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCloseMetas}
        >
          <div
            className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Configurar Metas Mensais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {indicatorConfig.map((config) => (
                <div key={config.key}>
                  <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-3">
                    {config.emoji} {config.title}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={tempMetas[config.key] || 0}
                    onChange={(e) =>
                      setTempMetas({ ...tempMetas, [config.key]: Number(e.target.value) || 0 })
                    }
                    className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 text-lg focus:ring-4 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                  />
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSaveMetas}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-500 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
              >
                Salvar Metas
              </button>
              <button
                onClick={handleCloseMetas}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
