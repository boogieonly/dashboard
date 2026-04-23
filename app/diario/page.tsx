'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';

type Transaction = {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  region: string;
  product: string;
  quantity: number;
  unitPrice: number;
  total: number;
  seller: string;
  createdAt: string;
};

type FormData = {
  description: string;
  region: string;
  product: string;
  quantity: number;
  unitPrice: number;
  seller: string;
};

type DailyData = {
  date: string;
  value: number;
};

type ProductData = {
  product: string;
  value: number;
};

const regions = ['SP', 'MG', 'RJ', 'BA', 'RS'] as const;
const products = ['Aço Inox', 'Cobre', 'Latão', 'Alumínio', 'Ligas Especiais'] as const;

const STORAGE_KEY = 'dailyTransactions';

const DiarioPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [formData, setFormData] = useState<FormData>({
    description: '',
    region: 'SP',
    product: 'Aço Inox',
    quantity: 0,
    unitPrice: 0,
    seller: '',
  });
  const [message, setMessage] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const itemsPerPage = 10;

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTransactions(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions]);

  const selectedDateTransactions = useMemo(() =>
    transactions.filter((t) => t.date === selectedDate),
    [transactions, selectedDate]
  );

  const todayFormatted = new Date(selectedDate).toLocaleDateString('pt-BR');

  // KPIs for selected date
  const kpis = useMemo(() => {
    const data = selectedDateTransactions;
    const totalWeight = data.reduce((sum, t) => sum + t.quantity, 0);
    const totalValue = data.reduce((sum, t) => sum + t.total, 0);
    const totalSales = data.length;
    const avgTicket = totalSales > 0 ? totalValue / totalSales : 0;
    const bestProduct = data.reduce((best, t) =>
      t.total > (best.total || 0) ? t : best
    );

    return {
      totalWeight: totalWeight.toFixed(2),
      totalValue: totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      totalSales,
      avgTicket: avgTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      bestProduct: bestProduct.product || 'Nenhum',
    };
  }, [selectedDateTransactions]);

  // Last 7 days data
  const last7Days = useMemo(() => {
    const today = new Date();
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return dates.map((date): DailyData => {
      const dayData = transactions.filter((t) => t.date === date);
      const value = dayData.reduce((sum, t) => sum + t.total, 0);
      return {
        date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        value,
      };
    });
  }, [transactions]);

  // Top 5 products last 7 days
  const top5Products = useMemo(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const productTotals = transactions
      .filter((t) => new Date(t.date) >= sevenDaysAgo)
      .reduce((acc: Record<string, number>, t) => {
        acc[t.product] = (acc[t.product] || 0) + t.total;
        return acc;
      }, {});

    return Object.entries(productTotals)
      .map(([product, value]): ProductData => ({ product, value: value as number }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [transactions]);

  // Last 30 days transactions for table
  const last30Transactions = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    return transactions
      .filter((t) => new Date(t.date) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions]);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return last30Transactions.slice(start, start + itemsPerPage);
  }, [last30Transactions, currentPage]);

  const totalPages = Math.ceil(last30Transactions.length / itemsPerPage);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('quantity') || name.includes('unitPrice') ? Number(value) || 0 : value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.description.trim() || !formData.seller.trim()) {
      setMessage('❌ Descrição e Vendedor são obrigatórios!');
      return false;
    }
    if (formData.quantity <= 0 || formData.unitPrice <= 0) {
      setMessage('❌ Quantidade e Valor Unitário devem ser positivos!');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    const total = formData.quantity * formData.unitPrice;
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: selectedDate,
      ...formData,
      total,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    setFormData({
      description: '',
      region: 'SP',
      product: 'Aço Inox',
      quantity: 0,
      unitPrice: 0,
      seller: '',
    });
    setMessage('✅ Venda registrada com sucesso!');
    setTimeout(() => setMessage(''), 3000);
    setLoading(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('❓ Confirmar exclusão desta venda?')) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setMessage('🗑️ Venda excluída!');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const exportCSV = useCallback((txns: Transaction[], filename: string) => {
    if (txns.length === 0) {
      setMessage('❌ Sem dados para exportar!');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    const headers = 'Data,Descrição,Região,Produto,Quantidade(kg),Valor Unit.(R$),Total(R$),Vendedor\n';
    const csv = headers + txns
      .map(
        (t) =>
          `${t.date},${t.description},${t.region},${t.product},${t.quantity},${t.unitPrice.toFixed(2)},${t.total.toFixed(2)},${t.seller}`
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    setMessage('📥 CSV exportado!');
    setTimeout(() => setMessage(''), 2000);
  }, []);

  const handleExportDay = () => exportCSV(selectedDateTransactions, `vendas_${selectedDate}.csv`);
  const handleExport30Days = () => exportCSV(last30Transactions, 'vendas_ultimos30dias.csv');

  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4 md:p-6 lg:p-8 text-white">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Fechamento Diário
        </h1>
        <p className="text-xl md:text-2xl opacity-90">Registre e acompanhe as vendas do dia</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300"
          />
          <p className="text-2xl font-semibold">📅 {todayFormatted}</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="fixed top-4 right-4 z-50 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl px-6 py-4 shadow-2xl animate-pulse">
          {message}
        </div>
      )}

      {/* Form */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              name="description"
              placeholder="Descrição"
              value={formData.description}
              onChange={handleInputChange}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300"
              required
            />
            <select
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300"
            >
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <select
              name="product"
              value={formData.product}
              onChange={handleInputChange}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300"
            >
              {products.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <input
              name="quantity"
              type="number"
              placeholder="Quantidade (kg)"
              value={formData.quantity}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300"
              required
            />
            <input
              name="unitPrice"
              type="number"
              placeholder="Valor Unit. (R$)"
              value={formData.unitPrice}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300"
              required
            />
            <input
              name="seller"
              placeholder="Vendedor"
              value={formData.seller}
              onChange={handleInputChange}
              className="md:col-span-2 lg:col-span-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 lg:col-span-1 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 hover:scale-105 rounded-xl px-8 py-3 font-bold shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-400/50"
            >
              {loading ? 'Salvando...' : '✅ Registrar Venda'}
            </button>
          </form>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 max-w-7xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 hover:scale-105 hover:bg-white/15 shadow-2xl transition-all duration-300 cursor-default">
          <p className="text-blue-300 text-sm opacity-80">📦 Peso Registrado Hoje</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">{kpis.totalWeight} kg</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 hover:scale-105 hover:bg-white/15 shadow-2xl transition-all duration-300 cursor-default">
          <p className="text-emerald-300 text-sm opacity-80">💰 Valor Registrado Hoje</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">{kpis.totalValue}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 hover:scale-105 hover:bg-white/15 shadow-2xl transition-all duration-300 cursor-default">
          <p className="text-purple-300 text-sm opacity-80">📋 Total de Vendas Hoje</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">{kpis.totalSales}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 hover:scale-105 hover:bg-white/15 shadow-2xl transition-all duration-300 cursor-default">
          <p className="text-pink-300 text-sm opacity-80">💳 Ticket Médio Hoje</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">{kpis.avgTicket}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 hover:scale-105 hover:bg-white/15 shadow-2xl transition-all duration-300 cursor-default">
          <p className="text-yellow-300 text-sm opacity-80">⭐ Melhor Produto Hoje</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">{kpis.bestProduct}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 max-w-7xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 h-[350px]">
          <h3 className="text-2xl font-bold mb-4 text-center">📈 Receita Últimos 7 Dias</h3>
          {last7Days.some((d) => d.value > 0) ? (
            <div className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="white/20" />
                  <XAxis dataKey="date" stroke="white" />
                  <YAxis stroke="white" tickFormatter={(v) => `R$ ${v.toLocaleString()}`} />
                  <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Receita']} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="url(#lineGradient)"
                    strokeWidth={3}
                    dot={{ fill: 'white', strokeWidth: 2 }}
                  />
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xl opacity-50">📊 Sem dados para exibir</div>
          )}
        </div>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 h-[350px]">
          <h3 className="text-2xl font-bold mb-4 text-center">📊 Top 5 Materiais (Últimos 7 Dias)</h3>
          {top5Products.some((p) => p.value > 0) ? (
            <div className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top5Products}>
                  <CartesianGrid strokeDasharray="3 3" stroke="white/20" />
                  <XAxis dataKey="product" stroke="white" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="white" tickFormatter={(v) => `R$ ${v.toLocaleString()}`} />
                  <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Valor']} />
                  <Bar dataKey="value" fill="url(#barGradient)" />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A855F7" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xl opacity-50">📊 Sem dados para exibir</div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <button
          onClick={handleExportDay}
          disabled={selectedDateTransactions.length === 0}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 rounded-xl font-bold shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-400/50"
        >
          📥 Exportar CSV do Dia ({selectedDateTransactions.length})
        </button>
        <button
          onClick={handleExport30Days}
          disabled={last30Transactions.length === 0}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 rounded-xl font-bold shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-400/50"
        >
          📊 Exportar Últimos 30 Dias ({last30Transactions.length})
        </button>
      </div>

      {/* Table */}
      {last30Transactions.length > 0 && (
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 overflow-x-auto">
            <h3 className="text-3xl font-bold mb-6 text-center">📋 Histórico Últimos 30 Dias</h3>
            <table className="w-full text-left text-sm md:text-base">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="p-4">Data</th>
                  <th className="p-4">Descrição</th>
                  <th className="p-4">Região</th>
                  <th className="p-4">Produto</th>
                  <th className="p-4">Qtd (kg)</th>
                  <th className="p-4">Valor Unit.</th>
                  <th className="p-4">Total (R$)</th>
                  <th className="p-4">Vendedor</th>
                  <th className="p-4">Ação</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((t) => (
                  <tr
                    key={t.id}
                    className={`hover:bg-white/15 transition-all duration-300 border-b border-white/10 ${
                      t.date === selectedDate
                        ? 'bg-white/20 border-blue-400/50'
                        : ''
                    }`}
                  >
                    <td className="p-4 font-semibold">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4">{t.description}</td>
                    <td className="p-4">{t.region}</td>
                    <td className="p-4">{t.product}</td>
                    <td className="p-4">{t.quantity.toFixed(2)}</td>
                    <td className="p-4">R$ {t.unitPrice.toFixed(2)}</td>
                    <td className="p-4 font-bold text-emerald-400">R$ {t.total.toFixed(2)}</td>
                    <td className="p-4">{t.seller}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-2xl hover:scale-125 hover:text-red-400 transition-all duration-300"
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="px-6 py-2 bg-white/20 rounded-xl hover:bg-white/30 disabled:opacity-50 transition-all duration-300"
                >
                  ← Anterior
                </button>
                <span>
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="px-6 py-2 bg-white/20 rounded-xl hover:bg-white/30 disabled:opacity-50 transition-all duration-300"
                >
                  Próxima →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {last30Transactions.length === 0 && (
        <div className="text-center py-20 opacity-50">
          📭 Nenhum registro nos últimos 30 dias. Registre a primeira venda!
        </div>
      )}
    </div>
  );
};

export default DiarioPage;
