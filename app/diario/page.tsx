'use client';

import { useState, useEffect } from 'react';

type DailyEntry = {
  date: string;
  faturamento: number;
  atrasos: number;
  vendas: number;
  carteiraTotal: number;
  previsaoMesAtual: number;
  previsaoMesSeguinte: number;
};

type KPICardProps = {
  title: string;
  value: number;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const dateBr = (isoDate: string): string => {
  const d = new Date(isoDate);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const KPICard: React.FC<KPICardProps> = ({ title, value }) => (
  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</h3>
    <p className="mt-1 text-3xl font-bold text-gray-900">{formatCurrency(value)}</p>
  </div>
);

export default function DiarioPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<DailyEntry | null>(null);
  const [formData, setFormData] = useState<Partial<DailyEntry>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dailyEntries');
      if (saved) {
        try {
          const parsed: DailyEntry[] = JSON.parse(saved).sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setEntries(parsed);
        } catch (e) {
          console.error('Error loading entries:', e);
        }
      }
    }
  }, []);

  // Update currentEntry when entries change
  useEffect(() => {
    if (entries.length > 0) {
      setCurrentEntry(entries[0]);
    } else {
      setCurrentEntry(null);
    }
  }, [entries]);

  // Persist to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dailyEntries', JSON.stringify(entries));
    }
  }, [entries]);

  const resetForm = () => {
    setFormData({});
    setEditingId(null);
  };

  const handleEdit = (entry: DailyEntry) => {
    setFormData(entry);
    setEditingId(entry.date);
  };

  const handleDelete = (date: string) => {
    if (confirm('Tem certeza que deseja deletar esta entrada?')) {
      setEntries((prev) => prev.filter((e) => e.date !== date));
      if (editingId === date) {
        resetForm();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.date) {
      alert('Data é obrigatória');
      return;
    }

    const entry: DailyEntry = {
      date: formData.date,
      faturamento: formData.faturamento ?? 0,
      atrasos: formData.atrasos ?? 0,
      vendas: formData.vendas ?? 0,
      carteiraTotal: formData.carteiraTotal ?? 0,
      previsaoMesAtual: formData.previsaoMesAtual ?? 0,
      previsaoMesSeguinte: formData.previsaoMesSeguinte ?? 0,
    };

    const existingIndex = entries.findIndex((e) => e.date === formData.date);
    let newEntries: DailyEntry[];
    if (existingIndex !== -1) {
      newEntries = [...entries];
      newEntries[existingIndex] = entry;
    } else {
      newEntries = [entry, ...entries];
    }
    setEntries(newEntries);
    resetForm();
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">Diário Financeiro</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-2xl font-semibold mb-6">Entrada Atual</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <KPICard title="Faturamento" value={currentEntry?.faturamento ?? 0} />
            <KPICard title="Atrasos" value={currentEntry?.atrasos ?? 0} />
            <KPICard title="Vendas" value={currentEntry?.vendas ?? 0} />
            <KPICard title="Carteira Total" value={currentEntry?.carteiraTotal ?? 0} />
            <KPICard title="Previsão Mês Atual" value={currentEntry?.previsaoMesAtual ?? 0} />
            <KPICard title="Previsão Mês Seguinte" value={currentEntry?.previsaoMesSeguinte ?? 0} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-semibold">
            {editingId ? 'Editar Entrada' : 'Nova Entrada'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data <span className="text-xs text-gray-500">(dd/mm/aaaa)</span>
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.date || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                required
              />
              {formData.date && (
                <p className="text-xs text-gray-500 mt-1">{dateBr(formData.date)}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Faturamento</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.faturamento?.toString() ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    faturamento: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Atrasos</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.atrasos?.toString() ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    atrasos: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendas</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.vendas?.toString() ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    vendas: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Carteira Total</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.carteiraTotal?.toString() ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    carteiraTotal: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Previsão Mês Atual</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.previsaoMesAtual?.toString() ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    previsaoMesAtual: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Previsão Mês Seguinte</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.previsaoMesSeguinte?.toString() ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    previsaoMesSeguinte: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {editingId ? 'Atualizar' : 'Salvar'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-6">Histórico</h2>
        {entries.length === 0 ? (
          <p className="text-gray-500 text-center py-12 text-lg">Nenhuma entrada cadastrada ainda.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faturamento</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atrasos</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendas</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carteira Total</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previsão Mês Atual</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previsão Mês Seguinte</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map((entry) => (
                  <tr key={entry.date} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dateBr(entry.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(entry.faturamento)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(entry.atrasos)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(entry.vendas)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(entry.carteiraTotal)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(entry.previsaoMesAtual)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(entry.previsaoMesSeguinte)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => handleEdit(entry)}
                        className="text-blue-600 hover:text-blue-900 mr-4 font-medium"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(entry.date)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Deletar
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
  );
}
