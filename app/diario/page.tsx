'use client';

import React, { useState, useEffect } from 'react';

type MetricKey = 'receita' | 'crescimento' | 'alertas' | 'tarefas' | 'previsoes' | 'eventos';

type AggType = 'sum' | 'avg';

interface Metric {
  key: MetricKey;
  emoji: string;
  name: string;
  unit: string;
  agg: AggType;
}

type DailyEntry = {
  date: string;
} & { [K in MetricKey]?: number };

type Metas = Record<MetricKey, number>;

const metrics: Metric[] = [
  { key: 'receita', emoji: '💰', name: 'Receita', unit: 'R$', agg: 'sum' },
  { key: 'crescimento', emoji: '📈', name: 'Crescimento', unit: '%', agg: 'avg' },
  { key: 'alertas', emoji: '⚠️', name: 'Alertas', unit: '', agg: 'sum' },
  { key: 'tarefas', emoji: '💼', name: 'Tarefas', unit: '', agg: 'sum' },
  { key: 'previsoes', emoji: '🔮', name: 'Previsões', unit: '', agg: 'sum' },
  { key: 'eventos', emoji: '📅', name: 'Eventos', unit: '', agg: 'sum' },
];

const defaultMetas: Metas = {
  receita: 50000,
  crescimento: 15,
  alertas: 5,
  tarefas: 20,
  previsoes: 10,
  eventos: 10,
};

const formatDate = (iso: string): string => {
  const [year, month, day] = iso.split('-');
  return `${day.padStart(2, '0')}/${month}/${year}`;
};

const getMonthFromDate = (date: string): string => date.slice(0, 7);

const getMonthStart = (month: string): string => `${month}-01`;

