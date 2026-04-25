'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

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

function getPercentageChange(current: number, previous: number | undefined): { percentage: string; colorClass: string; arrow: string } {
  if (previous == null || previous === 0) {
    return { percentage: 'N/A', colorClass: 'text-gray-500', arrow: '' };
  }

  const changePercent = ((current - previous) / previous) * 100;
  const absPercent = Math.abs(changePercent);
  const percentage = `${changePercent >= 0 ? '+' : '-'}${absPercent.toFixed(1)}%`;
  const colorClass = changePercent >= 0 ? 'text-green-500' : 'text-red-500';
  const arrow = changePercent >= 0 ? '↑' : '↓';

  return { percentage, colorClass, arrow };
}

const kpiConfigs = [
  { key: 'faturamento' as NumericField, emoji: '💰', title: 'Faturamento' },
  { key: 'vendas' as NumericField, emoji: '📈', title: 'Vendas' },
  { key: 'atrasos' as NumericField, emoji: '⏰', title: 'Atrasos' },
  { key: 'carteiraTotal' as NumericField, emoji: '💼', title: 'Carteira Total' },
  { key: 'previsaoMesAtual' as NumericField, emoji: '🔮', title: 'Previsão Mês Atual' },
  { key: 'previsaoMesSeguinte' as NumericField, emoji: '📅', title: 'Previsão Mês Seguinte' },
] as Array<{ key: NumericField; emoji: string; title: string }>;

