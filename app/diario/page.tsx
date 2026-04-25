'use client';

import { useState, useEffect } from 'react';

type DailyEntry = {
  date: string;
  faturamento: number;
  atrasos: number;
  vendas: number;
  carteiraTotal: number;
  previsaoMesAtual: number;
  previsaoMesSeguinte: number;
};

type Metric = {
  key: keyof DailyEntry;
  label: string;
  emoji: string;
  sparkColor: string;
};

const metrics: Metric[] = [
  { key: 'faturamento', label: 'Faturamento', emoji: '💰', sparkColor: '#10b981' },
  { key: 'atrasos', label: 'Atrasos', emoji: '⏰', sparkColor: '#eab308' },
  { key: 'vendas', label: 'Vendas', emoji: '📈', sparkColor: '#3b82f6' },
  { key: 'carteiraTotal', label: 'Carteira Total', emoji: '💼', sparkColor: '#a855f7' },
  { key: 'previsaoMesAtual', label: 'Previsão Mês Atual', emoji: '📅', sparkColor: '#6366f1' },
  { key: 'previsaoMesSeguinte', label: 'Previsão Mês Seguinte', emoji: '🔮', sparkColor: '#ec4899' },
];

const KPICard: React.FC<{
  emoji: string;
  label: string;
  value: number;
  variation: string;
  varColor: string;
}> = ({ emoji, label, value, variation, varColor }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <span className="text-3xl">{emoji}</span>
      <span className={`text-sm font-semibold ${varColor} px-2 py-1 rounded-full bg-opacity-10`}>
        {variation}
      </span>
    </div>
    <p className="text-4xl font-bold text-gray-900 mb-1">{formatCurrency(value)}</p>
    <p className="text-sm text-gray-500 capitalize">{label}</p>
  </div>
);

