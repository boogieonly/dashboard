'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type FormDataType = {
  produto: string;
  regiao: string;
  vendedor: string;
  material: string;
  volume: string;
  valor: string;
};

type Sale = {
  id: string;
  date: string;
  produto: string;
  regiao: string;
  vendedor: string;
  material: string;
  volume: number;
  valor: number;
};

const glassInput = "w-full p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 text-lg shadow-xl";
const glassCard = "bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300";
const glassTable = "bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden";

const KpiCard = ({
  title,
  value,
  gradientClass,
  icon
}: {
  title: string;
  value: string;
  gradientClass: string;
  icon: string;
}) => (
  <div className={`${glassCard} text-center group hover:scale-[1.02]`}>
    <span className="text-4xl mb-4 block select-none">{icon}</span>
    <h3 className={`text-3xl font-black ${gradientClass} bg-gradient-to-r bg-clip-text text-transparent mb-2 drop-shadow-lg`}>
      {value}
    </h3>
    <p className="text-gray-400 text-sm uppercase tracking-wide font-medium">
      {title}
    </p>
  </div>
);

const LineChart = ({ data }: { data: { date: string; valor: number }[] }) => {
  if (data.length === 0) return <div className="h-64 flex items-center justify-center text-gray-400">Sem dados</div>;

  const maxVal = Math.max(...data.map((d) => d.valor));
  const step = 400 / (data.length - 1);
  const points = data
    .map((d, i) => {
      const x = i * step;
      const y = 200 - (d.valor / maxVal) * 180;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="h-64 flex flex-col">
      <svg viewBox="0 0 400 200" className="flex-1 w-full">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(34, 211, 238, 0.4)" />
            <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
          </linearGradient>
        </defs>
        <path
          d={`M 0 200 L ${points} L 400 200 Z`}
          fill="url(#lineGrad)"
          stroke="#22d3ee"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((d, i) => {
          const x = i * step;
          const y = 200 - (d.valor / maxVal) * 180;
          return (
            <circle key={i} cx={x} cy={y} r="5" fill="#22d3ee" stroke="white" strokeWidth="1" />
          );
        })}
      </svg>
      <div className="grid grid-cols-7 gap-1 px-4 py-2 text-xs text-gray-400 font-mono">
        {data.map((d) => (
          <span key={d.date}>{d.date.slice(5, 10)}</span>
        ))}
      </div>
    </div>
  );
};

