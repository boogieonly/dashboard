'use client';

import { useState, useEffect, useMemo } from 'react';

type MetricKey = 'faturamento' | 'vendas' | 'atrasos' | 'carteira' | 'previsaoAtual' | 'previsaoProx';

type DailyEntry = {
  id: string;
  date: string;
  faturamento: number;
  vendas: number;
  atrasos: number;
  carteira: number;
  previsaoAtual: number;
  previsaoProx: number;
};

type Metas = Record<MetricKey, number>;

type CurrentForm = Partial<DailyEntry>;

type CurrentMetasForm = Partial<Metas>;

const metricKeys: MetricKey[] = ['faturamento', 'vendas', 'atrasos', 'carteira', 'previsaoAtual', 'previsaoProx'];

const labels: Record<MetricKey, string> = {
  faturamento: 'Faturamento',
  vendas: 'Vendas',
  atrasos: 'Atrasos',
  carteira: 'Carteira',
  previsaoAtual: 'Previsão Mês',
  previsaoProx: 'Previsão Mês Seguinte',
};

const emojis: Record<MetricKey, string> = {
  faturamento: '💰',
  vendas: '📈',
  atrasos: '⚠️',
  carteira: '💳',
  previsaoAtual: '🔮',
  previsaoProx: '📅',
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

function formatCurrency(num: number): string {
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatValue(metric: MetricKey, num: number): string {
  return formatCurrency(num);
}

function Sparkline({ data }: { data: number[] }) {
  if (data.length === 0) {
    return <div className="h-8 bg-gray-100 rounded" />;
  }
  const values = data.map((d) => Math.max(0, d));
  const maxV = Math.max(...values);
  const minV = Math.min(...values);
  const range = maxV - minV || 1;
  const points = values
    .map((d, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 30 - ((d - minV) / range) * 25;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg
      width={100}
      height={30}
      viewBox="0 0 100 30"
      className="w-full block"
    >
      <polyline
        points={points}
        stroke="hsl(210, 80%, 50%)"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Diario() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [currentForm, setCurrentForm] = useState<CurrentForm>({ date: '' });
  const [metas, setMetas] = useState<Metas>({});
  const [showMetasModal, setShowMetasModal] = useState(false);
  const [currentMetasForm, setCurrentMetasForm] = useState<CurrentMetasForm>({});

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [entries]
  );

  const latestEntry = sortedEntries[0];

  const getCurrentValue = (metric: MetricKey): number => latestEntry?.[metric] ?? 0;

  const getSparklineData = (metric: MetricKey): number[] =>
    sortedEntries.slice(0, 7).map((e) => e[metric]);

  useEffect(() => {
    const savedEntries = localStorage.getItem('diarioEntries');
    if (savedEntries) {
      const parsed = JSON.parse(savedEntries) as DailyEntry[];
      setEntries(
        parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    }

    const savedMetas = localStorage.getItem('diarioMetas');
    if (savedMetas) {
      setMetas(JSON.parse(savedMetas) as Metas);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('diarioEntries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('diarioMetas', JSON.stringify(metas));
  }, [metas]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentForm.date) return;

    const entryData = metricKeys.reduce((acc, key) => {
      (acc as any)[key] = (currentForm as any)[key] ?? 0;
      return acc;
    }, {} as Record<MetricKey, number>);

    const newEntry: DailyEntry = {
      id: (currentForm as any).id ?? Date.now().toString(),
      date: currentForm.date,
      ...entryData,
    };

    if ((currentForm as any).id) {
      setEntries(entries.map((e) => (e.id === (currentForm as any).id ? newEntry : e)));
    } else {
      setEntries([newEntry, ...entries]);
    }
    setCurrentForm({ date: '' });
  };

  const editEntry = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (entry) {
      setCurrentForm(entry);
    }
  };

  const deleteEntry = (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta entrada?')) {
      setEntries(entries.filter((e) => e.id !== id));
    }
  };

  const openMetasModal = () => {
    setCurrentMetasForm(metas);
    setShowMetasModal(true);
  };

  const handleSaveMetas = () => {
    setMetas({ ...metas, ...currentMetasForm });
    setCurrentMetasForm({});
    setShowMetasModal(false);
  };

  const clearForm = () => {
    setCurrentForm({ date: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">Diário de Métricas</h1>

        {/* KPI Cards 2x3 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {metricKeys.map((metric) => (
            <div
              key={metric}
              className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-center mb-6">
                <span className="text-3xl mr-4">{emojis[metric]}</span>
                <h3 className="text-2xl font-bold text-gray-800">{labels[metric]}</h3>
              </div>
              <p className="text-5xl font-black text-green-600 mb-4">
                {formatValue(metric, getCurrentValue(metric))}
              </p>
              <Sparkline data={getSparklineData(metric)} />
            </div>
          ))}
        </div>

        {/* Form Nova Entrada */}
        <div className="bg-white p-8 rounded-2xl shadow-xl mb-12 border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Nova Entrada</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Data *</label>
              <input
                type="date"
                required
                value={currentForm.date || ''}
                onChange={(e) => setCurrentForm({ ...currentForm, date: e.target.value })}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            {metricKeys.map((metric) => (
              <div key={metric}>
                <label className="block text-sm font-semibold text-gray-700 mb-3">{labels[metric]}</label>
                <input
                  type="number"
                  step="any"
                  value={currentForm[metric]?.toString() || ''}
                  onChange={(e) =>
                    setCurrentForm({ ...currentForm, [metric]: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            ))}
            <div className="md:col-span-2 xl:col-span-4 flex gap-4 pt-2">
              <button
                type="button"
                onClick={clearForm}
                className="flex-1 bg-gray-500 text-white py-4 px-8 rounded-xl font-bold hover:bg-gray-600 transition-all"
              >
                Limpar
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-4 px-8 rounded-xl font-bold hover:bg-blue-700 transition-all"
              >
                {currentForm.id ? 'Atualizar' : 'Adicionar'} Entrada
              </button>
            </div>
          </form>
        </div>

        {/* Tabela histórico */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900">Histórico</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-8 py-6 text-left text-xl font-bold text-gray-700">Data</th>
                  {metricKeys.map((m) => (
                    <th key={m} className="px-8 py-6 text-right text-xl font-bold text-gray-700">
                      {labels[m]}
                    </th>
                  ))}
                  <th className="px-8 py-6 text-left text-xl font-bold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortedEntries.map((entry) => (
                  <tr key={entry.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6 font-semibold text-lg text-gray-900">{formatDate(entry.date)}</td>
                    {metricKeys.map((m) => (
                      <td key={m} className="px-8 py-6 text-right text-lg font-semibold">
                        {formatValue(m, entry[m])}
                      </td>
                    ))}
                    <td className="px-8 py-6">
                      <button
                        onClick={() => editEntry(entry.id)}
                        className="text-blue-600 hover:text-blue-800 font-semibold mr-6 hover:underline transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="text-red-600 hover:text-red-800 font-semibold hover:underline transition"
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

        {/* Modal Metas button */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={openMetasModal}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white py-6 px-12 rounded-2xl text-xl font-bold shadow-xl hover:shadow-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300"
          >
            📊 Gerenciar Metas
          </button>
        </div>

        {/* Modal Metas */}
        {showMetasModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-10 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
              <h2 className="text-4xl font-bold text-gray-900 mb-10 text-center">Metas Mensais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {metricKeys.map((metric) => (
                  <div key={metric}>
                    <label className="block text-xl font-bold text-gray-700 mb-4 flex items-center">
                      {emojis[metric]} {labels[metric]}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={currentMetasForm[metric]?.toString() ?? metas[metric]?.toString() ?? ''}
                      onChange={(e) =>
                        setCurrentMetasForm({
                          ...currentMetasForm,
                          [metric]: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full p-6 text-2xl border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-500 focus:border-transparent transition-all shadow-inner"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-6 justify-end pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowMetasModal(false);
                    setCurrentMetasForm({});
                  }}
                  className="px-12 py-4 bg-gray-200 text-gray-800 rounded-2xl font-bold hover:bg-gray-300 transition-all text-xl"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveMetas}
                  className="px-12 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-bold hover:from-green-600 hover:to-green-700 transition-all text-xl shadow-lg hover:shadow-xl"
                >
                  Salvar Metas
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
