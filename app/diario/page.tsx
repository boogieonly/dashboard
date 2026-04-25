import { useState, useEffect } from 'react';

type MetricKey = 'faturamento' | 'vendas' | 'atrasos' | 'carteira' | 'previsaoAtual' | 'previsaoProx';

interface Metric {
  key: MetricKey;
  label: string;
  unit: string;
}

interface Day {
  date: string;
  faturamento: number;
  vendas: number;
  atrasos: number;
  carteira: number;
  previsaoAtual: number;
  previsaoProx: number;
}

const METRICS: Metric[] = [
  { key: 'faturamento', label: 'Faturamento', unit: 'R$' },
  { key: 'vendas', label: 'Vendas', unit: 'R$' },
  { key: 'atrasos', label: 'Atrasos', unit: 'R$' },
  { key: 'carteira', label: 'Carteira', unit: 'R$' },
  { key: 'previsaoAtual', label: 'Previsão Atual', unit: 'R$' },
  { key: 'previsaoProx', label: 'Previsão Próxima', unit: 'R$' },
];

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const Sparkline = ({
  data,
  className = '',
}: {
  data: number[];
  className?: string;
}) => {
  if (data.length === 0) {
    return <div className={`h-6 bg-gray-300/50 rounded-full ${className}`} />;
  }

  const minV = Math.min(...data);
  const maxV = Math.max(...data);
  const padding = 2;
  const height = 20;
  const range = maxV - minV || 1;
  const normalize = (v: number) =>
    height - padding - ((v - minV) / range) * (height - 2 * padding);
  const widthPerPoint = 100 / Math.max(1, data.length - 1);
  const points: string[] = data.map((v, i) => {
    const x = i * widthPerPoint;
    const y = normalize(v);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <svg
      className={`w-full h-6 ${className}`}
      viewBox="0 0 100 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points={points.join(' ')} />
    </svg>
  );
};

export default function Diario() {
  const [data, setData] = useState<Day[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Record<MetricKey, number>>>({});

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    try {
      const stored = localStorage.getItem('diarioData');
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('diarioData', JSON.stringify(data));
  }, [data]);

  const getDayValue = (dateStr: string, key: MetricKey): number => {
    return (data.find((d) => d.date === dateStr)?.[key] as number) ?? 0;
  };

  const getHistory = (key: MetricKey, count = 30): number[] => {
    return data.slice(0, count).map((d) => d[key] as number);
  };

  const getYesterday = (): string => {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  const openModal = (date: string) => {
    setEditingDate(date);
    const dayData = data.find((d) => d.date === date);
    if (dayData) {
      const fd: Record<MetricKey, number> = {} as Record<MetricKey, number>;
      METRICS.forEach((m) => {
        fd[m.key] = dayData[m.key];
      });
      setFormData(fd);
    } else {
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDate(null);
    setFormData({});
  };

  const handleFormChange = (key: MetricKey, value: number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDate) return;

    const newDay: Day = {
      date: editingDate,
      faturamento: formData.faturamento ?? 0,
      vendas: formData.vendas ?? 0,
      atrasos: formData.atrasos ?? 0,
      carteira: formData.carteira ?? 0,
      previsaoAtual: formData.previsaoAtual ?? 0,
      previsaoProx: formData.previsaoProx ?? 0,
    };

    const newData = data.map((d) => (d.date === editingDate ? newDay : d));
    if (!data.some((d) => d.date === editingDate)) {
      newData.push(newDay);
    }
    newData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setData(newData);
    closeModal();
  };

  const deleteDay = (date: string) => {
    if (!confirm('Tem certeza que deseja excluir este dia?')) return;
    setData(data.filter((d) => d.date !== date));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-12 text-center">
          Diário Financeiro
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center">
          <button
            onClick={() => openModal(today)}
            className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white font-medium hover:bg-white/20 transition-all shadow-2xl hover:shadow-3xl"
          >
            📊 Registrar Hoje
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-16">
          {METRICS.map((metric) => {
            const value = getDayValue(today, metric.key);
            const yestDate = getYesterday();
            const prevValue = getDayValue(yestDate, metric.key);
            const change =
              prevValue === 0 ? 0 : ((value - prevValue) / prevValue) * 100;
            const history = getHistory(metric.key);

            return (
              <div
                key={metric.key}
                className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-2 hover:bg-white/20"
              >
                <h3 className="text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                  {metric.label}
                </h3>
                <div className="text-4xl lg:text-3xl font-black text-white mb-4">
                  {formatNumber(value)}
                </div>
                <div
                  className={`text-lg font-bold ${
                    change >= 0 ? 'text-emerald-400' : 'text-red-400'
                  } mb-6`}
                >
                  {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% vs ontem
                </div>
                <Sparkline
                  data={history}
                  className="text-blue-400/80 group-hover:text-blue-300"
                />
                <div className="text-xs text-gray-400 mt-3 font-medium">
                  {metric.unit}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <h2 className="text-3xl font-bold text-white mb-8">Histórico</h2>
          {data.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              Nenhum dado registrado ainda. Clique em &quot;Registrar Hoje&quot; para começar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="p-4 text-left text-gray-300 font-semibold sticky top-0 bg-white/10 backdrop-blur-sm z-10">
                      Data
                    </th>
                    {METRICS.map((m) => (
                      <th
                        key={m.key}
                        className="p-4 text-left text-gray-300 font-semibold sticky top-0 bg-white/10 backdrop-blur-sm z-10"
                      >
                        {m.label}
                      </th>
                    ))}
                    <th className="p-4 text-left text-gray-300 font-semibold sticky top-0 bg-white/10 backdrop-blur-sm z-10">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 100).map((day) => (
                    <tr
                      key={day.date}
                      className="border-b border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <td className="p-4 font-medium text-white">
                        {new Date(day.date).toLocaleDateString('pt-BR')}
                      </td>
                      {METRICS.map((m) => (
                        <td key={m.key} className="p-4 text-gray-200">
                          {formatNumber(day[m.key])}
                        </td>
                      ))}
                      <td className="p-4">
                        <button
                          onClick={() => openModal(day.date)}
                          className="text-blue-400 hover:text-blue-300 mr-4 text-xs font-medium transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteDay(day.date)}
                          className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && editingDate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-4xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-3xl">
            <h2 className="text-3xl font-bold text-white mb-8">
              {editingDate === today
                ? 'Registrar Hoje'
                : `Editar ${new Date(editingDate).toLocaleDateString('pt-BR')}`}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {METRICS.map((metric) => (
                <div key={metric.key} className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-200">
                    {metric.label}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData[metric.key]?.toString() ?? ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      handleFormChange(metric.key, val);
                    }}
                    className="w-full p-4 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg font-mono"
                    placeholder="0,00"
                  />
                  <div className="text-xs text-gray-500">{metric.unit}</div>
                </div>
              ))}
              <div className="md:col-span-2 lg:col-span-3 pt-4 border-t border-white/20 flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 p-4 bg-gray-500/30 border border-gray-400/30 rounded-2xl text-white font-semibold hover:bg-gray-500/50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl text-white font-bold shadow-lg hover:shadow-2xl hover:from-blue-600 hover:to-indigo-700 transition-all"
                >
                  Salvar Dados
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
