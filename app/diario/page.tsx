'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

type MetricKey = 'faturamento' | 'vendas' | 'atrasos' | 'carteiraTotal' | 'previsaoMesAtual' | 'previsaoMesSeguinte';

interface DailyEntry {
  date: string;
  faturamento: number;
  vendas: number;
  atrasos: number;
  carteiraTotal: number;
  previsaoMesAtual: number;
  previsaoMesSeguinte: number;
}

interface Metas {
  faturamento: number;
  vendas: number;
  atrasos: number;
  carteiraTotal: number;
  previsaoMesAtual: number;
  previsaoMesSeguinte: number;
}

type Metric = {
  key: MetricKey;
  label: string;
  emoji: string;
  color: string;
  inverse?: boolean;
};

const METRICS: Metric[] = [
  { key: 'faturamento', label: 'Faturamento', emoji: '💰', color: 'from-emerald-500 to-emerald-600' },
  { key: 'vendas', label: 'Vendas', emoji: '📈', color: 'from-blue-500 to-blue-600' },
  { key: 'atrasos', label: 'Atrasos', emoji: '⚠️', color: 'from-orange-400 to-red-500', inverse: true },
  { key: 'carteiraTotal', label: 'Carteira Total', emoji: '💼', color: 'from-purple-500 to-purple-600' },
  { key: 'previsaoMesAtual', label: 'Previsão Mês Atual', emoji: '🔮', color: 'from-cyan-500 to-cyan-600' },
  { key: 'previsaoMesSeguinte', label: 'Previsão Mês Seguinte', emoji: '📅', color: 'from-yellow-500 to-yellow-600' },
];

const POSICAO_METRICS = METRICS.slice(3);

const defaultMetas: Metas = {
  faturamento: 0,
  vendas: 0,
  atrasos: 0,
  carteiraTotal: 0,
  previsaoMesAtual: 0,
  previsaoMesSeguinte: 0,
};

const defaultFormData: DailyEntry = {
  date: '',
  faturamento: 0,
  vendas: 0,
  atrasos: 0,
  carteiraTotal: 0,
  previsaoMesAtual: 0,
  previsaoMesSeguinte: 0,
};

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getMonthStart(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00Z');
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.toISOString().split('T')[0];
}

function sameMonth(date1: string, date2: string): boolean {
  const d1 = new Date(date1 + 'T00:00:00Z');
  const d2 = new Date(date2 + 'T00:00:00Z');
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
}

function computeAccum(
  date: string,
  entries: DailyEntry[],
  monthStart: string
): Record<MetricKey, number> {
  const targetMonthStart = getMonthStart(date);
  const sums: Record<MetricKey, number> = {
    faturamento: 0,
    vendas: 0,
    atrasos: 0,
    carteiraTotal: 0,
    previsaoMesAtual: 0,
    previsaoMesSeguinte: 0,
  };
  entries
    .filter((e) => sameMonth(e.date, date) && e.date <= date)
    .forEach((e) => {
      sums.faturamento += e.faturamento;
      sums.vendas += e.vendas;
      sums.atrasos += e.atrasos;
      sums.carteiraTotal += e.carteiraTotal;
      sums.previsaoMesAtual += e.previsaoMesAtual;
      sums.previsaoMesSeguinte += e.previsaoMesSeguinte;
    });
  return sums;
}

function getLast7Accum(
  metricKey: MetricKey,
  entries: DailyEntry[],
  monthStart: string
): number[] {
  const today = getToday();
  const dates: string[] = [];
  let current = new Date(today + 'T00:00:00Z');
  for (let i = 0; i < 7; i++) {
    const dateStr = current.toISOString().split('T')[0];
    dates.push(dateStr);
    current.setDate(current.getDate() - 1);
  }
  return dates.map((d) => {
    const acc = computeAccum(d, entries, monthStart);
    return (acc as any)[metricKey];
  });
}

