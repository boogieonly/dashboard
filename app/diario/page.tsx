'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

type MetricKey = 'faturamento' | 'vendas' | 'atrasos' | 'carteira' | 'previsaoAtual' | 'previsaoProx';

type DailyEntry = {
  date: string;
} & Record<MetricKey, number>;

type Metas = Record<MetricKey, number>;

type Metric = {
  key: MetricKey;
  label: string;
  emoji: string;
  unit: 'R$';
  color: string;
};

const METRICS: Metric[] = [
  { key: 'faturamento', label: 'Faturamento', emoji: '💰', unit: 'R$', color: 'emerald' },
  { key: 'vendas', label: 'Vendas', emoji: '📦', unit: 'R$', color: 'blue' },
  { key: 'atrasos', label: 'Atrasos', emoji: '⚠️', unit: 'R$', color: 'orange' },
  { key: 'carteira', label: 'Carteira Total', emoji: '💳', unit: 'R$', color: 'purple' },
  { key: 'previsaoAtual', label: 'Previsão Mês Atual', emoji: '🔮', unit: 'R$', color: 'indigo' },
  { key: 'previsaoProx', label: 'Previsão Mês Seguinte', emoji: '📅', unit: 'R$', color: 'yellow' },
];

const defaultMetas: Metas = {
  faturamento: 100000,
  vendas: 2000,
  atrasos: 5000,
  carteira: 500000,
  previsaoAtual: 120000,
  previsaoProx: 150000,
};

const defaultFormData = (): DailyEntry => ({
  date: getToday(),
  faturamento: 0,
  vendas: 0,
  atrasos: 0,
  carteira: 0,
  previsaoAtual: 0,
  previsaoProx: 0,
});

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getMonthStart(): string {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().split('T')[0];
}

function sameMonth(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
}

function computeAccum(entries: DailyEntry[], metricKey: MetricKey): number {
  return entries
    .filter((e) => sameMonth(e.date, getToday()))
    .reduce((acc, e) => acc + (e[metricKey] ?? 0), 0);
}

function getLastSnapshotValue(entries: DailyEntry[], metricKey: MetricKey): number {
  if (entries.length === 0) return 0;
  const latest = entries.reduce((prev, curr) =>
    new Date(curr.date) > new Date(prev.date) ? curr : prev
  );
  return latest[metricKey] ?? 0;
}

function getLast7DaysData(entries: DailyEntry[], metricKey: MetricKey): number[] {
  const today = new Date();
  const data: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const entry = entries.find((e) => e.date === dateStr);
    data.push(entry?.[metricKey] ?? 0);
  }
  return data;
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (isoString: string): string =>
  new Date(isoString).toLocaleDateString('pt-BR');

