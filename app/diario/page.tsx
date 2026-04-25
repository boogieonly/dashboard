'use client';

import { useState, useEffect, useCallback } from 'react';

type MetricKey = 'faturamento' | 'vendas' | 'atrasos' | 'carteira' | 'previsaoAtual' | 'previsaoProx';

type DailyEntry = {
  date: string;
  faturamento: number;
  vendas: number;
  atrasos: number;
  carteira: number;
  previsaoAtual: number;
  previsaoProx: number;
};

type Metas = {
  faturamento: number;
  vendas: number;
  atrasos: number;
  carteira: number;
  previsaoAtual: number;
  previsaoProx: number;
};

const metrics = [
  { key: 'faturamento' as MetricKey, emoji: '💰', label: 'Faturamento' },
  { key: 'vendas' as MetricKey, emoji: '📈', label: 'Vendas' },
  { key: 'atrasos' as MetricKey, emoji: '⚠️', label: 'Atrasos' },
  { key: 'carteira' as MetricKey, emoji: '💼', label: 'Carteira' },
  { key: 'previsaoAtual' as MetricKey, emoji: '🔮', label: 'Previsão Atual' },
  { key: 'previsaoProx' as MetricKey, emoji: '📅', label: 'Previsão Próx' },
];

const getToday = (): string => new Date().toISOString().split('T')[0];

const getMonthStart = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.toISOString().split('T')[0];
};

const sameMonth = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1 + 'T00:00:00');
  const d2 = new Date(date2 + 'T00:00:00');
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
};

const computeAccum = (entries: DailyEntry[], metric: MetricKey, upToDate: string): number => {
  return entries
    .filter((e) => e.date <= upToDate)
    .reduce((sum, e) => sum + e[metric], 0);
};

const getLastSnapshotValue = (entries: DailyEntry[], metric: MetricKey): number | null => {
  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return sorted[0]?.[metric] ?? null;
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
};

