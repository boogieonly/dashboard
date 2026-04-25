'use client';

import { useState, useEffect, useMemo } from 'react';

type NumericKey = keyof Omit<DailyEntry, 'date'>;

interface DailyEntry {
  date: string;
  faturamento: number;
  atrasos: number;
  vendas: number;
  carteiraTotal: number;
  previsaoMesAtual: number;
  previsaoMesSeguinte: number;
}

type FormData = DailyEntry;

interface Metric {
  key: NumericKey;
  label: string;
  emoji: string;
  sparkColor: string;
}

const metrics: Metric[] = [
  { key: 'faturamento', label: 'Faturamento', emoji: '💰', sparkColor: 'green-500' },
  { key: 'atrasos', label: 'Atrasos', emoji: '⏰', sparkColor: 'yellow-500' },
  { key: 'vendas', label: 'Vendas', emoji: '📈', sparkColor: 'blue-500' },
  { key: 'carteiraTotal', label: 'Carteira Total', emoji: '💼', sparkColor: 'purple-500' },
  { key: 'previsaoMesAtual', label: 'Previsão Mês Atual', emoji: '🔮', sparkColor: 'indigo-500' },
  { key: 'previsaoMesSeguinte', label: 'Previsão Mês Seguinte', emoji: '📅', sparkColor: 'pink-500' },
];

interface KPICardProps {
  metric: Metric;
  value: number;
  sparkData: number[];
}

function KPICard({ metric, value, sparkData }: KPICardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">{metric.label}</p>
        </div>
        <span className="text-4xl">{metric.emoji}</span>
      </div>
      <Sparkline data={sparkData} sparkColor={metric.sparkColor} />
    </div>
  );
}

interface SparklineProps {
  data: number[];
  sparkColor: string;
}

function Sparkline({ data, sparkColor }: SparklineProps) {
  if (data.length === 0) {
    return <div className="h-10 bg-gray-200 rounded mt-2" />;
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  const width = 120;
  const height = 40;

  const points: string[] = [];
  for (let i = 0; i < data.length; i++) {
    const x = data.length > 1 ? (i / (data.length - 1)) * width : width / 2;
    const y = range > 0 ? height - ((data[i] - min) / range) * height : height / 2;
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const pointsStr = points.join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full">
      <polyline
        points={pointsStr}
        className={`stroke-${sparkColor} fill-none stroke-2 stroke-linecap-round stroke-linejoin-round`}
      />
    </svg>
  );
}

interface DailyFormProps {
  formData: FormData;
  onChange: (key: keyof DailyEntry, value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  editingEntry: DailyEntry | null;
}

function DailyForm({ formData, onChange, onSubmit, onReset, editingEntry }: DailyFormProps) {
  return (
    <form onSubmit={onSubmit} className="bg-white p-8 rounded-lg shadow-md border border-gray-200 mb-8">
      <h2 className="text-2xl font-bold mb-6">{editingEntry ? 'Editar Entrada' : 'Nova Entrada'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => onChange('date', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        {metrics.map((metric) => (
          <div key={metric.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {metric.emoji} {metric.label}
            </label>
            <input
              type="number"
              step="0.01"
              value={formData[metric.key] ?? 0}
              onChange={(e) => onChange(metric.key, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mt-6">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={onReset}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
        >
          Reset
        </button>
        {editingEntry && (
          <button
            type="button"
            onClick={onReset}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

interface HistoricalTableProps {
  entries: DailyEntry[];
  onEdit: (entry: DailyEntry) => void;
  onDelete: (date: string) => void;
}

function HistoricalTable({ entries, onEdit, onDelete }: HistoricalTableProps) {
  const recent = entries.slice(0, 7);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Últimos 7 Dias</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              {metrics.map((metric) => (
                <th key={metric.key} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {metric.emoji}<br className="sm:hidden" /> {metric.label}
                </th>
              ))}
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recent.map((entry) => (
              <tr key={entry.date} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {entry.date}
                </td>
                {metrics.map((metric) => (
                  <td key={metric.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry[metric.key].toLocaleString()}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onEdit(entry)}
                    className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Tem certeza que deseja deletar esta entrada?')) {
                        onDelete(entry.date);
                      }
                    }}
                    className="text-red-600 hover:text-red-900 transition-colors"
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td colSpan={metrics.length + 2} className="px-6 py-12 text-center text-gray-500">
                  Nenhuma entrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DiarioPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<DailyEntry | null>(null);
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    faturamento: 0,
    atrasos: 0,
    vendas: 0,
    carteiraTotal: 0,
    previsaoMesAtual: 0,
    previsaoMesSeguinte: 0,
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const currentEntry = useMemo(() => {
    const entry = entries.find((e) => e.date === todayStr);
    if (entry) return entry;
    return {
      date: todayStr,
      faturamento: 0,
      atrasos: 0,
      vendas: 0,
      carteiraTotal: 0,
      previsaoMesAtual: 0,
      previsaoMesSeguinte: 0,
    } as DailyEntry;
  }, [entries, todayStr]);

  const sparkData = useMemo(() => {
    const data: Partial<Record<NumericKey, number[]>> = {};
    const recent = entries.slice(0, 7);
    metrics.forEach((metric) => {
      data[metric.key] = recent.map((e) => e[metric.key]).reverse();
    });
    return data as Record<NumericKey, number[]>;
  }, [entries]);

  const handleChange = (key: keyof DailyEntry, value: string): void => {
    setFormData((prev) => ({
      ...prev,
      [key]: key === 'date' ? value : Number(value) || 0,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEntries((prev) => {
      const newEntries = [...prev];
      const index = newEntries.findIndex((entry) => entry.date === formData.date);
      if (index !== -1) {
        newEntries[index] = formData;
      } else {
        newEntries.push(formData);
      }
      return newEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
    setEditingEntry(null);
    const today = new Date().toISOString().split('T')[0];
    if (formData.date === today) {
      // No need to reset if editing today
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      date: today,
      faturamento: 0,
      atrasos: 0,
      vendas: 0,
      carteiraTotal: 0,
      previsaoMesAtual: 0,
      previsaoMesSeguinte: 0,
    });
    setEditingEntry(null);
  };

  const handleEdit = (entry: DailyEntry) => {
    setFormData(entry);
    setEditingEntry(entry);
  };

  const deleteData = (date: string) => {
    setEntries((prev) => prev.filter((e) => e.date !== date));
  };

  useEffect(() => {
    const stored = localStorage.getItem('dailyEntries');
    if (stored) {
      try {
        const parsed: DailyEntry[] = JSON.parse(stored);
        setEntries(
          parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem('dailyEntries', JSON.stringify(entries));
    }
  }, [entries]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">Diário de Métricas</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {metrics.map((metric) => (
            <KPICard
              key={metric.key}
              metric={metric}
              value={currentEntry[metric.key]}
              sparkData={sparkData[metric.key]}
            />
          ))}
        </div>

        <DailyForm
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onReset={resetForm}
          editingEntry={editingEntry}
        />

        <HistoricalTable entries={entries} onEdit={handleEdit} onDelete={deleteData} />
      </div>
    </div>
  );
}
