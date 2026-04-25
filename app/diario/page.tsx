'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

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

type Metas = Record<MetricKey, number>;

type FormDataType = {
  date: string;
} & Record<MetricKey, number>;

type Metric = {
  key: MetricKey;
  label: string;
  unit: string;
  color: string;
};

const METRICS: Metric[] = [
  { key: 'faturamento', label: 'Faturamento', unit: 'R$', color: 'from-blue-500 to-blue-600' },
  { key: 'vendas', label: 'Vendas', unit: 'unid', color: 'from-green-500 to-green-600' },
  { key: 'atrasos', label: 'Atrasos', unit: 'dias', color: 'from-orange-500 to-orange-600' },
  { key: 'carteira', label: 'Carteira Total', unit: 'R$', color: 'from-purple-500 to-purple-600' },
  { key: 'previsaoAtual', label: 'Previsão Mês Atual', unit: 'R$', color: 'from-indigo-500 to-indigo-600' },
  { key: 'previsaoProx', label: 'Previsão Mês Seguinte', unit: 'R$', color: 'from-pink-500 to-pink-600' },
];

const defaultMetas: Metas = {
  faturamento: 100000,
  vendas: 1000,
  atrasos: 0,
  carteira: 50000,
  previsaoAtual: 120000,
  previsaoProx: 150000,
};

const defaultFormData: FormDataType = {
  date: '',
  faturamento: 0,
  vendas: 0,
  atrasos: 0,
  carteira: 0,
  previsaoAtual: 0,
  previsaoProx: 0,
};

const icons = ['💰', '📦', '⚠️', '💳', '🔮', '📅'];

const firstAccumKeys: MetricKey[] = ['faturamento', 'vendas', 'atrasos'];

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getMonthStart(): string {
  const now = new Date();
  now.setDate(1);
  return now.toISOString().split('T')[0];
}

function sameMonth(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
}

function computeAccum(entries: DailyEntry[], field: MetricKey, upToDate: string): number {
  return entries
    .filter(entry => sameMonth(entry.date, upToDate) && entry.date <= upToDate)
    .reduce((sum, entry) => sum + (entry[field] || 0), 0);
}

function getLastSnapshotValue(entries: DailyEntry[], field: MetricKey): number {
  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return sorted[0]?.[field] || 0;
}

function getLast7Accum(entries: DailyEntry[], field: MetricKey, upToDate: string): number[] {
  const today = new Date(upToDate);
  const last7: number[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const accum = computeAccum(entries, field, dateStr);
    last7.unshift(accum);
  }
  return last7;
}

function getLast7Snapshots(entries: DailyEntry[], field: MetricKey, upToDate: string): number[] {
  const today = new Date(upToDate);
  const last7: number[] = [];
  for (let i = 0; i < 7; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - i);
    const dateStr = targetDate.toISOString().split('T')[0];
    const candidates = entries.filter(e => e.date <= dateStr).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const val = candidates[0]?.[field] || 0;
    last7.unshift(val);
  }
  return last7;
}

function Sparkline({ data }: { data: number[] }) {
  if (!data.length) {
    return <div className="h-5 bg-white/10 rounded-full" />;
  }
  const max = Math.max(...data, 1);
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * 100;
    const y = 20 - (val / max) * 18;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 100 20" className="w-full h-5 flex-shrink-0">
      <polyline
        points={points}
        stroke="rgba(255, 255, 255, 0.9)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-lg"
      />
    </svg>
  );
}

