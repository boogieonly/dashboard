'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

type Seller = 'João' | 'Maria' | 'Pedro' | 'Ana' | 'Carlos';
type Region = 'SP' | 'RJ' | 'MG' | 'RS' | 'BA';

const sellers: Seller[] = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos'];
const regions: Region[] = ['SP', 'RJ', 'MG', 'RS', 'BA'];

const monthNames: Record<string, string> = {
  '01': 'Janeiro',
  '02': 'Fevereiro',
  '03': 'Março',
  '04': 'Abril',
  '05': 'Maio',
  '06': 'Junho',
  '07': 'Julho',
  '08': 'Agosto',
  '09': 'Setembro',
  '10': 'Outubro',
  '11': 'Novembro',
  '12': 'Dezembro',
};

const years = [2023, 2024, 2025];

interface Sale {
  id: string;
  date: string;
  value: number;
  seller: Seller;
  region: Region;
}

export default function VisaoMensal() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [currentMonth, setCurrentMonth] = useState<string>('');
  const [view, setView] = useState<'sellers' | 'regions'>('sellers');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Sale>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const generateData = useCallback((month: string): Sale[] => {
    const [yearStr, monthStr] = month.split('-');
    const year = Number(yearStr);
    const mon = Number(monthStr);
    const daysInMonth = new Date(year, mon, 0).getDate();
    const data: Sale[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${monthStr}-${String(day).padStart(2, '0')}`;
      const salesPerDay = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < salesPerDay; i++) {
        data.push({
          id: crypto.randomUUID(),
          date: dateStr,
          value: Math.floor(Math.random() * 900) + 100,
          seller: sellers[Math.floor(Math.random() * sellers.length)]!,
          region: regions[Math.floor(Math.random() * regions.length)]!,
        });
      }
    }
    return data;
  }, []);

  // Load data from localStorage
  useEffect(() => {
    const loadSales = () => {
      try {
        const stored = localStorage.getItem('salesData');
        if (stored) {
          const parsedSales = JSON.parse(stored) as Sale[];
          setSales(parsedSales);
          return;
        }
        // Generate initial demo data
        const initialData = generateData(currentMonth);
        setSales(initialData);
      } catch (error) {
        console.error('Error loading sales:', error);
        setSales([]);
      }
    };
    loadSales();
  }, [generateData, currentMonth]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('salesData', JSON.stringify(sales));
  }, [sales]);

  // Filter sales by current month
  useEffect(() => {
    const filtered = sales.filter((sale) => sale.date.startsWith(currentMonth));
    setFilteredSales(filtered);
    setCurrentPage(1);
  }, [sales, currentMonth]);

  const dailyData = useMemo(() => {
    const monthData: Record<string, number> = {};
    filteredSales.forEach((sale) => {
      const day = sale.date.slice(-2);
      monthData[day] = (monthData[day] || 0) + sale.value;
    });
    const [yearStr, monthStr] = currentMonth.split('-');
    const year = Number(yearStr);
    const mon = Number(monthStr);
    const daysInMonth = new Date(year, mon, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = String(index + 1).padStart(2, '0');
      return {
        day,
        value: monthData[day] || 0,
      };
    });
  }, [filteredSales, currentMonth]);

  const chartData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    filteredSales.forEach((sale) => {
      const key = view === 'sellers' ? sale.seller : sale.region;
      dataMap[key] = (dataMap[key] || 0) + sale.value;
    });
    return Object.entries(dataMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value: Number(value) }));
  }, [filteredSales, view]);

  const totalPages = useMemo(
    () => Math.ceil(filteredSales.length / pageSize),
    [filteredSales.length, pageSize]
  );

  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredSales.slice(startIndex, startIndex + pageSize);
  }, [filteredSales, currentPage, pageSize]);

  const onEdit = useCallback((sale: Sale) => {
    setFormData(sale);
    setEditingId(sale.id);
    setIsModalOpen(true);
  }, []);

  const onDelete = useCallback((id: string) => {
    if (confirm('Tem certeza que deseja excluir esta venda?')) {
      setSales((prev) => prev.filter((s) => s.id !== id));
    }
  }, []);

  const onSave = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (
        !formData.date ||
        formData.value === undefined ||
        !formData.seller ||
        !formData.region
      ) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      if (editingId) {
        setSales((prev) =>
          prev.map((s) => (s.id === editingId ? { ...s, ...formData } : s))
        );
      } else {
        const newSale: Sale = {
          id: crypto.randomUUID(),
          ...((formData as Sale)),
        };
        setSales((prev) => [...prev, newSale]);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({});
    },
    [formData, editingId]
  );

  const exportCSV = useCallback(() => {
    const headers = 'Data,Valor,Vendedor,Região\n';
    const csvContent =
      headers +
      filteredSales
        .map((sale) => `${sale.date},${sale.value},${sale.seller},${sale.region}`)
        .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vendas_${currentMonth}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredSales, currentMonth]);

  // Initialize currentMonth
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    setCurrentMonth(`${year}-${month}`);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-black bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent text-center mb-12 drop-shadow-2xl">
          Visão Mensal de Vendas
        </h1>

        {/* Header Controls */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-center justify-between mb-8">
            <div className="flex gap-4 items-center flex-wrap">
              <label className="text-white/90 font-semibold text-lg whitespace-nowrap">Selecione o Mês:</label>
              <select
                value={currentMonth.split('-')[1]}
                onChange={(e) => setCurrentMonth(`${currentMonth.split('-')[0]}-${e.target.value}`)}
                className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl px-6 py-3 text-white font-medium focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 min-w-[140px]"
              >
                {Object.entries(monthNames).map(([val, name]) => (
                  <option key={val} value={val}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                value={currentMonth.split('-')[0]}
                onChange={(e) => setCurrentMonth(`${e.target.value}-${currentMonth.split('-')[1]}`)}
                className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl px-6 py-3 text-white font-medium focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                {years.map((y) => (
                  <option key={y} value={y.toString()}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-4 flex-wrap items-center justify-center">
              <button
                onClick={() => {
                  const newData = generateData(currentMonth);
                  setSales((prev) => [...prev, ...newData]);
                }}
                className="px-8 py-3 bg-emerald-500/90 hover:bg-emerald-400 backdrop-blur-xl border border-emerald-300/50 rounded-3xl text-white font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Gerar Dados Demo
              </button>
              <button
                onClick={exportCSV}
                className="px-8 py-3 bg-blue-500/90 hover:bg-blue-400 backdrop-blur-xl border border-blue-300/50 rounded-3xl text-white font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Exportar CSV
              </button>
              <button
                onClick={() => {
                  setFormData({});
                  setEditingId(null);
                  setIsModalOpen(true);
                }}
                className="px-8 py-3 bg-purple-500/90 hover:bg-purple-400 backdrop-blur-xl border border-purple-300/50 rounded-3xl text-white font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
              >
                + Nova Venda
              </button>
            </div>
          </div>
          <div className="flex gap-4 justify-center lg:justify-start">
            <button
              onClick={() => setView('sellers')}
              className={`px-8 py-3 rounded-3xl font-semibold transition-all duration-300 border-2 ${
                view === 'sellers'
                  ? 'bg-white/30 border-white/50 shadow-xl shadow-blue-500/25'
                  : 'bg-white/10 border-white/30 hover:bg-white/20 hover:border-white/50'
              } text-white`}
            >
              Top Vendedores
            </button>
            <button
              onClick={() => setView('regions')}
              className={`px-8 py-3 rounded-3xl font-semibold transition-all duration-300 border-2 ${
                view === 'regions'
                  ? 'bg-white/30 border-white/50 shadow-xl shadow-red-500/25'
                  : 'bg-white/10 border-white/30 hover:bg-white/20 hover:border-white/50'
              } text-white`}
            >
              Top Regiões
            </button>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
            <h2 className="text-3xl font-bold text-white mb-8 text-center drop-shadow-lg">📈 Vendas Diárias</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="5 5" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="rgba(255,255,255,0.8)"
                  tick={{ fill: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 500 }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.8)"
                  tick={{ fill: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 500 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                  }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Vendas']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={4}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
            <h2 className="text-3xl font-bold text-white mb-8 text-center drop-shadow-lg">
              🏆 Top {view === 'sellers' ? 'Vendedores' : 'Regiões'}
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="5 5" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.8)"
                  tick={{ fill: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 500 }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.8)"
                  tick={{ fill: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 500 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                  }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Total']}
                />
                <Bar
                  dataKey="value"
                  fill={view === 'sellers' ? '#3b82f6' : '#ef4444'}
                  rx={8}
                  ry={8}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Paginated Table */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <h2 className="text-3xl font-bold text-white drop-shadow-lg">📋 Histórico de Vendas ({filteredSales.length} registros)</h2>
            <div className="text-xl text-white/80 font-medium">Página {currentPage} de {totalPages}</div>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-white">
              <thead>
                <tr className="bg-white/5 backdrop-blur-md border-b-2 border-white/20">
                  <th className="p-6 text-left font-bold text-lg">Data</th>
                  <th className="p-6 text-left font-bold text-lg">Valor</th>
                  <th className="p-6 text-left font-bold text-lg">Vendedor</th>
                  <th className="p-6 text-left font-bold text-lg">Região</th>
                  <th className="p-6 text-left font-bold text-lg">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="hover:bg-white/10 transition-all duration-200 border-b border-white/10 last:border-b-0"
                  >
                    <td className="p-6 font-semibold">{new Date(sale.date).toLocaleDateString('pt-BR')}</td>
                    <td className="p-6 font-mono text-2xl font-bold text-emerald-300">
                      R$ {sale.value.toLocaleString('pt-BR')}
                    </td>
                    <td className="p-6 font-semibold">{sale.seller}</td>
                    <td className="p-6">
                      <span className="px-4 py-2 bg-blue-500/30 border border-blue-400/50 rounded-2xl font-medium">
                        {sale.region}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(sale)}
                          className="px-5 py-2 bg-blue-500/80 hover:bg-blue-400 backdrop-blur-md border border-blue-400/50 rounded-2xl text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onDelete(sale.id)}
                          className="px-5 py-2 bg-red-500/80 hover:bg-red-400 backdrop-blur-md border border-red-400/50 rounded-2xl text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedSales.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-white/70 font-medium text-xl">
                      Nenhum registro para este mês. Gere dados demo ou adicione vendas!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-12 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/20">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-8 py-3 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md border border-white/30 rounded-2xl text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 disabled:transform-none"
              >
                ← Anterior
              </button>
              <div className="flex gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i));
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 border-2 ${
                        currentPage === pageNum
                          ? 'bg-white/40 border-white/60 shadow-2xl shadow-blue-500/30 text-blue-900'
                          : 'bg-white/10 border-white/30 hover:bg-white/25 hover:border-white/50 shadow-lg hover:shadow-xl'
                      } text-white`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-8 py-3 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md border border-white/30 rounded-2xl text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 disabled:transform-none"
              >
                Próxima →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
              setEditingId(null);
              setFormData({});
            }
          }}
        >
          <div className="bg-white/20 backdrop-blur-3xl border border-white/30 rounded-3xl p-10 w-full max-w-lg shadow-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-4xl font-black text-white mb-10 text-center bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-2xl">
              {editingId ? '✏️ Editar Venda' : '➕ Nova Venda'}
            </h3>
            <form onSubmit={onSave} className="space-y-8">
              <div>
                <label className="block text-white/95 font-bold mb-4 text-lg">📅 Data</label>
                <input
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/30 backdrop-blur-xl border border-white/40 rounded-3xl px-6 py-5 text-xl text-white placeholder-gray-200 font-semibold focus:outline-none focus:ring-4 focus:ring-blue-400/60 focus:border-transparent shadow-xl hover:shadow-2xl transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-white/95 font-bold mb-4 text-lg">💰 Valor (R$)</label>
                <input
                  type="number"
                  value={formData.value || ''}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) || 0 })}
                  required
                  min={1}
                  step={0.01}
                  className="w-full bg-white/30 backdrop-blur-xl border border-white/40 rounded-3xl px-6 py-5 text-xl text-white placeholder-gray-200 font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-400/60 focus:border-transparent shadow-xl hover:shadow-2xl transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-white/95 font-bold mb-4 text-lg">👤 Vendedor</label>
                <select
                  value={formData.seller || ''}
                  onChange={(e) => setFormData({ ...formData, seller: e.target.value as Seller })}
                  required
                  className="w-full bg-white/30 backdrop-blur-xl border border-white/40 rounded-3xl px-6 py-5 text-xl text-white font-semibold focus:outline-none focus:ring-4 focus:ring-purple-400/60 focus:border-transparent shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <option value="">Selecione um vendedor...</option>
                  {sellers.map((seller) => (
                    <option key={seller} value={seller}>
                      {seller}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/95 font-bold mb-4 text-lg">📍 Região</label>
                <select
                  value={formData.region || ''}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value as Region })}
                  required
                  className="w-full bg-white/30 backdrop-blur-xl border border-white/40 rounded-3xl px-6 py-5 text-xl text-white font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-400/60 focus:border-transparent shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <option value="">Selecione uma região...</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-6 pt-8">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                    setFormData({});
                  }}
                  className="flex-1 px-12 py-6 bg-gray-500/80 hover:bg-gray-400 backdrop-blur-xl border border-gray-400/50 rounded-3xl text-white font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-12 py-6 bg-gradient-to-r from-emerald-500 to-teal-500/90 hover:from-emerald-400 hover:to-teal-400 backdrop-blur-xl border border-emerald-400/50 rounded-3xl text-white font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {editingId ? 'Atualizar Venda' : 'Criar Venda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
