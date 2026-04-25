'use client';

import { useState, useEffect } from 'react';

type MetricKey = 'faturamento' | 'vendas' | 'atrasos' | 'carteiraTotal' | 'previsaoMesAtual' | 'previsaoMesSeguinte';

interface DailyEntry {
  date: string;
  [K in MetricKey]: number;
}

type Metas = {
  [K in MetricKey]: number;
};

interface Metric {
  key: MetricKey;
  label: string;
  emoji: string;
  color: string;
}

type FormDataType = DailyEntry;

const METRICS: Metric[] = [
  { key: 'faturamento', label: 'Faturamento', emoji: '💰', color: 'stroke-emerald-500' },
  { key: 'vendas', label: 'Vendas', emoji: '📈', color: 'stroke-blue-500' },
  { key: 'atrasos', label: 'Atrasos', emoji: '⚠️', color: 'stroke-amber-500' },
  { key: 'carteiraTotal', label: 'Carteira Total', emoji: '💼', color: 'stroke-slate-600' },
  { key: 'previsaoMesAtual', label: 'Previsão Mês Atual', emoji: '🔮', color: 'stroke-cyan-500' },
  { key: 'previsaoMesSeguinte', label: 'Previsão Mês Seguinte', emoji: '📅', color: 'stroke-sky-500' },
];

const defaultMetas: Metas = {
  faturamento: 1000000,
  vendas: 200,
  atrasos: 10,
  carteiraTotal: 2000000,
  previsaoMesAtual: 1100000,
  previsaoMesSeguinte: 1200000,
};

const getToday = (): string => new Date().toISOString().split('T')[0];

const getMonthStart = (dateStr: string): string => {
  const date = new Date(dateStr);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.toISOString().split('T')[0];
};

const sameMonth = (date1: string, date2: string): boolean =>
  getMonthStart(date1) === getMonthStart(date2);

const computeAccum = (entries: DailyEntry[], metric: MetricKey, upToDate: string): number => {
  const monthStart = getMonthStart(upToDate);
  return entries
    .filter((entry) => sameMonth(entry.date, upToDate) && entry.date <= upToDate)
    .reduce((acc, entry) => acc + entry[metric], 0);
};

const getLastSnapshotValue = (entries: DailyEntry[], metric: MetricKey): number => {
  const currentMonthEntries = entries.filter((e) => sameMonth(e.date, getToday()));
  if (currentMonthEntries.length === 0) return 0;
  const latestDate = currentMonthEntries.reduce(
    (maxDate, e) => (new Date(e.date) > new Date(maxDate) ? e.date : maxDate),
    currentMonthEntries[0].date
  );
  const latestEntry = currentMonthEntries.find((e) => e.date === latestDate);
  return latestEntry ? latestEntry[metric] : 0;
};

const getLast7Accum = (entries: DailyEntry[], metric: MetricKey): number[] => {
  const todayDate = getToday();
  const today = new Date(todayDate);
  const data: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    const accum = computeAccum(entries, metric, dateStr);
    data.push(accum);
  }
  return data;
};

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

interface SparklineProps {
  data: number[];
  color: string;
}