function Sparkline({ data, color = 'current' }: { data: number[]; color?: string }) {
  if (data.length === 0) {
    return <div className="w-20 h-6 bg-gray-300/50 rounded-full" />;
  }
  const minV = Math.min(...data);
  const maxV = Math.max(...data);
  const range = maxV - minV || 1;
  const normalizeY = (v: number) => 100 - ((v - minV) / range) * 80;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${normalizeY(v)}`)
    .join(' ');
  return (
    <svg viewBox="0 0 100 100" className={`w-20 h-6 ${color}`}>
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DiarioPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [metas, setMetas] = useState<Metas>(defaultMetas);
  const [metasForm, setMetasForm] = useState<Metas>(defaultMetas);
  const [formData, setFormData] = useState<DailyEntry>({ ...defaultFormData, date: getToday() });
  const [editingEntry, setEditingEntry] = useState<DailyEntry | null>(null);
  const [showMetasModal, setShowMetasModal] = useState(false);

  const today = getToday();
  const monthStart = useMemo(() => getMonthStart(today), []);
  const prevDay = useMemo(() => {
    const d = new Date(today + 'T00:00:00Z');
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }, [today]);

  const accumToday = useMemo(
    () => computeAccum(today, entries, monthStart),
    [today, entries, monthStart]
  );

  const prevAccum = useMemo(
    () => computeAccum(prevDay, entries, monthStart),
    [prevDay, entries, monthStart]
  );

  const last7Datas = useMemo(() => {
    const data: Record<MetricKey, number[]> = {} as any;
    METRICS.forEach((m) => {
      data[m.key] = getLast7Accum(m.key, entries, monthStart);
    });
    return data;
  }, [entries, monthStart]);

  const monthAccum = useMemo(() => {
    const sums: Record<MetricKey, number> = {
      faturamento: 0,
      vendas: 0,
      atrasos: 0,
      carteiraTotal: 0,
      previsaoMesAtual: 0,
      previsaoMesSeguinte: 0,
    };
    entries
      .filter((e) => sameMonth(e.date, monthStart))
      .forEach((e) => {
        sums.faturamento += e.faturamento;
        sums.vendas += e.vendas;
        sums.atrasos += e.atrasos;
        sums.carteiraTotal += e.carteiraTotal;
        sums.previsaoMesAtual += e.previsaoMesAtual;
        sums.previsaoMesSeguinte += e.previsaoMesSeguinte;
      });
    return sums;
  }, [entries, monthStart]);

  const lastEntry = entries[entries.length - 1];

  useEffect(() => {
    try {
      const entriesStr = localStorage.getItem('diario-entries');
      if (entriesStr) {
        setEntries(JSON.parse(entriesStr));
      }
      const metasStr = localStorage.getItem('diario-metas');
      if (metasStr) {
        const loadedMetas = JSON.parse(metasStr) as Metas;
        setMetas(loadedMetas);
        setMetasForm(loadedMetas);
      }
    } catch (e) {
      console.error('Load error:', e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('diario-entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (Object.values(metas).some((v) => v !== 0)) {
      localStorage.setItem('diario-metas', JSON.stringify(metas));
    }
  }, [metas]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: DailyEntry = {
      date: formData.date,
      faturamento: formData.faturamento,
      vendas: formData.vendas,
      atrasos: formData.atrasos,
      carteiraTotal: formData.carteiraTotal,
      previsaoMesAtual: formData.previsaoMesAtual,
      previsaoMesSeguinte: formData.previsaoMesSeguinte,
    };
    if (editingEntry) {
      setEntries(entries.map((en) => (en.date === entry.date ? entry : en)));
    } else {
      if (entries.some((en) => en.date === entry.date)) {
        alert('Registro para esta data já existe!');
        return;
      }
      setEntries([...entries, entry].sort((a, b) => a.date.localeCompare(b.date)));
    }
    setEditingEntry(null);
    setFormData({ ...defaultFormData, date: getToday() });
  };

  const handleMetasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMetas(metasForm);
    setShowMetasModal(false);
  };

  const startEdit = useCallback((entry: DailyEntry) => {
    setEditingEntry(entry);
    setFormData(entry);
  }, []);

  const deleteEntry = useCallback((date: string) => {
    setEntries(entries.filter((e) => e.date !== date));
  }, [entries]);

  const isGood = (metric: Metric, accum: number, meta: number): boolean => {
    const pct = meta > 0 ? (accum / meta) * 100 : 0;
    return metric.inverse ? pct < 100 : pct >= 100;
  };

  const getPctChange = (metricKey: MetricKey): number => {
    const todayVal = accumToday[metricKey];
    const prevVal = prevAccum[metricKey];
    return prevVal > 0 ? ((todayVal - prevVal) / prevVal) * 100 : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900/50 to-pink-900/50 py-12 px-4 text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-black text-center mb-16 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
          📊 Diário de Indicadores
        </h1>

        {/* Config Metas Button */}
        <div className="flex justify-end mb-12">
          <button
            onClick={() => setShowMetasModal(true)}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white px-8 py-3 rounded-2xl font-bold shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 border border-yellow-300/50"
          >
            ⚙️ Configurar Metas
          </button>
        </div>

        {/* Seção 1 - KPI Cards */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Seção 1 - KPI Cards (Acumulado até Hoje)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {METRICS.map((metric) => {
              const accum = accumToday[metric.key as MetricKey];
              const meta = metas[metric.key as MetricKey];
              const pctMeta = meta > 0 ? (accum / meta) * 100 : 0;
              const deltaPct = getPctChange(metric.key as MetricKey);
              const good = isGood(metric, accum, meta);
              const sparkData = last7Datas[metric.key as MetricKey];
              return (
                <div
                  key={metric.key}
                  className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl hover:-translate-y-3 transition-all duration-500 cursor-pointer relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br ${metric.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                  <div className="relative z-10 flex items-start justify-between mb-6">
                    <span className="text-4xl drop-shadow-lg">{metric.emoji}</span>
                    <span
                      className={`text-lg font-bold px-3 py-1 rounded-full ${good ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50' : 'bg-red-500/20 text-red-300 border-red-400/50'} border`}
                    >
                      {meta > 0 ? pctMeta.toFixed(1) + '%' : 'N/A'}
                    </span>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-2xl">
                    {accum.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </h3>
                  <div className="flex items-center gap-4 mb-6">
                    <Sparkline data={sparkData} color={`text-${metric.color.split('from-')[1].split('-')[0]}-400`} />
                    <span
                      className={`font-mono text-xl font-bold ${deltaPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                    >
                      {deltaPct >= 0 ? `+${deltaPct.toFixed(1)}%` : `${deltaPct.toFixed(1)}%`}
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-white/80 capitalize">{metric.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Seção 2 - Posição Atual */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Seção 2 - Posição Atual
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {POSICAO_METRICS.map((metric) => {
              const value = lastEntry ? (lastEntry as any)[metric.key] : 0;
              return (
                <div
                  key={metric.key}
                  className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  <span className="text-5xl block mb-4 drop-shadow-lg">{metric.emoji}</span>
                  <h3 className="text-3xl font-black text-white mb-2">
                    {value.toLocaleString('pt-BR')}
                  </h3>
                  <p className="text-white/70 font-medium capitalize text-sm tracking-wide">{metric.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Resumo Mensal */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Resumo Mensal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {METRICS.map((metric) => {
              const accum = monthAccum[metric.key as MetricKey];
              const meta = metas[metric.key as MetricKey];
              const pctMeta = meta > 0 ? (accum / meta) * 100 : 0;
              const good = isGood(metric, accum, meta);
              return (
                <div
                  key={metric.key}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-4xl">{metric.emoji}</span>
                    <span
                      className={`text-xl font-bold px-4 py-2 rounded-2xl ${good ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400/50' : 'bg-red-500/30 text-red-200 border-red-400/50'} border shadow-lg`}
                    >
                      {meta > 0 ? pctMeta.toFixed(1) + '%' : 'N/A'}
                    </span>
                  </div>
                  <h3 className="text-4xl font-black mb-6 text-white drop-shadow-lg">
                    {accum.toLocaleString('pt-BR')}
                  </h3>
                  <div className="w-full bg-white/30 rounded-2xl h-5 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${metric.color} shadow-lg transition-all duration-1000 ease-out rounded-xl relative ${good ? 'shadow-emerald-500/25' : 'shadow-red-500/25'}`}
                      style={{ width: `${Math.min(pctMeta, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-white/60 mt-4">Meta: {meta.toLocaleString('pt-BR')}</p>
                  <p className="text-white/70 capitalize font-medium mt-1">{metric.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Histórico */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Histórico
          </h2>
          <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 shadow-2xl overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/20 uppercase tracking-wider text-white/70 text-xs">
                  <th className="p-4">Data</th>
                  {METRICS.map((m) => (
                    <th key={m.key} className="p-4 text-center">
                      {m.emoji}<br />{m.label}
                    </th>
                  ))}
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {entries
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((entry) => (
                    <tr
                      key={entry.date}
                      className="border-b border-white/10 hover:bg-white/20 transition-colors duration-200"
                    >
                      <td className="p-4 font-mono font-bold text-white/90">
                      {new Date(entry.date + 'T00:00:00Z').toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: '2-digit', 
                        year: 'numeric' 
                        })}
                        </td>
                      {METRICS.map((m) => (
                        <td key={m.key} className="p-4 text-center font-mono">
                          {((entry as any)[m.key] || 0).toLocaleString('pt-BR')}
                        </td>
                      ))}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => startEdit(entry)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-xl text-sm font-bold mr-2 transition-all shadow-md hover:shadow-lg"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteEntry(entry.date)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg"
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

        {/* Formulário */}
        <section>
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {editingEntry ? '✏️ Editar Registro' : '➕ Novo Registro'}
          </h2>
          <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-6 items-end mb-6">
              <div>
                <label className="block text-white/80 font-medium mb-2">Data</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full p-4 rounded-2xl bg-white/30 border border-white/40 text-white placeholder-white/50 font-mono text-lg focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all shadow-lg hover:shadow-xl"
                />
              </div>
              {METRICS.map((m) => (
                <div key={m.key}>
                  <label className="block text-white/80 font-medium mb-2 flex items-center gap-2">
                    {m.emoji}
                    <span className="text-sm capitalize">{m.label}</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={formData[m.key as keyof DailyEntry] || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [m.key]: parseFloat(e.target.value) || 0,
                      } as DailyEntry)
                    }
                    className="w-full p-4 rounded-2xl bg-white/30 border border-white/40 text-white placeholder-white/50 font-mono text-lg focus:outline-none focus:ring-4 focus:ring-${m.color.split('from-')[1].split('-')[0]}-500/30 transition-all shadow-lg hover:shadow-xl"
                  />
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-6 rounded-3xl font-black text-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 border border-green-400/50"
            >
              {editingEntry ? 'Atualizar Registro' : 'Adicionar Registro'}
            </button>
          </form>
        </section>
      </div>

      {/* Metas Modal */}
      {showMetasModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-2xl flex items-center justify-center z-50 p-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMetasModal(false);
          }}
        >
          <div className="bg-white/20 backdrop-blur-3xl border border-white/30 rounded-3xl p-10 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-3xl">
            <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              ⚙️ Configurar Metas Mensais
            </h2>
            <form onSubmit={handleMetasSubmit} className="space-y-6">
              {METRICS.map((m) => (
                <div key={m.key} className="space-y-2">
                  <label className="flex items-center gap-3 text-white/90 font-semibold text-lg">
                    {m.emoji} {m.label}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={metasForm[m.key as keyof Metas] || ''}
                    onChange={(e) =>
                      setMetasForm({
                        ...metasForm,
                        [m.key]: parseFloat(e.target.value) || 0,
                      } as Metas)
                    }
                    className="w-full p-4 rounded-2xl bg-white/40 border border-white/50 text-white placeholder-white/60 font-mono text-xl focus:outline-none focus:ring-4 focus:ring-blue-500/40 transition-all shadow-xl hover:shadow-2xl"
                  />
                </div>
              ))}
              <div className="flex gap-4 pt-6 border-t border-white/20">
                <button
                  type="button"
                  onClick={() => setShowMetasModal(false)}
                  className="flex-1 bg-gray-500/30 hover:bg-gray-500/50 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all border border-blue-400/50"
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
