'use client';

import React, { useState, useEffect } from 'react';

type MetricKey = 'faturamento' | 'vendas' | 'atrasos' | 'carteira' | 'previsaoAtual' | 'previsaoProx';

interface DailyEntry {
  date: string;
  faturamento: number;
  vendas: number;
  atrasos: number;
  carteira: number;
  previsaoAtual: number;
  previsaoProx: number;
}

type Metas = {
  faturamento: number;
  vendas: number;
  atrasos: number;
  carteira: number;
  previsaoAtual: number;
  previsaoProx: number;
};

type Metric = {
  key: MetricKey;
  label: string;
  emoji: string;
  color: string;
};

const METRICS: Metric[] = [
  { key: 'faturamento', label: 'Faturamento', emoji: '💰', color: 'blue' },
  { key: 'vendas', label: 'Vendas', emoji: '📦', color: 'green' },
  { key: 'atrasos', label: 'Atrasos', emoji: '⚠️', color: 'orange' },
  { key: 'carteira', label: 'Carteira', emoji: '💳', color: 'cyan' },
  { key: 'previsaoAtual', label: 'Previsão Atual', emoji: '🔮', color: 'teal' },
  { key: 'previsaoProx', label: 'Previsão Próx', emoji: '📈', color: 'sky' },
];

const defaultMetas: Metas = {
  faturamento: 10000,
  vendas: 100,
  atrasos: 5,
  carteira: 5000,
  previsaoAtual: 12000,
  previsaoProx: 15000,
};

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getMonthStart(): string {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.toISOString().split('T')[0];
}

function sameMonth(date1: string, date2: string): boolean {
  const d1 = new Date(date1 + 'T00:00:00');
  const d2 = new Date(date2 + 'T00:00:00');
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
}

function computeAccum(entries: DailyEntry[], metric: MetricKey): number {
  return entries.reduce((sum, entry) => sum + (entry[metric] ?? 0), 0);
}

function getLastSnapshotValue(entries: DailyEntry[], metric: MetricKey): number {
  if (entries.length === 0) return 0;
  const lastEntry = entries.reduce((latest, entry) =>
    new Date(entry.date) > new Date(latest.date) ? entry : latest
  );
  return lastEntry[metric] ?? 0;
}

function getLast7DaysData(entries: DailyEntry[], metric: MetricKey): number[] {
  const data: number[] = [];
  const today = new Date(getToday() + 'T00:00:00');
  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(today.getTime() - i * 86400000);
    const dateStr = targetDate.toISOString().split('T')[0];
    const entry = entries.find((e) => e.date === dateStr);
    data.push(entry ? (entry[metric] ?? 0) : 0);
  }
  return data;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

const getDefaultFormData = (): DailyEntry => ({
  date: getToday(),
  faturamento: 0,
  vendas: 0,
  atrasos: 0,
  carteira: 0,
  previsaoAtual: 0,
  previsaoProx: 0,
});

interface SparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

