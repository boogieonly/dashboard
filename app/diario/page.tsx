'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

type MetricKey = 'faturamento' | 'vendas' | 'atrasos' | 'carteira' | 'previsaoAtual' | 'previsaoProx';

interface MetricValues {
  faturamento: number;
  vendas: number;
  atrasos: number;
  carteira: number;
  previsaoAtual: number;
  previsaoProx: number;
}

type DailyEntry = MetricValues & { date: string };

type MetasState = MetricValues;

const defaultMetas: MetasState = {
  faturamento: 0,
  vendas: 0,
  atrasos: 0,
  carteira: 0,
  previsaoAtual: 0,
  previsaoProx: 0,
};

const metrics = [
  { key: 'faturamento' as MetricKey, emoji: '💰', label: 'Faturamento' },
  { key: 'vendas' as MetricKey, emoji: '📈', label: 'Vendas' },
  { key: 'atrasos' as MetricKey, emoji: '⚠️', label: 'Atrasos' },
  { key: 'carteira' as MetricKey, emoji: '💼', label: 'Carteira' },
  { key: 'previsaoAtual' as MetricKey, emoji: '🔮', label: 'Previsão Atual' },
  { key: 'previsaoProx' as MetricKey, emoji: '📅', label: 'Previsão Próxima' },
] as Array<{ key: MetricKey; emoji: string; label: string }>;

const formatCurrency = (value: number): string =>
  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateStr: string): string => new Date(dateStr).toLocaleDateString('pt-BR');

const getToday = (): string => new Date().toISOString().split('T')[0];

const getMonthStart = (dateStr: string): string => {
  const date = new Date(dateStr);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.toISOString().split('T')[0];
};

const sameMonth = (date1: string, date2: string): boolean =>
  getMonthStart(date1) === getMonthStart(date2);

const computeAccum = (entries: DailyEntry[], metric: MetricKey, upToDate: string): number =>
  entries
    .filter((e) => sameMonth(e.date, upToDate) && e.date <= upToDate)
    .reduce((sum, e) => sum + e[metric], 0);

const getLast7Accum = (entries: DailyEntry[], metric: MetricKey): number[] => {
  const data: number[] = [];
  const todayDate = new Date(getToday());
  for (let i = 6; i >= 0; i--) {
    const dateCopy = new Date(todayDate);
    dateCopy.setDate(todayDate.getDate() - i);
    const dateStr = dateCopy.toISOString().split('T')[0];
    data.push(computeAccum(entries, metric, dateStr));
  }
  return data;
};

const getLastSnapshotValue = (entries: DailyEntry[], metric: MetricKey): number => {
  const monthStart = getMonthStart(getToday());
  const prevEntries = entries.filter((e) => e.date < monthStart);
  if (prevEntries.length === 0) return 0;
  const sortedPrev = [...prevEntries].sort((a, b) => a.date.localeCompare(b.date));
  const lastPrevDate = sortedPrev[sortedPrev.length - 1].date;
  return computeAccum(entries, metric, lastPrevDate);
};

