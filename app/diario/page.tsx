'use client';

import { useState, useEffect } from 'react';

type MetricKey = 'faturamento' | 'vendas' | 'atrasos' | 'carteira' | 'previsaoAtual' | 'previsaoProx';

interface Values {
  faturamento: number;
  vendas: number;
  atrasos: number;
  carteira: number;
  previsaoAtual: number;
  previsaoProx: number;
}

type HistoryData = Record<MetricKey, number[]>;

interface Metric {
  key: MetricKey;
  label: string;
  emoji: string;
}

const defaultValues: Values = {
  faturamento: 0,
  vendas: 0,
  atrasos: 0,
  carteira: 0,
  previsaoAtual: 0,
  previsaoProx: 0,
};

const defaultHistory: HistoryData = {
  faturamento: [],
  vendas: [],
  atrasos: [],
  carteira: [],
  previsaoAtual: [],
  previsaoProx: [],
};

const metrics: Metric[] = [
  { key: 'faturamento', label: 'Faturamento', emoji: '💰' },
  { key: 'vendas', label: 'Vendas', emoji: '🛒' },
  { key: 'atrasos', label: 'Atrasos', emoji: '⏰' },
  { key: 'carteira', label: 'Carteira', emoji: '💼' },
  { key: 'previsaoAtual', label: 'Previsão Atual', emoji: '📊' },
  { key: 'previsaoProx', label: 'Previsão Próxima', emoji: '🔮' },
];

const Sparkline = ({
  data,
}: {
  data: number[];
}) => {
  if (data.length === 0) {
    return (
      <div className="h-24 w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse" />
    );
  }

  const maxV = Math.max(...data);
  const minV = Math.min(...data);
  const range = maxV - minV || 1;

  const width = 120;
  const height = 24;
  const padX = 8;
  const padY = 4;

  const points: string[] = data.map((d, i) => {
    const x =
      padX + (width - 2 * padX) * (i / (data.length - 1 || 1));
    const y =
      padY + (height - 2 * padY) * (1 - (d - minV) / range);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 flex-shrink-0">
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke="#3B82F6"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.length > 0 && (
        <circle
          cx={points[points.length - 1].split(',')[0]}
          cy={points[points.length - 1].split(',')[1]}
          r="4"
          fill="#3B82F6"
          stroke="white"
          strokeWidth="2"
        />
      )}
    </svg>
  );
};