export default function DiarioPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const todayStr = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState<DailyEntry>({
    date: todayStr,
    faturamento: 0,
    atrasos: 0,
    vendas: 0,
    carteiraTotal: 0,
    previsaoMesAtual: 0,
    previsaoMesSeguinte: 0,
  });

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries]);

  const formatDate = (isoDate: string): string => {
    return new Date(isoDate).toLocaleDateString('pt-BR');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as keyof DailyEntry]: name === 'date' ? value : (Number(value) || 0),
    }));
  };

  const resetForm = useCallback(() => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      faturamento: 0,
      atrasos: 0,
      vendas: 0,
      carteiraTotal: 0,
      previsaoMesAtual: 0,
      previsaoMesSeguinte: 0,
    });
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.date) return;

    const newEntry: DailyEntry = {
      date: formData.date,
      faturamento: formData.faturamento,
      atrasos: formData.atrasos,
      vendas: formData.vendas,
      carteiraTotal: formData.carteiraTotal,
      previsaoMesAtual: formData.previsaoMesAtual,
      previsaoMesSeguinte: formData.previsaoMesSeguinte,
    };

    setEntries((prev) => {
      const index = prev.findIndex((entry) => entry.date === newEntry.date);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = newEntry;
        return updated;
      }
      return [...prev, newEntry];
    });

    resetForm();
  };

  const handleEdit = (entry: DailyEntry) => {
    setFormData(entry);
  };

  const deleteData = (date: string) => {
    if (confirm('Tem certeza que deseja deletar esta entrada?')) {
      setEntries((prev) => prev.filter((e) => e.date !== date));
      if (formData.date === date) {
        resetForm();
      }
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('dailyEntries');
    if (stored) {
      try {
        const parsed: DailyEntry[] = JSON.parse(stored);
        setEntries(parsed);
      } catch (error) {
        console.error('Erro ao carregar entradas:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyEntries', JSON.stringify(entries));
  }, [entries]);

  const isEditing = entries.some((e) => e.date === formData.date);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-slate-900 bg-clip-text text-transparent mb-16 text-center drop-shadow-2xl">
          Diário de Indicadores
        </h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {kpiConfigs.map((config) => {
            const key = config.key as keyof DailyEntry;
            const current = (sortedEntries[0]?.[key] as number) ?? 0;
            const previous = sortedEntries[1]?.[key] as number | undefined;
            const change = getPercentageChange(current, previous);

            return (
              <div
                key={config.key}
                className="group bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/50 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 hover:bg-white/90"
              >
                <div className="text-6xl mb-6 group-hover:scale-110 transition-all duration-300">
                  {config.emoji}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6 capitalize tracking-wide">
                  {config.title}
                </h3>
                <div className="text-5xl lg:text-6xl font-black text-gray-900 mb-8 drop-shadow-lg">
                  {current.toLocaleString('pt-BR')}
                </div>
                <div
                  className={`flex items-center justify-center gap-3 text-xl font-bold px-8 py-4 rounded-2xl backdrop-blur-sm shadow-xl transition-all duration-300 ${
                    change.colorClass === 'text-green-500'
                      ? 'bg-gradient-to-r from-green-100/80 to-emerald-100/80 border border-green-200 shadow-green-200/50'
                      : change.colorClass === 'text-red-500'
                      ? 'bg-gradient-to-r from-red-100/80 to-rose-100/80 border border-red-200 shadow-red-200/50'
                      : 'bg-gradient-to-r from-gray-100/80 to-gray-200/80 border border-gray-200 shadow-gray-200/50'
                  }`}
                >
                  <span className="text-3xl -mr-1">{change.arrow}</span>
                  <span>{change.percentage}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Form Section */}
        <section className="bg-white/60 backdrop-blur-xl shadow-2xl rounded-3xl p-12 mb-20 border border-white/50">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-12 text-center drop-shadow-lg">
            {isEditing ? 'Editar Entrada' : 'Nova Entrada'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div>
              <label htmlFor="date" className="block text-xl font-semibold text-gray-700 mb-4">
                Data
              </label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-6 py-5 text-xl border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="faturamento" className="block text-xl font-semibold text-gray-700 mb-4">
                Faturamento
              </label>
              <input
                id="faturamento"
                name="faturamento"
                type="number"
                step="0.01"
                value={formData.faturamento || ''}
                onChange={handleChange}
                className="w-full px-6 py-5 text-xl border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/50 focus:border-emerald-500 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="atrasos" className="block text-xl font-semibold text-gray-700 mb-4">
                Atrasos
              </label>
              <input
                id="atrasos"
                name="atrasos"
                type="number"
                value={formData.atrasos || ''}
                onChange={handleChange}
                className="w-full px-6 py-5 text-xl border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/50 focus:border-orange-500 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="vendas" className="block text-xl font-semibold text-gray-700 mb-4">
                Vendas
              </label>
              <input
                id="vendas"
                name="vendas"
                type="number"
                step="0.01"
                value={formData.vendas || ''}
                onChange={handleChange}
                className="w-full px-6 py-5 text-xl border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/50 focus:border-green-500 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="carteiraTotal" className="block text-xl font-semibold text-gray-700 mb-4">
                Carteira Total
              </label>
              <input
                id="carteiraTotal"
                name="carteiraTotal"
                type="number"
                step="0.01"
                value={formData.carteiraTotal || ''}
                onChange={handleChange}
                className="w-full px-6 py-5 text-xl border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="previsaoMesAtual" className="block text-xl font-semibold text-gray-700 mb-4">
                Previsão Mês Atual
              </label>
              <input
                id="previsaoMesAtual"
                name="previsaoMesAtual"
                type="number"
                step="0.01"
                value={formData.previsaoMesAtual || ''}
                onChange={handleChange}
                className="w-full px-6 py-5 text-xl border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/50 focus:border-indigo-500 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
                required
              />
            </div>
            <div className="lg:col-span-2 xl:col-span-3">
              <label htmlFor="previsaoMesSeguinte" className="block text-xl font-semibold text-gray-700 mb-4">
                Previsão Mês Seguinte
              </label>
              <input
                id="previsaoMesSeguinte"
                name="previsaoMesSeguinte"
                type="number"
                step="0.01"
                value={formData.previsaoMesSeguinte || ''}
                onChange={handleChange}
                className="w-full px-6 py-5 text-xl border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/50 focus:border-pink-500 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
                required
              />
            </div>
            <div className="col-span-full flex flex-col sm:flex-row gap-6 justify-end pt-8">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 sm:w-auto px-12 py-6 bg-gradient-to-r from-gray-400 to-gray-500 text-xl font-bold text-white rounded-3xl shadow-2xl hover:shadow-3xl hover:from-gray-500 hover:to-gray-600 active:scale-95 transition-all duration-300"
              >
                Resetar
              </button>
              <button
                type="submit"
                className="flex-1 sm:w-auto px-12 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-xl font-bold text-white rounded-3xl shadow-2xl hover:shadow-3xl hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all duration-300"
              >
                {isEditing ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        </section>

        {/* Historical List */}
        <section className="bg-white/60 backdrop-blur-xl shadow-2xl rounded-3xl p-12 border border-white/50">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-12 text-center drop-shadow-lg">
            Histórico de Entradas
          </h2>
          {sortedEntries.length === 0 ? (
            <div className="text-center py-20 text-2xl text-gray-500 font-medium">
              Nenhuma entrada registrada ainda. <br /> Adicione a primeira acima!
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full table-auto divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-8 py-6 text-left text-xl font-bold text-gray-800 rounded-tl-3xl">Data</th>
                    <th className="px-6 py-6 text-left text-xl font-bold text-gray-800">Faturamento</th>
                    <th className="px-6 py-6 text-left text-xl font-bold text-gray-800">Atrasos</th>
                    <th className="px-6 py-6 text-left text-xl font-bold text-gray-800">Vendas</th>
                    <th className="px-6 py-6 text-left text-xl font-bold text-gray-800">Carteira Total</th>
                    <th className="px-6 py-6 text-left text-xl font-bold text-gray-800">Previsão Atual</th>
                    <th className="px-6 py-6 text-left text-xl font-bold text-gray-800 rounded-tr-3xl">Previsão Seguinte</th>
                    <th className="px-6 py-6 text-center text-xl font-bold text-gray-800 rounded-tr-3xl">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white/50">
                  {sortedEntries.map((entry) => (
                    <tr
                      key={entry.date}
                      className="hover:bg-gray-50/60 transition-all duration-200"
                    >
                      <td className="px-8 py-6 font-bold text-lg text-gray-900">
                        {formatDate(entry.date)}
                      </td>
                      <td className="px-6 py-6 font-semibold text-gray-800">
                        {entry.faturamento.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-6 font-semibold text-gray-800">
                        {entry.atrasos.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-6 font-semibold text-gray-800">
                        {entry.vendas.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-6 font-semibold text-gray-800">
                        {entry.carteiraTotal.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-6 font-semibold text-gray-800">
                        {entry.previsaoMesAtual.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-6 font-semibold text-gray-800">
                        {entry.previsaoMesSeguinte.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex gap-4 justify-center">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 whitespace-nowrap"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => deleteData(entry.date)}
                            className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 whitespace-nowrap"
                          >
                            Deletar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
