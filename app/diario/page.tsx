'use client';

import { useState, useEffect } from 'react';

type MetricKey = 'faturamento' | 'vendas' | 'atrasos' | 'carteira' | 'previsaoAtual' | 'previsaoProx';

type DailyEntry = {
  date: string;
} & Record<MetricKey, number>;

type Metas = Record<MetricKey, number>;

type CurrentForm = Partial<DailyEntry>;

type CurrentMetasForm = Partial<Metas>;

const metricKeys: MetricKey[] = ['faturamento', 'vendas', 'atrasos', 'carteira', 'previsaoAtual', 'previsaoProx'];

const emojis: Record<MetricKey, string> = {
  faturamento: '💰',
  vendas: '💲',
  atrasos: '⚠️',
  carteira: '💼',
  previsaoAtual: '🔮',
  previsaoProx: '📅',
};

const inputClass = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

const labelClass = "block text-sm font-medium text-gray-700 mb-1";

const buttonPrimary = "inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex-1";

const buttonSecondary = "inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex-1";

const buttonMetas = "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500";

const buttonActionEdit = "text-indigo-600 hover:text-indigo-900 mr-3 text-xs font-medium underline";

const buttonActionDelete = "text-red-600 hover:text-red-900 text-xs font-medium underline";

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

