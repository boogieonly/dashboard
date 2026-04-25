'use client';

import { useState, useEffect } from 'react';

type NumericField = 'faturamento' | 'atrasos' | 'vendas' | 'carteiraTotal' | 'previsaoMesAtual' | 'previsaoMesSeguinte';

interface DailyEntry {
  date: string;
  faturamento: number;
  atrasos: number;
  vendas: number;
  carteiraTotal: number;
  previsaoMesAtual: number;
  previsaoMesSeguinte: number;
}

type FieldConfig = {
  key: NumericField;
  label: string;
  emoji: string;
};

const fields: FieldConfig[] = [
  { key: 'faturamento', label: 'Faturamento', emoji: '💰' },
  { key: 'vendas', label: 'Vendas', emoji: '📈' },
  { key: 'atrasos', label: 'Atrasos', emoji: '⏰' },
  { key: 'carteiraTotal', label: 'Carteira Total', emoji: '💼' },
  { key: 'previsaoMesAtual', label: 'Previsão Mês Atual', emoji: '🔮' },
  { key: 'previsaoMesSeguinte', label: 'Previsão Mês Seguinte', emoji: '📅' },
];

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('pt-BR');
}

function getPercentageChange(current: number, previous: number | null, isInverse = false): {
  color: 'green' | 'red' | 'gray';
  symbol: '↑' | '↓' | '';
  percentage: string;
} {
  if (previous === null || previous === 0) {
    return { color: 'gray', symbol: '', percentage: '--' };
  }

  const percentage = isInverse
    ? ((previous - current) / previous) * 100
    : ((current - previous) / previous) * 100;

  if (percentage === 0) {
    return { color: 'gray', symbol: '', percentage: '0%' };
  }

  const abs = Math.abs(percentage);
  const color: 'green' | 'red' = percentage > 0 ? 'green' : 'red';
  const symbol: '↑' | '↓' = percentage > 0 ? '↑' : '↓';
  const formatted = `${percentage > 0 ? '+' : ''}${abs.toFixed(1)}%`;

  return { color, symbol, percentage: formatted };
}

