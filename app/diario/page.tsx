'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';

type NumericFields = 'faturamento' | 'vendas' | 'atrasos' | 'carteiraTotal' | 'previsaoMesAtual' | 'previsaoMesSeguinte';
type Metas = { [K in NumericFields]: number };
type DailyEntry = {
  date: string;
} & Metas;

type AccumField = 'faturamento' | 'vendas' | 'atrasos';

type KpiConfig = {
  field: NumericFields;
  emoji: string;
  title: string;
};

const fieldEmojis: Record<NumericFields, string> = {
  faturamento: '💰',
  vendas: '📈',
  atrasos: '⚠️',
  carteiraTotal: '💼',
  previsaoMesAtual: '🔮',
  previsaoMesSeguinte: '📅',
};

const fieldTitles: Record<NumericFields, string> = {
  faturamento: 'Faturamento',
  vendas: 'Vendas',
  atrasos: 'Atrasos',
  carteiraTotal: 'Carteira Total',
  previsaoMesAtual: 'Previsão Mês Atual',
  previsaoMesSeguinte: 'Previsão Mês Seguinte',
};

const kpisDiaria: KpiConfig[] = [
  { field: 'faturamento', emoji: fieldEmojis.faturamento, title: fieldTitles.faturamento },
  { field: 'vendas', emoji: fieldEmojis.vendas, title: fieldTitles.vendas },
  { field: 'atrasos', emoji: fieldEmojis.atrasos, title: fieldTitles.atrasos },
];

const kpisSnapshot: KpiConfig[] = [
  { field: 'carteiraTotal', emoji: fieldEmojis.carteiraTotal, title: fieldTitles.carteiraTotal },
  { field: 'previsaoMesAtual', emoji: fieldEmojis.previsaoMesAtual, title: fieldTitles.previsaoMesAtual },
  { field: 'previsaoMesSeguinte', emoji: fieldEmojis.previsaoMesSeguinte, title: fieldTitles.previsaoMesSeguinte },
];

const glassClass = 'bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-6 md:p-8';

const inputClass = 'w-full p-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200';

const parseDate = (dateStr: string): number => new Date(`${dateStr}T00:00:00`).getTime();

const getTodayDate = (): string => new Date().toISOString().split('T')[0];

const getYesterdayDate = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

const getMonthStartDate = (): string => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().split('T')[0];
};

