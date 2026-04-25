'use client';

import React, { useState, useEffect } from 'react';

type OmitDate = Omit<DailyEntry, 'date'>;

interface DailyEntry {
  date: string;
  faturamento: number;
  atrasos: number;
  vendas: number;
  carteiraTotal: number;
  previsaoMesAtual: number;
  previsaoMesSeguinte: number;
}

type Kpi = {
  key: keyof OmitDate;
  label: string;
  color: string;
};

const kpis: Kpi[] = [
  { key: 'faturamento', label: 'Faturamento', color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
  { key: 'atrasos', label: 'Atrasos', color: 'bg-gradient-to-r from-red-500 to-red-600' },
  { key: 'vendas', label: 'Vendas', color: 'bg-gradient-to-r from-green-500 to-green-600' },
  { key: 'carteiraTotal', label: 'Carteira Total', color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
  { key: 'previsaoMesAtual', label: 'Previsão Mês Atual', color: 'bg-gradient-to-r from-orange-500 to-orange-600' },
  { key: 'previsaoMesSeguinte', label: 'Previsão Mês Seguinte', color: 'bg-gradient-to-r from-indigo-500 to-indigo-600' },
];

const numFields = ['faturamento', 'atrasos', 'vendas', 'carteiraTotal', 'previsaoMesAtual', 'previsaoMesSeguinte'] as const;
type NumKey = typeof numFields[number];

const DiarioPage: React.FC = () => {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<DailyEntry | null>(null);
  const [formData, setFormData] = useState<Partial<DailyEntry>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const getToday = (): string => new Date().toISOString().split('T')[0];

  const dateBr = (iso: string): string => {
    const date = new Date(iso + 'T00:00:00');
    if (isNaN(date.getTime())) return iso;
    return date.toLocaleDateString('pt-BR');
  };

  const parseDateBr = (brStr: string): string => {
    if (!brStr) return '';
    const parts = brStr.split('/');
    if (parts.length !== 3) return '';
    const [day, month, year] = parts.map(p => parseInt(p.trim()));
    if (isNaN(day) || isNaN(month) || isNaN(year) || month < 1 || month > 12 || day < 1 || day > 31) return '';
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return '';
    return date.toISOString().split('T')[0];
  };

  const formatNumber = (num: number): string => num.toLocaleString('pt-BR');

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('diario-entries');
      if (saved) {
        try {
          const parsed: DailyEntry[] = JSON.parse(saved);
          const sorted = parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setEntries(sorted);
        } catch {
          // ignore invalid data
        }
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (entries.length > 0 && typeof window !== 'undefined') {
      localStorage.setItem('diario-entries', JSON.stringify(entries));
    }
  }, [entries]);

  // Update currentEntry reactively
  const today = getToday();
  useEffect(() => {
    const curr = entries.find((e) => e.date === today);
    setCurrentEntry(curr || null);
  }, [entries, today]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseDateBr(e.target.value);
    setFormData((prev) => ({ ...prev, date: parsed }));
  };

  const handleNumChange = (key: NumKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const resetForm = () => {
    setFormData({});
    setEditingId(null);
  };

  const handleEdit = (entry: DailyEntry) => {
    setFormData(entry);
    setEditingId(entry.date);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date) {
      alert('Data é obrigatória!');
      return;
    }
    const entry: DailyEntry = {
      date: formData.date,
      faturamento: (formData as any).faturamento ?? 0,
      atrasos: (formData as any).atrasos ?? 0,
      vendas: (formData as any).vendas ?? 0,
      carteiraTotal: (formData as any).carteiraTotal ?? 0,
      previsaoMesAtual: (formData as any).previsaoMesAtual ?? 0,
      previsaoMesSeguinte: (formData as any).previsaoMesSeguinte ?? 0,
    };
    let newEntries: DailyEntry[];
    if (editingId) {
      newEntries = entries.map((e) => (e.date === editingId ? entry : e));
    } else {
      newEntries = [...entries.filter((e) => e.date !== entry.date), entry];
    }
    const sorted = newEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setEntries(sorted);
    resetForm();
  };

  const deleteData = (dateToDelete: string) => {
    if (confirm(`Deletar entrada de ${dateBr(dateToDelete)}?`)) {
      setEntries(entries.filter((e) => e.date !== dateToDelete));
    }
  };

  const Sparkline: React.FC<{ data: number[] }> = ({ data }) => {
    if (data.length === 0) {
      return <div className="h-6 bg-gray-200 rounded" />;
    }
    const maxV = Math.max(...data);
    const minV = Math.min(...data);
    const range = maxV - minV || 1;
    const width = 120;
    const height = 24;
    const points = data
      .map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - (height * (v - minV) / range);
        return `${x},${y}`;
      })
      .join(' ');
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-6 fill-none">
        <polyline
          points={points}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-80"
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-12">Diário</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {kpis.map((kpi) => {
            const value = currentEntry ? (currentEntry[kpi.key] ?? 0) : 0;
            const historyData = [...entries]
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((e) => (e[kpi.key] ?? 0) as number)
              .slice(-30);
            return (
              <div key={kpi.key} className={`p-6 rounded-2xl shadow-xl ${kpi.color} text-white`}>
                <h3 className="text-sm font-semibold uppercase tracking-wide opacity-90 mb-2">
                  {kpi.label}
                </h3>
                <p className="text-3xl lg:text-4xl font-bold mb-4">
                  {formatNumber(value)}
                </p>
                <Sparkline data={historyData} />
              </div>
            );
          })}
        </div>

        {/* Historical Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Histórico</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                  {kpis.map((kpi) => (
                    <th
                      key={kpi.key}
                      className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {kpi.label}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entries.map((e) => (
                  <tr key={e.date} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dateBr(e.date)}
                    </td>
                    {numFields.map((field) => (
                      <td key={field} className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right text-gray-900">
                        {formatNumber(e[field] as number)}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => handleEdit(e)}
                        className="text-blue-600 hover:text-blue-900 font-medium mr-4 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteData(e.date)}
                        className="text-red-600 hover:text-red-900 font-medium transition-colors"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={kpis.length + 2} className="px-6 py-12 text-center text-gray-500">
                      Nenhuma entrada registrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingId ? `Editar ${dateBr(editingId)}` : 'Nova Entrada'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-semibold text-gray-900 mb-2">
                  Data *
                </label>
                <input
                  id="date"
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={formData.date ? dateBr(formData.date) : ''}
                  onChange={handleDateChange}
                  placeholder="dd/mm/aaaa"
                  maxLength={10}
                />
              </div>
              {numFields.map((field) => {
                const kpi = kpis.find((k) => k.key === field);
                const label = kpi ? kpi.label : field;
                return (
                  <div key={field}>
                    <label htmlFor={field} className="block text-sm font-semibold text-gray-900 mb-2">
                      {label}
                    </label>
                    <input
                      id={field}
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={(formData[field as keyof DailyEntry] ?? 0).toString()}
                      onChange={handleNumChange(field)}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              >
                {editingId ? 'Atualizar' : 'Adicionar Hoje'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
              >
                Limpar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DiarioPage;
