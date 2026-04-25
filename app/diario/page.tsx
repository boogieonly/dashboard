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

type SparklineProps = {
  data: number[];
  color?: string;
  height?: number;
};

const Sparkline: React.FC<SparklineProps> = ({ data, color = 'currentColor', height = 20 }) => {
  if (data.length === 0) {
    return (
      <svg viewBox={`0 0 100 ${height}`} className="w-full h-auto">
        <rect width="100" height={height} rx={height / 2} fill="hsl(210 20% 90%)" />
      </svg>
    );
  }

  const maxV = Math.max(...data);
  const minV = Math.min(...data);
  const range = maxV - minV || 1;
  const padding = 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 98 + 1;
    const y = height - padding - ((v - minV) / range) * (height - 2 * padding);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full h-auto">
      <polyline
        points={points}
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <line
        x1="1"
        y1={height - 1}
        x2="99"
        y2={height - 1}
        stroke={color}
        strokeWidth="0.5"
        opacity="0.3"
      />
    </svg>
  );
};

const DiarioPage = () => {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<DailyEntry>>({});

  useEffect(() => {
    const saved = localStorage.getItem('diarioEntries');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('diarioEntries', JSON.stringify(entries));
  }, [entries]);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const currentDay = now.getDate();
  const daysPassed = currentDay;
  const daysRemaining = daysInMonth - currentDay;
  const monthPercent = Math.round((daysPassed / daysInMonth) * 100);

  const monthlyEntries = entries.filter((e) => e.date.startsWith(currentMonthStr));
  const monthlyCount = monthlyEntries.length;

  const totalFaturamento = monthlyEntries.reduce((sum, e) => sum + e.faturamento, 0);
  const totalVendas = monthlyEntries.reduce((sum, e) => sum + e.vendas, 0);
  const totalCarteira = monthlyEntries.reduce((sum, e) => sum + e.carteiraTotal, 0);
  const totalAtrasos = monthlyEntries.reduce((sum, e) => sum + e.atrasos, 0);

  const avgFaturamento = monthlyCount > 0 ? totalFaturamento / monthlyCount : 0;
  const avgVendas = monthlyCount > 0 ? totalVendas / monthlyCount : 0;
  const avgCarteira = monthlyCount > 0 ? totalCarteira / monthlyCount : 0;
  const avgAtrasos = monthlyCount > 0 ? totalAtrasos / monthlyCount : 0;

  const sortedMonthly = monthlyEntries.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const cumulativeFaturamento: number[] = [];
  let cum = 0;
  sortedMonthly.forEach((e) => {
    cum += e.faturamento;
    cumulativeFaturamento.push(cum);
  });

  const sortedEntries = entries.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const recent = sortedEntries.slice(0, 30);
  const faturamentoSpark = recent.map((e) => e.faturamento);
  const atrasosSpark = recent.map((e) => -e.atrasos); // Lógica inversa para atrasos
  const vendasSpark = recent.map((e) => e.vendas);
  const carteiraSpark = recent.map((e) => e.carteiraTotal);
  const previsaoAtualSpark = recent.map((e) => e.previsaoMesAtual);
  const previsaoSeguinteSpark = recent.map((e) => e.previsaoMesSeguinte);

  const latestEntry = sortedEntries[0];

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const handleInputChange =
    (field: keyof DailyEntry) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === 'date'
          ? e.target.value
          : Number(e.target.value) || 0;
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const resetForm = () => {
    setFormData({});
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date) return;

    const entry: DailyEntry = {
      date: formData.date,
      faturamento: Number(formData.faturamento ?? 0),
      atrasos: Number(formData.atrasos ?? 0),
      vendas: Number(formData.vendas ?? 0),
      carteiraTotal: Number(formData.carteiraTotal ?? 0),
      previsaoMesAtual: Number(formData.previsaoMesAtual ?? 0),
      previsaoMesSeguinte: Number(formData.previsaoMesSeguinte ?? 0),
    };

    if (editingId) {
      setEntries(entries.map((e) => (e.date === editingId ? entry : e)));
    } else {
      setEntries([entry, ...entries]);
    }
    resetForm();
  };

  const handleEdit = (date: string) => {
    const entry = entries.find((e) => e.date === date);
    if (entry) {
      setFormData(entry);
      setEditingId(date);
    }
  };

  const deleteData = (date: string) => {
    if (confirm('Tem certeza que deseja deletar esta entrada?')) {
      setEntries(entries.filter((e) => e.date !== date));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-12 text-center">
          Diário Financeiro 📊
        </h1>

        {/* RESUMO MENSAL */}
        <section className="bg-white/70 backdrop-blur-2xl shadow-2xl border border-white/50 rounded-3xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 flex items-center gap-3">
            📊 Resumo Mensal
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-gradient-to-br from-emerald-400 to-green-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="text-sm font-medium opacity-90">Total Faturamento</div>
              <div className="text-2xl md:text-3xl font-black mt-1">
                {totalFaturamento.toLocaleString('pt-BR')}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-cyan-500 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="text-sm font-medium opacity-90">Total Vendas</div>
              <div className="text-2xl md:text-3xl font-black mt-1">
                {totalVendas.toLocaleString('pt-BR')}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-400 to-pink-500 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="text-sm font-medium opacity-90">Total Carteira</div>
              <div className="text-2xl md:text-3xl font-black mt-1">
                {totalCarteira.toLocaleString('pt-BR')}
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-400 to-red-500 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="text-sm font-medium opacity-90">Total Atrasos</div>
              <div className="text-2xl md:text-3xl font-black mt-1">
                {totalAtrasos.toLocaleString('pt-BR')}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border-2 border-emerald-200 p-6 rounded-2xl backdrop-blur-sm">
              <div className="text-sm font-medium text-emerald-800">Média Diária Faturamento</div>
              <div className="text-2xl md:text-3xl font-black text-emerald-900 mt-1">
                {avgFaturamento.toLocaleString('pt-BR')}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-200 p-6 rounded-2xl backdrop-blur-sm">
              <div className="text-sm font-medium text-blue-800">Média Diária Vendas</div>
              <div className="text-2xl md:text-3xl font-black text-blue-900 mt-1">
                {avgVendas.toLocaleString('pt-BR')}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-200 p-6 rounded-2xl backdrop-blur-sm">
              <div className="text-sm font-medium text-purple-800">Média Diária Carteira</div>
              <div className="text-2xl md:text-3xl font-black text-purple-900 mt-1">
                {avgCarteira.toLocaleString('pt-BR')}
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-200 p-6 rounded-2xl backdrop-blur-sm">
              <div className="text-sm font-medium text-orange-800">Média Diária Atrasos</div>
              <div className="text-2xl md:text-3xl font-black text-orange-900 mt-1">
                {avgAtrasos.toLocaleString('pt-BR')}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-8 rounded-3xl shadow-2xl border border-white/30">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
              <div className="text-2xl font-bold">
                Mês: <span className="text-3xl">{daysPassed}/{daysInMonth}</span> dias
                <br />
                <span>({monthPercent}% completo)</span>
              </div>
              <div className="text-2xl font-bold text-yellow-200">
                {daysRemaining} dias restantes
              </div>
            </div>
            <Sparkline data={cumulativeFaturamento} color="#ffffff" height={40} />
          </div>
        </section>

        {/* Form */}
        <section className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-12 mb-12 border border-white/50">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            {editingId ? 'Editar Entrada' : 'Nova Entrada Diária'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
              <input
                type="date"
                value={formData.date || ''}
                onChange={handleInputChange('date')}
                className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Faturamento</label>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                value={formData.faturamento?.toString() || ''}
                onChange={handleInputChange('faturamento')}
                className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Atrasos</label>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                value={formData.atrasos?.toString() || ''}
                onChange={handleInputChange('atrasos')}
                className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendas</label>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                value={formData.vendas?.toString() || ''}
                onChange={handleInputChange('vendas')}
                className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Carteira Total</label>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                value={formData.carteiraTotal?.toString() || ''}
                onChange={handleInputChange('carteiraTotal')}
                className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Previsão Mês Atual</label>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                value={formData.previsaoMesAtual?.toString() || ''}
                onChange={handleInputChange('previsaoMesAtual')}
                className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Previsão Mês Seguinte</label>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                value={formData.previsaoMesSeguinte?.toString() || ''}
                onChange={handleInputChange('previsaoMesSeguinte')}
                className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 text-lg"
              />
            </div>
          </form>
          <div className="flex flex-col sm:flex-row gap-4 mt-10 pt-8 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 focus:ring-4 focus:ring-blue-500"
            >
              {editingId ? 'Atualizar' : 'Adicionar'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 focus:ring-4 focus:ring-gray-500"
            >
              Cancelar
            </button>
          </div>
        </section>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <div className="group bg-gradient-to-b from-yellow-400 via-orange-400 to-red-500 text-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 backdrop-blur-sm border border-white/30">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">💰</span>
              <div>
                <div className="font-bold text-xl group-hover:scale-110 transition-transform">Faturamento</div>
                <div className="text-sm opacity-90">Atual</div>
              </div>
            </div>
            <div className="text-4xl md:text-5xl font-black mb-6">
              {latestEntry?.faturamento?.toLocaleString('pt-BR') || '0'}
            </div>
            <Sparkline data={faturamentoSpark} color="rgba(255,255,255,0.9)" height={28} />
          </div>
          <div className="group bg-gradient-to-b from-green-400 via-emerald-400 to-teal-500 text-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 backdrop-blur-sm border border-white/30">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📈</span>
              <div>
                <div className="font-bold text-xl group-hover:scale-110 transition-transform">Vendas</div>
                <div className="text-sm opacity-90">Atual</div>
              </div>
            </div>
            <div className="text-4xl md:text-5xl font-black mb-6">
              {latestEntry?.vendas?.toLocaleString('pt-BR') || '0'}
            </div>
            <Sparkline data={vendasSpark} color="rgba(255,255,255,0.9)" height={28} />
          </div>
          <div className="group bg-gradient-to-b from-orange-400 via-amber-400 to-yellow-500 text-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 backdrop-blur-sm border border-white/30">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">⏰</span>
              <div>
                <div className="font-bold text-xl group-hover:scale-110 transition-transform">Atrasos</div>
                <div className="text-sm opacity-90">Atual</div>
              </div>
            </div>
            <div className="text-4xl md:text-5xl font-black mb-6">
              {latestEntry?.atrasos?.toLocaleString('pt-BR') || '0'}
            </div>
            <Sparkline data={atrasosSpark} color="rgba(255,255,255,0.9)" height={28} />
          </div>
          <div className="group bg-gradient-to-b from-purple-400 via-violet-400 to-indigo-500 text-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 backdrop-blur-sm border border-white/30">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">💼</span>
              <div>
                <div className="font-bold text-xl group-hover:scale-110 transition-transform">Carteira Total</div>
                <div className="text-sm opacity-90">Atual</div>
              </div>
            </div>
            <div className="text-4xl md:text-5xl font-black mb-6">
              {latestEntry?.carteiraTotal?.toLocaleString('pt-BR') || '0'}
            </div>
            <Sparkline data={carteiraSpark} color="rgba(255,255,255,0.9)" height={28} />
          </div>
          <div className="group bg-gradient-to-b from-indigo-400 via-blue-400 to-cyan-500 text-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 backdrop-blur-sm border border-white/30">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🔮</span>
              <div>
                <div className="font-bold text-xl group-hover:scale-110 transition-transform">Previsão Mês Atual</div>
                <div className="text-sm opacity-90">Atual</div>
              </div>
            </div>
            <div className="text-4xl md:text-5xl font-black mb-6">
              {latestEntry?.previsaoMesAtual?.toLocaleString('pt-BR') || '0'}
            </div>
            <Sparkline data={previsaoAtualSpark} color="rgba(255,255,255,0.9)" height={28} />
          </div>
          <div className="group bg-gradient-to-b from-pink-400 via-rose-400 to-fuchsia-500 text-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 backdrop-blur-sm border border-white/30">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📅</span>
              <div>
                <div className="font-bold text-xl group-hover:scale-110 transition-transform">Previsão Mês Seguinte</div>
                <div className="text-sm opacity-90">Atual</div>
              </div>
            </div>
            <div className="text-4xl md:text-5xl font-black mb-6">
              {latestEntry?.previsaoMesSeguinte?.toLocaleString('pt-BR') || '0'}
            </div>
            <Sparkline data={previsaoSeguinteSpark} color="rgba(255,255,255,0.9)" height={28} />
          </div>
        </section>

        {/* Lista de Entradas */}
        <section className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-12 border border-white/50 overflow-hidden">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Histórico de Entradas</h2>
          {entries.length === 0 ? (
            <div className="text-center py-20 text-gray-500 text-xl">Nenhuma entrada registrada. Adicione a primeira! 🎉</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm md:text-base">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <th className="p-4 text-left font-bold text-gray-800">Data</th>
                    <th className="p-4 text-right font-bold text-gray-800">Fat.</th>
                    <th className="p-4 text-right font-bold text-gray-800">Atrasos</th>
                    <th className="p-4 text-right font-bold text-gray-800">Vendas</th>
                    <th className="p-4 text-right font-bold text-gray-800">Carteira</th>
                    <th className="p-4 text-right font-bold text-gray-800">Prev. Atual</th>
                    <th className="p-4 text-right font-bold text-gray-800">Prev. Próx.</th>
                    <th className="p-4 text-center font-bold text-gray-800">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEntries.map((entry) => (
                    <tr
                      key={entry.date}
                      className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <td className="p-4 font-semibold text-gray-900">{formatDate(entry.date)}</td>
                      <td className="p-4 text-right font-mono text-emerald-700 font-bold">
                        {entry.faturamento.toLocaleString('pt-BR')}
                      </td>
                      <td className="p-4 text-right font-mono text-orange-600 font-semibold">
                        {entry.atrasos.toLocaleString('pt-BR')}
                      </td>
                      <td className="p-4 text-right font-mono text-blue-700 font-bold">
                        {entry.vendas.toLocaleString('pt-BR')}
                      </td>
                      <td className="p-4 text-right font-mono text-purple-700 font-bold">
                        {entry.carteiraTotal.toLocaleString('pt-BR')}
                      </td>
                      <td className="p-4 text-right font-mono text-indigo-700">
                        {entry.previsaoMesAtual.toLocaleString('pt-BR')}
                      </td>
                      <td className="p-4 text-right font-mono text-pink-700">
                        {entry.previsaoMesSeguinte.toLocaleString('pt-BR')}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(entry.date)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => deleteData(entry.date)}
                            className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-200"
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
};

export default DiarioPage;