const Sparkline: React.FC<{
  data: number[];
  label: string;
  sparkColor: string;
}> = ({ data, label, sparkColor }) => {
  if (data.length === 0 || data.every((v) => v === 0)) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-64 flex items-center justify-center">
        <span className="text-gray-400 text-sm font-medium">Sem dados</span>
      </div>
    );
  }

  const minV = Math.min(...data);
  const maxV = Math.max(...data);
  const range = maxV - minV || 1;
  const calcHeight = (v: number) => `${((v - minV) / range) * 85 + 5}%`;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <p className="font-semibold text-gray-800 mb-4 capitalize">{label}</p>
      <div className="flex h-24 bg-gray-50 rounded-lg p-3 mb-4 overflow-hidden">
        {data.map((v, i) => (
          <div
            key={i}
            className="flex-1 mx-0.5 rounded-sm shadow-sm"
            style={{
              height: calcHeight(v),
              backgroundColor: sparkColor,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500 font-medium">
        <span>Mín: {formatCurrency(minV)}</span>
        <span>Máx: {formatCurrency(maxV)}</span>
      </div>
    </div>
  );
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const getVariation = (current: number, previous: number): string => {
  if (previous === 0) return 'N/A';
  const diff = ((current - previous) / previous) * 100;
  return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
};

export default function DiarioPage() {
  const todayStr = new Date().toLocaleDateString('sv-SE');
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [currentForm, setCurrentForm] = useState<Partial<DailyEntry>>({
    date: todayStr,
  });
  const [editingDate, setEditingDate] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('diaryEntries');
      if (saved) {
        const parsed: DailyEntry[] = JSON.parse(saved);
        setEntries(parsed.sort((a, b) => b.date.localeCompare(a.date)));
      }
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('diaryEntries', JSON.stringify(entries));
  }, [entries]);

  const latest = entries[0];
  const prevEntry = entries[1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentForm.date) {
      alert('Por favor, selecione uma data.');
      return;
    }

    const entry: DailyEntry = {
      date: currentForm.date!,
      faturamento: currentForm.faturamento ?? 0,
      atrasos: currentForm.atrasos ?? 0,
      vendas: currentForm.vendas ?? 0,
      carteiraTotal: currentForm.carteiraTotal ?? 0,
      previsaoMesAtual: currentForm.previsaoMesAtual ?? 0,
      previsaoMesSeguinte: currentForm.previsaoMesSeguinte ?? 0,
    };

    let newEntries = [...entries];
    const dateIdx = newEntries.findIndex((e) => e.date === entry.date);
    if (dateIdx !== -1) {
      newEntries[dateIdx] = entry;
    } else {
      newEntries.unshift(entry);
    }

    setEntries(newEntries.sort((a, b) => b.date.localeCompare(a.date)));
    resetForm();
  };

  const handleEdit = (entry: DailyEntry) => {
    setCurrentForm(entry);
    setEditingDate(entry.date);
  };

  const resetForm = () => {
    setCurrentForm({ date: todayStr });
    setEditingDate(null);
  };

  const deleteData = (date: string) => {
    if (confirm('Tem certeza que deseja deletar esta entrada?')) {
      setEntries(entries.filter((e) => e.date !== date));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    const dateStr = date.toLocaleDateString('sv-SE');
    setCurrentForm((prev) => ({ ...prev, date: dateStr }));
  };

  const handleNumberChange =
    (key: keyof DailyEntry) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const num = parseFloat(e.target.value) || 0;
      setCurrentForm((prev) => ({ ...prev, [key]: num }));
    };

  const kpiCards = metrics.map((metric) => {
    const value = latest?.[metric.key] ?? 0;
    const prevValue = prevEntry?.[metric.key] ?? 0;
    const variation = getVariation(value, prevValue);
    const varColor = value >= prevValue ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
    return (
      <KPICard
        key={metric.key as string}
        emoji={metric.emoji}
        label={metric.label}
        value={value}
        variation={variation}
        varColor={varColor}
      />
    );
  });

  const last7 = entries.slice(0, 7);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 drop-shadow-lg">
            Diário Financeiro
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Registre suas métricas diárias, acompanhe variações e visualize tendências com sparklines avançados.
          </p>
          {latest && (
            <p className="text-sm text-gray-500 mt-4">
              KPIs baseados em {new Date(latest.date).toLocaleDateString('pt-BR')} (variação do dia anterior)
            </p>
          )}
        </div>

        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {kpiCards}
        </section>

        {/* Form */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">📝 Nova / Editar Entrada</h2>
          <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6 items-end">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Data *</label>
                <input
                  type="date"
                  value={currentForm.date || ''}
                  onChange={handleDateChange}
                  onBlur={handleDateChange}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 text-lg shadow-sm"
                  max={todayStr}
                />
              </div>
              {metrics.map((metric) => (
                <div key={metric.key as string}>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    {metric.emoji}
                    {metric.label}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentForm[metric.key]?.toString() ?? ''}
                    onChange={handleNumberChange(metric.key)}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 text-lg shadow-sm"
                    placeholder="0,00"
                  />
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-10 pt-10 border-t-2 border-gray-100">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-5 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-indigo-700 hover:to-blue-700 transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-300"
              >
                {editingDate ? '🔄 Atualizar' : '💾 Salvar Hoje'}
              </button>
              {editingDate && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-5 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-gray-600 hover:to-gray-700 transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  ❌ Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Sparklines */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {metrics.map((metric) => {
            const data = last7.slice().reverse().map((e) => (e[metric.key] ?? 0) as number);
            return (
              <Sparkline
                key={metric.key as string}
                data={data}
                label={metric.label}
                sparkColor={metric.sparkColor}
              />
            );
          })}
        </section>

        {/* Historical Table */}
        <section>
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                📊 Histórico dos Últimos 7 Dias
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-8 py-5 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Data</th>
                    {metrics.map((metric) => (
                      <th
                        key={metric.key as string}
                        className="px-6 py-5 text-left text-sm font-bold text-gray-900 uppercase tracking-wider"
                      >
                        <div className="flex items-center gap-2">
                          {metric.emoji}
                          <span className="hidden sm:inline">{metric.label}</span>
                          <span className="sm:hidden">{metric.label.split(' ')[0]}</span>
                        </div>
                      </th>
                    ))}
                    <th className="px-8 py-5 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {last7.map((entry) => (
                    <tr
                      key={entry.date}
                      className={`hover:bg-gray-50 transition-colors ${
                        entry.date === todayStr ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200' : ''
                      }`}
                    >
                      <td className="px-8 py-6 text-sm font-semibold text-gray-900">
                        {new Date(entry.date).toLocaleDateString('pt-BR', {
                          weekday: 'short',
                        })}
                        <br className="sm:hidden" />
                        {new Date(entry.date).toLocaleDateString('pt-BR')}
                      </td>
                      {metrics.map((metric) => (
                        <td key={metric.key as string} className="px-6 py-6 text-sm text-gray-800 font-medium">
                          {formatCurrency(entry[metric.key] ?? 0)}
                        </td>
                      ))}
                      <td className="px-8 py-6 text-sm font-medium whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-4 py-2 rounded-lg font-semibold transition-all duration-200 mr-3 shadow-sm hover:shadow-md"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteData(entry.date)}
                          className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          Deletar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {last7.length === 0 && (
                    <tr>
                      <td colSpan={metrics.length + 2} className="px-8 py-12 text-center text-gray-500 text-lg">
                        Nenhuma entrada registrada ainda. Comece salvando a primeira!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
