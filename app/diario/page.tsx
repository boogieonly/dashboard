'use client';

import { useState, useEffect, useMemo } from 'react';

type FieldKey = 'faturamento' | 'atrasos' | 'vendas' | 'carteiraTotal' | 'previsaoMesAtual' | 'previsaoMesSeguinte';

interface DailyEntry {
  date: string;
  faturamento: number;
  atrasos: number;
  vendas: number;
  carteiraTotal: number;
  previsaoMesAtual: number;
  previsaoMesSeguinte: number;
}

type Field = {
  key: FieldKey;
  label: string;
  emoji: string;
  formatter: (value: number) => string;
};

const sortByDateDesc = (a: DailyEntry, b: DailyEntry): number => {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
};

const getToday = (): string => new Date().toISOString().split('T')[0];

const formatDate = (dateStr: string): string => {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatNumber = (value: number): string => {
  return value.toLocaleString('pt-BR');
};

const fields: Field[] = [
  { key: 'faturamento', label: 'Faturamento', emoji: '💰', formatter: formatCurrency },
  { key: 'atrasos', label: 'Atrasos', emoji: '⏰', formatter: formatNumber },
  { key: 'vendas', label: 'Vendas', emoji: '📈', formatter: formatCurrency },
  { key: 'carteiraTotal', label: 'Carteira Total', emoji: '💼', formatter: formatCurrency },
  { key: 'previsaoMesAtual', label: 'Previsão Mês Atual', emoji: '🔮', formatter: formatCurrency },
  { key: 'previsaoMesSeguinte', label: 'Previsão Mês Seguinte', emoji: '📅', formatter: formatCurrency },
];

const initialFormData: DailyEntry = {
  date: getToday(),
  faturamento: 0,
  atrasos: 0,
  vendas: 0,
  carteiraTotal: 0,
  previsaoMesAtual: 0,
  previsaoMesSeguinte: 0,
};

export default function DiarioPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [formData, setFormData] = useState<DailyEntry>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('diarioEntries');
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading entries:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('diarioEntries', JSON.stringify(entries));
  }, [entries]);

  // Update current entry when date changes
  useEffect(() => {
    const existingEntry = entries.find((e) => e.date === formData.date);
    if (existingEntry) {
      setFormData(existingEntry);
      setIsEditing(true);
    } else {
      setFormData({
        ...formData,
        faturamento: 0,
        atrasos: 0,
        vendas: 0,
        carteiraTotal: 0,
        previsaoMesAtual: 0,
        previsaoMesSeguinte: 0,
      });
      setIsEditing(false);
    }
  }, [formData.date, entries]);

  const sortedEntries = useMemo(
    () => entries.slice().sort(sortByDateDesc),
    [entries]
  );

  const latest = sortedEntries[0];

  const handleInputChange =
    (key: FieldKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [key]: Number(e.target.value) || 0,
      }));
    };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, date: e.target.value }));
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setIsEditing(false);
  };

  const handleEdit = (date: string) => {
    const entry = entries.find((e) => e.date === date);
    if (entry) {
      setFormData(entry);
      setIsEditing(true);
    }
  };

  const handleDelete = (date: string) => {
    if (confirm('Tem certeza que deseja excluir esta entrada?')) {
      setEntries((prev) => prev.filter((e) => e.date !== date));
      if (formData.date === date) {
        handleReset();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entryData: DailyEntry = {
      date: formData.date,
      faturamento: formData.faturamento,
      atrasos: formData.atrasos,
      vendas: formData.vendas,
      carteiraTotal: formData.carteiraTotal,
      previsaoMesAtual: formData.previsaoMesAtual,
      previsaoMesSeguinte: formData.previsaoMesSeguinte,
    };

    if (isEditing) {
      setEntries((prev) =>
        prev.map((e) => (e.date === formData.date ? entryData : e))
      );
    } else {
      setEntries((prev) => [entryData, ...prev]);
    }
    handleReset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4 drop-shadow-2xl">
            Diário de Indicadores
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Registre e acompanhe seus indicadores diários com facilidade.
          </p>
        </header>

        {latest && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {fields.map((field) => (
              <div
                key={field.key}
                className="group bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-8 shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 flex flex-col items-center text-center overflow-hidden"
              >
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {field.emoji}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 px-4">
                  {field.label}
                </h3>
                <div className="text-4xl font-black bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent drop-shadow-lg">
                  {field.formatter(latest[field.key as keyof DailyEntry] as number)}
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm shadow-3xl rounded-3xl p-10 mb-16 border border-white/50">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 flex items-center justify-center space-x-4 mx-auto mb-4 max-w-md">
              <span className="text-5xl">📝</span>
              <span>{isEditing ? 'Editar Entrada' : 'Nova Entrada'}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            <div className="col-span-full">
              <label className="block text-lg font-semibold text-gray-700 mb-4 flex items-center justify-center space-x-3">
                <span className="text-4xl">📅</span>
                <span>Data</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={handleDateChange}
                className="w-full px-6 py-4 text-xl border-2 border-gray-200 rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
              />
            </div>

            {fields.map((field) => (
              <div key={field.key} className="space-y-3">
                <label className="block text-lg font-semibold text-gray-700 flex items-center space-x-3">
                  <span className="text-4xl">{field.emoji}</span>
                  <span>{field.label}</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData[field.key]}
                  onChange={handleInputChange(field.key)}
                  className="w-full px-6 py-4 text-xl border-2 border-gray-200 rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-300 bg-white/50 backdrop-blur-sm font-mono tracking-wider"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-6 mt-16 pt-10 border-t-4 border-indigo-100">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-5 px-10 border-2 border-gray-300 rounded-2xl text-xl font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              Limpar
            </button>
            <button
              type="submit"
              className="flex-1 py-5 px-10 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-xl font-black text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:-translate-y-1 transform"
            >
              {isEditing ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>

        {sortedEntries.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm shadow-3xl rounded-3xl overflow-hidden border border-white/50">
            <div className="px-8 py-8 bg-gradient-to-r from-indigo-500 to-blue-600">
              <h2 className="text-3xl font-bold text-white flex items-center space-x-3">
                <span className="text-4xl">📊</span>
                <span>Histórico de Entradas</span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-8 py-6 text-left text-xl font-bold text-gray-900 sm:w-32">Data</th>
                    {fields.map((field) => (
                      <th
                        key={field.key}
                        className="px-6 py-6 text-left text-xl font-bold text-gray-900"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{field.emoji}</span>
                          <span className="hidden md:inline">{field.label}</span>
                        </div>
                      </th>
                    ))}
                    <th className="px-8 py-6 text-left text-xl font-bold text-gray-900 sm:w-48">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {sortedEntries.map((entry) => (
                    <tr
                      key={entry.date}
                      className="hover:bg-indigo-50/50 transition-all duration-200"
                    >
                      <td className="px-8 py-6 whitespace-nowrap text-xl font-bold text-gray-900">
                        {formatDate(entry.date)}
                      </td>
                      {fields.map((field) => (
                        <td key={field.key} className="px-6 py-6 whitespace-nowrap text-lg font-mono text-gray-800">
                          {field.formatter(entry[field.key as keyof Omit<DailyEntry, 'date'>] as number)}
                        </td>
                      ))}
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-4">
                          <button
                            onClick={() => handleEdit(entry.date)}
                            className="text-indigo-600 hover:text-indigo-900 font-bold py-2 px-6 rounded-xl hover:bg-indigo-100 transition-all duration-200 border border-indigo-200 hover:border-indigo-300"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(entry.date)}
                            className="text-red-600 hover:text-red-900 font-bold py-2 px-6 rounded-xl hover:bg-red-100 transition-all duration-200 border border-red-200 hover:border-red-300"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