function formatCurrency(num: number): string {
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatValue(metric: MetricKey, num: number): string {
  return formatCurrency(num);
}

export default function DiarioPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [currentForm, setCurrentForm] = useState<CurrentForm>({});
  const [metas, setMetas] = useState<Metas>({} as Metas);
  const [showMetasModal, setShowMetasModal] = useState(false);
  const [currentMetasForm, setCurrentMetasForm] = useState<CurrentMetasForm>({});

  useEffect(() => {
    const savedEntries = localStorage.getItem('diarioEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }

    const savedMetas = localStorage.getItem('diarioMetas');
    if (savedMetas) {
      setMetas(JSON.parse(savedMetas));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('diarioEntries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('diarioMetas', JSON.stringify(metas));
  }, [metas]);

  useEffect(() => {
    const today = new Date();
    const isoDate = today.toISOString().split('T')[0];
    setCurrentForm({ date: isoDate });
  }, []);

  const getLatestValue = (metric: MetricKey): number => {
    const latest = entries[0];
    return latest ? (latest[metric] ?? 0) : 0;
  };

  const getSparklineData = (metric: MetricKey, days: number = 7): number[] => {
    const recent = entries.slice(0, days).map((e) => e[metric] ?? 0);
    return recent.reverse();
  };

  const clearForm = () => {
    const today = new Date();
    const isoDate = today.toISOString().split('T')[0];
    setCurrentForm({ date: isoDate });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const date = currentForm.date;
    if (!date) {
      alert('Data é obrigatória!');
      return;
    }

    const entryData: Record<MetricKey, number> = {} as Record<MetricKey, number>;
    metricKeys.forEach((key) => {
      entryData[key] = (currentForm[key as MetricKey] ?? 0) as number;
    });

    const newEntry: DailyEntry = {
      date,
      ...entryData,
    };

    setEntries((prev) => {
      const index = prev.findIndex((e) => e.date === date);
      if (index >= 0) {
        const newEntries = [...prev];
        newEntries[index] = newEntry;
        return newEntries.sort((a, b) => b.date.localeCompare(a.date));
      } else {
        return [newEntry, ...prev].sort((a, b) => b.date.localeCompare(a.date));
      }
    });

    clearForm();
  };

  const editEntry = (entry: DailyEntry) => {
    setCurrentForm(entry);
  };

  const deleteEntry = (date: string) => {
    if (confirm('Tem certeza que deseja excluir esta entrada?')) {
      setEntries((prev) => prev.filter((e) => e.date !== date));
    }
  };

  const openMetasModal = () => {
    setCurrentMetasForm(metas);
    setShowMetasModal(true);
  };

  const handleSaveMetas = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedMetas: Metas = {} as Metas;
    metricKeys.forEach((key) => {
      updatedMetas[key] = (currentMetasForm[key] ?? metas[key] ?? 0) as number;
    });
    setMetas(updatedMetas);
    setShowMetasModal(false);
    setCurrentMetasForm({});
  };

  const Sparkline = ({ data, metric }: { data: number[]; metric: MetricKey }) => {
    if (data.length === 0) {
      return <div className="h-6 bg-gray-200 rounded-full w-full" />;
    }
    const minV = Math.min(...data);
    const maxV = Math.max(...data);
    const range = maxV > minV ? maxV - minV : 1;
    const width = 120;
    const height = 24;
    const points = data
      .map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - minV) / range) * (height - 4) + 2;
        return `${x} ${y}`;
      })
      .join(',');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-6">
        <polyline
          points={points}
          stroke="#3B82F6"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12 gap-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Diário de Métricas</h1>
          <button onClick={openMetasModal} className={buttonMetas}>
            🎯 Definir Metas
          </button>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {metricKeys.map((metric) => {
            const current = getLatestValue(metric);
            const goal = metas[metric] ?? 0;
            const progress = goal > 0 ? (current / goal) * 100 : 0;
            const progressWidth = Math.min(100, progress);
            const barColor =
              progress >= 100 ? 'bg-green-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-red-500';
            return (
              <div key={metric} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-3">
                  <span className="text-3xl mr-3">{emojis[metric]}</span>
                  <span className="font-semibold text-lg text-gray-700 capitalize">{metric.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {formatValue(metric, current)}
                </div>
                <Sparkline data={getSparklineData(metric)} metric={metric} />
                <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} transition-all duration-300`}
                    style={{ width: `${progressWidth}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {goal > 0 ? `${progress.toFixed(0)}% da meta` : 'Sem meta'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Form */}
        <section className="bg-white p-8 rounded-xl shadow-lg mb-12">
          <h2 className="text-2xl font-bold mb-8">Nova Entrada</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>📅 Data</label>
              <input
                type="date"
                className={inputClass}
                value={currentForm.date || ''}
                onChange={(e) => setCurrentForm({ ...currentForm, date: e.target.value })}
                required
              />
            </div>
            {metricKeys.map((key) => (
              <div key={key}>
                <label className={labelClass}>
                  {emojis[key]} {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="number"
                  step="any"
                  className={inputClass}
                  value={currentForm[key]?.toString() || ''}
                  onChange={(e) =>
                    setCurrentForm({ ...currentForm, [key]: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            ))}
            <div className="md:col-span-2 lg:col-span-3 flex gap-3 pt-2">
              <button type="submit" className={buttonPrimary}>
                Salvar
              </button>
              <button type="button" onClick={clearForm} className={buttonSecondary}>
                Limpar
              </button>
            </div>
          </form>
        </section>

        {/* History Table */}
        {entries.length > 0 && (
          <section className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Histórico</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    {metricKeys.map((m) => (
                      <th
                        key={m}
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {emojis[m]} {m.replace(/([A-Z])/g, ' $1').trim()}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {entries.map((entry) => (
                    <tr key={entry.date} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatDate(entry.date)}
                      </td>
                      {metricKeys.map((m) => (
                        <td key={m} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatValue(m, entry[m])}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => editEntry(entry)} className={buttonActionEdit}>
                          Editar
                        </button>
                        <button
                          onClick={() => deleteEntry(entry.date)}
                          className={buttonActionDelete}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {/* Metas Modal */}
      {showMetasModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowMetasModal(false);
            }
          }}
        >
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-8 text-gray-900">🎯 Metas Diárias</h2>
            <form onSubmit={handleSaveMetas} className="space-y-6">
              {metricKeys.map((key) => (
                <div key={key}>
                  <label className={labelClass}>
                    {emojis[key]} {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <input
                    type="number"
                    step="any"
                    className={inputClass}
                    value={currentMetasForm[key]?.toString() || ''}
                    onChange={(e) =>
                      setCurrentMetasForm({ ...currentMetasForm, [key]: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-4">
                <button type="submit" className={buttonPrimary}>
                  Salvar Metas
                </button>
                <button
                  type="button"
                  onClick={() => setShowMetasModal(false)}
                  className={buttonSecondary}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
