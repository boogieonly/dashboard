'use client';

import { useState, useEffect, useCallback } from 'react';

type MetricKey = 'faturamento' | 'vendas' | 'atrasos' | 'carteira' | 'previsaoAtual' | 'previsaoProx';

type DailyEntry = {
  date: string;
} & Record<MetricKey, number>;

type Metas = Record<MetricKey, number>;

type Metric = {
  key: MetricKey;
  label: string;
  emoji: string;
};

const metrics: Metric[] = [
  { key: 'faturamento', label: 'Faturamento', emoji: '💰' },
  { key: 'vendas', label: 'Vendas', emoji: '📈' },
  { key: 'atrasos', label: 'Atrasos', emoji: '⚠️' },
  { key: 'carteira', label: 'Carteira', emoji: '💼' },
  { key: 'previsaoAtual', label: 'Previsão Atual', emoji: '🔮' },
  { key: 'previsaoProx', label: 'Previsão Próx.', emoji: '📅' },
];

const defaultMetas: Metas = {
  faturamento: 0,
  vendas: 0,
  atrasos: 0,
  carteira: 0,
  previsaoAtual: 0,
  previsaoProx: 0,
};

const formatDate = (dateStr: string): string =>
  new Date(dateStr + 'T00:00:00Z').toLocaleDateString('pt-BR');

const getMonthStart = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00Z');
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString().split('T')[0];
};

const computeAccum = (
  entries: DailyEntry[],
  startDate: string,
  key: MetricKey
): number =>
  entries
    .filter((e) => e.date >= startDate)
    .reduce((sum, e) => sum + (e[key] || 0), 0);

const getLastSnapshotValue = (
  entries: DailyEntry[],
  key: MetricKey
): number => {
  const sorted = [...entries].sort((a, b) =>
    new Date(b.date + 'T00:00:00Z').getTime() -
    new Date(a.date + 'T00:00:00Z').getTime()
  );
  for (const e of sorted) {
    if ((e[key] || 0) > 0) return e[key];
  }
  return 0;
};

const Sparkline = ({ data }: { data: number[] }) => {
  if (data.length === 0) {
    return <div className="w-20 h-8 bg-gray-200 rounded" />;
  }
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max > min ? max - min : 1;
  const points = data
    .map((v, i) => `${i * 4},${32 - Math.max(0, ((v - min) / range) * 30)}`)
    .join(' ');
  return (
    <svg className="w-20 h-8 mt-2" viewBox="0 0 80 32">
      <polyline
        points={points}
        stroke="currentColor"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default function DiarioPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [metas, setMetas] = useState<Metas>(defaultMetas);
  const [formDate, setFormDate] = useState<string>('');
  const [formData, setFormData] = useState<Partial<Record<MetricKey, number>>>({});
  const [showMetas, setShowMetas] = useState(false);
  const [metaForm, setMetaForm] = useState<Partial<Metas>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem('diarioEntries');
      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
      }
      const savedMetas = localStorage.getItem('diarioMetas');
      if (savedMetas) {
        setMetas({ ...defaultMetas, ...JSON.parse(savedMetas) });
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('diarioEntries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('diarioMetas', JSON.stringify(metas));
  }, [metas]);

  const today = new Date().toISOString().split('T')[0];
  const monthStart = getMonthStart(today);

  const currentAccum: Record<MetricKey, number> = metrics.reduce(
    (acc, m) => {
      acc[m.key] = computeAccum(entries, monthStart, m.key);
      return acc;
    },
    {} as Record<MetricKey, number>
  );

  const last7Days: string[] = (() => {
    const days: string[] = [];
    const now = new Date(today + 'T00:00:00Z');
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setUTCDate(now.getUTCDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  })();

  const sparkData: Record<MetricKey, number[]> = metrics.reduce(
    (acc, m) => {
      acc[m.key] = last7Days.map((date) => {
        const entry = entries.find((e) => e.date === date);
        return entry ? entry[m.key] || 0 : 0;
      });
      return acc;
    },
    {} as Record<MetricKey, number[]>
  );

  const getProgress = useCallback((key: MetricKey): number => {
    const accum = currentAccum[key];
    const target = metas[key];
    return target > 0 ? Math.min(100, (accum / target) * 100) : 0;
  }, [currentAccum, metas]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDate) return;

    const newEntryData: Record<MetricKey, number> = metrics.reduce(
      (acc, m) => {
        acc[m.key] = formData[m.key] ?? 0;
        return acc;
      },
      {} as Record<MetricKey, number>
    );

    const newEntry: DailyEntry = { date: formDate, ...newEntryData };

    let newEntries: DailyEntry[];
    if (isEditing) {
      newEntries = entries.map((en) => (en.date === formDate ? newEntry : en));
      setIsEditing(false);
    } else {
      newEntries = entries.filter((en) => en.date !== formDate).concat(newEntry);
    }
    newEntries.sort((a, b) => b.date.localeCompare(a.date));
    setEntries(newEntries);
    setFormDate('');
    setFormData({});
  };

  const handleEdit = (entry: DailyEntry) => {
    setFormDate(entry.date);
    setFormData({ ...entry });
    setIsEditing(true);
  };

  const handleDelete = (date: string) => {
    setEntries(entries.filter((e) => e.date !== date));
  };

  const handleOpenMetas = () => setShowMetas(true);

  const handleSaveMetas = () => {
    setMetas({ ...defaultMetas, ...metaForm } as Metas);
    setShowMetas(false);
    setMetaForm({});
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Diário de Indicadores</h1>
      </header>

      {/* KPI Cards 2x3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {metrics.map((metric) => (
          <div key={metric.key} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{metric.emoji}</span>
              <span className="text-sm font-medium text-gray-600">{metric.label}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {currentAccum[metric.key].toLocaleString('pt-BR')}
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${getProgress(metric.key)}%` }}
                />
              </div>
              <div className="text-sm font-medium mt-2 text-gray-600">
                {getProgress(metric.key).toFixed(1)}%
              </div>
            </div>
            <Sparkline data={sparkData[metric.key]} />
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="date"
            value={formDate}
            onChange={(e) => setFormDate(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          {metrics.map((m) => (
            <div key={m.key}>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                {m.emoji} {m.label}
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                value={formData[m.key]?.toString() ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    [m.key]: e.target.value ? parseFloat(e.target.value) : undefined,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {isEditing ? 'Atualizar' : 'Adicionar Hoje'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormDate('');
                setFormData({});
              }}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Histórico Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Histórico</h2>
            <button
              onClick={handleOpenMetas}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
            >
              📊 Gerenciar Metas
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Data</th>
                {metrics.map((m) => (
                  <th key={m.key} className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    {m.emoji}<br className="sm:hidden" /> {m.label}
                  </th>
                ))}
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry) => (
                <tr key={entry.date} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {formatDate(entry.date)}
                  </td>
                  {metrics.map((m) => (
                    <td key={m.key} className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {entry[m.key].toLocaleString('pt-BR')}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="text-blue-600 hover:text-blue-900 mr-4 font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(entry.date)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Metas */}
      {showMetas && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Metas Mensais</h3>
            <div className="space-y-6">
              {metrics.map((m) => (
                <div key={m.key}>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    {m.emoji} {m.label}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={metaForm[m.key]?.toString() ?? metas[m.key].toString()}
                    onChange={(e) =>
                      setMetaForm((prev) => ({
                        ...prev,
                        [m.key]: e.target.value ? parseFloat(e.target.value) : undefined,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
            <div className="mt-8 flex gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowMetas(false);
                  setMetaForm({});
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveMetas}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Salvar Metas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
