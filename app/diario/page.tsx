'use client';

import { useState, useEffect, useCallback } from 'react';

type FieldKey = 'faturamento' | 'vendas' | 'atrasos' | 'carteiraTotal' | 'previsaoMesAtual' | 'previsaoMesSeguinte';

type DailyEntry = {
  date: string;
  faturamento: number;
  vendas: number;
  atrasos: number;
  carteiraTotal: number;
  previsaoMesAtual: number;
  previsaoMesSeguinte: number;
};

type Metas = {
  [K in FieldKey]: number;
};

type FormDataType = {
  date: string;
} & Partial<{ [K in FieldKey]: number }>;

const fields: FieldKey[] = ['faturamento', 'vendas', 'atrasos', 'carteiraTotal', 'previsaoMesAtual', 'previsaoMesSeguinte'];

const indicatorConfig = [
  { emoji: '💰', title: 'Faturamento', isMoney: true, inverse: false },
  { emoji: '📈', title: 'Vendas', isMoney: true, inverse: false },
  { emoji: '⚠️', title: 'Atrasos', isMoney: false, inverse: true },
  { emoji: '💼', title: 'Carteira Total', isMoney: true, inverse: false },
  { emoji: '🔮', title: 'Previsão Mês Atual', isMoney: true, inverse: false },
  { emoji: '📅', title: 'Previsão Mês Seguinte', isMoney: true, inverse: false },
];

const defaultMetas: Metas = {
  faturamento: 100000,
  vendas: 80000,
  atrasos: 5000,
  carteiraTotal: 500000,
  previsaoMesAtual: 950000,
  previsaoMesSeguinte: 1200000,
};

const Sparkline = ({ data }: { data: number[] }) => {
  if (data.length === 0) {
    return <div className="h-8 bg-gray-200 rounded-lg" />;
  }
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  return (
    <div className="h-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg overflow-hidden flex">
      {data.map((d, i) => (
        <div
          key={i}
          className="flex-1 bg-gradient-to-t from-blue-400 to-purple-500 opacity-70"
          style={{
            height: `${((d - min) / range) * 100}%`,
            marginLeft: i > 0 ? '1px' : 0,
          }}
        />
      ))}
    </div>
  );
};