const BarChart = ({ data }: { data: { material: string; volume: number }[] }) => {
  if (data.length === 0) return <div className="h-64 flex items-center justify-center text-gray-400">Sem dados</div>;

  const maxVol = Math.max(...data.map((d) => d.volume));

  return (
    <div className="h-64 flex flex-col">
      <div className="flex-1 flex gap-3 p-6">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full bg-gradient-to-t from-orange-400 via-amber-400 to-orange-500 rounded-2xl shadow-lg transition-all duration-500 origin-bottom"
              style={{ height: `${Math.max((d.volume / maxVol) * 180, 10)}px` }}
            />
            <span className="text-xs text-gray-300 font-mono text-center min-h-[2rem] flex items-center">
              {d.material.length > 12 ? d.material.slice(0, 12) + '...' : d.material}
            </span>
            <span className="text-xs text-orange-400 font-bold">
              {d.volume.toFixed(1)}kg
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DiarioPage() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [formData, setFormData] = useState<FormDataType>({
    produto: '',
    regiao: '',
    vendedor: '',
    material: '',
    volume: '0',
    valor: '0',
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [feedback, setFeedback] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dailySales');
      if (stored) {
        setSales(JSON.parse(stored));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dailySales', JSON.stringify(sales));
    }
  }, [sales]);

  const dailySales = sales.filter((s) => s.date === selectedDate);
  const totalValor = dailySales.reduce((sum, s) => sum + s.valor, 0);
  const totalVolume = dailySales.reduce((sum, s) => sum + s.volume, 0);
  const qtd = dailySales.length;
  const ticketMedio = qtd > 0 ? totalValor / qtd : 0;
  const maiorVenda = Math.max(...dailySales.map((s) => s.valor), 0);

  const today = new Date();
  const last7Days: { date: string; valor: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayTotal = sales.filter((s) => s.date === dateStr).reduce((sum, s) => sum + s.valor, 0);
    last7Days.push({ date: dateStr, valor: dayTotal });
  }

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSales = sales.filter((s) => new Date(s.date) >= thirtyDaysAgo);
  const matVolumes: Record<string, number> = {};
  recentSales.forEach((s) => {
    matVolumes[s.material] = (matVolumes[s.material] || 0) + s.volume;
  });
  const topMats = Object.entries(matVolumes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([material, volume]) => ({ material, volume }));

  const tableSales = sales
    .filter((s) => new Date(s.date) >= thirtyDaysAgo)
    .sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortDir === 'desc' ? timeB - timeA : timeA - timeB;
    });
  const pageSize = 10;
  const totalPages = Math.ceil(tableSales.length / pageSize);
  const paginatedSales = tableSales.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numVolume = Number(formData.volume);
    const numValor = Number(formData.valor);
    const required = ['produto', 'regiao', 'vendedor', 'material'];
    if (
      required.some((f) => !formData[f].trim()) ||
      numVolume <= 0 ||
      numValor <= 0 ||
      isNaN(numVolume) ||
      isNaN(numValor)
    ) {
      setFeedback('Preencha todos os campos obrigatórios corretamente (valores > 0).');
      setTimeout(() => setFeedback(''), 5000);
      return;
    }

    const newSale: Sale = {
      id: crypto.randomUUID(),
      date: selectedDate,
      produto: formData.produto.trim(),
      regiao: formData.regiao.trim(),
      vendedor: formData.vendedor.trim(),
      material: formData.material.trim(),
      volume: numVolume,
      valor: numValor,
    };
    setSales((prev) => [...prev, newSale]);
    setFormData({ produto: '', regiao: '', vendedor: '', material: '', volume: '0', valor: '0' });
    setFeedback('Venda registrada com sucesso!');
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Confirma a exclusão desta venda?')) return;
    setSales((prev) => prev.filter((s) => s.id !== id));
    if (currentPage > Math.ceil((tableSales.length - 1) / pageSize)) {
      setCurrentPage(Math.max(1, totalPages - 1));
    }
    setFeedback('Venda deletada com sucesso!');
    setTimeout(() => setFeedback(''), 3000);
  };

  const toggleSort = () => {
    setSortDir((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    setCurrentPage(1);
  };

  const exportCSV = () => {
    const headers = ['Data', 'Produto', 'Região', 'Vendedor', 'Material', 'Volume (kg)', 'Valor (R$)'];
    const csvContent = [
      headers.join(','),
      ...tableSales.map(
        (s) =>
          [
            s.date,
            s.produto,
            s.regiao,
            s.vendedor,
            s.material,
            s.volume.toFixed(2),
            s.valor.toFixed(2),
          ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vendas_ultimos_30_dias_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900/30 to-gray-900 p-4 sm:p-8 lg:p-12 text-gray-100 overflow-x-hidden">
      {/* Header */}
      <div className="text-center mb-12 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent mb-6 drop-shadow-2xl leading-tight">
          Fechamento Diário
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-300/90 max-w-2xl mx-auto leading-relaxed backdrop-blur-sm">
          Registre e Acompanhe as Vendas do Dia
        </p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`mx-auto mb-8 max-w-2xl p-6 rounded-3xl text-white font-semibold shadow-2xl transform transition-all duration-300 ${
            feedback.includes('sucesso') || feedback.includes('registrada') || feedback.includes('deletada')
              ? 'bg-emerald-500/20 border-2 border-emerald-400/40'
              : 'bg-red-500/20 border-2 border-red-400/40'
          }`}
        >
          {feedback}
        </div>
      )}

      {/* Date Selector + Form + KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* Form */}
        <div className={`${glassCard} col-span-1`}>
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
            Registrar Nova Venda
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2 ml-1">Data *</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={glassInput}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 ml-1">Produto *</label>
              <input
                name="produto"
                placeholder="Nome do produto"
                value={formData.produto}
                onChange={handleFormChange}
                className={glassInput}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 ml-1">Região *</label>
              <input
                name="regiao"
                placeholder="Região de venda"
                value={formData.regiao}
                onChange={handleFormChange}
                className={glassInput}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 ml-1">Vendedor *</label>
              <input
                name="vendedor"
                placeholder="Nome do vendedor"
                value={formData.vendedor}
                onChange={handleFormChange}
                className={glassInput}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 ml-1">Material *</label>
              <input
                name="material"
                placeholder="Tipo de material"
                value={formData.material}
                onChange={handleFormChange}
                className={glassInput}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 ml-1">Volume (kg) *</label>
              <input
                name="volume"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={formData.volume}
                onChange={handleFormChange}
                className={glassInput}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 ml-1">Valor (R$) *</label>
              <input
                name="valor"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={formData.valor}
                onChange={handleFormChange}
                className={glassInput}
                required
              />
            </div>
            <button
              type="submit"
              className="md:col-span-2 mt-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-400 hover:via-blue-400 hover:to-indigo-400 text-white font-bold py-4 px-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 text-xl backdrop-blur-sm border border-cyan-400/30 hover:scale-[1.02]"
            >
              Registrar Venda
            </button>
          </form>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 col-span-1 lg:col-span-1">
          <KpiCard
            title="Total de Vendas"
            value={`R$ ${totalValor.toLocaleString('pt-BR')}`}
            gradientClass="from-cyan-400 to-blue-500"
            icon="💰"
          />
          <KpiCard
            title="Volume Total"
            value={`${totalVolume.toFixed(1)} kg`}
            gradientClass="from-emerald-400 to-teal-500"
            icon="📦"
          />
          <KpiCard
            title="Quantidade"
            value={qtd.toString()}
            gradientClass="from-orange-400 to-amber-500"
            icon="🛒"
          />
          <KpiCard
            title="Ticket Médio"
            value={`R$ ${ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            gradientClass="from-violet-400 to-purple-500"
            icon="💳"
          />
          <KpiCard
            title="Maior Venda"
            value={`R$ ${maiorVenda.toLocaleString('pt-BR')}`}
            gradientClass="from-rose-400 to-pink-500"
            icon="🏆"
          />
        </div>
      </div>

      {/* Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <div className={`${glassCard}`}>
          <h3 className="text-2xl font-bold mb-6 text-cyan-400 drop-shadow-lg">Últimas 7 Dias - Total Vendas (R$)</h3>
          <LineChart data={last7Days} />
        </div>
        <div className={`${glassCard}`}>
          <h3 className="text-2xl font-bold mb-6 text-orange-400 drop-shadow-lg">Top 5 Materiais - Volume (kg)</h3>
          <BarChart data={topMats} />
        </div>
      </div>

      {/* Table */}
      <div className="mb-12">
        <div className={`${glassTable} max-h-[600px] overflow-auto`}>
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-white/10">
                <th
                  className="sticky top-0 z-20 bg-white/20 backdrop-blur-xl px-6 py-4 text-left font-bold text-gray-100 cursor-pointer hover:bg-white/30 transition-all pr-2"
                  onClick={toggleSort}
                >
                  Data {sortDir === 'desc' ? '↓' : '↑'}
                </th>
                <th className="sticky top-0 z-10 bg-white/20 backdrop-blur-xl px-6 py-4 text-left font-bold text-gray-100">Produto</th>
                <th className="sticky top-0 z-10 bg-white/20 backdrop-blur-xl px-6 py-4 text-left font-bold text-gray-100">Região</th>
                <th className="sticky top-0 z-10 bg-white/20 backdrop-blur-xl px-6 py-4 text-left font-bold text-gray-100">Vendedor</th>
                <th className="sticky top-0 z-10 bg-white/20 backdrop-blur-xl px-6 py-4 text-left font-bold text-gray-100">Material</th>
                <th className="sticky top-0 z-10 bg-white/20 backdrop-blur-xl px-6 py-4 text-left font-bold text-gray-100">Volume (kg)</th>
                <th className="sticky top-0 z-10 bg-white/20 backdrop-blur-xl px-6 py-4 text-left font-bold text-gray-100">Valor (R$)</th>
                <th className="sticky top-0 z-10 bg-white/20 backdrop-blur-xl px-6 py-4 text-left font-bold text-gray-100 w-32">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSales.map((sale) => (
                <tr key={sale.id} className="border-b border-white/5 hover:bg-white/10 transition-all">
                  <td className="px-6 py-4 font-medium text-gray-200">
                    {new Date(sale.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-gray-300 max-w-[12rem] truncate">{sale.produto}</td>
                  <td className="px-6 py-4 text-gray-300">{sale.regiao}</td>
                  <td className="px-6 py-4 text-gray-300">{sale.vendedor}</td>
                  <td className="px-6 py-4 text-gray-300">{sale.material}</td>
                  <td className="px-6 py-4 text-emerald-400 font-mono">{sale.volume.toFixed(2)}</td>
                  <td className="px-6 py-4 text-cyan-400 font-mono">R$ {sale.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(sale.id)}
                      className="bg-red-500/90 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm border border-red-400/30"
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedSales.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 font-medium">
                    Nenhuma venda nos últimos 30 dias.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-gray-300 hover:bg-white/20 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all disabled:hover:bg-transparent"
            >
              Anterior
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const pageNum = currentPage > 3 ? currentPage - 3 + i : i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    currentPage === pageNum
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-xl'
                      : 'bg-white/10 backdrop-blur-xl border border-white/20 text-gray-300 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-gray-300 hover:bg-white/20 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all disabled:hover:bg-transparent"
            >
              Próxima
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-6 justify-center pt-12 pb-12">
        <button
          onClick={exportCSV}
          className="flex-1 max-w-sm bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold py-4 px-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 text-lg backdrop-blur-sm border border-emerald-400/30 hover:scale-[1.02]"
        >
          📊 Exportar Últimas 30 Dias (CSV)
        </button>
        <button
          onClick={() => router.back()}
          className="flex-1 max-w-sm bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-500 hover:to-gray-600 text-white font-bold py-4 px-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg backdrop-blur-sm border border-slate-400/30 hover:scale-[1.02]"
        >
          ← Voltar para Visão Geral
        </button>
      </div>
    </div>
  );
}