const Sparkline: React.FC<SparklineProps> = ({ data, color, width = 80, height = 40 }) => {
  if (data.length === 0 || data.every((d) => d === 0)) {
    return <div className="w-[80px] h-10 bg-gray-200 rounded-full" />;
  }
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max > min ? max - min : 1;
  const points: string[] = [];
  data.forEach((d, i) => {
    const x = (i / (data.length - 1)) * (width - 4);
    const y = height - 4 - ((d - min) / range) * (height - 8);
    points.push(`${x},${y}`);
  });
  const pointsStr = points.join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-10 block">
      <polyline
        points={pointsStr}
        fill="none"
        stroke={`${color}-500`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const DiarioPage = () => {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [metas, setMetas] = useState<Metas>(defaultMetas);
  const [formData, setFormData] = useState<DailyEntry>(getDefaultFormData());
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [showMetasModal, setShowMetasModal] = useState(false);

  useEffect(() => {
    const savedEntries = localStorage.getItem('diario-entries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
    const savedMetas = localStorage.getItem('diario-metas');
    if (savedMetas) {
      setMetas(JSON.parse(savedMetas));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('diario-entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('diario-metas', JSON.stringify(metas));
  }, [metas]);

  const currentMonthEntries = entries.filter((e) => sameMonth(e.date, getToday()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entryData: DailyEntry = { date: formData.date } as DailyEntry;
    METRICS.forEach((m) => {
      entryData[m.key] = formData[m.key];
    });
    if (editingEntryId) {
      setEntries((prev) =>
        prev.map((entry) => (entry.date === editingEntryId ? entryData : entry))
      );
      setEditingEntryId(null);
    } else {
      setEntries((prev) => [
        ...prev,
        entryData,
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
    setFormData(getDefaultFormData());
  };

  const handleEdit = (entry: DailyEntry) => {
    setEditingEntryId(entry.date);
    setFormData(entry);
  };

  const handleDelete = (date: string) => {
    if (confirm('Tem certeza que deseja deletar esta entrada?')) {
      setEntries((prev) => prev.filter((e) => e.date !== date));
    }
  };

  const monthlyValues = METRICS.map((m) => computeAccum(currentMonthEntries, m.key));

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-white p-6 md:p-8 pb-20">
      {/* KPI Cards */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-center bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-16">
          📊 Dashboard Diário
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {METRICS.map((m, index) => {
            const value = monthlyValues[index];
            const progress = metas[m.key] > 0 ? Math.min(100, (value / metas[m.key]) * 100) : 0;
            const sparkData = getLast7DaysData(entries, m.key);
            return (
              <div
                key={m.key}
                className="group bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 hover:shadow-3xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-200">
                    {m.emoji}
                  </span>
                  <Sparkline data={sparkData} color={m.color} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 capitalize">{m.label}</h3>
                <p className="text-4xl lg:text-3xl font-black bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-6">
                  {value.toLocaleString()}
                </p>
                <div className="w-full bg-gray-200/50 rounded-2xl h-4 overflow-hidden">
                  <div
                    className={`h-4 bg-gradient-to-r from-${m.color}-500 to-${m.color}-600 rounded-2xl shadow-lg transition-all duration-700`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm font-semibold text-gray-700 mt-3">
                  {value.toLocaleString()} / {metas[m.key].toLocaleString()} ({progress.toFixed(1)}%)
                </p>
              </div>
            );
          })}
        </div>

        {/* Resumo Mensal */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-center text-blue-800 mb-12 tracking-tight">
            📈 Resumo Mensal
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {METRICS.map((m, index) => {
              const value = monthlyValues[index];
              const progress = metas[m.key] > 0 ? (value / metas[m.key]) * 100 : 0;
              return (
                <div
                  key={m.key}
                  className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{m.emoji}</span>
                      <h3 className="text-2xl font-bold text-gray-800">{m.label}</h3>
                    </div>
                    <span className="text-2xl font-bold text-blue-700">
                      {value.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-3xl h-6 shadow-inner overflow-hidden">
                    <div
                      className={`h-6 bg-gradient-to-r from-${m.color}-500 via-${m.color}-600 to-${m.color}-700 rounded-3xl shadow-lg transition-all duration-1000`}
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-4">
                    <span className="text-sm font-medium text-gray-600">
                      Meta: {metas[m.key].toLocaleString()}
                    </span>
                    <span className={`text-lg font-bold ${progress >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                      {Math.min(100, progress).toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Formulário */}
        <section className="mb-20">
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl p-10 shadow-2xl">
            <h2 className="text-4xl font-bold text-blue-800 mb-10 text-center">
              {editingEntryId ? '✏️ Editar Entrada' : '➕ Nova Entrada Diária'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">📅 Data</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-5 border-2 border-blue-200 rounded-2xl focus:ring-4 focus:ring-blue-200/50 focus:border-blue-400 bg-white/60 shadow-lg text-lg font-medium transition-all"
                />
              </div>
              {METRICS.map((m) => (
                <div key={m.key}>
                  <label className="block text-lg font-semibold text-gray-700 mb-4">
                    {m.emoji} {m.label}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData[m.key]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [m.key]: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className={`w-full p-5 border-2 rounded-2xl shadow-lg focus:ring-4 focus:ring-${m.color}-200/50 focus:border-${m.color}-400 bg-white/60 text-lg font-medium transition-all border-${m.color}-200`}
                  />
                </div>
              ))}
              <div className="lg:col-span-3 flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-5 px-8 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all duration-200"
                >
                  {editingEntryId ? '✅ Atualizar' : '💾 Salvar'} Entrada
                </button>
                {editingEntryId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEntryId(null);
                      setFormData(getDefaultFormData());
                    }}
                    className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white py-5 px-8 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all duration-200"
                  >
                    ❌ Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

        {/* Histórico */}
        <section>
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl p-10 shadow-2xl overflow-hidden">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-4">
              <h2 className="text-4xl font-bold text-blue-800 flex-1">📋 Histórico do Mês</h2>
              <button
                onClick={() => setShowMetasModal(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all whitespace-nowrap"
              >
                ⚙️ Configurar Metas Mensais
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-sky-50 backdrop-blur-sm">
                    <th className="px-6 py-5 text-left text-lg font-bold text-blue-800 border-b border-blue-100">Data</th>
                    {METRICS.map((m) => (
                      <th
                        key={m.key}
                        className={`px-6 py-5 text-left text-lg font-bold text-${m.color}-700 border-b border-blue-100`}
                      >
                        {m.emoji}
                      </th>
                    ))}
                    <th className="px-6 py-5 text-left text-lg font-bold text-blue-800 border-b border-blue-100">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentMonthEntries
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((entry) => (
                      <tr
                        key={entry.date}
                        className="hover:bg-blue-50/50 transition-all border-b border-blue-50 backdrop-blur-sm"
                      >
                        <td className="px-6 py-6 font-bold text-xl text-gray-900 border-b border-blue-50">
                          {formatDate(entry.date)}
                        </td>
                        {METRICS.map((m) => (
                          <td
                            key={m.key}
                            className={`px-6 py-6 font-semibold text-lg text-${m.color}-600 border-b border-blue-50`}
                          >
                            {(entry[m.key] as number).toLocaleString()}
                          </td>
                        ))}
                        <td className="px-6 py-6 border-b border-blue-50">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(entry)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-sm"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(entry.date)}
                              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-sm"
                            >
                              Deletar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {currentMonthEntries.length === 0 && (
                    <tr>
                      <td
                        colSpan={METRICS.length + 2}
                        className="px-6 py-20 text-center text-xl text-gray-500 font-medium"
                      >
                        📭 Nenhuma entrada registrada este mês. Adicione a primeira!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* Modal Metas */}
      {showMetasModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-10 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-3xl border border-white/60">
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-blue-100">
              <h2 className="text-4xl font-bold text-blue-800">⚙️ Configurar Metas Mensais</h2>
              <button
                onClick={() => setShowMetasModal(false)}
                className="text-4xl text-gray-500 hover:text-blue-600 transition-colors p-2 -m-2 rounded-2xl hover:bg-blue-50"
              >
                &times;
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowMetasModal(false);
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {METRICS.map((m) => (
                <div key={m.key}>
                  <label className="block text-xl font-bold text-gray-800 mb-5 flex items-center space-x-3">
                    <span className="text-2xl">{m.emoji}</span>
                    <span>{m.label}</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={metas[m.key]}
                    onChange={(e) =>
                      setMetas((prev) => ({
                        ...prev,
                        [m.key]: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className={`w-full p-6 border-2 rounded-3xl shadow-xl focus:ring-4 focus:ring-${m.color}-200/50 focus:border-${m.color}-500 bg-white/70 text-2xl font-bold text-gray-900 transition-all border-${m.color}-200 hover:border-${m.color}-300`}
                  />
                </div>
              ))}
              <div className="lg:col-span-3 pt-8 border-t border-blue-100 mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-6 px-10 rounded-3xl font-bold text-2xl shadow-2xl hover:shadow-3xl transition-all duration-200"
                >
                  💾 Salvar Metas
                </button>
                <button
                  type="button"
                  onClick={() => setShowMetasModal(false)}
                  className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white py-6 px-10 rounded-3xl font-bold text-2xl shadow-2xl hover:shadow-3xl transition-all duration-200"
                >
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiarioPage;