export default function DiarioPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [metas, setMetas] = useState<Metas>(defaultMetas);
  const [formData, setFormData] = useState<FormDataType>(defaultFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showMetasModal, setShowMetasModal] = useState(false);
  const today = getToday();

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

  const currentAccum = useMemo(() => ({
    faturamento: computeAccum(entries, 'faturamento', today),
    vendas: computeAccum(entries, 'vendas', today),
    atrasos: computeAccum(entries, 'atrasos', today),
    carteira: getLastSnapshotValue(entries, 'carteira'),
    previsaoAtual: getLastSnapshotValue(entries, 'previsaoAtual'),
    previsaoProx: getLastSnapshotValue(entries, 'previsaoProx'),
  }), [entries, today]);

  const sparklineData = useMemo(() =>
    METRICS.map((metric) =>
      firstAccumKeys.includes(metric.key as MetricKey)
        ? getLast7Accum(entries, metric.key as MetricKey, today)
        : getLast7Snapshots(entries, metric.key as MetricKey, today)
    ),
    [entries, today]
  );

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const entryDate = formData.date || getToday();
    const newEntry: DailyEntry = {
      ...formData,
    };
    if (editingId) {
      setEntries((prev) => prev.map((e) => (e.date === editingId ? newEntry : e)));
      setEditingId(null);
    } else {
      setEntries((prev) => [...prev, newEntry]);
    }
    setFormData(defaultFormData);
  }, [formData, editingId]);

  const handleEdit = useCallback((entry: DailyEntry) => {
    setFormData({
      date: entry.date,
      faturamento: entry.faturamento,
      vendas: entry.vendas,
      atrasos: entry.atrasos,
      carteira: entry.carteira,
      previsaoAtual: entry.previsaoAtual,
      previsaoProx: entry.previsaoProx,
    });
    setEditingId(entry.date);
  }, []);

  const handleDelete = useCallback((date: string) => {
    setEntries((prev) => prev.filter((e) => e.date !== date));
  }, []);

  const handleMetaChange = useCallback((key: MetricKey, value: string) => {
    setMetas((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }));
  }, []);

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatNumber = (num: number, unit: string): string => {
    if (unit === 'R$') {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
    }
    return num.toLocaleString('pt-BR') + (unit ? ` ${unit}` : '');
  };

  const getProgress = (accum: number, meta: number): number => {
    return Math.min((accum / meta) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-4 animate-pulse">
            📊 Diário Financeiro
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Acompanhe seus KPIs diários com precisão e defina metas mensais.
          </p>
        </header>

        {/* Seção 1 - KPI Cards */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center animate-fade-in">
            📈 KPIs do Mês (Acumulado até {formatDate(today)})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {METRICS.map((metric, idx) => {
              const key = metric.key as MetricKey;
              const accum = currentAccum[key];
              const prog = getProgress(accum, metas[key]);
              return (
                <div
                  key={metric.key}
                  className="group relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent rounded-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${metric.color} flex items-center justify-center shadow-lg shadow-black/30`}>
                        {icons[idx]}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowMetasModal(true)}
                        className="text-xl hover:scale-110 transition-all duration-200 hover:text-white text-slate-400"
                        title="Configurar Metas"
                      >
                        ⚙️
                      </button>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-slate-200 transition-colors">
                      {metric.label}
                    </h3>
                    <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent mb-4 leading-tight">
                      {formatNumber(accum, metric.unit)}
                    </div>
                    <div className="h-5 mb-4">
                      <Sparkline data={sparklineData[idx]} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Meta: {formatNumber(metas[key], metric.unit)}</span>
                      <div className="w-20 bg-white/10 rounded-full h-3 overflow-hidden border border-white/20">
                        <div
                          className={`h-full bg-gradient-to-r ${metric.color} rounded-full transition-all duration-1000 ease-out shadow-inner`}
                          style={{ width: `${prog}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Formulário */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center animate-fade-in">
            {editingId ? '✏️ Editar Registro' : '➕ Novo Registro Diário'}
          </h2>
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-slate-300 mb-2 font-medium">Data *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all shadow-lg"
                  required
                />
              </div>
              {METRICS.map((metric) => {
                const key = metric.key as MetricKey;
                return (
                  <div key={metric.key}>
                    <label className="block text-slate-300 mb-2 font-medium">{metric.label}</label>
                    <input
                      type="number"
                      step="any"
                      value={formData[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all shadow-lg"
                      placeholder="0"
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 flex-1 sm:w-auto"
              >
                {editingId ? 'Atualizar Registro' : 'Salvar Registro'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData(defaultFormData);
                    setEditingId(null);
                  }}
                  className="px-8 py-4 bg-slate-600/50 hover:bg-slate-500/50 text-slate-300 font-bold rounded-2xl shadow-xl transition-all duration-300 flex-1 sm:w-auto border border-slate-400/30"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Histórico */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-8 text-center animate-fade-in">📜 Histórico do Mês</h2>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl overflow-x-auto">
            <table className="w-full text-sm text-slate-300 min-w-max">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-4 font-bold text-white">Data</th>
                  {METRICS.map((metric) => (
                    <th key={metric.key} className="px-4 py-4 text-center font-bold text-white">
                      {metric.label}
                    </th>
                  ))}
                  <th className="text-right p-4 font-bold text-white pr-8">Ações</th>
                </tr>
              </thead>
              <tbody>
                {entries
                  .filter((e) => sameMonth(e.date, today))
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((entry) => (
                    <tr key={entry.date} className="hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0">
                      <td className="p-4 font-semibold text-white pl-0">{formatDate(entry.date)}</td>
                      {METRICS.map((metric) => {
                        const key = metric.key as MetricKey;
                        return (
                          <td key={metric.key} className="px-4 py-4 text-center font-mono">
                            {formatNumber(entry[key], metric.unit)}
                          </td>
                        );
                      })}
                      <td className="p-4 text-right pr-8 space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(entry)}
                          className="px-4 py-2 bg-blue-500/80 hover:bg-blue-400 text-white rounded-xl shadow-lg hover:shadow-blue-400/50 transition-all duration-200 text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(entry.date)}
                          className="px-4 py-2 bg-red-500/80 hover:bg-red-400 text-white rounded-xl shadow-lg hover:shadow-red-400/50 transition-all duration-200 text-sm font-medium"
                        >
                          Deletar
                        </button>
                      </td>
                    </tr>
                  ))}
                {entries.filter((e) => sameMonth(e.date, today)).length === 0 && (
                  <tr>
                    <td colSpan={METRICS.length + 2} className="p-12 text-center text-slate-400 font-medium">
                      Nenhum registro este mês. Adicione o primeiro!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Modal Metas */}
      {showMetasModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
          onClick={() => setShowMetasModal(false)}
        >
          <div
            className="bg-white/20 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-3xl hover:shadow-4xl transition-all duration-300 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-white">⚙️ Configurar Metas Mensais</h3>
              <button
                type="button"
                onClick={() => setShowMetasModal(false)}
                className="text-3xl hover:scale-110 transition-transform text-slate-400 hover:text-white ml-4"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {METRICS.map((metric) => {
                const key = metric.key as MetricKey;
                return (
                  <div key={metric.key} className="space-y-2">
                    <label className="block text-slate-300 font-semibold text-lg">{metric.label}</label>
                    <input
                      type="number"
                      step="any"
                      value={metas[key]}
                      onChange={(e) => handleMetaChange(key, e.target.value)}
                      className="w-full px-6 py-4 bg-white/30 border border-white/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all text-xl font-mono tracking-wider shadow-xl hover:shadow-2xl hover:border-white/70"
                      placeholder="Defina a meta..."
                    />
                  </div>
                );
              })}
            </div>
            <div className="mt-12 pt-8 border-t border-white/20 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMetasModal(false)}
                className="px-12 py-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-3xl shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 text-xl tracking-wide"
              >
                ✅ Metas Salvas!
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }
      `}</style>
    </div>
  );
}
