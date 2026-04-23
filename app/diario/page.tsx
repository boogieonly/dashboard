'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import * as XLSX from 'xlsx';

type Entry = {
  id: string;
  date: string;
  material: string;
  quantity: number;
  notes: string;
};

type FormData = {
  date: string;
  material: string;
  quantity: string;
  notes: string;
};

const VisaoDiario: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [formData, setFormData] = useState<FormData>({
    date: '',
    material: '',
    quantity: '',
    notes: '',
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('diarioEntries');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('diarioEntries', JSON.stringify(entries));
  }, [entries]);

  // Reset pagination on entries change
  useEffect(() => {
    setCurrentPage(1);
  }, [entries]);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.date || !formData.material || !formData.quantity || parseFloat(formData.quantity) <= 0) {
      alert('Por favor, preencha todos os campos corretamente. Quantidade deve ser maior que 0.');
      return;
    }
    const newEntry: Entry = {
      id: crypto.randomUUID(),
      date: formData.date,
      material: formData.material,
      quantity: parseFloat(formData.quantity),
      notes: formData.notes,
    };
    setEntries((prev) => [newEntry, ...prev]);
    setFormData({ date: '', material: '', quantity: '', notes: '' });
  }, [formData]);

  const handleDelete = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleExport = useCallback(() => {
    const ws = XLSX.utils.json_to_sheet(entries);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Diario');
    XLSX.writeFile(wb, 'diario.xlsx');
  }, [entries]);

  const last7DaysData = useMemo(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const filtered = entries.filter((e) => {
      const entryDate = new Date(e.date);
      return entryDate >= sevenDaysAgo && entryDate <= today;
    });
    const data: { date: string; quantity: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const sum = filtered
        .filter((e) => e.date === dateStr)
        .reduce((acc, e) => acc + e.quantity, 0);
      data.unshift({ date: dateStr, quantity: sum });
    }
    return data;
  }, [entries]);

  const topMaterialsData = useMemo(() => {
    const grouped = entries.reduce((acc: Record<string, number>, e) => {
      acc[e.material] = (acc[e.material] || 0) + e.quantity;
      return acc;
    }, {});
    return Object.entries(grouped)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([material, quantity]) => ({ material, quantity }));
  }, [entries]);

  const last30DaysEntries = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    return entries
      .filter((e) => new Date(e.date) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries]);

  const entriesPerPage = 10;
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentEntries = last30DaysEntries.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(last30DaysEntries.length / entriesPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/30 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
          Diário de Materiais
        </h1>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 mb-8 shadow-2xl shadow-purple-500/25">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                required
              />
              <input
                type="text"
                placeholder="Material"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                required
              />
              <input
                type="number"
                placeholder="Quantidade"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                min="0"
                step="0.01"
                required
              />
              <input
                type="text"
                placeholder="Notas (opcional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="submit"
                className="flex-1 sm:flex-none bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-400"
              >
                Adicionar Entrada
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-400"
              >
                Exportar XLSX
              </button>
            </div>
          </form>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl shadow-purple-500/25">
            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Últimos 7 Dias
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={last7DaysData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Line type="monotone" dataKey="quantity" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl shadow-pink-500/25">
            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
              Top 5 Materiais
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topMaterialsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="material" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Bar dataKey="quantity" fill="#EC4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl shadow-indigo-500/25">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Histórico (Últimos 30 Dias)
            </h2>
            <div className="text-lg text-gray-300 font-semibold">
              {last30DaysEntries.length} entradas
            </div>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/20 bg-white/5 backdrop-blur-sm">
                  <th className="p-6 font-bold text-lg">Data</th>
                  <th className="p-6 font-bold text-lg">Material</th>
                  <th className="p-6 font-bold text-lg">Quantidade</th>
                  <th className="p-6 font-bold text-lg">Notas</th>
                  <th className="p-6 font-bold text-lg">Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-white/10 hover:bg-white/10 transition-all duration-200"
                  >
                    <td className="p-6 font-medium">
                      {new Date(entry.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-6 font-semibold text-purple-300 max-w-xs truncate">
                      {entry.material}
                    </td>
                    <td className="p-6 font-bold text-pink-400 text-xl">
                      {entry.quantity}
                    </td>
                    <td className="p-6 max-w-md truncate text-gray-300">
                      {entry.notes || '-'}
                    </td>
                    <td className="p-6">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="bg-red-500/90 hover:bg-red-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400"
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12 space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 shadow-lg ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/50'
                      : 'bg-white/20 text-white hover:bg-white/40 hover:shadow-xl'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisaoDiario;
