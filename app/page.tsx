'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart, Bar } from 'recharts';

const FechamentoMensal: React.FC = () => {
  interface FormData {
    date: string;
    revenue: string;
    expenses: string;
  }

  interface HistoryEntry {
    id: string;
    date: string;
    revenue: number;
    expenses: number;
    balance: number;
  }

  const [form, setForm] = useState<FormData>({ date: '', revenue: '', expenses: '' });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load from localStorage
  useEffect(() => {
    try {
      const savedForm = localStorage.getItem('fechamentoMensalForm');
      if (savedForm) {
        setForm(JSON.parse(savedForm));
      }
      const savedHistory = localStorage.getItem('fechamentoMensalHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error('Load error:', e);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fechamentoMensalForm', JSON.stringify(form));
      localStorage.setItem('fechamentoMensalHistory', JSON.stringify(history));
    } catch (e) {
      console.error('Save error:', e);
    }
  }, [form, history]);

  const isBusinessDay = (dateString: string): boolean => {
    const date = new Date(dateString);
    const day = date.getDay();
    return day >= 1 && day <= 5; // Mon=1, Fri=5
  };

  const parseNumber = (value: string | number): number => {
    if (typeof value === 'number') return value;
    const num = parseFloat(value);
    return isNaN(num) ? NaN : num;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Date validation
    if (!form.date) {
      newErrors.date = 'Date is required';
    } else if (!isBusinessDay(form.date)) {
      newErrors.date = 'Must be a business day (Monday to Friday)';
    }

    // Numeric fields
    const numericFields: (keyof FormData)[] = ['revenue', 'expenses'];
    numericFields.forEach((field) => {
      const value = form[field];
      const numValue = parseNumber(value);
      if (isNaN(numValue)) {
        newErrors[field] = 'Must be a valid number';
      } else if (numValue < 0) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} cannot be negative`;
      }
    });

    // Balance
    const revenueNum = parseNumber(form.revenue);
    const expensesNum = parseNumber(form.expenses);
    if (!isNaN(revenueNum) && !isNaN(expensesNum)) {
      const balance = revenueNum - expensesNum;
      if (balance < 0) {
        newErrors.balance = 'Balance cannot be negative';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setForm({ ...form, [field]: value });
    // Clear specific error on change
    if (errors[field]) {
      setErrors({ ...errors });
      delete errors[field];
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      const revenueNum = parseNumber(form.revenue)!;
      const expensesNum = parseNumber(form.expenses)!;
      const balance = revenueNum - expensesNum;
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        date: form.date,
        revenue: revenueNum,
        expenses: expensesNum,
        balance,
      };
      setHistory((prev) => [entry, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      // Reset form
      setForm({ date: '', revenue: '', expenses: '' });
      setErrors({});
    }
  };

  const deleteEntry = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  // Chart data
  const lineData = history.map((h) => ({
    name: new Date(h.date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
    balance: h.balance,
    revenue: h.revenue,
  }));

  const barData = history.map((h) => ({
    name: new Date(h.date).toLocaleDateString('pt-BR', { month: 'short' }),
    revenue: h.revenue,
    expenses: h.expenses,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent text-center mb-12">
          Fechamento Mensal
        </h1>

        {/* Form and Charts Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Form Card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Novo Fechamento</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Data</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                />
                {errors.date && <p className="mt-1 text-sm text-red-400">{errors.date}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Receita (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.revenue}
                  onChange={(e) => handleInputChange('revenue', e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
                {errors.revenue && <p className="mt-1 text-sm text-red-400">{errors.revenue}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Despesas (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.expenses}
                  onChange={(e) => handleInputChange('expenses', e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
                {errors.expenses && <p className="mt-1 text-sm text-red-400">{errors.expenses}</p>}
              </div>
              {errors.balance && (
                <p className="text-sm text-red-400 p-3 bg-red-500/20 border border-red-400/50 rounded-xl">
                  {errors.balance}
                </p>
              )}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-white/20 backdrop-blur-sm"
              >
                Salvar Fechamento
              </button>
            </form>
          </div>

          {/* Charts */}
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-6 h-80">
              <h3 className="text-xl font-semibold text-white mb-4">Evolução do Saldo</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="#e2e8f0" />
                  <YAxis stroke="#e2e8f0" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-6 h-80">
              <h3 className="text-xl font-semibold text-white mb-4">Receita vs Despesas</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="#e2e8f0" />
                  <YAxis stroke="#e2e8f0" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-white">Histórico</h2>
            {history.length === 0 && <p className="text-gray-400">Nenhum registro ainda.</p>}
          </div>
          {history.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-4 text-gray-200 font-semibold">Data</th>
                    <th className="text-left p-4 text-gray-200 font-semibold">Receita</th>
                    <th className="text-left p-4 text-gray-200 font-semibold">Despesas</th>
                    <th className="text-left p-4 text-gray-200 font-semibold">Saldo</th>
                    <th className="text-left p-4 text-gray-200 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr key={entry.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white font-medium">{new Date(entry.date).toLocaleDateString('pt-BR')}</td>
                      <td className="p-4 text-green-400 font-semibold">R$ {entry.revenue.toFixed(2)}</td>
                      <td className="p-4 text-red-400 font-semibold">R$ {entry.expenses.toFixed(2)}</td>
                      <td className={`p-4 font-semibold ${entry.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>R$ {entry.balance.toFixed(2)}</td>
                      <td className="p-4">
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="px-4 py-2 bg-red-500/80 hover:bg-red-600 text-white text-xs rounded-lg transition-all duration-200"
                        >
                          Excluir
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
};

export default FechamentoMensal;
