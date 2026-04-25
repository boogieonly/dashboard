'use client';

import React, { useState, useEffect } from 'react';

type IndicatorKey = 'faturamento' | 'vendas' | 'atrasos' | 'carteiraTotal' | 'previsaoMesAtual' | 'previsaoMesSeguinte';

interface DailyEntry {
  id: string;
  date: string;
  faturamento: number;
  vendas: number;
  atrasos: number;
  carteiraTotal: number;
  previsaoMesAtual: number;
  previsaoMesSeguinte: number;
}

interface Metas {
  [key in IndicatorKey]?: number;
}

interface IndicatorConfig {
  label: string;
  icon: string;
  color: string;
  inverse: boolean;
}

const indicatorConfig: Record<IndicatorKey, IndicatorConfig> = {
  faturamento: { label: 'Faturamento', icon: '💰', color: 'green', inverse: false },
  vendas: { label: 'Vendas', icon: '📦', color: 'blue', inverse: false },
  atrasos: { label: 'Atrasos', icon: '⚠️', color: 'red', inverse: true },
  carteiraTotal: { label: 'Carteira Total', icon: '💳', color: 'purple', inverse: false },
  previsaoMesAtual: { label: 'Previsão Mês Atual', icon: '📈', color: 'orange', inverse: false },
  previsaoMesSeguinte: { label: 'Previsão Mês Seguinte', icon: '🔮', color: 'indigo', inverse: false },
};

const defaultMetas: Metas = {
  faturamento: 500000,
  vendas: 1000,
  atrasos: 5,
  carteiraTotal: 1000000,
  previsaoMesAtual: 450000,
  previsaoMesSeguinte: 600000,
};

const ENTRADA_DIARIA: IndicatorKey[] = ['faturamento', 'vendas', 'atrasos'];
const SNAPSHOT: IndicatorKey[] = ['carteiraTotal', 'previsaoMesAtual', 'previsaoMesSeguinte'];