export default function DiarioPage() {
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);
  const [metas, setMetas] = useState<Metas>(defaultMetas);
  const [formData, setFormData] = useState<FormDataType>({ date: new Date().toISOString().split('T')[0] });
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
      const parsedMetas = JSON.parse(savedMetas) as Metas;
      setMetas(parsedMetas);
      setTempMetas(parsedMetas);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyEntries', JSON.stringify(dailyEntries));
  }, [dailyEntries]);

  useEffect(() => {
    localStorage.setItem('metas', JSON.stringify(metas));
  }, [metas]);

  const getProgress = (value: number, target: number, inverse: boolean): number => {
    if (target === 0) return 0;
    const p = (value / target) * 100;
    return inverse ? Math.max(0, 100 - p) : Math.min(100, p);
  };

  const getBarColorClass = (progress: number): string => {
    if (progress >= 100) return 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/50 shadow-lg';
    if (progress >= 70) return 'bg-gradient-to-r from-amber-500 to-yellow-500 shadow-amber-500/50 shadow-lg';
    return 'bg-gradient-to-r from-rose-500 to-red-500 shadow-rose-500/50 shadow-lg';
  };

  const getTrendIcon = (curr: number, prev?: number): string => {
    if (prev === undefined) return '➡️';
    if (curr > prev) return '📈';
    if (curr < prev) return '📉';
    return '➡️';
  };

  const getLatestAndPrevious = useCallback(() => {
    const sorted = [...dailyEntries].sort((a, b) => b.date.localeCompare(a.date));
    return {
      latest: sorted[0],
      previous: sorted[1],
    };
  }, [dailyEntries]);

  const getMonthlySummary = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear().toString();
    const mon = (now.getMonth() + 1).toString().padStart(2, '0');
    const monthPrefix = `${year}-${mon}`;
    const monthEntries = dailyEntries.filter((e) => e.date.startsWith(monthPrefix));
    const summary: Partial<DailyEntry> = {};
    fields.forEach((field) => {
      (summary as any)[field] = monthEntries.reduce((acc: number, e) => acc + e[field], 0);
    });
    return summary;
  }, [dailyEntries]);

  const { latest, previous } = getLatestAndPrevious();
  const monthlySummary = getMonthlySummary();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, date: e.target.value }));
  };

  const handleValueChange = (field: FieldKey, value: string) => {
    const num = value === '' ? undefined : parseFloat(value);
    setFormData((prev) => ({ ...prev, [field]: num }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date) return;

    const entry: DailyEntry = {
      date: formData.date,
      faturamento: formData.faturamento ?? 0,
      vendas: formData.vendas ?? 0,
      atrasos: formData.atrasos ?? 0,
      carteiraTotal: formData.carteiraTotal ?? 0,
      previsaoMesAtual: formData.previsaoMesAtual ?? 0,
      previsaoMesSeguinte: formData.previsaoMesSeguinte ?? 0,
    };

    const existsIndex = dailyEntries.findIndex((e) => e.date === formData.date);

    if (existsIndex !== -1) {
      setDailyEntries((prev) =>
        prev.map((e, i) => (i === existsIndex ? entry : e))
      );
    } else {
      setDailyEntries((prev) => [entry, ...prev].sort((a, b) => a.date.localeCompare(b.date)));
    }

    setFormData({ date: new Date().toISOString().split('T')[0] });
    setEditingId(null);
  };

  const handleEdit = (date: string) => {
    const entry = dailyEntries.find((e) => e.date === date);
    if (entry) {
      setFormData({
        date: entry.date,
        faturamento: entry.faturamento,
        vendas: entry.vendas,
        atrasos: entry.atrasos,
        carteiraTotal: entry.carteiraTotal,
        previsaoMesAtual: entry.previsaoMesAtual,
        previsaoMesSeguinte: entry.previsaoMesSeguinte,
      });
      setEditingId(date);
    }
  };

  const handleDelete = (date: string) => {
    setDailyEntries((prev) => prev.filter((e) => e.date !== date));
    if (editingId === date) {
      setEditingId(null);
      setFormData({ date: new Date().toISOString().split('T')[0] });
    }
  };

  const handleOpenMetas = () => {
    setTempMetas(metas);
    setShowMetasModal(true);
  };

  const handleSaveMetas = () => {
    setMetas(tempMetas);
    setShowMetasModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 drop-shadow-2xl">
            Diário de Desempenho
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Acompanhe suas metas diárias e mensais com precisão e elegância.
          </p>
        </header>

        {latest ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {indicatorConfig.map((config, index) => {
              const field = fields[index];
              const curr = (latest as any)[field] ?? 0;
              const prev = previous ? (previous as any)[field] ?? 0 : undefined;
              const progress = getProgress(curr, metas[field], config.inverse);
              const sparkData = [...dailyEntries]
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 7)
                .map((e) => (e as any)[field] ?? 0);
              const trendIconStr = getTrendIcon(curr, prev);
              return (
                <div
                  key={field}
                  className="group bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 hover:shadow-3xl hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl md:text-4xl">{config.emoji}</span>
                    <div className="flex items-center gap-2 text-sm md:text-base font-semibold text-gray-700 group-hover:text-gray-900">
                      {config.title}
                      <span className="text-xl">{trendIconStr}</span>
                    </div>
                  </div>
                  <Sparkline data={sparkData} />
                  <div className="mt-6 mb-4">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden">
                      <div
                        className={`h-4 rounded-full transition-all duration-700 ease-out ${getBarColorClass(progress)}`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                    <p className="text-xs md:text-sm font-mono mt-2 text-center text-gray-600 font-medium">
                      {progress.toFixed(0)}%
                    </p>
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-gray-900 mb-1 text-center">
                    {config.isMoney ? `R$ ${curr.toLocaleString()}` : curr.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    Meta: {config.isMoney ? `R$ ${metas[field].toLocaleString()}` : metas[field].toLocaleString()}
                  </p>
                </div>
              );
            })}
          </section>
        ) : (
          <div className="text-center py-20 bg-white/50 backdrop-blur-xl rounded-3xl shadow-xl">
            <p className="text-2xl text-gray-500 mb-4">Nenhum dado ainda</p>
            <p className="text-lg text-gray-400">Adicione sua primeira entrada para ver os KPIs!</p>
          </div>
        )}

        <section className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent drop-shadow-lg">
            Resumo Mensal Atual
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {indicatorConfig.map((config, index) => {
              const field = fields[index];
              const value = (monthlySummary as any)[field] ?? 0;
              const target = metas[field];
              const progress = getProgress(value, target, config.inverse);
              return (
                <div
                  key={field}
                  className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-4xl md:text-5xl">{config.emoji}</span>
                    <span className="text-xl md:text-2xl font-bold text-gray-800 whitespace-nowrap">
                      {config.title}
                    </span>
                  </div>
                  <div className="mb-8">
                    <div className="h-6 md:h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 rounded-2xl overflow-hidden shadow-inner">
                      <div
                        className={`h-6 md:h-8 rounded-2xl transition-all duration-1000 ease-out ${getBarColorClass(progress)}`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                    <p className="text-center font-mono text-2xl md:text-3xl mt-4 font-bold text-gray-800">
                      {progress.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-slate-900 bg-clip-text text-transparent text-center mb-3">
                    R$ {value.toLocaleString('pt-BR')}
                  </div>
                  <p className="text-center text-lg text-gray-600 font-medium">
                    Meta: R$ {target.toLocaleString('pt-BR')}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800 drop-shadow-lg">
            {editingId ? 'Editar Entrada' : 'Adicionar Nova Entrada'}
          </h2>
          <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">📅 Data</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={handleDateChange}
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm"
                  required
                />
              </div>
              {fields.map((field, index) => (
                <div key={field}>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    {indicatorConfig[index].emoji} {indicatorConfig[index].title}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData[field] ?? ''}
                    onChange={(e) => handleValueChange(field, e.target.value)}
                    placeholder="0.00"
                    className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="w-full lg:w-auto lg:col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-6 px-12 rounded-3xl font-bold text-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 mx-auto block"
            >
              {editingId ? '🔄 Atualizar Entrada' : '➕ Adicionar Entrada'}
            </button>
          </form>
          {editingId && (
            <p className="text-center mt-4 text-yellow-600 font-semibold text-lg">
              Editando entrada de <strong>{new Date(editingId).toLocaleDateString('pt-BR')}</strong>
            </p>
          )}
        </section>

        <section>
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800 drop-shadow-lg">Histórico Completo</h2>
          {dailyEntries.length === 0 ? (
            <div className="text-center py-20 bg-white/50 backdrop-blur-xl rounded-3xl shadow-xl">
              <p className="text-2xl text-gray-500 mb-4">📝 Histórico vazio</p>
              <p className="text-lg text-gray-400">Adicione entradas para ver o histórico!</p>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-500 to-purple-500 text-white uppercase text-sm tracking-wider">
                      <th className="p-6 text-left font-bold">Data</th>
                      {indicatorConfig.map((config, index) => (
                        <th key={fields[index]} className="p-6 text-right font-bold">
                          {config.emoji}<br />{config.title}
                        </th>
                      ))}
                      <th className="p-6 text-center font-bold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...dailyEntries]
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((entry) => (
                        <tr
                          key={entry.date}
                          className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-6 font-semibold text-gray-900">
                            {new Date(entry.date).toLocaleDateString('pt-BR', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          {fields.map((field, index) => (
                            <td key={field} className="p-6 text-right font-mono">
                              {indicatorConfig[index].isMoney
                                ? `R$ ${entry[field].toLocaleString('pt-BR')}`
                                : entry[field].toLocaleString('pt-BR')}
                            </td>
                          ))}
                          <td className="p-6 text-center">
                            <button
                              onClick={() => handleEdit(entry.date)}
                              className="px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all mr-3 shadow-md hover:shadow-lg"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(entry.date)}
                              className="px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all shadow-md hover:shadow-lg"
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
          )}
        </section>

        <div className="text-center mt-20 mb-12">
          <button
            onClick={handleOpenMetas}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-12 py-6 rounded-3xl font-bold text-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-3"
          >
            📊 Configurar Metas Mensais
          </button>
        </div>

        {showMetasModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-xl p-10 rounded-4xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/30">
              <h3 className="text-3xl font-bold mb-8 text-gray-800 text-center">🎯 Metas Mensais</h3>
              <div className="space-y-6">
                {fields.map((field, index) => (
                  <div key={field}>
                    <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center gap-3">
                      {indicatorConfig[index].emoji} {indicatorConfig[index].title}
                    </label>
                    <input
                      type="number"
                      step="1000"
                      min="0"
                      value={tempMetas[field]}
                      onChange={(e) =>
                        setTempMetas((prev) => ({
                          ...prev,
                          [field]: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-sm text-2xl text-right font-mono"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-12 pt-8 border-t border-gray-200">
                <button
                  onClick={handleSaveMetas}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 px-8 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  💾 Salvar Metas
                </button>
                <button
                  onClick={() => setShowMetasModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-4 px-8 rounded-2xl font-bold text-xl hover:bg-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