const Sparkline = ({
  data,
  width = 120,
  height = 30,
}: {
  data: number[];
  width?: number;
  height?: number;
}) => {
  if (data.length === 0) {
    return <svg width={width} height={height} className="text-sky-500" />;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * (width || 120);
      const y = (height || 30) - ((d - min) / range) * (height || 30);
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="text-sky-500"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default function DiarioPage() {
  const defaultFormData: DailyEntry = {
    date: getToday(),
    faturamento: 0,
    vendas: 0,
    atrasos: 0,
    carteira: 0,
    previsaoAtual: 0,
    previsaoProx: 0,
  };

  const defaultMetas: Metas = {
    faturamento: 0,
    vendas: 0,
    atrasos: 0,
    carteira: 0,
    previsaoAtual: 0,
    previsaoProx: 0,
  };

  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [metas, setMetas] = useState<Metas>(defaultMetas);
  const [formData, setFormData] = useState<DailyEntry>(defaultFormData);
  const [metasForm, setMetasForm] = useState<Metas>(defaultMetas);
  const [editingEntry, setEditingEntry] = useState<DailyEntry | null>(null);
  const [showMetasModal, setShowMetasModal] = useState(false);

  const saveEntriesLocal = (newEntries: DailyEntry[]) => {
    const sorted = [...newEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setEntries(sorted);
    localStorage.setItem('diario-entries', JSON.stringify(sorted));
  };

  const saveMetasLocal = (newMetas: Metas) => {
    setMetas(newMetas);
    localStorage.setItem('diario-metas', JSON.stringify(newMetas));
  };

  useEffect(() => {
    try {
      const entriesStr = localStorage.getItem('diario-entries');
      if (entriesStr) {
        const parsedEntries: DailyEntry[] = JSON.parse(entriesStr);
        saveEntriesLocal(parsedEntries);
      }
      const metasStr = localStorage.getItem('diario-metas');
      if (metasStr) {
        const parsedMetas: Metas = JSON.parse(metasStr);
        saveMetasLocal(parsedMetas);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }, []);

  const getSparklineData = (metric: MetricKey): number[] => {
    const data: number[] = [];
    const today = new Date(getToday() + 'T12:00:00');
    for (let i = 6; i >= 0; i--) {
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - i);
      const dateStr = pastDate.toISOString().split('T')[0];
      const entry = entries.find((e) => e.date === dateStr);
      data.push(entry ? entry[metric] : 0);
    }
    return data;
  };

  const getCurrentMonthAccum = (metric: MetricKey): number => {
    const todayStr = getToday();
    const monthEntries = entries.filter((e) => sameMonth(e.date, todayStr));
    return computeAccum(monthEntries, metric, todayStr);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEntry) {
      const newEntries = entries.map((en) => (en.date === formData.date ? formData : en));
      saveEntriesLocal(newEntries);
      setEditingEntry(null);
    } else {
      if (entries.some((e) => e.date === formData.date)) {
        alert('Já existe uma entrada para esta data.');
        return;
      }
      const newEntries = [...entries, formData];
      saveEntriesLocal(newEntries);
    }
    setFormData(defaultFormData);
  };

  const editEntry = (entry: DailyEntry) => {
    setFormData(entry);
    setEditingEntry(entry);
  };

  const deleteEntry = (date: string) => {
    if (confirm('Tem certeza que deseja deletar esta entrada?')) {
      const newEntries = entries.filter((e) => e.date !== date);
      saveEntriesLocal(newEntries);
    }
  };

  const openMetasModal = () => {
    setMetasForm(metas);
    setShowMetasModal(true);
  };

  const handleMetasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMetasLocal(metasForm);
    setShowMetasModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-sky-800 mb-8 text-center">Diário</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
        {metrics.map(({ key, emoji, label }) => {
          const currentValue = getLastSnapshotValue(entries, key) ?? 0;
          const accum = getCurrentMonthAccum(key);
          const progress = metas[key] > 0 ? (accum / metas[key]) * 100 : 0;
          const sparkData = getSparklineData(key);
          return (
            <div
              key={key}
              className="bg-white/70 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xl border border-sky-200 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl sm:text-4xl">{emoji}</span>
                <span className="text-xs sm:text-sm font-medium text-sky-600 whitespace-nowrap">{label}</span>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sky-900 mb-4">
                {currentValue.toLocaleString('pt-BR')}
              </div>
              <div className="mb-4">
                <Sparkline data={sparkData} width={120} height={30} />
              </div>
              <div className="w-full bg-sky-200 rounded-full h-2 sm:h-3">
                <div
                  className="bg-gradient-to-r from-sky-500 to-blue-500 h-2 sm:h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
              <p className="text-xs sm:text-sm text-sky-700 mt-2 font-medium">
                {progress.toFixed(1)}% da meta
              </p>
            </div>
          );
        })}
      </div>

      {/* Formulário */}
      <section className="bg-white/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 mb-12 shadow-lg border border-sky-200">
        <h2 className="text-xl sm:text-2xl font-bold text-sky-800 mb-6">
          {editingEntry ? 'Editar Entrada' : 'Nova Entrada'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-sky-700 mb-2">Data</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full p-3 border border-sky-300 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 bg-white/50 transition-all"
              required
            />
          </div>
          {metrics.map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-sky-700 mb-2 capitalize">
                {label}
              </label>
              <input
                type="number"
                step="any"
                value={formData[key]}
                onChange={(e) =>
                  setFormData({ ...formData, [key]: Number(e.target.value) || 0 })
                }
                className="w-full p-3 border border-sky-300 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 bg-white/50 transition-all"
                placeholder="0"
              />
            </div>
          ))}
          <button
            type="submit"
            className="col-span-full md:col-span-1 lg:col-span-1 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-bold py-3 px-8 rounded-xl hover:from-sky-600 hover:to-blue-600 shadow-lg transition-all duration-300 md:col-start-1 lg:col-start-auto"
          >
            {editingEntry ? 'Atualizar' : 'Adicionar'}
          </button>
        </form>
      </section>

      {/* Histórico e Modal Botão */}
      <section className="bg-white/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-lg border border-sky-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-sky-800">Histórico</h2>
          <button
            onClick={openMetasModal}
            className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-md"
          >
            ⚙️ Configurar Metas Mensais
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-sky-200">
                <th className="text-left p-4 font-semibold text-sky-700">Data</th>
                {metrics.map(({ key, label }) => (
                  <th key={key} className="text-right p-4 font-semibold text-sky-700">
                    {label}
                  </th>
                ))}
                <th className="text-right p-4 font-semibold text-sky-700 w-32">Ações</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.date}
                  className="border-b border-sky-100 hover:bg-sky-50 transition-colors duration-200"
                >
                  <td className="p-4 font-medium text-sky-800">{formatDate(entry.date)}</td>
                  {metrics.map(({ key }) => (
                    <td key={key} className="p-4 text-right text-sky-700">
                      {entry[key].toLocaleString('pt-BR')}
                    </td>
                  ))}
                  <td className="p-4 text-right">
                    <button
                      onClick={() => editEntry(entry)}
                      className="text-blue-500 hover:text-blue-600 mr-3 font-medium transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteEntry(entry.date)}
                      className="text-red-500 hover:text-red-600 font-medium transition-colors"
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Metas */}
      {showMetasModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowMetasModal(false);
            }
          }}
        >
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-sky-200">
            <h3 className="text-xl sm:text-2xl font-bold text-sky-800 mb-6 text-center">
              ⚙️ Configurar Metas Mensais
            </h3>
            <form onSubmit={handleMetasSubmit} className="space-y-4">
              {metrics.map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-sky-700 mb-2">
                    {label}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={metasForm[key]}
                    onChange={(e) =>
                      setMetasForm({ ...metasForm, [key]: Number(e.target.value) || 0 })
                    }
                    className="w-full p-3 border border-sky-300 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 bg-white/50 transition-all"
                    placeholder="0"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowMetasModal(false)}
                  className="flex-1 bg-sky-200 text-sky-800 py-3 rounded-xl hover:bg-sky-300 transition-all font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-sky-500 to-blue-500 text-white py-3 rounded-xl hover:from-sky-600 hover:to-blue-600 shadow-lg transition-all font-bold"
                >
                  Salvar Metas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