export default function DiarioPage() {
  const [currentValues, setCurrentValues] = useState<Values>(defaultValues);
  const [currentGoals, setCurrentGoals] = useState<Values>(defaultValues);
  const [historyData, setHistoryData] = useState<HistoryData>(defaultHistory);
  const [tempInput, setTempInput] = useState<Partial<Values>>({});
  const [showModal, setShowModal] = useState(false);
  const [tempGoals, setTempGoals] = useState<Values>(defaultValues);

  const updateMetric = (key: MetricKey, value: number) => {
    setCurrentValues((prev) => ({ ...prev, [key]: value }));
    setTempInput((prev) => ({ ...prev, [key]: value }));

    setHistoryData((prev) => {
      const newData = { ...prev };
      newData[key].push(value);
      if (newData[key].length > 30) {
        newData[key].shift();
      }
      return newData;
    });
  };

  const handleOpenModal = () => {
    setTempGoals(currentGoals);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmitGoals = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentGoals(tempGoals);
    setShowModal(false);
  };

  useEffect(() => {
    const loadData = () => {
      try {
        const valuesStr = localStorage.getItem('diario-values');
        if (valuesStr) {
          setCurrentValues(JSON.parse(valuesStr) as Values);
        }
        const goalsStr = localStorage.getItem('diario-goals');
        if (goalsStr) {
          setCurrentGoals(JSON.parse(goalsStr) as Values);
        }
        const historyStr = localStorage.getItem('diario-history');
        if (historyStr) {
          setHistoryData(JSON.parse(historyStr) as HistoryData);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do localStorage:', err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem('diario-values', JSON.stringify(currentValues));
  }, [currentValues]);

  useEffect(() => {
    localStorage.setItem('diario-goals', JSON.stringify(currentGoals));
  }, [currentGoals]);

  useEffect(() => {
    localStorage.setItem('diario-history', JSON.stringify(historyData));
  }, [historyData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
          Diário de Métricas
        </h1>

        <button
          onClick={handleOpenModal}
          className="mx-auto block px-10 py-5 bg-white/80 backdrop-blur-xl rounded-3xl font-bold text-xl shadow-2xl border border-white/50 hover:shadow-3xl hover:-translate-y-1 hover:bg-white/100 transition-all duration-300 mb-16"
        >
          Definir Metas 🎯
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {metrics.map((metric) => (
            <div
              key={metric.key}
              className="group relative bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 group-hover:opacity-100 transition-all duration-500" />
              <div className="text-6xl mb-6 relative z-10 animate-bounce-slow">{metric.emoji}</div>
              <h3 className="text-2xl font-bold mb-4 text-white/95 relative z-10 tracking-tight">
                {metric.label}
              </h3>
              <div className="text-5xl font-black text-white mb-6 relative z-10 drop-shadow-lg">
                {currentValues[metric.key].toLocaleString()}
              </div>
              <div className="flex items-center justify-center gap-4 mb-8 relative z-10">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={tempInput[metric.key] ?? currentValues[metric.key]}
                  onChange={(e) =>
                    setTempInput((prev) => ({
                      ...prev,
                      [metric.key]: Number(e.target.value) || 0,
                    }))
                  }
                  className="w-32 px-4 py-3 text-2xl font-bold bg-white/40 border-2 border-white/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-400/60 focus:border-blue-400 text-center transition-all shadow-lg"
                />
                <button
                  onClick={() => updateMetric(metric.key, tempInput[metric.key] ?? currentValues[metric.key])}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 whitespace-nowrap"
                >
                  Atualizar
                </button>
              </div>
              <div className="mb-8 relative z-10">
                <div className="text-lg font-semibold text-white/90 mb-3">Meta: {currentGoals[metric.key].toLocaleString()}</div>
                <div className="w-full bg-white/40 rounded-2xl h-4 overflow-hidden shadow-inner">
                  {currentGoals[metric.key] > 0 && (
                    <div
                      className="h-4 bg-gradient-to-r from-emerald-400 via-green-500 to-blue-500 rounded-2xl shadow-lg transition-all duration-1000 ease-out"
                      style={{
                        width: `${Math.min(100, (currentValues[metric.key] / currentGoals[metric.key]) * 100)}%`,
                      }}
                    />
                  )}
                </div>
              </div>
              <Sparkline data={historyData[metric.key]} />
            </div>
          ))}
        </div>

        <section>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
            Histórico Recente
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {metrics.map((metric) => (
              <div
                key={metric.key}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-300 text-center"
              >
                <div className="text-5xl mb-6 mx-auto w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/40 shadow-xl">
                  {metric.emoji}
                </div>
                <h3 className="text-2xl font-bold mb-8 text-white/95 tracking-tight">
                  {metric.label}
                </h3>
                <Sparkline data={historyData[metric.key].slice(-14)} />
                <div className="mt-8 text-sm space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-white/20">
                  {historyData[metric.key]
                    .slice(-7)
                    .reverse()
                    .map((val, i) => (
                      <div key={i} className="flex justify-between py-2 px-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/30">
                        <span className="text-white/80 font-medium">
                          {new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="font-mono text-white font-bold text-lg">
                          {val.toLocaleString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-8">
          <div className="bg-white/20 backdrop-blur-3xl border border-white/30 rounded-4xl p-10 max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-3xl">
            <h2 className="text-4xl font-bold mb-10 text-center bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent drop-shadow-lg">
              Definir Metas Diárias
            </h2>
            <form onSubmit={handleSubmitGoals} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {metrics.map((metric) => (
                <div key={metric.key} className="flex items-center gap-4 p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 hover:bg-white/20 transition-all shadow-lg hover:shadow-xl">
                  <div className="text-3xl flex-shrink-0 p-3 bg-white/30 rounded-2xl border border-white/50 shadow-md">
                    {metric.emoji}
                  </div>
                  <label className="font-semibold text-white/90 flex-1 min-w-0 pr-4">
                    {metric.label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={tempGoals[metric.key]}
                    onChange={(e) =>
                      setTempGoals((prev) => ({
                        ...prev,
                        [metric.key]: Number(e.target.value) || 0,
                      }))
                    }
                    className="flex-1 px-6 py-4 text-xl font-bold bg-white/50 border-2 border-white/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-400/70 focus:border-blue-400 transition-all shadow-lg"
                  />
                </div>
              ))}
              <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 pt-8 border-t border-white/20 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-8 py-4 bg-gray-200/80 backdrop-blur-xl rounded-3xl font-bold text-lg shadow-xl hover:bg-gray-300/80 hover:shadow-2xl transition-all border border-gray-300/50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-lg rounded-3xl shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-1"
                >
                  Salvar Metas ✅
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
