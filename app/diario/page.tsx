'use client';

import { useState, useEffect, useCallback } from 'react';

type DailyData = {
  date: string;
  faturamento: number;
  vendas: number;
  atrasos: number;
  carteiraTotal: number;
  previsaoMesAtual: number;
  previsaoMesSeguinte: number;
};

type MetasType = {
  faturamento: number;
  atrasos: number;
  vendas: number;
  carteiraTotal: number;
  previsaoMesAtual: number;
  previsaoMesSeguinte: number;
};

const defaultMetas: MetasType = {
  faturamento: 900000,
  atrasos: 0,
  vendas: 50000,
  carteiraTotal: 500000,
  previsaoMesAtual: 1000000,
  previsaoMesSeguinte: 1200000,
};

export default function DiarioPage() {
  const [history, setHistory] = useState<DailyData[]>([]);
  const [metas, setMetas] = useState<MetasType>(defaultMetas);
  const [formData, setFormData] = useState<DailyData>({
    date: '',
    faturamento: 0,
    vendas: 0,
    atrasos: 0,
    carteiraTotal: 0,
    previsaoMesAtual: 0,
    previsaoMesSeguinte: 0,
  });
  const [showMetasModal, setShowMetasModal] = useState(false);
  const [tempMetas, setTempMetas] = useState<MetasType>(defaultMetas);

  useEffect(() => {
    try {
      const h = localStorage.getItem('diarioHistory');
      if (h) {
        const parsed: DailyData[] = JSON.parse(h);
        setHistory(parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
      const m = localStorage.getItem('diarioMetas');
      if (m) {
        const parsedMetas: MetasType = JSON.parse(m);
        setMetas(parsedMetas);
        setTempMetas(parsedMetas);
      }
    } catch (e) {
      console.error('Error loading data:', e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('diarioHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('diarioMetas', JSON.stringify(metas));
  }, [metas]);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const monthStartStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  const monthData = history.filter((d) => d.date >= monthStartStr);
  const latest = monthData.length > 0 ? monthData[0] : { carteiraTotal: 0, previsaoMesAtual: 0, previsaoMesSeguinte: 0 };

  const metrics: Record<keyof MetasType, number> = {
    faturamento: monthData.reduce((sum, d) => sum + d.faturamento, 0),
    vendas: monthData.reduce((sum, d) => sum + d.vendas, 0),
    atrasos: monthData.reduce((sum, d) => sum + d.atrasos, 0),
    carteiraTotal: latest.carteiraTotal,
    previsaoMesAtual: latest.previsaoMesAtual,
    previsaoMesSeguinte: latest.previsaoMesSeguinte,
  };

  const last7 = history.slice(0, 7);
  const sparkData: Record<keyof MetasType, number[]> = {
    faturamento: last7.map((d) => d.faturamento),
    vendas: last7.map((d) => d.vendas),
    atrasos: last7.map((d) => d.atrasos),
    carteiraTotal: last7.map((d) => d.carteiraTotal),
    previsaoMesAtual: last7.map((d) => d.previsaoMesAtual),
    previsaoMesSeguinte: last7.map((d) => d.previsaoMesSeguinte),
  };

  // Cumulative for acumulado
  const ascLast7 = last7.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let cum = 0;
  const acumuladoSparkData: number[] = ascLast7.map((d) => {
    cum += d.faturamento;
    return cum;
  });

  const loadTodayForm = useCallback(() => {
    const todayEntry = history.find((h) => h.date === todayStr);
    setFormData(
      todayEntry || {
        date: todayStr,
        faturamento: 0,
        vendas: 0,
        atrasos: 0,
        carteiraTotal: 0,
        previsaoMesAtual: 0,
        previsaoMesSeguinte: 0,
      }
    );
  }, [history, todayStr]);

  useEffect(() => {
    loadTodayForm();
  }, [loadTodayForm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: DailyData = {
      ...formData,
      date: todayStr,
    };
    const existingIdx = history.findIndex((h) => h.date === todayStr);
    if (existingIdx >= 0) {
      const newHist = [...history];
      newHist[existingIdx] = newEntry;
      setHistory(newHist);
    } else {
      setHistory([newEntry, ...history]);
    }
  };

  const deleteEntry = (date: string) => {
    setHistory((h) => h.filter((x) => x.date !== date));
  };

  const openMetas = () => {
    setTempMetas(metas);
    setShowMetasModal(true);
  };

  const saveMetas = () => {
    setMetas(tempMetas);
    setShowMetasModal(false);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const getIcon = (metric: keyof MetasType): string => {
    const icons: Record<keyof MetasType, string> = {
      faturamento: '💰',
      vendas: '💵',
      atrasos: '⚠️',
      carteiraTotal: '💳',
      previsaoMesAtual: '🔮',
      previsaoMesSeguinte: '📈',
    };
    return icons[metric];
  };

  const getProgressColor = (p: number): string => {
    if (p > 80) return 'bg-green-500';
    if (p >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPercent = (current: number, target: number, metric: keyof MetasType): number => {
    if (target === 0) {
      return current === 0 ? 100 : 0;
    }
    const isAtrasos = metric === 'atrasos';
    if (isAtrasos) {
      return Math.max(0, 100 * (1 - current / target));
    }
    return Math.min(100, (current / target) * 100);
  };

  const getTrend = (last: number, prev: number, metric: keyof MetasType) => {
    const delta = last - prev;
    const isHigherBetter = metric !== 'atrasos';
    const good = isHigherBetter ? delta > 0 : delta < 0;
    const direction: 'up' | 'down' = delta >= 0 ? 'up' : 'down';
    return { good, direction };
  };

  const Sparkline = ({ data, color = '#4f46e5' }: { data: number[]; color?: string }) => {
    if (data.length === 0) {
      return <div className="h-10 w-full bg-gray-200 rounded-lg" />;
    }
    const minV = Math.min(...data, 0);
    const maxV = Math.max(...data);
    const rangeV = maxV - minV || 1;
    const points: string[] = data.map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const norm = (v - minV) / rangeV;
      const y = 18 - norm * 16;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const pointsStr = points.join(' ');
    return (
      <svg viewBox="0 0 100 20" className="w-full h-10 flex-shrink-0">
        <polyline
          points={pointsStr}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 drop-shadow-lg">
            Diário Financeiro 💼
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-medium">Acompanhe seus indicadores diários com precisão</p>
        </div>

        {/* Registro Diário Form */}
        <section className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 md:p-8 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3 text-gray-800">
            📝 Registro Diário
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Data</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-indigo-200/50 focus:outline-none shadow-sm font-medium text-lg"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Faturamento 💰</label>
              <input
                type="number"
                step="0.01"
                value={formData.faturamento}
                onChange={(e) => setFormData({ ...formData, faturamento: +e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-indigo-200/50 focus:outline-none shadow-sm font-medium text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Vendas 💵</label>
              <input
                type="number"
                step="0.01"
                value={formData.vendas}
                onChange={(e) => setFormData({ ...formData, vendas: +e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-indigo-200/50 focus:outline-none shadow-sm font-medium text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Atrasos ⚠️</label>
              <input
                type="number"
                step="1"
                value={formData.atrasos}
                onChange={(e) => setFormData({ ...formData, atrasos: +e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-indigo-200/50 focus:outline-none shadow-sm font-medium text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Carteira Total 💳</label>
              <input
                type="number"
                step="0.01"
                value={formData.carteiraTotal}
                onChange={(e) => setFormData({ ...formData, carteiraTotal: +e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-indigo-200/50 focus:outline-none shadow-sm font-medium text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Previsão Mês Atual 🔮</label>
              <input
                type="number"
                step="0.01"
                value={formData.previsaoMesAtual}
                onChange={(e) => setFormData({ ...formData, previsaoMesAtual: +e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-indigo-200/50 focus:outline-none shadow-sm font-medium text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Previsão Mês Seguinte 📈</label>
              <input
                type="number"
                step="0.01"
                value={formData.previsaoMesSeguinte}
                onChange={(e) => setFormData({ ...formData, previsaoMesSeguinte: +e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-indigo-200/50 focus:outline-none shadow-sm font-medium text-lg"
              />
            </div>
          </form>
          <button
            type="submit"
            className="mt-8 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-4 rounded-3xl text-xl font-bold shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3"
          >
            Salvar Registro 📊
          </button>
        </section>

        {/* KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {Object.entries(metrics).map(([key, value]) => {
            const metric = key as keyof MetasType;
            const percent = getPercent(value, metas[metric], metric);
            const barColor = getProgressColor(percent);
            const iconEmoji = getIcon(metric);
            const formatted =
              ['faturamento', 'vendas', 'carteiraTotal', 'previsaoMesAtual', 'previsaoMesSeguinte'].includes(key)
                ? formatCurrency(value)
                : formatNumber(value);
            return (
              <div
                key={key}
                className="group bg-white/70 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-white/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="p-3 md:p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl group-hover:scale-110 transition-transform">
                    {iconEmoji}
                  </span>
                  <div
                    className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-white shadow-lg font-bold text-sm md:text-base ${barColor}`}
                  >
                    {Math.round(percent)}%
                  </div>
                </div>
                <p className="text-2xl md:text-4xl lg:text-3xl xl:text-4xl font-black text-gray-900 mb-2 leading-tight">
                  {formatted}
                </p>
                <p className="text-sm md:text-base text-gray-600 font-medium capitalize tracking-wide">
                  {metric.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}
                </p>
                <div className="mt-6">
                  <div className="bg-gray-200/50 rounded-full h-3 md:h-4 overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full ${barColor} shadow-lg transition-all duration-1000 ease-out`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Resumo Mensal */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h2 className="text-3xl md:text-4xl font-black flex items-center gap-3 text-gray-800 drop-shadow-md">
              📊 Resumo Mensal
            </h2>
            <button
              onClick={openMetas}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              ⚙️ Configurar Metas
            </button>
          </div>

          {/* Sparkline Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
            {/* Acumulado Card */}
            <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all border border-white/50">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">💰</span>
                <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Acumulado
                </h3>
              </div>
              <Sparkline data={acumuladoSparkData} color="#4f46e5" />
              <div className="mt-8 space-y-3 pt-6 border-t border-gray-200/50">
                <p className="text-3xl md:text-4xl font-black text-gray-900">
                  {formatCurrency(metrics.faturamento)}
                </p>
                <div className="flex items-center gap-6 text-xl md:text-2xl">
                  <span className="font-bold text-gray-700 bg-gray-100 px-4 py-2 rounded-xl">
                    {getPercent(metrics.faturamento, metas.faturamento, 'faturamento').toFixed(0)}% da meta
                  </span>
                  {last7.length >= 2 && (
                    <>
                      {(() => {
                        const trendData = acumuladoSparkData;
                        const trend = getTrend(
                          trendData[trendData.length - 1],
                          trendData[trendData.length - 2],
                          'faturamento'
                        );
                        return (
                          <span
                            className={`font-black text-3xl drop-shadow-lg ${
                              trend.good ? 'text-green-500' : 'text-red-500'
                            }`}
                          >
                            {trend.direction === 'up' ? '↑' : '↓'}
                          </span>
                        );
                      })()}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Other Metrics Sparkline Cards */}
            {(['vendas', 'atrasos', 'carteiraTotal', 'previsaoMesAtual', 'previsaoMesSeguinte'] as (keyof MetasType)[]).map((metric) => (
              <div
                key={metric}
                className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all border border-white/50"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">{getIcon(metric)}</span>
                  <h3 className="text-xl md:text-2xl font-bold capitalize tracking-wide text-gray-800">
                    {metric.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}
                  </h3>
                </div>
                <Sparkline data={sparkData[metric]} color="#10b981" />
                <div className="mt-6 pt-4 border-t border-gray-200/50">
                  <p className="text-2xl font-bold text-gray-900 mb-3">
                    {(['vendas', 'carteiraTotal', 'previsaoMesAtual', 'previsaoMesSeguinte'] as string[]).includes(metric)
                      ? formatCurrency(metrics[metric])
                      : formatNumber(metrics[metric])}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-700">
                      {getPercent(metrics[metric], metas[metric], metric).toFixed(0)}% da meta
                    </span>
                    {last7.length >= 2 && (
                      (() => {
                        const data = sparkData[metric];
                        const trend = getTrend(data[data.length - 1], data[data.length - 2], metric);
                        return (
                          <span
                            className={`text-2xl font-black drop-shadow-lg ${
                              trend.good ? 'text-green-500' : 'text-red-500'
                            }`}
                          >
                            {trend.direction === 'up' ? '↑' : '↓'}
                          </span>
                        );
                      })()
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* % da Meta Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {Object.entries(metrics).map(([key]) => {
              const metric = key as keyof MetasType;
              const percent = getPercent(metrics[metric], metas[metric], metric);
              const barColor = getProgressColor(percent);
              const bgColor =
                barColor === 'bg-green-500'
                  ? 'bg-green-100/80'
                  : barColor === 'bg-yellow-500'
                  ? 'bg-yellow-100/80'
                  : 'bg-red-100/80';
              const textColor =
                barColor === 'bg-green-500'
                  ? 'text-green-800'
                  : barColor === 'bg-yellow-500'
                  ? 'text-yellow-800'
                  : 'text-red-800';
              return (
                <div
                  key={key}
                  className={`p-4 md:p-6 rounded-2xl shadow-lg backdrop-blur-sm border ${bgColor} ${textColor} hover:scale-105 transition-all`}
                >
                  <p className="font-bold text-sm md:text-base capitalize tracking-wide mb-1">
                    {metric.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}
                  </p>
                  <p className="text-2xl md:text-3xl font-black drop-shadow-md">
                    {percent.toFixed(0)}%
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Histórico */}
        <section>
          <h2 className="text-3xl md:text-4xl font-black mb-8 flex items-center gap-3 text-gray-800 drop-shadow-lg">
            📜 Histórico
          </h2>
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white divide-x divide-white/20">
                    <th className="px-4 md:px-6 py-4 text-left text-sm md:text-base font-bold uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-4 md:px-6 py-4 text-left text-sm md:text-base font-bold uppercase tracking-wider">
                      Faturamento
                    </th>
                    <th className="px-4 md:px-6 py-4 text-left text-sm md:text-base font-bold uppercase tracking-wider">
                      Vendas
                    </th>
                    <th className="px-4 md:px-6 py-4 text-left text-sm md:text-base font-bold uppercase tracking-wider">
                      Atrasos
                    </th>
                    <th className="px-4 md:px-6 py-4 text-left text-sm md:text-base font-bold uppercase tracking-wider">
                      Carteira Total
                    </th>
                    <th className="px-4 md:px-6 py-4 text-left text-sm md:text-base font-bold uppercase tracking-wider">
                      Previsão Atual
                    </th>
                    <th className="px-4 md:px-6 py-4 text-left text-sm md:text-base font-bold uppercase tracking-wider">
                      Previsão Próx
                    </th>
                    <th className="px-4 md:px-6 py-4 text-center text-sm md:text-base font-bold uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white/50">
                  {history.map((d) => (
                    <tr
                      key={d.date}
                      className="hover:bg-gray-50/50 transition-colors duration-200"
                    >
                      <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">
                        {d.date}
                      </td>
                      <td className="px-4 md:px-6 py-4 font-mono font-semibold text-indigo-600">
                        {formatCurrency(d.faturamento)}
                      </td>
                      <td className="px-4 md:px-6 py-4 font-mono font-semibold text-green-600">
                        {formatCurrency(d.vendas)}
                      </td>
                      <td className={`px-4 md:px-6 py-4 font-mono font-semibold ${
                        d.atrasos === 0 ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {formatNumber(d.atrasos)}
                      </td>
                      <td className="px-4 md:px-6 py-4 font-mono font-semibold text-blue-600">
                        {formatCurrency(d.carteiraTotal)}
                      </td>
                      <td className="px-4 md:px-6 py-4 font-mono font-semibold text-purple-600">
                        {formatCurrency(d.previsaoMesAtual)}
                      </td>
                      <td className="px-4 md:px-6 py-4 font-mono font-semibold text-pink-600">
                        {formatCurrency(d.previsaoMesSeguinte)}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-center">
                        <button
                          onClick={() => deleteEntry(d.date)}
                          className="p-2 rounded-xl bg-red-100 text-red-500 hover:bg-red-200 hover:scale-110 transition-all duration-200 shadow-md font-bold text-lg"
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500 font-medium">
                        Nenhum registro ainda. Adicione o primeiro! ✨
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* Metas Modal */}
      {showMetasModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
          onClick={() => setShowMetasModal(false)}
        >
          <div
            className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-white/30 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3 text-gray-800 drop-shadow-lg">
              ⚙️ Configurar Metas Mensais
            </h2>
            <div className="space-y-6 mb-8">
              {Object.entries(tempMetas).map(([key]) => {
                const metric = key as keyof MetasType;
                return (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 flex items-center gap-2 capitalize">
                      {metric.replace(/([A-Z])/g, ' $1').trim().toLowerCase()} {getIcon(metric)}
                    </label>
                    <input
                      type="number"
                      step="1000"
                      value={tempMetas[metric]}
                      onChange={(e) =>
                        setTempMetas({ ...tempMetas, [metric]: +e.target.value || 0 })
                      }
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-300/50 focus:border-indigo-500 outline-none shadow-lg font-mono text-lg text-right tracking-wider bg-gradient-to-r from-gray-50 to-indigo-50/30 hover:shadow-xl transition-all"
                      placeholder="0"
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={saveMetas}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Salvar Metas ✅
              </button>
              <button
                onClick={() => setShowMetasModal(false)}
                className="flex-1 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Cancelar ❌
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
