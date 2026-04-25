'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

type DailyEntry = {
  date: string;
  faturamento: number;
  atrasos: number;
  vendas: number;
  carteiraTotal: number;
  previsaoMesAtual: number;
  previsaoMesSeguinte: number;
};

type Change = {
  value: number;
  direction: 'up' | 'down' | 'neutral';
};

type Kpi = {
  key: keyof DailyEntry;
  title: string;
  emoji: string;
  isInverse: boolean;
  isCurrency: boolean;
};

const kpis: Kpi[] = [
  { key: 'faturamento', title: 'Faturamento', emoji: '💰', isInverse: false, isCurrency: true },
  { key: 'vendas', title: 'Vendas', emoji: '📈', isInverse: false, isCurrency: true },
  { key: 'atrasos', title: 'Atrasos', emoji: '⏰', isInverse: true, isCurrency: false },
  { key: 'carteiraTotal', title: 'Carteira Total', emoji: '💼', isInverse: false, isCurrency: true },
  { key: 'previsaoMesAtual', title: 'Previsão Mês Atual', emoji: '🔮', isInverse: false, isCurrency: true },
  { key: 'previsaoMesSeguinte', title: 'Previsão Mês Seguinte', emoji: '📅', isInverse: false, isCurrency: true },
];

const formatCurrency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const formatNumber = new Intl.NumberFormat('pt-BR');

const formatDateForDisplay = (isoDate: string): string => {
  return new Date(isoDate).toLocaleDateString('pt-BR');
};

const getPercentageChange = (current: number, previous: number, isInverse: boolean): Change => {
  if (previous === 0) {
    return { value: 0, direction: 'neutral' };
  }
  let change = ((current - previous) / previous) * 100;
  if (isInverse) {
    change = -change;
  }
  if (change > 0) {
    return { value: change, direction: 'up' };
  } else if (change < 0) {
    return { value: change, direction: 'down' };
  }
  return { value: 0, direction: 'neutral' };
};

