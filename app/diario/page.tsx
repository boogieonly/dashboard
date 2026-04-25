'use client';

import React, { useState, useEffect, useCallback } from 'react';

type MetricKey = 'faturamento' | 'vendas' | 'atrasos' | 'carteira' | 'previsaoAtual' | 'previsaoProx';

type Values = Record<MetricKey, number>;

interface MetricConfig {
  key: MetricKey;
  name: string;
  emoji: string;
  color: string;
}

interface DayData {
  date: string;
  values: Values;
}

const METRICS: MetricConfig[] = [
  { key: 'faturamento', name: 'Faturamento', emoji: '💰', color: 'blue' },
  { key: 'vendas', name: 'Vendas', emoji: '📦', color: 'green' },
  { key: 'atrasos', name: 'Atrasos', emoji: '⏰', color: 'orange' },
  { key: 'carteira', name: 'Carteira', emoji: '💳', color: 'cyan' },
  { key: 'previsaoAtual', name: 'Previsão Atual', emoji: '🔮', color: 'teal' },
  { key: 'previsaoProx', name: 'Previsão Próxima', emoji: '📅', color: 'sky' },
];

interface SparklineProps {
  data: number[];
  color: string;
}

const Sparkline: React.FC<SparklineProps> = ({ data, color }) => {
  if (data.length === 0) {
    return <div className="w-24 h-6 bg-white/30 rounded-full" />;
  }

  const minV = Math.min(...data);
  const maxV = Math.max(...data);
  const rangeV = maxV - minV || 1;
  const width = 96;
  const height = 20;

  const points: string[] = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const normalized = (v - minV) / rangeV;
    const y = height - (normalized * height);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M${points.join(' L')}`;

  return (
    <svg className={`w-24 h-6 stroke-${color}-400 stroke-[2.5] fill-none`} viewBox={`0 0 ${width} ${height + 4}`}>
      <path d={pathD} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default function DiarioPage() {
  const [currentValues, setCurrentValues] = useState<Values>({});
  const [currentGoals, setCurrentGoals] = useState<Values>({});
  const [history, setHistory] = useState<DayData[]>([]);
  const [showGoalsModal, setShowGoalsModal] = useState(false);

  const getSparkData = useCallback((key: MetricKey): number[] => {
    const last7 = history.slice(-7).map((d) => d.values[key] || 0);
    return [...last7, currentValues[key] || 0];
  }, [history, currentValues]);

  const getChange = (key: MetricKey): number => {
    const sparkData = getSparkData(key);
    const prev = sparkData[sparkData.length - 2] || sparkData[sparkData.length - 1] || 1;
    const val = sparkData[sparkData.length - 1];
    return ((val - prev) / prev) * 100;
  };

  const handleSaveHistory = () => {
    const isoDate = new Date().toISOString().slice(0, 10);
    const newDay: DayData = {
      date: isoDate,
      values: { ...currentValues },
    };
    setHistory((prev) => [...prev, newDay]);
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('diarioData');
      if (saved) {
        const parsed = JSON.parse(saved) as {
          currentValues?: Values;
          currentGoals?: Values;
          history?: DayData[];
        };
        setCurrentValues(parsed.currentValues || {});
        setCurrentGoals(parsed.currentGoals || {});
        setHistory(parsed.history || []);
      }
    } catch (e) {
      console.error('Failed to load data from localStorage');
    }
  }, []);

  const saveToStorage = useCallback(() => {
    try {
      localStorage.setItem(
        'diarioData',
        JSON.stringify({ currentValues, currentGoals, history })
      );
    } catch (e) {
      console.error('Failed to save to localStorage');
    }
  }, [currentValues, currentGoals, history]);

  useEffect(() => {
    saveToStorage();
  }, [saveToStorage]);

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="text-center mb-16 pt-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 bg-clip-text text-transparent mb-6 drop-shadow-lg">
              📊 Diário Premium
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Acompanhe suas métricas diárias com glassmorphism, sparklines e persistência em tempo real.
            </p>
          </header>

          {/* Metrics Cards */}
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {METRICS.map((m) => {
                const sparkData = getSparkData(m.key);
                const value = currentValues[m.key] || 0;
                const change = getChange(m.key);
                const goal = currentGoals[m.key] || 0;
                const progress = goal ? (value / goal) * 100 : 0;
                return (
                  <div
                    key={m.key}
                    className="group bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-6 md:p-8 shadow-2xl hover:shadow-3xl hover:-translate-y-2 hover:bg-white/30 transition-all duration-500 overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="p-3 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {m.emoji}
                      </div>
                      <div
                        className={`px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-${m.color}-500 to-${m.color}-600 text-white shadow-lg group-hover:shadow-xl transition-all`}
                      >
                        {change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`}
                      </div>
                    </div>
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white/95 mb-3 leading-tight">
                      {value.toLocaleString('pt-BR')}
                    </h3>
                    <p className="text-white/75 text-lg font-semibold mb-6 capitalize">{m.name}</p>
                    {goal > 0 && (
                      <div className="w-full bg-white/40 rounded-full h-3 mb-6 overflow-hidden">
                        <div
                          className={`h-3 bg-gradient-to-r from-${m.color}-400 to-${m.color}-500 rounded-full transition-all duration-1000 shadow-inner`}
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                    )}
                    <Sparkline data={sparkData} color={m.color} />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Goals Section */}
          <section className="mb-16">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h2 className="text-4xl font-black text-gray-800 flex items-center gap-3">
                🎯 Metas do Dia
              </h2>
              <button
                onClick={() => setShowGoalsModal(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2"
              >
                ✏️ Editar Metas
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {METRICS.map((m) => {
                const goal = currentGoals[m.key] || 0;
                const value = currentValues[m.key] || 0;
                const progress = goal ? (value / goal) * 100 : 0;
                return (
                  <div
                    key={m.key}
                    className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6 md:p-8 text-center hover:bg-white/30 hover:shadow-2xl transition-all duration-300 cursor-default"
                  >
                    <div className="text-3xl md:text-4xl mb-4 mx-auto w-16 h-16 bg-white/50 rounded-2xl flex items-center justify-center border border-white/60 backdrop-blur-sm shadow-lg">
                      {m.emoji}
                    </div>
                    <p className="text-white/80 text-sm md:text-base font-semibold uppercase tracking-wide mb-2">
                      {m.name}
                    </p>
                    <div className="text-2xl md:text-3xl font-black text-white/95 mb-4">
                      {goal.toLocaleString('pt-BR')}
                    </div>
                    <div className="w-full bg-white/40 rounded-full h-4 mb-3 overflow-hidden shadow-inner">
                      <div
                        className={`h-4 bg-gradient-to-r from-${m.color}-400 to-${m.color}-500 rounded-full shadow-md transition-all duration-1000`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                    <div className="text-lg font-bold text-white/90">
                      {Math.min(100, progress).toFixed(0)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Update Forms */}
          <section className="mb-16">
            <h2 className="text-4xl font-black text-gray-800 mb-10 flex items-center gap-3">
              📝 Atualizar Valores de Hoje
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {METRICS.map((m) => (
                <div key={m.key} className="space-y-3">
                  <label className="block text-lg font-bold text-gray-800 flex items-center gap-3">
                    {m.emoji}
                    <span>{m.name}</span>
                  </label>
                  <input
                    type="number"
                    value={currentValues[m.key]?.toString() || ''}
                    onChange={(e) =>
                      setCurrentValues((prev) => ({
                        ...prev,
                        [m.key]: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full p-6 bg-white/70 border-2 border-white/60 rounded-3xl text-2xl font-mono text-gray-900 font-bold focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 shadow-xl hover:shadow-2xl transition-all duration-300 placeholder-gray-500"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSaveHistory}
                className="flex-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white py-6 px-12 rounded-3xl font-black text-xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
              >
                💾 Salvar no Histórico
              </button>
            </div>
          </section>

          {/* History */}
          <section>
            <h2 className="text-4xl font-black text-gray-800 mb-10 flex items-center gap-3">
              📜 Histórico
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {history.length === 0 ? (
                <div className="text-center py-20 text-gray-500 text-xl">
                  Nenhum dado no histórico ainda. Salve o dia atual!
                </div>
              ) : (
                history.slice(-10).reverse().map((day) => (
                  <div
                    key={day.date}
                    className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-8 hover:bg-white/30 hover:shadow-2xl transition-all duration-300 group"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-white/20 gap-4">
                      <div>
                        <h4 className="text-2xl font-black text-gray-900">
                          {new Date(day.date).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </h4>
                        <p className="text-sm text-gray-600 font-mono">{day.date}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {METRICS.map((m) => (
                        <div
                          key={m.key}
                          className={`p-4 rounded-2xl text-center font-mono font-bold text-lg bg-gradient-to-br from-${m.color}-50 to-${m.color}-100 text-${m.color}-800 shadow-md group-hover:scale-105 transition-transform`}
                        >
                          {day.values[m.key]?.toLocaleString('pt-BR') ?? '—'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Goals Modal */}
      {showGoalsModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowGoalsModal(false)}
        >
          <div
            className="bg-white/30 backdrop-blur-3xl border border-white/40 rounded-4xl p-8 md:p-12 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl hover:shadow-3xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/30">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-3">
                🎯 Definir Metas do Dia
              </h2>
              <button
                onClick={() => setShowGoalsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {METRICS.map((m) => (
                <div key={m.key} className="space-y-3">
                  <label className="flex items-center gap-3 text-xl font-bold text-gray-800">
                    {m.emoji} {m.name}
                  </label>
                  <input
                    type="number"
                    value={currentGoals[m.key]?.toString() || ''}
                    onChange={(e) =>
                      setCurrentGoals((prev) => ({
                        ...prev,
                        [m.key]: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full p-5 bg-white/70 border-2 border-white/60 rounded-3xl text-xl font-mono font-bold text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 shadow-xl hover:shadow-2xl transition-all placeholder-gray-500"
                    placeholder="Meta..."
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowGoalsModal(false)}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-5 px-10 rounded-3xl font-black text-xl shadow-2xl hover:shadow-3xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 mx-auto"
            >
              ✅ Salvar Metas
            </button>
          </div>
        </div>
      )}
    </>
  );
}