const Sparkline = ({ data, color }: SparklineProps) => {
  if (data.length === 0 || data.every((v) => v === 0)) {
    return <div className="w-20 h-5 bg-gray-200 rounded" />;
  }
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const normalizedY = data.map((v) => 20 - ((v - min) / range) * 18);
  const points = data
    .map((_, i) => `${(i / (data.length - 1)) * 80} ${normalizedY[i]}`)
    .join(' ');
  return (
    <svg className="w-20 h-5" viewBox="0 0 80 20">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default function Diario() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [metas, setMetas] = useState<Metas>(defaultMetas);
  const [formData, setFormData] = useState<FormDataType>({
    date: getToday(),
    faturamento: 0,
    vendas: 0,
    atrasos: 0,
    carteiraTotal: 0,
    previsaoMesAtual: 0,
    previsaoMesSeguinte: 0,
  });
  const [editingEntry, setEditingEntry] = useState<DailyEntry | null>(null);
  const [showMetasModal, setShowMetasModal] = useState(false);
  const [tempMetas, setTempMetas] = useState<Metas | undefined>();

  const currentMonthEntries = entries
    .filter((e) => sameMonth(e.date, getToday()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem('diario-entries');
      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
      }
      const savedMetas = localStorage.getItem('diario-metas');
      if (savedMetas) {
        setMetas(JSON.parse(savedMetas));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('diario-entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('diario-metas', JSON.stringify(metas));
  }, [metas]);

  useEffect(() => {
    if (showMetasModal) {
      setTempMetas(metas);
    } else {
      setTempMetas(undefined);
    }
  }, [showMetasModal, metas]);

  const getCurrentValue = (metric: MetricKey): number => {
    if (metric === 'previsaoMesAtual' || metric === 'previsaoMesSeguinte') {
      return getLastSnapshotValue(entries, metric);
    }
    return computeAccum(entries, metric, getToday());
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newEntry: DailyEntry = formData as DailyEntry;

    if (editingEntry) {
      setEntries(entries.map((e) => (e.date === editingEntry.date ? newEntry : e)));
      setEditingEntry(null);
    } else {
      const exists = entries.find((e) => e.date === newEntry.date);
      if (exists) {
        alert('Entrada para esta data já existe. Use Editar.');
        return;
      }
      setEntries([...entries, newEntry]);
    }
    setFormData({
      date: getToday(),
      faturamento: 0,
      vendas: 0,
      atrasos: 0,
      carteiraTotal: 0,
      previsaoMesAtual: 0,
      previsaoMesSeguinte: 0,
    });
  };

  const editEntry = (entry: DailyEntry) => {
    setEditingEntry(entry);
    setFormData(entry);
  };

  const deleteEntry = (date: string) => {
    if (confirm('Tem certeza que deseja deletar esta entrada?')) {
      setEntries(entries.filter((e) => e.date !== date));
      if (editingEntry?.date === date) {
        setEditingEntry(null);
        setFormData({
          date: getToday(),
          faturamento: 0,
          vendas: 0,
          atrasos: 0,
          carteiraTotal: 0,
          previsaoMesAtual: 0,
          previsaoMesSeguinte: 0,
        });
      }
    }
  };

  const handleSaveMetas = () => {
    if (tempMetas) {
      setMetas(tempMetas);
      setShowMetasModal(false);
    }
  };

  const updateTempMeta = (key: MetricKey, value: number) => {
    setTempMetas((prev) => ({ ...prev!, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
          📊 Diário de Métricas
        </h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
          {METRICS.map((metric) => {
            const value = getCurrentValue(metric.key);
            const target = metas[metric.key];
            const progress = target > 0 ? Math.min(100, (value / target) * 100) : 0;
            const sparkData = getLast7Accum(entries, metric.key);
            const progressBg =
              progress >= 100
                ? 'bg-emerald-500'
                : progress >= 80
                ? 'bg-amber-500'
                : 'bg-red-500';
            return (
              <div
                key={metric.key}
                className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl md:text-3xl">{metric.emoji}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      progress >= 100
                        ? 'bg-emerald-100 text-emerald-800'
                        : progress >= 80
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {Math.round(progress)}%
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                  {metric.label}
                </h3>
                <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  {value.toLocaleString('pt-BR')}
                </p>
                <Sparkline data={sparkData} color={metric.color} />
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r from-blue-500 to-sky-500 transition-all ${progressBg === 'bg-red-500' ? 'from-red-500 to-red-400' : progressBg === 'bg-amber-500' ? 'from-amber-500 to-amber-400' : 'from-emerald-500 to-emerald-400'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Formulário */}
        <section className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 md:p-8 shadow-2xl mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            📝 {editingEntry ? 'Editar Entrada' : 'Nova Entrada'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Data</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full max-w-xs md:max-w-none"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            {METRICS.map((m) => (
              <div key={m.key} className="form-control w-full">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    {m.emoji} {m.label}
                  </span>
                </label>
                <input
                  type="number"
                  step="any"
                  className="input input-bordered w-full"
                  value={formData[m.key]}
                  onChange={(e) =>
                    setFormData({ ...formData, [m.key]: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0"
                  required
                />
              </div>
            ))}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col sm:flex-row gap-3 pt-2">
              <button type="submit" className="btn btn-primary flex-1">
                {editingEntry ? 'Atualizar' : 'Adicionar Entrada'}
              </button>
              {editingEntry && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setEditingEntry(null);
                    setFormData({
                      date: getToday(),
                      faturamento: 0,
                      vendas: 0,
                      atrasos: 0,
                      carteiraTotal: 0,
                      previsaoMesAtual: 0,
                      previsaoMesSeguinte: 0,
                    });
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Histórico */}
        <section className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 md:p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            📋 Histórico do Mês
          </h2>
          {currentMonthEntries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Nenhuma entrada registrada este mês.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Data</th>
                    {METRICS.map((m) => (
                      <th key={m.key} className="text-center">
                        {m.emoji}
                        <br />
                        <span className="text-xs font-normal">{m.label}</span>
                      </th>
                    ))}
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMonthEntries.map((entry) => (
                    <tr key={entry.date}>
                      <th>{formatDate(entry.date)}</th>
                      {METRICS.map((m) => (
                        <td key={m.key} className="text-right">
                          {entry[m.key].toLocaleString('pt-BR')}
                        </td>
                      ))}
                      <td>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => editEntry(entry)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-error"
                            onClick={() => deleteEntry(entry.date)}
                          >
                            Deletar
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

        {/* FAB for Metas */}
        <button
          className="fixed bottom-6 right-6 btn btn-circle btn-primary text-2xl shadow-xl border-0"
          onClick={() => setShowMetasModal(true)}
        >
          ⚙️
        </button>

        {/* Modal Metas */}
        {showMetasModal && (
          <dialog open className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-6">
                ⚙️ Configurar Metas Mensais
              </h3>
              <form className="space-y-4">
                {METRICS.map((m) => (
                  <div key={m.key} className="flex flex-col gap-2">
                    <label className="label-text font-medium flex items-center gap-2">
                      {m.emoji} {m.label}
                    </label>
                    <input
                      type="number"
                      step="any"
                      className="input input-bordered w-full"
                      value={tempMetas?.[m.key] ?? 0}
                      onChange={(e) =>
                        updateTempMeta(m.key, parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                ))}
                <div className="modal-action gap-2 mt-8">
                  <button className="btn btn-primary" type="button" onClick={handleSaveMetas}>
                    Salvar
                  </button>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => setShowMetasModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </dialog>
        )}
      </div>
    </div>
  );
}