const DiarioPage = () => {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<DailyEntry | null>(null);
  const [formData, setFormData] = useState<Partial<DailyEntry>>({
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const saved = localStorage.getItem('dailyEntries');
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch {
        // Ignore invalid data
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyEntries', JSON.stringify(entries));
  }, [entries]);

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const latest = sortedEntries[0] || null;
  const previous = sortedEntries[1] || null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.date) return;

    const data: DailyEntry = {
      date: formData.date as string,
      faturamento: (formData as any).faturamento ?? 0,
      atrasos: (formData as any).atrasos ?? 0,
      vendas: (formData as any).vendas ?? 0,
      carteiraTotal: (formData as any).carteiraTotal ?? 0,
      previsaoMesAtual: (formData as any).previsaoMesAtual ?? 0,
      previsaoMesSeguinte: (formData as any).previsaoMesSeguinte ?? 0,
    };

    if (editingEntry) {
      setEntries(entries.map((e) => (e.date === editingEntry.date ? data : e)));
      setEditingEntry(null);
    } else {
      const exists = entries.some((e) => e.date === data.date);
      if (exists) {
        alert('Entrada para esta data já existe!');
        return;
      }
      setEntries([data, ...entries]);
    }

    setFormData({ date: new Date().toISOString().split('T')[0] });
  };

  const handleEdit = (entry: DailyEntry) => {
    setEditingEntry(entry);
    setFormData(entry);
  };

  const handleDelete = (date: string) => {
    if (confirm('Confirmar exclusão desta entrada?')) {
      setEntries(entries.filter((e) => e.date !== date));
    }
  };

  const updateFormField = (key: NumericField, value: string) => {
    const numValue = value ? parseFloat(value) : 0;
    setFormData((prev) => ({ ...prev, [key]: numValue }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-12 text-center drop-shadow-lg">
          Diário de Performance
        </h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {fields.map((field) => {
            const currentVal = latest ? (latest[field.key] as number) : 0;
            const prevVal =
              previous ? (previous[field.key] as number) : null;
            const change = getPercentageChange(
              currentVal,
              prevVal,
              field.key === 'atrasos'
            );
            return (
              <div
                key={field.key}
                className="group bg-white/70 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/50 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 hover:bg-white/90"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                    {field.emoji}
                  </span>
                  <span
                    className={`text-3xl font-bold transition-all duration-300 ${
                      change.color === 'green'
                        ? 'text-green-500 animate-pulse'
                        : change.color === 'red'
                        ? 'text-red-500 -rotate-12'
                        : 'text-gray-400'
                    }`}
                  >
                    {change.symbol}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  {field.label}
                </p>
                <p className="text-4xl lg:text-5xl font-black text-gray-900 mb-3 drop-shadow-md">
                  {currentVal.toLocaleString('pt-BR')}
                </p>
                <p
                  className={`text-lg font-bold transition-colors duration-300 ${
                    change.color === 'green'
                      ? 'text-green-500'
                      : change.color === 'red'
                      ? 'text-red-500'
                      : 'text-gray-400'
                  }`}
                >
                  {change.percentage}
                </p>
              </div>
            );
          })}
        </div>

        {/* Form */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50 mb-16">
          <h2 className="text-3xl font-black text-gray-900 mb-8 text-center">
            {editingEntry ? '✏️ Editar Entrada' : '➕ Nova Entrada'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                📅 Data
              </label>
              <input
                type="date"
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-inner hover:shadow-md"
                required
              />
              {formData.date && (
                <p className="text-xs text-gray-500 mt-2 font-mono">
                  {formatDate(formData.date as string)}
                </p>
              )}
            </div>
            {fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  {field.emoji} {field.label}
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData[field.key] ?? ''}
                  onChange={(e) => updateFormField(field.key, e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-inner hover:shadow-md"
                  required
                  min="0"
                />
              </div>
            ))}
            <div className="col-span-full flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-blue-800 transform hover:-translate-y-1 transition-all duration-300"
              >
                {editingEntry ? 'Atualizar 📝' : 'Adicionar ➕'}
              </button>
              {editingEntry && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingEntry(null);
                    setFormData({ date: new Date().toISOString().split('T')[0] });
                  }}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-gray-600 hover:to-gray-700 transform hover:-translate-y-1 transition-all duration-300"
                >
                  Cancelar ❌
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table */}
        {sortedEntries.length > 0 && (
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-gray-900">📊 Histórico</h2>
              <span className="text-sm text-gray-500 font-medium">
                {sortedEntries.length} entradas
              </span>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full table-auto divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Data
                    </th>
                    {fields.map((field) => (
                      <th
                        key={field.key}
                        className="px-4 py-4 text-center text-lg font-bold text-gray-900"
                        title={field.label}
                      >
                        {field.emoji}
                      </th>
                    ))}
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {sortedEntries.map((entry) => (
                    <tr
                      key={entry.date}
                      className="hover:bg-blue-50 transition-all duration-200"
                    >
                      <td className="px-6 py-5 font-semibold text-gray-900">
                        {formatDate(entry.date)}
                      </td>
                      {fields.map((field) => (
                        <td
                          key={field.key}
                          className="px-4 py-5 text-center text-lg font-mono text-gray-800"
                        >
                          {entry[field.key].toLocaleString('pt-BR')}
                        </td>
                      ))}
                      <td className="px-6 py-5 font-medium">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="text-blue-600 hover:text-blue-900 mr-6 font-bold transition-colors duration-200 hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(entry.date)}
                          className="text-red-600 hover:text-red-900 font-bold transition-colors duration-200 hover:underline"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {sortedEntries.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">Nenhuma entrada ainda</h3>
            <p className="text-gray-500 mb-8">Adicione a primeira entrada acima!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiarioPage;