function Sparkline({
  data,
  width = 200,
  height = 50,
}: {
  data: number[];
  width?: number;
  height?: number;
}) {
  if (!data.length) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max > min ? max - min : 1;
  const padding = 8;
  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - padding - (height - 2 * padding) * (val - min) / range;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[50px]">
      <polyline
        points={points}
        fill="none"
        stroke="#3B82F6"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DiarioPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [metas, setMetas] = useState<MetasState>(defaultMetas);
  const [formDate, setFormDate] = useState(getToday());
  const [formData, setFormData] = useState<MetricValues>(defaultMetas);
  const [showMetas, setShowMetas] = useState(false);
  const [metaForm, setMetaForm] = useState<MetricValues>(defaultMetas);

  useEffect(() => {
    const entriesStr = localStorage.getItem('diario-entries');
    if (entriesStr) {
      try {
        const loadedEntries: DailyEntry[] = JSON.parse(entriesStr);
        setEntries([...loadedEntries].sort((a, b) => a.date.localeCompare(b.date)));
      } catch (err) {
        console.error('Erro ao carregar entradas:', err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('diario-entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    const metasStr = localStorage.getItem('diario-metas');
    if (metasStr) {
      try {
        const loadedMetas: Partial<MetricValues> = JSON.parse(metasStr);
        setMetas({ ...defaultMetas, ...loadedMetas });
      } catch (err) {
        console.error('Erro ao carregar metas:', err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('diario-metas', JSON.stringify(metas));
  }, [metas]);

  const displayEntries = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date)),
    [entries]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: DailyEntry = {
      date: formDate,
      ...formData,
    };
    const existsIndex = entries.findIndex((en) => en.date === formDate);
    let newEntries: DailyEntry[];
    if (existsIndex >= 0) {
      newEntries = [...entries];
      newEntries[existsIndex] = newEntry;
    } else {
      newEntries = [...entries, newEntry];
    }
    setEntries([...newEntries].sort((a, b) => a.date.localeCompare(b.date)));
    setFormDate(getToday());
    setFormData(defaultMetas);
  };

  const handleEdit = (date: string) => {
    const entry = entries.find((e) => e.date === date);
    if (entry) {
      setFormDate(entry.date);
      setFormData(entry);
    }
  };

  const handleDelete = (date: string) => {
    if (window.confirm(`Deletar entrada de ${formatDate(date)}?`)) {
      setEntries(entries.filter((e) => e.date !== date));
    }
  };

  const handleOpenMetas = () => {
    setMetaForm(metas);
    setShowMetas(true);
  };

  const handleSaveMetas = () => {
    setMetas(metaForm);
    setShowMetas(false);
  };

  const isEditing = entries.some((e) => e.date === formDate);

  const today = getToday();

  const currentAccum = useCallback(
    (metric: MetricKey) => computeAccum(entries, metric, today),
    [entries, today]
  );

  const sparkData = useCallback(
    (metric: MetricKey) => getLast7Accum(entries, metric),
    [entries]
  );

  const progress = useCallback(
    (metric: MetricKey) => {
      const m = metas[metric] ?? 0;
      const a = currentAccum(metric);
      return m > 0 ? Math.min(100, (a / m) * 100) : 0;
    },
    [metas, currentAccum]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Diário de Indicadores
          </h1>
          <button
            onClick={handleOpenMetas}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            🎯 Metas
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {metrics.map(({ key, emoji, label }) => (
            <div
              key={key}
              className="group bg-white/80 backdrop-blur-sm shadow-xl border border-blue-100/50 rounded-3xl p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-3 group-hover:scale-110 transition-transform duration-300">{emoji}</span>
                <h3 className="text-xl font-bold text-gray-900">{label}</h3>
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-6">
                {formatCurrency(currentAccum(key))}
              </div>
              <Sparkline data={sparkData(key)} />
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-3">
                  <span>Meta: {formatCurrency(metas[key] ?? 0)}</span>
                  <span>{progress(key).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-4 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progress(key)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form Section */}
        <section className="bg-white/80 backdrop-blur-sm shadow-xl border border-blue-100/50 rounded-3xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            {isEditing ? '✏️ Editar Entrada' : '➕ Nova Entrada'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                📅 Data
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metrics.map(({ key, emoji, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-xl">{emoji}</span>
                    {label}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium"
                    value={formData[key]}
                    onChange={(e) =>
                      setFormData({ ...formData, [key]: parseFloat(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-8 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isEditing ? '💾 Atualizar Entrada' : '➕ Adicionar Nova Entrada'}
            </button>
          </form>
        </section>

        {/* History Table */}
        <section className="bg-white/80 backdrop-blur-sm shadow-xl border border-blue-100/50 rounded-3xl overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">📋 Histórico</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Data</th>
                  {metrics.map(({ key, emoji, label }) => (
                    <th key={key} className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{emoji}</span>
                        <span>{label}</span>
                      </div>
                    </th>
                  ))}
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayEntries.map((entry) => (
                  <tr key={entry.date} className="hover:bg-blue-50 transition-colors duration-200">
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-gray-900">
                      {formatDate(entry.date)}
                    </td>
                    {metrics.map(({ key }) => (
                      <td key={key} className="px-6 py-6 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {formatCurrency(entry[key])}
                      </td>
                    ))}
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(entry.date)}
                        className="text-blue-600 hover:text-blue-900 mr-6 font-bold transition-colors duration-200"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(entry.date)}
                        className="text-red-600 hover:text-red-900 font-bold transition-colors duration-200"
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {displayEntries.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-lg">
              Nenhuma entrada registrada ainda. Adicione a primeira!
            </div>
          )}
        </section>

        {/* Metas Modal */}
        {showMetas && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowMetas(false)}
          >
            <div
              className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-8 border border-blue-100/50"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                🎯 Metas Mensais
              </h2>
              <div className="space-y-6 mb-8">
                {metrics.map(({ key, emoji, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <span className="text-2xl">{emoji}</span>
                      {label}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium"
                      value={metaForm[key]}
                      onChange={(e) =>
                        setMetaForm({ ...metaForm, [key]: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowMetas(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-4 rounded-xl font-bold text-lg transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveMetas}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  💾 Salvar Metas
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