const getNextMonthStart = (month: string): string => {
  const [year, mon] = month.split('-').map(Number);
  const nextMon = mon === 12 ? 1 : mon + 1;
  const nextYear = mon === 12 ? year + 1 : year;
  return `${nextYear}-${nextMon.toString().padStart(2, '0')}-01`;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatValue = (key: MetricKey, value: number | undefined): string => {
  if (value === undefined) return '-';
  switch (key) {
    case 'receita':
      return formatCurrency(value);
    case 'crescimento':
      return `${value.toFixed(1)}%`;
    default:
      return Math.round(value).toString();
  }
};

const getMonthSummary = (
  entries: DailyEntry[],
  metas: Metas,
  key: MetricKey,
  monthStart: string,
  nextMonthStart: string
): {
  value: number;
  progress: number;
  sparklineData: number[];
  maxSpark: number;
} => {
  const monthEntries = entries
    .filter((e) => e.date >= monthStart && e.date < nextMonthStart)
    .sort((a, b) => a.date.localeCompare(b.date));
  const values = monthEntries.map((e) => (e[key] ?? 0) as number);
  const count = values.length;
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = count > 0 ? sum / count : 0;
  const metric = metrics.find((m) => m.key === key)!;
  const aggValue = metric.agg === 'avg' ? avg : sum;
  const meta = metas[key];
  const progress = meta > 0 ? Math.min(100, Math.max(0, (aggValue / meta) * 100)) : 0;
  const sparkData = values.slice(-7);
  const maxSpark = Math.max(...sparkData, 1);
  return { value: aggValue, progress, sparklineData: sparkData, maxSpark };
};

const getSparklinePath = (data: number[], max: number): string => {
  if (data.length === 0) {
    return 'M0 30 L120 30';
  }
  const points: string[] = [];
  data.forEach((v, i) => {
    const x = (i / (data.length - 1)) * 120;
    const y = 30 - (v / max * 28);
    points.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
  });
  return `M0 30 L ${points.join(' L ')} L120 30`;
};

export default function DiarioPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [metas, setMetas] = useState<Metas>(defaultMetas);
  const [currentMonth, setCurrentMonth] = useState('2024-10');
  const [formData, setFormData] = useState<Partial<DailyEntry>>({});
  const [showMetas, setShowMetas] = useState(false);
  const [tempMetas, setTempMetas] = useState<Partial<Metas>>({});

  useEffect(() => {
    const dataStr = localStorage.getItem('diarioData');
    if (dataStr) {
      try {
        const data = JSON.parse(dataStr);
        const sortedEntries = (data.entries ?? []).sort((a, b) =>
          b.date.localeCompare(a.date)
        ) as DailyEntry[];
        setEntries(sortedEntries);
        setMetas(data.metas ?? defaultMetas);
      } catch (e) {
        console.error('Erro ao carregar dados:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (entries.length > 0) {
      setCurrentMonth(getMonthFromDate(entries[0].date));
    }
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('diarioData', JSON.stringify({ entries, metas }));
  }, [entries, metas]);

  const monthStart = getMonthStart(currentMonth);
  const nextMonthStart = getNextMonthStart(currentMonth);

  const handleSubmit = () => {
    if (!formData.date) {
      alert('Por favor, selecione uma data.');
      return;
    }
    const entryData: DailyEntry = { date: formData.date as string };
    metrics.forEach((metric) => {
      entryData[metric.key] = (formData[metric.key] ?? 0) as number;
    });
    const existsIdx = entries.findIndex((e) => e.date === entryData.date);
    let newEntries: DailyEntry[];
    if (existsIdx >= 0) {
      newEntries = [...entries];
      newEntries[existsIdx] = entryData;
    } else {
      newEntries = [entryData, ...entries];
    }
    setEntries(newEntries.sort((a, b) => b.date.localeCompare(a.date)));
    setFormData({});
  };

  const handleOpenMetas = () => {
    setTempMetas(metas);
    setShowMetas(true);
  };

  const handleSaveMetas = () => {
    setMetas({ ...metas, ...tempMetas });
    setShowMetas(false);
    setTempMetas({});
  };

  const handleDelete = (date: string) => {
    if (confirm('Tem certeza que deseja deletar esta entrada?')) {
      setEntries(entries.filter((e) => e.date !== date));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Diário de Métricas
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Acompanhe seu progresso diário com KPIs visuais, sparklines e histórico completo.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <label className="text-lg font-semibold text-gray-800">Mês:</label>
            <input
              type="month"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white shadow-sm"
            />
          </div>
          <button
            onClick={handleOpenMetas}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            🎯 Definir Metas
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {metrics.map((metric) => {
            const summary = getMonthSummary(entries, metas, metric.key, monthStart, nextMonthStart);
            return (
              <div
                key={metric.key}
                className="group bg-white/70 backdrop-blur-sm border border-white/50 rounded-3xl p-8 shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-300 hover:bg-white"
              >
                <div className="text-4xl mb-4">{metric.emoji}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{metric.name}</h3>
                <div className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                  {formatValue(metric.key, summary.value)}
                </div>
                <div className="w-full bg-gray-200 rounded-2xl h-4 mb-2 overflow-hidden">
                  <div
                    className="h-4 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl transition-all duration-1000"
                    style={{ width: `${summary.progress}%` }}
                  />
                </div>
                <div className="text-right text-sm font-semibold text-emerald-600 mb-4">
                  {Math.round(summary.progress)}% da meta
                </div>
                <div className="w-full h-12">
                  <svg viewBox="0 0 120 32" className="w-full h-full">
                    <path
                      d={getSparklinePath(summary.sparklineData, summary.maxSpark)}
                      stroke="url(#sparkGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <defs>
                      <linearGradient id="sparkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        <section className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-3xl p-8 shadow-2xl mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            📝 {formData.date ? 'Editar Entrada' : 'Nova Entrada Diária'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
              <input
                type="date"
                value={formData.date || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white shadow-sm"
              />
            </div>
            {metrics.map((metric) => (
              <div key={metric.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  {metric.emoji} {metric.name}
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={metric.emoji}
                  value={(formData[metric.key] ?? '').toString()}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setFormData((prev) => ({ ...prev, [metric.key]: val }));
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white shadow-sm"
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleSubmit}
              disabled={!formData.date}
              className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formData.date ? 'Salvar Alterações' : 'Adicionar Entrada'}
            </button>
            <button
              onClick={() => setFormData({})}
              className="px-8 py-3 bg-gray-300 text-gray-800 font-semibold rounded-xl hover:bg-gray-400 transition-all duration-200"
            >
              Limpar Formulário
            </button>
          </div>
        </section>

        <section className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">📊 Histórico Completo</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-200">
                    Data
                  </th>
                  {metrics.map((metric) => (
                    <th
                      key={metric.key}
                      className="px-6 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-200"
                    >
                      {metric.emoji}
                      <br />
                      {metric.name}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-200">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entries.map((entry) => (
                  <tr key={entry.date} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200">
                      {formatDate(entry.date)}
                    </td>
                    {metrics.map((metric) => (
                      <td
                        key={metric.key}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center border-b border-gray-200"
                      >
                        {formatValue(metric.key, entry[metric.key])}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium border-b border-gray-200">
                      <button
                        onClick={() => setFormData(entry)}
                        className="text-blue-600 hover:text-blue-900 mr-4 font-medium transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(entry.date)}
                        className="text-red-600 hover:text-red-900 font-medium transition-colors"
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {entries.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Nenhuma entrada ainda. Adicione a primeira!</p>
            </div>
          )}
        </section>
      </div>

      {showMetas && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">🎯 Metas Mensais</h3>
              {metrics.map((metric) => (
                <div key={metric.key} className="mb-6 last:mb-0">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-3">
                    {metric.emoji} {metric.name}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={tempMetas[metric.key]?.toString() ?? ''}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setTempMetas((prev) => ({ ...prev, [metric.key]: val }));
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white shadow-sm text-lg"
                  />
                </div>
              ))}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleSaveMetas}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                >
                  Salvar Metas
                </button>
                <button
                  onClick={() => {
                    setShowMetas(false);
                    setTempMetas({});
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
