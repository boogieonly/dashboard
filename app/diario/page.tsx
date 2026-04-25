import React, { useState, useEffect, useCallback, useMemo } from 'react';

type CatKey = 'income' | 'food' | 'transport' | 'leisure' | 'health' | 'other';

type FormData = Record<CatKey, number>;

type Targets = Record<CatKey, number>;

interface DailyRecord {
  date: string;
  income: number;
  food: number;
  transport: number;
  leisure: number;
  health: number;
  other: number;
}

const categories = [
  { key: 'income' as CatKey, label: 'Entradas', emoji: '💰', color: 'text-green-600' },
  { key: 'food' as CatKey, label: 'Alimentação', emoji: '🍔', color: 'text-orange-500' },
  { key: 'transport' as CatKey, label: 'Transporte', emoji: '🚌', color: 'text-blue-500' },
  { key: 'leisure' as CatKey, label: 'Lazer', emoji: '🎮', color: 'text-purple-500' },
  { key: 'health' as CatKey, label: 'Saúde', emoji: '💊', color: 'text-red-500' },
  { key: 'other' as CatKey, label: 'Outros', emoji: '❓', color: 'text-gray-500' },
] as const;

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

const Sparkline: React.FC<{ data: number[]; className?: string }> = ({ data, className }) => {
  const width = 120;
  const height = 40;

  if (data.length === 0 || data.every((v) => v === 0)) {
    return (
      <div className="h-10 flex items-center justify-center text-gray-400 text-xs font-mono">
        —
      </div>
    );
  }

  const minV = Math.min(...data);
  const maxV = Math.max(...data);

  let points: string;

  if (maxV === minV) {
    const y = height / 2;
    points = data
      .map((_, i) => `${(i * width) / (data.length - 1)},${y}`)
      .join(' ');
  } else {
    points = data
      .map((v, i) => {
        const x = (i * width) / (data.length - 1);
        const norm = (v - minV) / (maxV - minV);
        const y = height * (1 - norm);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={`w-full h-10 block ${className || ''}`}>
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
};

export default function DiarioPage() {
  const getToday = useCallback(() => new Date().toISOString().split('T')[0], []);

  const [history, setHistory] = useState<DailyRecord[]>([]);
  const [currentDate, setCurrentDate] = useState(getToday());
  const [formData, setFormData] = useState<FormData>({
    income: 0,
    food: 0,
    transport: 0,
    leisure: 0,
    health: 0,
    other: 0,
  });
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [showMetas, setShowMetas] = useState(false);
  const [targets, setTargets] = useState<Targets>({});
  const [formTargets, setFormTargets] = useState<Targets>({});

  // Load data
  useEffect(() => {
    const histStr = localStorage.getItem('diarioHistory');
    if (histStr) {
      try {
        setHistory(JSON.parse(histStr));
      } catch {}
    }
    const targStr = localStorage.getItem('diarioTargets');
    if (targStr) {
      try {
        setTargets(JSON.parse(targStr));
      } catch {}
    }
  }, []);

  // Save history
  useEffect(() => {
    localStorage.setItem('diarioHistory', JSON.stringify(history));
  }, [history]);

  // Save targets
  useEffect(() => {
    localStorage.setItem('diarioTargets', JSON.stringify(targets));
  }, [targets]);

  // Load form data when date changes in new entry modal
  useEffect(() => {
    const existing = history.find((h) => h.date === currentDate);
    if (existing && showNewEntry) {
      const newFormData: FormData = categories.reduce(
        (acc, cat) => ({ ...acc, [cat.key]: existing[cat.key] }),
        {} as FormData
      );
      setFormData(newFormData);
    }
  }, [currentDate, history, showNewEntry]);

  const sums = useMemo(
    () =>
      categories.map((cat) => ({
        key: cat.key,
        sum: history.reduce((acc, day) => acc + day[cat.key], 0),
        sparkData: history.slice(0, Math.min(30, history.length)).map((day) => day[cat.key]),
      })),
    [history]
  );

  const openNewEntry = useCallback(() => {
    const today = getToday();
    setCurrentDate(today);
    const existing = history.find((h) => h.date === today);
    const newFormData: FormData = categories.reduce(
      (acc, cat) => ({ ...acc, [cat.key]: existing?.[cat.key] ?? 0 }),
      {} as FormData
    );
    setFormData(newFormData);
    setShowNewEntry(true);
  }, [history, getToday]);

  const saveEntry = useCallback(() => {
    const record: DailyRecord = {
      date: currentDate,
      ...formData,
    };
    const index = history.findIndex((h) => h.date === currentDate);
    let newHistory: DailyRecord[];
    if (index !== -1) {
      newHistory = history.map((h, i) => (i === index ? record : h));
    } else {
      newHistory = [record, ...history].sort((a, b) => b.date.localeCompare(a.date));
    }
    setHistory(newHistory);
    setShowNewEntry(false);
  }, [history, currentDate, formData]);

  const openMetas = useCallback(() => {
    setFormTargets(targets);
    setShowMetas(true);
  }, [targets]);

  const saveMetas = useCallback(() => {
    setTargets(formTargets);
    setShowMetas(false);
  }, [formTargets]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          📓 Diário Financeiro
        </h1>

        <div className="kpis grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sums.map(({ key, sum, sparkData }, i) => {
            const cat = categories.find((c) => c.key === key)!;
            const progress = targets[key] > 0 ? (sum / targets[key]) * 100 : 0;
            return (
              <div key={i} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className={`text-3xl mb-3 ${cat.color}`}>{cat.emoji}</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(sum)}</div>
                <div className={`text-sm font-medium ${cat.color} mb-4`}>{cat.label}</div>
                <Sparkline data={sparkData} className={cat.color} />
                {targets[key] > 0 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {Math.round(progress)}% da meta
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center">
          <button
            onClick={openNewEntry}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            📝 Nova Entrada
          </button>
          <button
            onClick={openMetas}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            🎯 Metas
          </button>
        </div>

        <section>
          <h2 className="text-3xl font-bold mb-8 text-gray-800">📜 Histórico</h2>
          {history.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhuma entrada ainda. Adicione a primeira!
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {history.map((rec) => (
                <div
                  key={rec.date}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
                    <div className="text-xl font-bold text-gray-900 min-w-[120px]">{rec.date}</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 flex-1">
                      {categories.map((cat) => (
                        <div
                          key={cat.key}
                          className={`p-3 rounded-lg text-center text-sm font-medium ${cat.color} ${
                            rec[cat.key] > 0
                              ? 'bg-opacity-10 backdrop-blur-sm'
                              : 'opacity-50'
                          }`}
                        >
                          <div className="text-lg mb-1">{cat.emoji}</div>
                          <div>{formatCurrency(rec[cat.key])}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* New Entry Modal */}
      {showNewEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
              📝 Nova Entrada
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="ml-auto p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </h2>
            <div className="text-sm text-gray-600 mb-6">{currentDate}</div>
            {categories.map((cat) => (
              <label key={cat.key} className="block mb-5 last:mb-0">
                <div className={`flex items-center gap-2 mb-2 font-medium ${cat.color}`}>
                  {cat.emoji} {cat.label}
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData[cat.key]}
                  onChange={(e) =>
                    setFormData({ ...formData, [cat.key]: parseFloat(e.target.value) || 0 }
                  )}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                  placeholder="0,00"
                />
              </label>
            ))}
            <div className="flex gap-3 pt-6">
              <button
                onClick={() => setShowNewEntry(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 px-6 rounded-xl font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveEntry}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metas Modal */}
      {showMetas && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">🎯 Metas Mensais</h2>
            {categories.map((cat) => (
              <label key={cat.key} className="block mb-5 last:mb-0">
                <div className={`flex items-center gap-2 mb-2 font-medium ${cat.color}`}>
                  {cat.emoji} {cat.label}
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formTargets[cat.key] ?? ''}
                  onChange={(e) =>
                    setFormTargets({
                      ...formTargets,
                      [cat.key]: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm transition-all"
                  placeholder="Meta mensal"
                />
              </label>
            ))}
            <div className="flex gap-3 pt-6">
              <button
                onClick={() => setShowMetas(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 px-6 rounded-xl font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveMetas}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
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
