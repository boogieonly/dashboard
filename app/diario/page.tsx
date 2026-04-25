'use client';

import { useState, useEffect, useCallback } from 'react';

type Metrics = {
  faturamento: number;
  atrasos: number;
  vendas: number;
  carteiraTotal: number;
  previsaoMesAtual: number;
  previsaoMesSeguinte: number;
};

type DailyEntry = Metrics & {
  date: string;
};

const STORAGE_KEY = 'dailyEntries';

const kpis: Array<{ key: keyof Metrics; emoji: string; title: string }> = [
  { key: 'faturamento', emoji: '💰', title: 'Faturamento' },
  { key: 'vendas', emoji: '📈', title: 'Vendas' },
  { key: 'atrasos', emoji: '⏰', title: 'Atrasos' },
  { key: 'carteiraTotal', emoji: '💼', title: 'Carteira Total' },
  { key: 'previsaoMesAtual', emoji: '🔮', title: 'Previsão Mês Atual' },
  { key: 'previsaoMesSeguinte', emoji: '📅', title: 'Previsão Mês Seguinte' },
];

const metricsKeys: (keyof Metrics)[] = [
  'faturamento',
  'atrasos',
  'vendas',
  'carteiraTotal',
  'previsaoMesAtual',
  'previsaoMesSeguinte',
];