function Sparkline({
  data,
  isInverse = false,
  height = 24,
  width = 80,
}: {
  data: number[];
  isInverse?: boolean;
  height?: number;
  width?: number;
}) {
  if (data.length < 2) {
    return (
      <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
        <div className="w-16 h-1 bg-gray-400 rounded-full" />
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full block">
      {data.slice(0, -1).map((_, i) => {
        const x1 = (i / (data.length - 1)) * width;
        const y1 = height * (1 - (data[i] - min) / range);
        const x2 = ((i + 1) / (data.length - 1)) * width;
        const y2 = height * (1 - (data[i + 1] - min) / range);
        const delta = data[i + 1] - data[i];
        const adjDelta = isInverse ? -delta : delta;
        const color = adjDelta > 0 ? '#10b981' : '#ef4444';
        return (
          <polyline
            key={i}
            points={`${x1},${y1} ${x2},${y2}`}
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      })}
      <circle
        cx={width}
        cy={height * (1 - (data[data.length - 1] - min) / range)}
        r="3"
        fill="#3b82f6"
        stroke="white"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function DiarioPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [formData, setFormData] = useState<DailyEntry>({
    date: '',
    faturamento: 0,
    atrasos: 0,
    vendas: 0,
    carteiraTotal: 0,
    previsaoMesAtual: 0,
    previsaoMesSeguinte: 0,
  });
  const [editingEntry, setEditingEntry] = useState<DailyEntry | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries]);

  useEffect(() => {
    const saved = localStorage.getItem('dailyEntries');
    if (saved) {
      setEntries(JSON.parse(saved));
    } else {
      // Initialize form with today
      setFormData(prev => ({ ...prev, date: today }));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyEntries', JSON.stringify(entries));
  }, [entries]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'date') {
      setFormData(prev => ({ ...prev, date: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date) return;

    const newEntry: DailyEntry = {
      date: formData.date,
      faturamento: formData.faturamento,
      atrasos: formData.atrasos,
      vendas: formData.vendas,
      carteiraTotal: formData.carteiraTotal,
      previsaoMesAtual: formData.previsaoMesAtual,
      previsaoMesSeguinte: formData.previsaoMesSeguinte,
    };

    const newEntries = entries.map((entry) =>
      entry.date === newEntry.date ? newEntry : entry
    );
    if (!entries.some((entry) => entry.date === newEntry.date)) {
      newEntries.push(newEntry);
    }

    setEntries(newEntries);
    resetForm();
  };

  const resetForm = () => {
    setEditingEntry(null);
    setFormData({
      date: today,
      faturamento: 0,
      atrasos: 0,
      vendas: 0,
      carteiraTotal: 0,
      previsaoMesAtual: 0,
      previsaoMesSeguinte: 0,
    });
  };

  const handleEdit = (entry: DailyEntry) => {
    setEditingEntry(entry);
    setFormData(entry);
  };

  const deleteData = (date: string) => {
    if (confirm('Tem certeza que deseja deletar esta entrada?')) {
      setEntries(entries.filter((e) => e.date !== date));
      if (editingEntry?.date === date) {
        resetForm();
      }
    }
  };

  const fieldLabels: Record<keyof DailyEntry, string> = {
    date: 'Data',
    faturamento: 'Faturamento (R$)',
    atrasos: 'Atrasos',
    vendas: 'Vendas (R$)',
    carteiraTotal: 'Carteira Total (R$)',
    previsaoMesAtual: 'Previsão Mês Atual (R$)',
    previsaoMesSeguinte: 'Previsão Mês Seguinte (R$)',
  };

  const getFormatter = (isCurrency: boolean) => (isCurrency ? formatCurrency : formatNumber);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-12 text-center drop-shadow-lg">
          Diário de Vendas
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {kpis.map((kpi) => {
            const latest = sortedEntries[0];
            const prev = sortedEntries[1];
            const value = latest ? (latest[kpi.key] as number) : 0;
            const prevValue = prev ? (prev[kpi.key] as number) : 0;
            const change = getPercentageChange(value, prevValue, kpi.isInverse);
            const last7Data = sortedEntries
              .slice(0, 7)
              .slice()
              .reverse()
              .map((e) => (e[kpi.key] as number));
            const formatter = getFormatter(kpi.isCurrency);
            const formattedValue = formatter.format(value);

            return (
              <div
                key={kpi.key}
                className="group bg-white/70 backdrop-blur-xl shadow-2xl border border-white/50 rounded-3xl p-8 hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/90"
              >
                <div className="flex items-start justify-between mb-6">
                  <span className="text-4xl md:text-5xl drop-shadow-lg group-hover:scale-110 transition-transform duration-200">
                    {kpi.emoji}
                  </span>
                  <h3 className="text-xl font-bold text-gray-800 mt-2 ml-4 flex-1 text-left">
                    {kpi.title}
                  </h3>
                </div>
                <div className="text-3xl md:text-4xl font-black text-gray-900 mb-4 drop-shadow-md">
                  {formattedValue}
                </div>
                <div className="flex items-center text-lg font-semibold mb-6">
                  {prev ? (
                    <>
                      {change.value === 0 ? '—' : `${change.value > 0 ? '+' : ''}${change.value.toFixed(1)}%`}
                      <span
                        className={`ml-2 text-2xl transition-colors ${
                          change.direction === 'up'
                            ? 'text-green-500 animate-bounce'
                            : change.direction === 'down'
                            ? 'text-red-500 animate-pulse'
                            : 'text-gray-500'
                        }`}
                      >
                        {change.direction === 'up' ? '↗️' : change.direction === 'down' ? '↘️' : '➡️'}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </div>
                <div className="h-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl overflow-hidden border border-gray-300/50 shadow-inner">
                  <Sparkline data={last7Data} isInverse={kpi.isInverse} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-12 mb-12 border border-white/50">
          <div className="flex items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 flex-1">
              {editingEntry ? 'Editar Entrada' : 'Nova Entrada'}
            </h2>
            {editingEntry && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium"
              >
                Nova
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(fieldLabels).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 capitalize">
                  {label}
                </label>
                <input
                  name={key}
                  type={key === 'date' ? 'date' : 'number'}
                  step={key === 'atrasos' ? '1' : '0.01'}
                  value={formData[key as keyof DailyEntry]?.toString() || ''}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200 text-lg"
                  required
                />
              </div>
            ))}
            <div className="col-span-full flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-gray-600 hover:to-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                {editingEntry ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          {sortedEntries.length === 0 ? (
            <div className="text-center py-20 bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-dashed border-gray-300">
              <p className="text-2xl text-gray-500 mb-4">📝</p>
              <p className="text-xl font-semibold text-gray-600">Nenhuma entrada ainda. Adicione a primeira!</p>
            </div>
          ) : (
            sortedEntries.map((entry) => (
              <div
                key={entry.date}
                className="bg-white/90 backdrop-blur-xl shadow-xl rounded-2xl p-6 md:p-8 border border-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-blue-500"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl">📅</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{formatDateForDisplay(entry.date)}</h3>
                      <p className="text-sm text-gray-500">Clique em editar para alterar</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6 mb-8 text-center">
                  <div>
                    <span className="text-lg font-semibold text-gray-700 block mb-1">💰 Faturamento</span>
                    <span className="text-2xl font-bold text-gray-900">{formatCurrency.format(entry.faturamento)}</span>
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-gray-700 block mb-1">📈 Vendas</span>
                    <span className="text-2xl font-bold text-gray-900">{formatCurrency.format(entry.vendas)}</span>
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-gray-700 block mb-1">⏰ Atrasos</span>
                    <span className="text-2xl font-bold text-gray-900">{formatNumber.format(entry.atrasos)}</span>
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-gray-700 block mb-1">💼 Carteira</span>
                    <span className="text-2xl font-bold text-gray-900">{formatCurrency.format(entry.carteiraTotal)}</span>
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-gray-700 block mb-1">🔮 Previsão Atual</span>
                    <span className="text-2xl font-bold text-gray-900">{formatCurrency.format(entry.previsaoMesAtual)}</span>
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-gray-700 block mb-1">📅 Previsão Próxima</span>
                    <span className="text-2xl font-bold text-gray-900">{formatCurrency.format(entry.previsaoMesSeguinte)}</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => handleEdit(entry)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteData(entry.date)}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-xl font-bold hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