const Sparkline: React.FC<{ data: number[] }> = ({ data }) => {
  if (!data.length) {
    return <div className="h-10 bg-gray-800/50 rounded-lg animate-pulse" />;
  }

  const maxV = Math.max(...data);
  const minV = Math.min(...data);
  const range = maxV > minV ? maxV - minV : 1;
  const width = 120;
  const height = 40;
  const points: string[] = [];

  data.forEach((val, i) => {
    const x = (i / (data.length - 1)) * (width - 20) + 10;
    const y = height - ((val - minV) / range * (height - 20) + 10);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  });

  return (
    <svg className="w-full h-10" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="sparkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke="url(#sparkGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default function DiarioPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [metas, setMetas] = useState<Metas>({
    faturamento: 100000,
    vendas: 200,
    atrasos: 5,
    carteiraTotal: 50000,
    previsaoMesAtual: 120000,
    previsaoMesSeguinte: 150000,
  });
  const [formData, setFormData] = useState<DailyEntry>({
    date: getTodayDate(),
    faturamento: 0,
    vendas: 0,
    atrasos: 0,
    carteiraTotal: 0,
    previsaoMesAtual: 0,
    previsaoMesSeguinte: 0,
  });
  const [editingEntryDate, setEditingEntryDate] = useState<string | null>(null);
  const [showMetasModal, setShowMetasModal] = useState(false);
  const [tempMetas, setTempMetas] = useState<Metas>(metas);

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => parseDate(b.date) - parseDate(a.date)),
    [entries]
  );

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

  const getEntryValue = useCallback((dateStr: string, field: NumericFields): number => {
    return entries.find((e) => e.date === dateStr)?.[field] ?? 0;
  }, [entries]);

  const getTodayValue = useCallback((field: NumericFields): number => {
    return getEntryValue(getTodayDate(), field);
  }, [getEntryValue]);

  const getYesterdayValue = useCallback((field: NumericFields): number => {
    return getEntryValue(getYesterdayDate(), field);
  }, [getEntryValue]);

  const getCurrentAccum = useCallback((field: AccumField): number => {
    const monthStart = getMonthStartDate();
    return entries
      .filter((e) => e.date >= monthStart)
      .reduce((sum, e) => sum + (e[field] ?? 0), 0);
  }, [entries]);

  const getCurrentSnapshot = useCallback((field: NumericFields): number => {
    const sortedDesc = [...entries].sort((a, b) => parseDate(b.date) - parseDate(a.date));
    return sortedDesc[0]?.[field] ?? 0;
  }, [entries]);

  const getSparklineData = useCallback((field: AccumField, days: number = 7): number[] => {
    const sortedDesc = [...entries].sort((a, b) => parseDate(b.date) - parseDate(a.date));
    return sortedDesc.slice(0, days).map((e) => e[field]).reverse();
  }, [entries]);

  const getPctMeta = useCallback((field: NumericFields, value: number): number => {
    const meta = metas[field];
    if (meta === 0) return 0;
    if (field === 'atrasos') {
      return Math.max(0, (1 - value / meta) * 100);
    }
    return Math.min(100, (value / meta) * 100);
  }, [metas]);

  const getDeltaColor = useCallback((field: NumericFields, delta: number): string => {
    if (field === 'atrasos') {
      return delta > 0 ? 'text-red-400' : 'text-emerald-400';
    }
    return delta > 0 ? 'text-emerald-400' : 'text-red-400';
  }, []);

  const getProgressColor = (pct: number): string => {
    if (pct >= 80) return 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-emerald-500/50';
    if (pct >= 50) return 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-yellow-500/50';
    return 'bg-gradient-to-r from-red-400 to-rose-500 shadow-red-500/50';
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newEntry: DailyEntry = {
      date: formData.date,
      ...formData,
    } as DailyEntry;

    if (editingEntryDate) {
      setEntries((prev) => prev.map((e) => (e.date === editingEntryDate ? newEntry : e)));
      setEditingEntryDate(null);
    } else {
      const exists = entries.some((e) => e.date === newEntry.date);
      if (exists) {
        alert('Entrada para esta data já existe! Use Editar no histórico.');
        return;
      }
      setEntries((prev) => [...prev, newEntry]);
    }
    const defaultForm: DailyEntry = {
      date: getTodayDate(),
      faturamento: 0,
      vendas: 0,
      atrasos: 0,
      carteiraTotal: 0,
      previsaoMesAtual: 0,
      previsaoMesSeguinte: 0,
    };
    setFormData(defaultForm);
  };

  const handleEditEntry = (date: string) => {
    const entry = entries.find((e) => e.date === date);
    if (entry) {
      setFormData(entry);
      setEditingEntryDate(date);
    }
  };

  const handleDeleteEntry = (date: string) => {
    if (confirm('Tem certeza que deseja deletar esta entrada?')) {
      setEntries((prev) => prev.filter((e) => e.date !== date));
    }
  };

  const handleOpenMetas = () => {
    setTempMetas(metas);
    setShowMetasModal(true);
  };

  const handleSaveMetas = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMetas(tempMetas);
    setShowMetasModal(false);
  };

  const numericFields: NumericFields[] = [
    'faturamento',
    'vendas',
    'atrasos',
    'carteiraTotal',
    'previsaoMesAtual',
    'previsaoMesSeguinte',
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6 md:p-8 py-12 relative overflow-x-hidden">
        <button
          onClick={handleOpenMetas}
          className="fixed top-6 right-6 z-50 p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300 backdrop-blur-sm border border-white/20"
        >
          ⚙️ Configurar Metas
        </button>

        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-12 md:mb-16 text-center drop-shadow-2xl animate-pulse">
            Diário Financeiro
          </h1>

          {/* KPI Cards Entrada Diária */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {kpisDiaria.map(({ field, emoji, title }) => {
              const todayVal = getTodayValue(field);
              const yestVal = getYesterdayValue(field);
              const delta = todayVal - yestVal;
              const pctChg = yestVal ? (delta / yestVal) * 100 : 0;
              const accumVal = getCurrentAccum(field as AccumField);
              const pctMeta = getPctMeta(field, accumVal);
              const sparkData = getSparklineData(field as AccumField);
              const deltaCls = getDeltaColor(field, delta);

              return (
                <div
                  key={field}
                  className={`${glassClass} text-center group hover:scale-[1.02] transition-all duration-500 hover:shadow-3xl border-white/30`}
                >
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="text-4xl drop-shadow-lg">{emoji}</span>
                    <h3 className="text-xl font-bold text-white drop-shadow-md">{title}</h3>
                  </div>
                  <div className="text-4xl md:text-5xl font-black bg-gradient-to-br from-white via-blue-100 to-white bg-clip-text text-transparent mb-4 drop-shadow-2xl">
                    {todayVal.toLocaleString('pt-BR')}
                  </div>
                  <div className={`text-xl font-bold ${deltaCls} mb-6 drop-shadow-lg`}>
                    {delta >= 0 ? '+' : ''}{delta.toLocaleString('pt-BR')} ({pctChg.toFixed(1)}% vs ontem)
                  </div>
                  <div className="mb-6">
                    <Sparkline data={sparkData} />
                  </div>
                  <div className="inline-flex items-center gap-1 px-4 py-2 bg-black/30 backdrop-blur-sm border border-white/30 rounded-2xl text-white/90 font-semibold text-sm shadow-lg">
                    {pctMeta.toFixed(1)}% meta mensal
                  </div>
                </div>
              );
            })}
          </div>

          {/* KPI Cards Posição Atual */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {kpisSnapshot.map(({ field, emoji, title }) => {
              const todayVal = getTodayValue(field);
              const yestVal = getYesterdayValue(field);
              const delta = todayVal - yestVal;
              const pctChg = yestVal ? (delta / yestVal) * 100 : 0;
              const pctMeta = getPctMeta(field, todayVal);
              const deltaCls = getDeltaColor(field, delta);

              return (
                <div
                  key={field}
                  className={`${glassClass} text-center group hover:scale-[1.02] transition-all duration-500 hover:shadow-3xl border-white/30`}
                >
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="text-4xl drop-shadow-lg">{emoji}</span>
                    <h3 className="text-xl font-bold text-white drop-shadow-md">{title}</h3>
                  </div>
                  <div className="text-4xl md:text-5xl font-black bg-gradient-to-br from-white via-emerald-100 to-white bg-clip-text text-transparent mb-6 drop-shadow-2xl">
                    {todayVal.toLocaleString('pt-BR')}
                  </div>
                  <div className={`text-xl font-bold ${deltaCls} mb-8 drop-shadow-lg`}>
                    {delta >= 0 ? '+' : ''}{delta.toLocaleString('pt-BR')} ({pctChg.toFixed(1)}% vs ontem)
                  </div>
                  <div className="inline-flex items-center gap-1 px-4 py-2 bg-black/30 backdrop-blur-sm border border-white/30 rounded-2xl text-white/90 font-semibold text-sm shadow-lg">
                    {pctMeta.toFixed(1)}% meta
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumo Mensal */}
          <section className="mb-20">
            <h2 className="text-4xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-12 text-center drop-shadow-2xl">
              📊 Resumo Mensal
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Acumulado do Mês */}
              <div className={`${glassClass} ${glassClass}`}>
                <h3 className="text-2xl font-bold mb-8 flex items-center justify-center gap-3 text-white drop-shadow-xl">
                  💹 Acumulado do Mês
                </h3>
                {kpisDiaria.map(({ field, emoji, title }) => {
                  const value = getCurrentAccum(field as AccumField);
                  const pct = getPctMeta(field, value);
                  return (
                    <div key={field} className="mb-8 last:mb-0 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">{emoji}</span>
                        <span className="font-bold text-xl text-white">{title}</span>
                      </div>
                      <div className="text-3xl font-black text-white mb-4 drop-shadow-lg">
                        {value.toLocaleString('pt-BR')}
                      </div>
                      <div className="w-full bg-gray-800/50 rounded-full h-4 mb-2 overflow-hidden">
                        <div
                          className={getProgressColor(pct)}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                      <div className="text-sm font-medium text-white/90">
                        {pct.toFixed(1)}% da meta
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Posição Atual */}
              <div className={`${glassClass} ${glassClass}`}>
                <h3 className="text-2xl font-bold mb-8 flex items-center justify-center gap-3 text-white drop-shadow-xl">
                  📈 Posição Atual
                </h3>
                {kpisSnapshot.map(({ field, emoji, title }) => {
                  const value = getCurrentSnapshot(field);
                  const pct = getPctMeta(field, value);
                  return (
                    <div key={field} className="mb-8 last:mb-0 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">{emoji}</span>
                        <span className="font-bold text-xl text-white">{title}</span>
                      </div>
                      <div className="text-3xl font-black text-white mb-4 drop-shadow-lg">
                        {value.toLocaleString('pt-BR')}
                      </div>
                      <div className="w-full bg-gray-800/50 rounded-full h-4 mb-2 overflow-hidden">
                        <div
                          className={getProgressColor(pct)}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                      <div className="text-sm font-medium text-white/90">
                        {pct.toFixed(1)}% da meta
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Formulário de Entrada */}
          <section className="mb-20">
            <div className={`${glassClass} ${glassClass}`}>
              <h2 className="text-3xl font-bold mb-8 text-center text-white drop-shadow-2xl">
                {editingEntryDate ? '✏️ Editar Entrada' : '➕ Nova Entrada Diária'}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">📅 Data</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                {numericFields.map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      {fieldEmojis[field]} {fieldTitles[field]}
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      value={formData[field]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [field]: Number(e.target.value) || 0,
                        }))
                      }
                      className={inputClass}
                      placeholder="0"
                    />
                  </div>
                ))}
                <div className="md:col-span-2 lg:col-span-3 pt-4">
                  <button
                    type="submit"
                    className="w-full p-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 border border-white/20 backdrop-blur-sm"
                  >
                    {editingEntryDate ? 'Atualizar' : 'Registrar'} Entrada
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* Histórico */}
          <section>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-white drop-shadow-2xl">
              📋 Histórico
            </h2>
            <div className={`${glassClass} overflow-x-auto shadow-3xl ${glassClass}`}>
              <table className="w-full text-sm md:text-base">
                <thead>
                  <tr className="border-b-2 border-white/30">
                    <th className="p-4 text-left font-bold text-white">Data</th>
                    <th className="p-4 text-center font-bold text-white">💰 Fat.</th>
                    <th className="p-4 text-center font-bold text-white">📈 Vend.</th>
                    <th className="p-4 text-center font-bold text-white">⚠️ Atr.</th>
                    <th className="p-4 text-center font-bold text-white">💼 Carteira</th>
                    <th className="p-4 text-center font-bold text-white">🔮 Prev. Atual</th>
                    <th className="p-4 text-center font-bold text-white">📅 Prev. Seg.</th>
                    <th className="p-4 text-center font-bold text-white">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEntries.slice(0, 30).map((entry) => (
                    <tr
                      key={entry.date}
                      className="hover:bg-white/20 transition-all duration-200 border-b border-white/10 last:border-b-0"
                    >
                      <td className="p-4 font-semibold text-white">{entry.date}</td>
                      <td className="p-4 text-center text-white/90 font-mono">
                        {entry.faturamento.toLocaleString('pt-BR')}
                      </td>
                      <td className="p-4 text-center text-white/90 font-mono">
                        {entry.vendas.toLocaleString('pt-BR')}
                      </td>
                      <td className="p-4 text-center text-white/90 font-mono">
                        {entry.atrasos.toLocaleString('pt-BR')}
                      </td>
                      <td className="p-4 text-center text-white/90 font-mono">
                        {entry.carteiraTotal.toLocaleString('pt-BR')}
                      </td>
                      <td className="p-4 text-center text-white/90 font-mono">
                        {entry.previsaoMesAtual.toLocaleString('pt-BR')}
                      </td>
                      <td className="p-4 text-center text-white/90 font-mono">
                        {entry.previsaoMesSeguinte.toLocaleString('pt-BR')}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleEditEntry(entry.date)}
                          className="mr-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-blue-500/50"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(entry.date)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-red-500/50"
                        >
                          Deletar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {sortedEntries.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-white/60 font-medium">
                        Nenhuma entrada registrada ainda. Comece adicionando a primeira! 🎉
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {/* Modal Configurar Metas */}
      {showMetasModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white/20 backdrop-blur-3xl border border-white/30 rounded-3xl p-8 w-full max-w-lg shadow-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-white drop-shadow-2xl flex items-center justify-center gap-3">
              ⚙️ Configurar Metas
            </h2>
            <form onSubmit={handleSaveMetas} className="space-y-6">
              {Object.entries(tempMetas).map(([key, value]) => {
                const field = key as NumericFields;
                return (
                  <div key={field}>
                    <label className="block text-sm font-bold text-white/95 mb-3 capitalize">
                      {fieldEmojis[field]} {fieldTitles[field]}
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={value}
                      onChange={(e) =>
                        setTempMetas((prev) => ({
                          ...prev,
                          [field]: Number(e.target.value) || 0,
                        }))
                      }
                      className={`${inputClass} text-lg`}
                      placeholder="Defina a meta..."
                    />
                  </div>
                );
              })}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowMetasModal(false)}
                  className="flex-1 p-4 bg-gray-500/50 hover:bg-gray-600/50 text-white font-bold rounded-2xl border border-white/30 backdrop-blur-sm transition-all shadow-xl hover:shadow-gray-500/30 hover:scale-105"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl border border-white/30 backdrop-blur-sm shadow-xl hover:shadow-green-500/50 hover:scale-105 transition-all"
                >
                  Salvar Metas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