function formatValue(key: keyof Metrics, value: number): string {
  if (key === 'atrasos') {
    return value.toLocaleString('pt-BR');
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getPreviousDay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

function getEntryByDate(entries: DailyEntry[], dateStr: string): DailyEntry | undefined {
  return entries.find((e) => e.date === dateStr);
}

function getPercentageChange(
  current: number,
  previous: number | undefined,
  isInverse: boolean
): { pct: number; color: string; arrow: string } {
  if (previous === undefined || previous === 0) {
    return { pct: 0, color: 'text-gray-500', arrow: '' };
  }
  let pct = ((current - previous) / previous) * 100;
  if (isInverse) pct = -pct;
  const color = pct >= 0 ? 'text-green-500' : 'text-red-500';
  const arrow = pct >= 0 ? '📈' : '📉';
  return { pct: Math.round(pct * 10) / 10, color, arrow };
}

function getLast7DaysData(entries: DailyEntry[], key: keyof Metrics): number[] {
  const data: number[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 6; i >= 0; i--) {
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - i);
    const dateStr = pastDate.toISOString().split('T')[0];
    const entry = getEntryByDate(entries, dateStr);
    data.push(entry ? entry[key] : 0);
  }
  return data;
}

function getCumulativeData(entries: DailyEntry[], key: keyof Metrics): number[] {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const data: number[] = [];
  let cum = 0;
  for (const e of sorted) {
    cum += e[key];
    data.push(cum);
  }
  return data.length ? data : [0];
}

function sumMetrics(entries: DailyEntry[], key: keyof Metrics): number {
  return entries.reduce((sum, e) => sum + e[key], 0);
}

function Sparkline({
  data,
  keyProp,
  width = 120,
  height = 32,
}: {
  data: number[];
  keyProp: keyof Metrics;
  width?: number;
  height?: number;
}) {
  if (data.length === 0 || data.every((v) => v === 0)) {
    return <div className="w-full h-full bg-gray-200 rounded-full animate-pulse" />;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max > min ? max - min : 1;
  const isInverse = keyProp === 'atrasos';
  const trend = data[data.length - 1] - data[0];
  const strokeColor = (isInverse ? -trend : trend) >= 0 ? '#10b981' : '#ef4444';
  const points = data
    .map((val, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - (height * (val - min) / range);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full block">
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DiarioPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [formData, setFormData] = useState<Partial<DailyEntry>>({});
  const [editingDate, setEditingDate] = useState<string | null>(null);

  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed: DailyEntry[] = JSON.parse(data);
        setEntries(
          parsed.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        );
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const date = formData.date as string;
    if (!date) {
      alert('Por favor, selecione a data.');
      return;
    }
    const entryData: DailyEntry = {
      date,
      faturamento: formData.faturamento ?? 0,
      atrasos: formData.atrasos ?? 0,
      vendas: formData.vendas ?? 0,
      carteiraTotal: formData.carteiraTotal ?? 0,
      previsaoMesAtual: formData.previsaoMesAtual ?? 0,
      previsaoMesSeguinte: formData.previsaoMesSeguinte ?? 0,
    };
    const exists = entries.some((e) => e.date === date && e.date !== editingDate);
    if (exists) {
      alert('Já existe uma entrada para esta data.');
      return;
    }
    if (editingDate === date) {
      setEntries((prev) =>
        prev
          .map((e) => (e.date === date ? entryData : e))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    } else {
      setEntries((prev) =>
        [entryData, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    }
    setFormData({});
    setEditingDate(null);
  };

  const handleEdit = (entry: DailyEntry) => {
    setFormData(entry);
    setEditingDate(entry.date);
  };

  const handleDelete = (date: string) => {
    if (confirm('Tem certeza que deseja deletar esta entrada?')) {
      setEntries((prev) => prev.filter((e) => e.date !== date));
    }
  };

  const latest = entries[0];

  // Current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthStartDate = new Date(year, month, 1);
  const monthEndDate = new Date(year, month + 1, 0);
  const monthStart = monthStartDate.toISOString().split('T')[0];
  const monthEnd = monthEndDate.toISOString().split('T')[0];
  const monthEntries = entries.filter((e) => e.date >= monthStart && e.date <= monthEnd);
  const daysInMonth = monthEndDate.getDate();
  const elapsedDays = Math.ceil((now.getTime() - monthStartDate.getTime()) / 86400000);
  const percentComplete = ((elapsedDays / daysInMonth) * 100).toFixed(1);
  const monthName = monthStartDate.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  const monthTotals: Metrics = {
    faturamento: sumMetrics(monthEntries, 'faturamento'),
    atrasos: sumMetrics(monthEntries, 'atrasos'),
    vendas: sumMetrics(monthEntries, 'vendas'),
    carteiraTotal: sumMetrics(monthEntries, 'carteiraTotal'),
    previsaoMesAtual: sumMetrics(monthEntries, 'previsaoMesAtual'),
    previsaoMesSeguinte: sumMetrics(monthEntries, 'previsaoMesSeguinte'),
  };

  const cumData = getCumulativeData(monthEntries, 'faturamento');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 drop-shadow-lg">
            Diário Financeiro
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-medium max-w-2xl mx-auto">
            Registre e acompanhe seu progresso diário com KPIs premium e resumos mensais.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 md:mb-16">
          {kpis.map(({ key, emoji, title }) => {
            const val = latest ? latest[key] : 0;
            const prevDate = latest ? getPreviousDay(latest.date) : '';
            const prevVal = latest ? getEntryByDate(entries, prevDate)?.[key] : undefined;
            const change = getPercentageChange(val, prevVal, key === 'atrasos');
            const sparkData = getLast7DaysData(entries, key);
            return (
              <div
                key={key as string}
                className="group bg-white/30 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-6 md:p-8 hover:shadow-3xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 cursor-pointer border-opacity-60"
              >
                <div className="text-5xl md:text-6xl mb-4 drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                  {emoji}
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 tracking-tight">
                  {title}
                </h3>
                <div className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 drop-shadow-lg">
                  {latest ? formatValue(key, val) : formatValue(key, 0)}
                </div>
                <div className="flex items-center text-lg md:text-xl mb-6">
                  <span className={`${change.color} font-bold text-2xl mr-2 drop-shadow-sm`}>
                    {change.arrow}
                  </span>
                  <span className={`${change.color} font-bold mr-3`}>{change.pct}%</span>
                  <span className="text-gray-500 font-medium">vs. ontem</span>
                </div>
                <div className="h-10 md:h-12 bg-white/50 rounded-2xl p-2 backdrop-blur-sm border border-white/70 shadow-inner">
                  <Sparkline data={sparkData} keyProp={key} width={140} height={28} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Monthly Summary */}
        <div className="bg-white/30 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 md:p-12 mb-12 md:mb-16 max-w-6xl mx-auto hover:shadow-3xl transition-all duration-300">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent drop-shadow-lg">
            📅 Resumo Mensal
          </h2>
          <div className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-10 tracking-tight">
            {monthName}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-center">
            <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm shadow-lg">
              <div className="text-sm md:text-base text-gray-600 font-medium uppercase tracking-wide">Dias Decorridos</div>
              <div className="text-3xl md:text-4xl font-black text-blue-600 mt-2">{elapsedDays}/{daysInMonth}</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm shadow-lg">
              <div className="text-sm md:text-base text-gray-600 font-medium uppercase tracking-wide">Entradas</div>
              <div className="text-3xl md:text-4xl font-black text-purple-600 mt-2">{monthEntries.length}</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm shadow-lg">
              <div className="text-sm md:text-base text-gray-600 font-medium uppercase tracking-wide">% Completo</div>
              <div className="text-3xl md:text-4xl font-black text-emerald-600 mt-2">{percentComplete}%</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div>
              <div className="text-lg font-bold text-gray-700 mb-2 uppercase tracking-wide text-sm">Totais</div>
              <div className="space-y-4">
                {metricsKeys.map((key) => (
                  <div key={key as string} className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                    <span className="font-medium text-gray-600 flex items-center">
                      {kpis.find((k) => k.key === key)?.emoji}
                    </span>
                    <span className="font-bold text-xl">
                      {formatValue(key, monthTotals[key])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-700 mb-2 uppercase tracking-wide text-sm">Médias Diárias</div>
              <div className="space-y-4">
                {metricsKeys.map((key) => {
                  const avg = elapsedDays > 0 ? monthTotals[key] / elapsedDays : 0;
                  return (
                    <div key={key as string} className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <span className="font-medium text-gray-600 flex items-center">
                        {kpis.find((k) => k.key === key)?.emoji}
                      </span>
                      <span className="font-bold text-xl text-green-600">
                        {formatValue(key, avg)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-1 flex flex-col items-center justify-center p-8 bg-white/70 rounded-2xl shadow-xl backdrop-blur-md border border-white/70">
              <div className="text-xl font-bold mb-4 text-gray-800">Acumulado 💰</div>
              <div className="w-full max-w-xs">
                <Sparkline data={cumData} keyProp="faturamento" width={200} height={40} />
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto mb-12 md:mb-16">
          <div className="bg-white/30 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 md:p-12 hover:shadow-3xl transition-all duration-300">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent drop-shadow-lg">
              {editingDate ? '✏️ Editar Entrada' : '➕ Nova Entrada Diária'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Data *</label>
                <input
                  type="date"
                  required
                  value={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200/50 bg-white/70 backdrop-blur-sm shadow-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200/50 focus:outline-none transition-all duration-300 text-lg font-mono tracking-wider"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">{kpis[0].emoji} Faturamento</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.faturamento?.toString() || ''}
                  onChange={(e) => setFormData({ ...formData, faturamento: parseFloat(e.target.value) || 0 })}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200/50 bg-white/70 backdrop-blur-sm shadow-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200/50 focus:outline-none transition-all duration-300 text-lg font-mono tracking-wider"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">{kpis[2].emoji} Atrasos</label>
                <input
                  type="number"
                  step="1"
                  value={formData.atrasos?.toString() || ''}
                  onChange={(e) => setFormData({ ...formData, atrasos: parseFloat(e.target.value) || 0 })}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200/50 bg-white/70 backdrop-blur-sm shadow-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200/50 focus:outline-none transition-all duration-300 text-lg font-mono tracking-wider"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">{kpis[1].emoji} Vendas</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.vendas?.toString() || ''}
                  onChange={(e) => setFormData({ ...formData, vendas: parseFloat(e.target.value) || 0 })}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200/50 bg-white/70 backdrop-blur-sm shadow-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200/50 focus:outline-none transition-all duration-300 text-lg font-mono tracking-wider"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">{kpis[3].emoji} Carteira Total</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.carteiraTotal?.toString() || ''}
                  onChange={(e) => setFormData({ ...formData, carteiraTotal: parseFloat(e.target.value) || 0 })}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200/50 bg-white/70 backdrop-blur-sm shadow-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200/50 focus:outline-none transition-all duration-300 text-lg font-mono tracking-wider"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">{kpis[4].emoji} Previsão Mês Atual</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.previsaoMesAtual?.toString() || ''}
                  onChange={(e) => setFormData({ ...formData, previsaoMesAtual: parseFloat(e.target.value) || 0 })}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200/50 bg-white/70 backdrop-blur-sm shadow-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200/50 focus:outline-none transition-all duration-300 text-lg font-mono tracking-wider"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">{kpis[5].emoji} Previsão Mês Seguinte</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.previsaoMesSeguinte?.toString() || ''}
                  onChange={(e) => setFormData({ ...formData, previsaoMesSeguinte: parseFloat(e.target.value) || 0 })}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200/50 bg-white/70 backdrop-blur-sm shadow-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200/50 focus:outline-none transition-all duration-300 text-lg font-mono tracking-wider"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-1 md:order-last">
                <button
                  type="submit"
                  className="w-full py-5 px-8 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-black text-xl shadow-2xl hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 hover:shadow-3xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-300/50 transition-all duration-300 tracking-wide uppercase letter-spacing-1"
                >
                  {editingDate ? '✏️ Atualizar Entrada' : '➕ Adicionar Entrada'}
                </button>
              </div>
              {editingDate && (
                <div className="md:col-span-2 lg:col-span-1">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({});
                      setEditingDate(null);
                    }}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold text-lg shadow-xl hover:from-gray-500 hover:to-gray-600 hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    ❌ Cancelar Edição
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* History Table */}
        {entries.length > 0 && (
          <div>
            <div className="bg-white/30 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 md:p-12 hover:shadow-3xl transition-all duration-300 overflow-hidden">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
                📋 Histórico de Entradas
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-gray-200/50 shadow-inner">
                <table className="w-full table-auto divide-y divide-gray-200/50">
                  <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-10">
                    <tr>
                      <th className="px-6 py-5 text-left text-xs md:text-sm font-black text-gray-700 uppercase tracking-wider">Data</th>
                      {kpis.map(({ key, emoji, title }) => (
                        <th
                          key={key as string}
                          className="px-4 md:px-6 py-5 text-right text-xs md:text-sm font-black text-gray-700 uppercase tracking-wider"
                        >
                          <span className="flex items-center justify-end gap-1">
                            {emoji}
                            <span className="hidden sm:inline">{title.slice(0, 6)}</span>
                          </span>
                        </th>
                      ))}
                      <th className="px-6 py-5 text-right text-xs md:text-sm font-black text-gray-700 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/30 bg-white/50 backdrop-blur-sm">
                    {entries.slice(0, 20).map((entry) => (
                      <tr
                        key={entry.date}
                        className="hover:bg-gray-50/60 transition-all duration-200 group"
                      >
                        <td className="px-6 py-6 whitespace-nowrap font-semibold text-gray-900">
                          {new Date(entry.date).toLocaleDateString('pt-BR', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        {metricsKeys.map((key) => (
                          <td
                            key={key as string}
                            className="px-4 md:px-6 py-6 whitespace-nowrap text-right text-sm md:text-base font-mono font-semibold text-gray-900 group-hover:text-gray-800"
                          >
                            {formatValue(key, entry[key])}
                          </td>
                        ))}
                        <td className="px-6 py-6 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(entry)}
                              className="px-4 py-2 bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-blue-600 hover:shadow-xl hover:scale-105 transition-all duration-200 whitespace-nowrap"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(entry.date)}
                              className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-red-600 hover:shadow-xl hover:scale-105 transition-all duration-200 whitespace-nowrap"
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
              {entries.length > 20 && (
                <div className="text-center mt-8 text-gray-500 text-sm">
                  Mostrando as últimas 20 entradas de {entries.length} totais.
                </div>
              )}
            </div>
          </div>
        )}

        {entries.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-8">📝</div>
            <h3 className="text-3xl font-bold text-gray-700 mb-4">Nenhuma entrada ainda</h3>
            <p className="text-xl text-gray-500 mb-8 max-w-md mx-auto">
              Adicione sua primeira entrada diária para começar a acompanhar seus KPIs e resumos mensais.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
