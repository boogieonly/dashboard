'use client';

import React, { useState, useEffect } from 'react';

type DailyEntry = {
  date: string;
  faturamento: number;
  atrasos: number;
  vendas: number;
  carteiraTotal: number;
  previsaoMesAtual: number;
  previsaoMesSeguinte: number;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const sortByDateDesc = (a: DailyEntry, b: DailyEntry): number => {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
};

export default function DiarioPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<DailyEntry | null>(null);
  const [formData, setFormData] = useState<DailyEntry>({
    date: '',
    faturamento: 0,
    atrasos: 0,
    vendas: 0,
    carteiraTotal: 0,
    previsaoMesAtual: 0,
    previsaoMesSeguinte: 0,
  });
  const [editingDate, setEditingDate] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('dailyEntries');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyEntries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = entries.find((e: DailyEntry) => e.date === today);
    const sortedEntries = [...entries].sort(sortByDateDesc);
    setCurrentEntry(todayEntry || sortedEntries[0] || null);
  }, [entries]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as keyof DailyEntry]: name === 'date' ? value : Number(value) || 0,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const data: DailyEntry = { ...formData };
    if (editingDate) {
      setEntries((prev) => prev.map((entry) => (entry.date === editingDate ? data : entry)));
      setEditingDate(null);
    } else {
      setEntries((prev) => [...prev, data]);
    }
    resetForm();
  };

  const resetForm = (): void => {
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
    setEditingDate(null);
  };

  const handleEdit = (entry: DailyEntry): void => {
    setFormData(entry);
    setEditingDate(entry.date);
  };

  const deleteData = (date: string): void => {
    if (confirm('Tem certeza que deseja deletar esta entrada?')) {
      setEntries((prev) => prev.filter((e) => e.date !== date));
    }
  };

  const sortedEntries = [...entries].sort(sortByDateDesc);
  const recentEntries = sortedEntries.slice(0, 7);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Diário Financeiro
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Registre e acompanhe suas métricas diárias de faturamento, vendas e previsões.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/50 hover:shadow-2xl transition-all duration-300">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Faturamento</h3>
            <p className="text-3xl font-bold text-gray-900">
              R$ {(currentEntry?.faturamento ?? 0).toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/50 hover:shadow-2xl transition-all duration-300">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Atrasos</h3>
            <p className="text-3xl font-bold text-gray-900">
              R$ {(currentEntry?.atrasos ?? 0).toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/50 hover:shadow-2xl transition-all duration-300">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Vendas</h3>
            <p className="text-3xl font-bold text-gray-900">
              R$ {(currentEntry?.vendas ?? 0).toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/50 hover:shadow-2xl transition-all duration-300">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Carteira Total</h3>
            <p className="text-3xl font-bold text-gray-900">
              R$ {(currentEntry?.carteiraTotal ?? 0).toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/50 hover:shadow-2xl transition-all duration-300">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Previsão Mês Atual</h3>
            <p className="text-3xl font-bold text-gray-900">
              R$ {(currentEntry?.previsaoMesAtual ?? 0).toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/50 hover:shadow-2xl transition-all duration-300">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Previsão Mês Seguinte</h3>
            <p className="text-3xl font-bold text-gray-900">
              R$ {(currentEntry?.previsaoMesSeguinte ?? 0).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 mb-12 border border-white/50">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Nova Entrada</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Faturamento</label>
              <input
                type="number"
                name="faturamento"
                value={formData.faturamento}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Atrasos</label>
              <input
                type="number"
                name="atrasos"
                value={formData.atrasos}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendas</label>
              <input
                type="number"
                name="vendas"
                value={formData.vendas}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Carteira Total</label>
              <input
                type="number"
                name="carteiraTotal"
                value={formData.carteiraTotal}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Previsão Mês Atual</label>
              <input
                type="number"
                name="previsaoMesAtual"
                value={formData.previsaoMesAtual}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Previsão Mês Seguinte</label>
              <input
                type="number"
                name="previsaoMesSeguinte"
                value={formData.previsaoMesSeguinte}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex gap-4 pt-2">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 focus:ring-4 focus:ring-blue-200"
              >
                {editingDate ? 'Atualizar' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-500/80 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:bg-gray-600/80 transition-all duration-200 focus:ring-4 focus:ring-gray-200"
              >
                Limpar
              </button>
            </div>
          </form>
        </div>

        {/* Historical Table */}
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-white/50 overflow-hidden">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Últimas 7 Entradas</h2>
          {recentEntries.length === 0 ? (
            <p className="text-center text-gray-500 py-12 text-lg">Nenhuma entrada registrada ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Faturamento</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Atrasos</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Vendas</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Carteira</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Prev. Atual</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Prev. Próx.</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentEntries.map((entry) => (
                    <tr key={entry.date} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatDate(entry.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {entry.faturamento.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {entry.atrasos.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {entry.vendas.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {entry.carteiraTotal.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {entry.previsaoMesAtual.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {entry.previsaoMesSeguinte.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="text-blue-600 hover:text-blue-900 font-medium px-2 py-1 rounded transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteData(entry.date)}
                          className="text-red-600 hover:text-red-900 font-medium px-2 py-1 rounded transition-colors"
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
    </div>
  );
}
