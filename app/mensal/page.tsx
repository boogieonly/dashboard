'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Sale = {
  id: string;
  date: string; // YYYY-MM
  value: number;
  product: string;
};

type FormData = {
  date: string;
  value: string;
  product: string;
};

export default function MensalPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [formData, setFormData] = useState<FormData>({ date: '', value: '', product: '' });
  const [darkMode, setDarkMode] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mensalSales');
      if (saved) {
        setSales(JSON.parse(saved));
      }
      // Dark mode from localStorage or default
      const savedDark = localStorage.getItem('darkMode');
      if (savedDark) {
        setDarkMode(JSON.parse(savedDark));
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mensalSales', JSON.stringify(sales));
    }
  }, [sales]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
      document.documentElement.classList.toggle('dark', darkMode);
    }
  }, [darkMode]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newSaleData = {
      ...formData,
      id: crypto.randomUUID(), // Spread first, then override id to ensure unique new ID
      value: parseFloat(formData.value) || 0,
    };
    setSales([...sales, newSaleData as Sale]);
    setFormData({ date: '', value: '', product: '' });
  };

  const handleDelete = (id: string) => {
    setSales(sales.filter((sale) => sale.id !== id));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // KPIs
  const totalSales = sales.reduce((sum, sale) => sum + sale.value, 0);
  const numSales = sales.length;
  const avgSales = numSales > 0 ? totalSales / numSales : 0;
  const maxSale = Math.max(...sales.map((s) => s.value), 0);

  // Chart data: aggregate by month
  const monthlyData = sales.reduce((acc: Record<string, number>, sale) => {
    acc[sale.date] = (acc[sale.date] || 0) + sale.value;
    return acc;
  }, {});
  const chartData = Object.entries(monthlyData)
    .map(([month, value]) => ({ month, value: Number(value) }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const glassStyle = "backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/20 hover:shadow-3xl transition-all duration-300";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-8 font-sans">
      <div className="max-w-7xl mx-auto relative">
        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`${glassStyle} absolute top-4 right-4 text-white text-sm px-4 py-2 rounded-xl`}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        <h1 className="text-5xl md:text-6xl font-bold text-white/90 mb-12 drop-shadow-2xl text-center">
          Vendas Mensais
        </h1>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className={`${glassStyle} text-center text-white`}>
            <h3 className="text-2xl font-semibold opacity-90">Total Vendas</h3>
            <p className="text-4xl font-bold mt-2">R$ {totalSales.toLocaleString()}</p>
          </div>
          <div className={`${glassStyle} text-center text-white`}>
            <h3 className="text-2xl font-semibold opacity-90">Nº Vendas</h3>
            <p className="text-4xl font-bold mt-2">{numSales}</p>
          </div>
          <div className={`${glassStyle} text-center text-white`}>
            <h3 className="text-2xl font-semibold opacity-90">Média</h3>
            <p className="text-4xl font-bold mt-2">R$ {avgSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className={`${glassStyle} text-center text-white`}>
            <h3 className="text-2xl font-semibold opacity-90">Maior Venda</h3>
            <p className="text-4xl font-bold mt-2">R$ {maxSale.toLocaleString()}</p>
          </div>
        </div>

        {/* Add Sale Form */}
        <form onSubmit={handleSubmit} className={`${glassStyle} mb-12 max-w-2xl mx-auto`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input
              name="date"
              type="month"
              value={formData.date}
              onChange={handleInputChange}
              className={`${glassStyle.replace('p-8', 'p-4')} text-white placeholder-white/70 border-0 focus:ring-2 focus:ring-white/50`}
              placeholder="Data (YYYY-MM)"
              required
            />
            <input
              name="value"
              type="number"
              step="0.01"
              value={formData.value}
              onChange={handleInputChange}
              className={`${glassStyle.replace('p-8', 'p-4')} text-white placeholder-white/70 border-0 focus:ring-2 focus:ring-white/50`}
              placeholder="Valor"
              required
            />
            <input
              name="product"
              value={formData.product}
              onChange={handleInputChange}
              className={`${glassStyle.replace('p-8', 'p-4')} text-white placeholder-white/70 border-0 focus:ring-2 focus:ring-white/50`}
              placeholder="Produto"
            />
          </div>
          <button
            type="submit"
            className={`${glassStyle} w-full text-xl font-bold bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white py-4 rounded-2xl transition-all`}
          >
            Adicionar Venda
          </button>
        </form>

        {/* Chart */}
        <div className={`${glassStyle} mb-12`}>
          <h2 className="text-3xl font-bold text-white mb-6 drop-shadow-lg">Gráfico Mensal</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="white/20" />
              <XAxis dataKey="month" stroke="white/80" />
              <YAxis stroke="white/80" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} />
              <Line type="monotone" dataKey="value" stroke="#a78bfa" strokeWidth={3} dot={{ fill: '#a78bfa', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sales Table */}
        <div className={`${glassStyle} overflow-x-auto`}>
          <h2 className="text-3xl font-bold text-white mb-6 drop-shadow-lg">Tabela de Vendas</h2>
          {sales.length === 0 ? (
            <p className="text-white/70 text-center py-12 text-xl">Nenhuma venda registrada. Adicione a primeira!</p>
          ) : (
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="p-4 text-left font-semibold">ID</th>
                  <th className="p-4 text-left font-semibold">Data</th>
                  <th className="p-4 text-left font-semibold">Valor</th>
                  <th className="p-4 text-left font-semibold">Produto</th>
                  <th className="p-4 text-left font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sales
                  .sort((a, b) => new Date(b.date + '-01').getTime() - new Date(a.date + '-01').getTime())
                  .map((sale) => (
                    <tr key={sale.id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                      <td className="p-4 font-mono text-sm opacity-90">{sale.id.slice(0, 8)}...</td>
                      <td className="p-4">{sale.date}</td>
                      <td className="p-4 font-bold text-lg">R$ {sale.value.toLocaleString()}</td>
                      <td className="p-4">{sale.product || '-'}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDelete(sale.id)}
                          className="bg-red-500/80 hover:bg-red-600/90 text-white px-6 py-2 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                        >
                          Deletar
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