export default function DiarioPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [metas, setMetas] = useState<Metas>(defaultMetas);
  const [formData, setFormData] = useState<DailyEntry>(defaultFormData());
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

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [entries]
  );

  const kpis = useMemo(() => {
    const isAccumMetrics: MetricKey[] = ['faturamento', 'vendas', 'atrasos'];
    return METRICS.map((metric) => {
      const value =
        isAccumMetrics.includes(metric.key)
          ? computeAccum(entries, metric.key)
          : getLastSnapshotValue(entries, metric.key);
      const sparklineData = getLast7DaysData(entries, metric.key);
      const progress = metas[metric.key] > 0 ? Math.min(100, (value / metas[metric.key]) * 100) : 0;
      return { metric, value, sparklineData, progress };
    });
  }, [entries, metas]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.date) return;
      const newEntry: DailyEntry = {
        date: formData.date,
        faturamento: formData.faturamento ?? 0,
        vendas: formData.vendas ?? 0,
        atrasos: formData.atrasos ?? 0,
        carteira: formData.carteira ?? 0,
        previsaoAtual: formData.previsaoAtual ?? 0,
        previsaoProx: formData.previsaoProx ?? 0,
      };
      if (editingEntryId) {
        setEntries(entries.map((entry) => (entry.date === editingEntryId ? newEntry : entry)));
      } else {
        setEntries([...entries, newEntry]);
      }
      setFormData(defaultFormData());
      setEditingEntryId(null);
    },
    [entries, formData, editingEntryId]
  );

  const handleEdit = useCallback((entry: DailyEntry) => {
    setFormData(entry);
    setEditingEntryId(entry.date);
  }, []);

  const handleDelete = useCallback((date: string) => {
    if (confirm('Tem certeza que deseja deletar esta entrada?')) {
      setEntries(entries.filter((e) => e.date !== date));
    }
  }, [entries]);

  const inputClass =
    'p-4 bg-white/20 border border-white/40 rounded-2xl backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-white/30 focus:border-transparent transition-all text-white placeholder-gray-300 font-mono text-lg w-full';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900/50 to-pink-900/50 p-6 md:p-8 text-white overflow-x-hidden">
      <h1 className="text-4xl md:text-5xl font-black mb-12 text-center bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
        📊 Diário de Métricas
      </h1>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {kpis.map(({ metric, value, sparklineData, progress }) => (
          <div
            key={metric.key}
            className={`group bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-2 transition-all duration-500 bg-gradient-to-br from-${metric.color}-400/20 to-${metric.color}-600/20`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{metric.emoji}</span>
            </div>
            <h3 className={`text-xl font-bold mb-2 text-${metric.color}-300 drop-shadow-md`}>
              {metric.label}
            </h3>
            <div className="text-3xl md:text-4xl font-black mb-4 text-white drop-shadow-2xl">
              {formatCurrency(value)}
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden mb-6">
              <div
                className={`h-full bg-gradient-to-r from-${metric.color}-400 to-${metric.color}-600 rounded-full shadow-lg transition-all duration-1000 ease-out`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <Sparkline data={sparklineData} color={metric.color} />
          </div>
        ))}
      </section>

      {/* Resumo Mensal */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {kpis.map(({ metric, value, progress }) => (
          <div
            key={metric.key}
            className={`bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 bg-gradient-to-b from-${metric.color}-500/10 to-transparent`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{metric.emoji}</span>
              <h4 className="font-bold text-lg text-${metric.color}-300">{metric.label}</h4>
            </div>
            <div className="text-2xl font-black mb-2 drop-shadow-lg">{formatCurrency(value)}</div>
            <div className="text-sm text-gray-300 mb-4">Meta: {formatCurrency(metas[metric.key])}</div>
            <div className="h-4 bg-white/30 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full bg-gradient-to-r from-${metric.color}-400 to-${metric.color}-500 rounded-full transition-all duration-1000`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className={`text-right font-mono text-sm font-bold text-${metric.color}-300`}>
              {progress.toFixed(1)}%
            </div>
          </div>
        ))}
      </section>

      {/* Formulário */}
      <section className="mb-12">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-3xl">
          <h2 className="text-3xl font-black mb-8 flex items-center gap-3 bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent drop-shadow-lg">
            📝 Nova Entrada Diária
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-8 gap-6">
            <div>
              <label className="block text-sm font-bold mb-3 text-gray-200 uppercase tracking-wide">
                Data
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            {METRICS.map((metric) => (
              <div key={metric.key} className="2xl:col-span-1">
                <label className="block text-sm font-bold mb-3 flex items-center gap-2 text-gray-200 uppercase tracking-wide">
                  {metric.emoji}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData[metric.key]}
                  onChange={(e) =>
                    setFormData({ ...formData, [metric.key]: parseFloat(e.target.value) || 0 })
                  }
                  className={inputClass}
                  placeholder="0,00"
                  required
                />
              </div>
            ))}
            <div className="lg:col-span-2 xl:col-span-1 2xl:col-span-1 flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setFormData(defaultFormData());
                  setEditingEntryId(null);
                }}
                className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:scale-105 hover:shadow-2xl transition-all shadow-xl border border-white/30 backdrop-blur-sm"
              >
                🧹 Limpar
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:scale-105 hover:shadow-2xl transition-all shadow-xl"
              >
                {editingEntryId ? '✏️ Atualizar' : '➕ Adicionar'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Histórico */}
      <section>
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-3xl">
          <h2 className="text-3xl font-black mb-8 flex items-center gap-3 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent drop-shadow-lg">
            📋 Histórico Completo
          </h2>
          {sortedEntries.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xl">
              Nenhuma entrada ainda. Adicione a primeira! 🎉
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/20">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5 backdrop-blur border-b border-white/20">
                    <th className="p-4 text-left font-bold text-gray-100 uppercase tracking-wide">Data</th>
                    {METRICS.map((metric) => (
                      <th key={metric.key} className="p-4 text-right font-bold text-gray-100 uppercase tracking-wide text-xs">
                        {metric.emoji}<br />
                        <span>{metric.label}</span>
                      </th>
                    ))}
                    <th className="p-4 text-right font-bold text-gray-100 uppercase tracking-wide">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEntries.map((entry) => (
                    <tr
                      key={entry.date}
                      className="border-b border-white/10 hover:bg-white/20 transition-all duration-200"
                    >
                      <td className="p-4 font-mono text-lg font-bold text-gray-100">
                        {formatDate(entry.date)}
                      </td>
                      {METRICS.map((metric) => (
                        <td key={metric.key} className="p-4 text-right font-mono text-lg">
                          {formatCurrency(entry[metric.key])}
                        </td>
                      ))}
                      <td className="p-4 whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-xl transition-all mr-2 min-w-[70px]"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(entry.date)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-xl transition-all min-w-[70px]"
                        >
                          Deletar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* FAB Configurar Metas */}
      <button
        onClick={() => setShowMetasModal(true)}
        className="fixed bottom-8 right-8 w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 focus:outline-none focus:ring-4 ring-white/30 transition-all duration-300 border-4 border-white/20 backdrop-blur-xl z-40 flex items-center justify-center text-3xl font-bold animate-bounce"
        title="⚙️ Configurar Metas Mensais"
      >
        ⚙️
      </button>

      {/* Modal Configurar Metas */}
      {showMetasModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in-0 duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMetasModal(false);
          }}
        >
          <div className="bg-white/20 backdrop-blur-3xl border border-white/40 rounded-4xl p-8 max-w-2xl w-full shadow-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-300">
            <h2 className="text-4xl font-black mb-12 text-center bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent drop-shadow-2xl flex items-center justify-center gap-4 mx-auto w-fit">
              ⚙️ Configurar Metas Mensais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {METRICS.map((metric) => (
                <div key={metric.key} className={`p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 shadow-xl hover:shadow-2xl transition-all group ${metric.color === 'yellow' ? 'from-yellow-500/20 to-amber-500/20' : `from-${metric.color}-500/20 to-${metric.color}-600/20`}`}>
                  <label className="block text-xl font-bold mb-6 flex items-center gap-4 text-gray-100 drop-shadow-lg group-hover:scale-105 transition-transform">
                    {metric.emoji} {metric.label}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={metas[metric.key]}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setMetas((prev) => ({ ...prev, [metric.key]: val }));
                    }}
                    className={`${inputClass} text-3xl py-8 font-mono tracking-widest text-right bg-white/30 hover:bg-white/40 transition-all border-2 border-white/50 rounded-3xl shadow-inner`}
                    placeholder="R$ 0,00"
                  />
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-col sm:flex-row gap-4 pt-8 border-t border-white/20 justify-end">
              <button
                onClick={() => setShowMetasModal(false)}
                className="px-12 py-4 bg-white/30 backdrop-blur-xl border border-white/50 text-white rounded-3xl font-bold text-lg hover:bg-white/50 hover:scale-105 transition-all shadow-2xl flex-1 sm:flex-none"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowMetasModal(false)}
                className="px-12 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-3xl font-bold text-lg hover:scale-105 hover:shadow-3xl transition-all shadow-2xl flex-1 sm:flex-none"
              >
                ✅ Metas Salvas!
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.every((d) => d === 0)) {
    return (
      <div className="w-[140px] h-10 bg-gray-800/50 rounded-full ml-auto animate-pulse" />
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const normalize = (v: number) => 35 - ((v - min) / range) * 30;

  const points = data.map((v, i) => `${i * 20 + 10},${normalize(v)}`).join(' ');

  const isRising = data[data.length - 1] > data[0];

  return (
    <svg
      width={140}
      height={40}
      viewBox="0 0 150 40"
      className={`ml-auto stroke-current stroke-[3px] fill-none stroke-linecap-round stroke-linejoin-round drop-shadow-lg ${
        isRising ? 'text-emerald-400' : 'text-red-400'
      } ${`text-${color}-400`} `}
    >
      <polyline points={points} />
    </svg>
  );
}