const Sparkline: React.FC<{ data: number[]; className?: string }> = ({ data, className = '' }) => {
  if (data.length === 0) return <div className="w-full h-5 bg-gray-200 rounded" />;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max > min ? max - min : 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 20 - ((v - min) / range) * 18;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 20" className={`w-full h-5 ${className}`}>
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default function DiarioPage() {
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);
  const [metas, setMetas] = useState<Metas>(defaultMetas);
  const [formData, setFormData] = useState<Partial<DailyEntry>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showMetasModal, setShowMetasModal] = useState(false);
  const [tempMetas, setTempMetas] = useState<Metas>(defaultMetas);

  useEffect(() => {
    const savedEntries = localStorage.getItem('dailyEntries');
    if (savedEntries) {
      setDailyEntries(JSON.parse(savedEntries));
    }
    const savedMetas = localStorage.getItem('metas');
    if (savedMetas) {
      setMetas(JSON.parse(savedMetas));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyEntries', JSON.stringify(dailyEntries));
    localStorage.setItem('metas', JSON.stringify(metas));
  }, [dailyEntries, metas]);

  const getDateStr = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getLastNDays = (field: IndicatorKey, days: number): number[] => {
    const data: number[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = getDateStr(d);
      const entry = dailyEntries.find((e) => e.date === dateStr);
      data.push(entry ? (entry as any)[field] : 0);
    }
    return data;
  };

  const getCurrentValue = (field: IndicatorKey): number => getLastNDays(field, 1)[0];

  const getPreviousValue = (field: IndicatorKey): number | null => {
    const data = getLastNDays(field, 2);
    return data.length >= 2 ? data[1] : null;
  };

  const getTrendIcon = (delta: number): { icon: string; className: string } => {
    if (delta > 0) return { icon: '↗️', className: 'text-emerald-500' };
    if (delta < 0) return { icon: '↘️', className: 'text-rose-500' };
    return { icon: '→', className: 'text-gray-500' };
  };

  const getProgress = (field: IndicatorKey, value: number, periodDays: number = 1): number => {
    const monthlyTarget = metas[field];
    if (monthlyTarget === undefined || monthlyTarget === 0) return 0;

    const periodTarget = (monthlyTarget / 30) * periodDays;
    const config = indicatorConfig[field];
    let progress: number;

    if (config.inverse) {
      progress = Math.max(0, ((periodTarget - value) / periodTarget) * 100);
    } else {
      progress = Math.min(100, (value / periodTarget) * 100);
    }
    return progress;
  };

  const getBarColorClass = (progress: number): string => {
    if (progress >= 90) return 'bg-gradient-to-r from-emerald-400 to-green-500';
    if (progress >= 70) return 'bg-gradient-to-r from-amber-400 to-yellow-500';
    return 'bg-gradient-to-r from-rose-400 to-red-500';
  };

  const getMonthlySummary = () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthEntries = dailyEntries.filter((e) => e.date.startsWith(currentMonth));

    const dailySum: Record<string, number> = {};
    ENTRADA_DIARIA.forEach((f) => {
      dailySum[f] = monthEntries.reduce((sum, e) => sum + e[f as keyof DailyEntry], 0);
    });

    const snapshotLast: Record<string, number> = {};
    if (monthEntries.length > 0) {
      const last = monthEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      SNAPSHOT.forEach((f) => {
        snapshotLast[f] = last[f as keyof DailyEntry];
      });
    }

    return { dailySum, snapshotLast };
  };

  const monthly = getMonthlySummary();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date) return;

    const entry: DailyEntry = {
      id: editingId || Date.now().toString(),
      date: formData.date as string,
      faturamento: formData.faturamento ?? 0,
      vendas: formData.vendas ?? 0,
      atrasos: formData.atrasos ?? 0,
      carteiraTotal: formData.carteiraTotal ?? 0,
      previsaoMesAtual: formData.previsaoMesAtual ?? 0,
      previsaoMesSeguinte: formData.previsaoMesSeguinte ?? 0,
    };

    if (editingId) {
      setDailyEntries(dailyEntries.map((e) => (e.id === editingId ? entry : e)));
    } else {
      setDailyEntries([...dailyEntries, entry]);
    }
    setFormData({});
    setEditingId(null);
  };

  const handleEdit = (entry: DailyEntry) => {
    setFormData(entry);
    setEditingId(entry.id);
  };

  const handleDelete = (id: string) => {
    setDailyEntries(dailyEntries.filter((e) => e.id !== id));
  };

  const handleOpenMetas = () => {
    setTempMetas(metas);
    setShowMetasModal(true);
  };

  const handleSaveMetas = () => {
    setMetas(tempMetas);
    setShowMetasModal(false);
  };

  const sortedEntries = dailyEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const fields: (keyof Partial<DailyEntry>)[] = ['date', 'faturamento', 'vendas', 'atrasos', 'carteiraTotal', 'previsaoMesAtual', 'previsaoMesSeguinte'];
  const fieldLabels: Record<string, string> = {
    date: 'Data',
    faturamento: 'Faturamento',
    vendas: 'Vendas',
    atrasos: 'Atrasos',
    carteiraTotal: 'Carteira Total',
    previsaoMesAtual: 'Previsão Mês Atual',
    previsaoMesSeguinte: 'Previsão Mês Seguinte',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-12 text-center">
          📊 Diário Financeiro
        </h1>

        {/* KPI Cards - Entrada Diária */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">KPI Cards - Entrada Diária</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ENTRADA_DIARIA.map((field) => {
              const value = getCurrentValue(field);
              const sparkData = getLastNDays(field, 7);
              const progress = getProgress(field, value, 1);
              const config = indicatorConfig[field];
              return (
                <div
                  key={field}
                  className="group bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/50 hover:shadow-3xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl md:text-4xl">{config.icon}</span>
                    <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      {config.label}
                    </span>
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                    R$ {value.toLocaleString()}
                  </div>
                  <Sparkline data={sparkData} className={`text-${config.color}-500`} />
                  <div className="w-full bg-gray-200 rounded-2xl h-4 mt-6 overflow-hidden">
                    <div
                      className={getBarColorClass(progress)}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mt-2">{progress.toFixed(0)}% da meta diária</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Posição Atual - Snapshot */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Posição Atual - Snapshot</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SNAPSHOT.map((field) => {
              const value = getCurrentValue(field);
              const prevValue = getPreviousValue(field);
              const delta = prevValue !== null ? value - prevValue : 0;
              const trend = getTrendIcon(delta);
              const progress = getProgress(field, value, 1);
              const config = indicatorConfig[field];
              return (
                <div
                  key={field}
                  className="group bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/50 hover:shadow-3xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl md:text-4xl">{config.icon}</span>
                    <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      {config.label}
                    </span>
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                    R$ {value.toLocaleString()}
                  </div>
                  <div className="flex items-center text-lg font-semibold mb-6">
                    <span className={`${trend.className} text-2xl mr-2`}>{trend.icon}</span>
                    <span className={delta !== 0 ? trend.className : 'text-gray-500'}>
                      {delta > 0 ? '+' : ''}R$ {Math.abs(delta).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-2xl h-4 overflow-hidden">
                    <div
                      className={getBarColorClass(progress)}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mt-2">{progress.toFixed(0)}% da meta</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Resumo Mensal */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">📊 Resumo Mensal</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Acumulado do Mês */}
            <div>
              <h3 className="text-2xl font-bold text-emerald-600 mb-6 text-center">📊 Acumulado do Mês</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ENTRADA_DIARIA.map((field) => {
                  const value = (monthly.dailySum as any)[field] || 0;
                  const progress = getProgress(field, value, 30);
                  const config = indicatorConfig[field];
                  return (
                    <div key={field} className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-6 border border-white/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{config.icon}</span>
                        <span className="text-xs font-semibold text-gray-600">{config.label}</span>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-3">R$ {value.toLocaleString()}</div>
                      <div className="w-full bg-gray-200 rounded-xl h-3 overflow-hidden">
                        <div
                          className={getBarColorClass(progress)}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{progress.toFixed(0)}% da meta</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Posição Atual */}
            <div>
              <h3 className="text-2xl font-bold text-purple-600 mb-6 text-center">💾 Posição Atual</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SNAPSHOT.map((field) => {
                  const value = (monthly.snapshotLast as any)[field] || 0;
                  const progress = getProgress(field, value, 1);
                  const config = indicatorConfig[field];
                  return (
                    <div key={field} className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-6 border border-white/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{config.icon}</span>
                        <span className="text-xs font-semibold text-gray-600">{config.label}</span>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-3">R$ {value.toLocaleString()}</div>
                      <div className="w-full bg-gray-200 rounded-xl h-3 overflow-hidden">
                        <div
                          className={getBarColorClass(progress)}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{progress.toFixed(0)}% da meta</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Formulário */}
        <section className="mb-12">
          <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-12 border border-white/50">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              {editingId ? '✏️ Editar' : '➕ Nova'} Entrada Diária
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fields.map((f) => (
                <div key={f as string} className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 capitalize">
                    {fieldLabels[f as string]}
                  </label>
                  <input
                    type={f === 'date' ? 'date' : 'number'}
                    step={f === 'date' ? undefined : '0.01'}
                    value={(formData[f as keyof Partial<DailyEntry>] ?? '') as string}
                    onChange={(e) =>
                      setFormData({ ...formData, [f]: f === 'date' ? e.target.value : Number(e.target.value) || 0 }
                    )}
                    className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                    required={f === 'date'}
                  />
                </div>
              ))}
              <div className="lg:col-span-3 flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-8 rounded-2xl font-bold shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-lg"
                >
                  {editingId ? 'Atualizar Entrada' : 'Adicionar Entrada'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({});
                      setEditingId(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 px-8 rounded-2xl font-bold shadow-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 text-lg"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

        {/* Histórico */}
        <section className="mb-12">
          <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-12 border border-white/50 overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">📋 Histórico</h2>
              <span className="text-sm text-gray-500">{sortedEntries.length} entradas</span>
            </div>
            {sortedEntries.length === 0 ? (
              <p className="text-center text-gray-500 py-12 text-xl">Nenhuma entrada registrada ainda. Adicione a primeira!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="p-4 text-left font-bold text-gray-700">Data</th>
                      {Object.keys(indicatorConfig).map((key) => (
                        <th key={key} className="p-4 text-left font-bold text-gray-700">
                          {indicatorConfig[key as IndicatorKey].label}
                        </th>
                      ))}
                      <th className="p-4 text-left font-bold text-gray-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedEntries.map((entry) => (
                      <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-semibold text-gray-900">{entry.date}</td>
                        <td className="p-4">R$ {entry.faturamento.toLocaleString()}</td>
                        <td className="p-4">{entry.vendas.toLocaleString()}</td>
                        <td className="p-4">{entry.atrasos}</td>
                        <td className="p-4">R$ {entry.carteiraTotal.toLocaleString()}</td>
                        <td className="p-4">R$ {entry.previsaoMesAtual.toLocaleString()}</td>
                        <td className="p-4">R$ {entry.previsaoMesSeguinte.toLocaleString()}</td>
                        <td className="p-4">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-4 py-2 rounded-xl font-semibold shadow-md hover:from-amber-500 hover:to-yellow-600 transition-all mr-2 text-sm"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="bg-gradient-to-r from-rose-400 to-red-500 text-white px-4 py-2 rounded-xl font-semibold shadow-md hover:from-rose-500 hover:to-red-600 transition-all text-sm"
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

        {/* Botão Metas */}
        <div className="text-center">
          <button
            onClick={handleOpenMetas}
            className="bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 text-white px-12 py-6 rounded-3xl font-bold text-xl shadow-2xl hover:shadow-3xl hover:from-purple-600 hover:via-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1"
          >
            ⚙️ Configurar Metas Mensais
          </button>
        </div>
      </div>

      {/* Modal Metas */}
      {showMetasModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 md:p-12 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">⚙️ Configurar Metas Mensais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {Object.entries(indicatorConfig).map(([key, config]) => (
                <div key={key} className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 flex items-center">
                    {config.icon} {config.label}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={tempMetas[key as IndicatorKey]?.toString() ?? ''}
                    onChange={(e) =>
                      setTempMetas({ ...tempMetas, [key]: Number(e.target.value) || 0 }
                    )}
                    className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm text-lg"
                  />
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowMetasModal(false)}
                className="flex-1 sm:flex-none bg-gradient-to-r from-gray-400 to-gray-500 text-white py-4 px-8 rounded-2xl font-bold shadow-xl hover:from-gray-500 hover:to-gray-600 transition-all text-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveMetas}
                className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 px-8 rounded-2xl font-bold shadow-xl hover:from-emerald-600 hover:to-green-700 transition-all text-lg"
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
