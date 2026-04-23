'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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

type Entry = {
  id: string;
  data: string;
  descricao: string;
  faturado: number;
  atraso: number;
  vendido: number;
  total: number;
};

type FormInputs = {
  data: string;
  descricao: string;
  faturado: number;
  atraso: number;
  vendido: number;
  total: number;
};

type Totals = {
  faturado: number;
  atraso: number;
  vendido: number;
  total: number;
  count: number;
};

const glass = 'bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-6 md:p-8';
const glassInput = 'w-full p-4 rounded-2xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all text-lg';
const gradientBtn = 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold px-6 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1';

const FechamentoPage = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [form, setForm] = useState<FormInputs>({
    data: '',
    descricao: '',
    faturado: 0,
    atraso: 0,
    vendido: 0,
    total: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const saved = localStorage.getItem('fechamento-entries');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fechamento-entries', JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.data || !form.descricao.trim()) return;
    const id = crypto.randomUUID();
    const newEntry: Entry = {
      id,
      data: form.data,
      descricao: form.descricao.trim(),
      faturado: form.faturado,
      atraso: form.atraso,
      vendido: form.vendido,
      total: form.total,
    };
    setEntries([newEntry, ...entries]);
    setForm({ data: '', descricao: '', faturado: 0, atraso: 0, vendido: 0, total: 0 });
    setCurrentPage(1);
  };

  const deleteEntry = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      setEntries(entries.filter((e) => e.id !== id));
      setCurrentPage(1);
    }
  };

  const totals: Totals = useMemo(
    () =>
      entries.reduce(
        (acc, e) => ({
          faturado: acc.faturado + e.faturado,
          atraso: acc.atraso + e.atraso,
          vendido: acc.vendido + e.vendido,
          total: acc.total + e.total,
          count: acc.count + 1,
        }),
        { faturado: 0, atraso: 0, vendido: 0, total: 0, count: 0 }
      ),
    [entries]
  );

  const media = totals.count ? totals.total / totals.count : 0;

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
    [entries]
  );

  const paginatedEntries = sortedEntries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(sortedEntries.length / pageSize);

  const lineData = useMemo(() => {
    const map: Record<string, number> = {};
    entries.forEach((e) => {
      map[e.data] = (map[e.data] || 0) + e.total;
    });
    return Object.entries(map)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [entries]);

  const barData = useMemo(
    () => [
      { name: 'Faturado', value: totals.faturado },
      { name: 'Atraso', value: totals.atraso },
      { name: 'Vendido', value: totals.vendido },
    ],
    [totals]
  );

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
          <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent text-center sm:text-left">
            Fechamento Diário
          </h1>
          <Link
            href="/"
            className={`${gradientBtn} inline-flex items-center gap-2`}
          >
            ← Voltar ao Home
          </Link>
        </div>

        {/* Formulário */}
        <section className={glass}>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
            Novo Lançamento
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-white/90 mb-2 font-semibold">Data</label>
              <input
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                className={glassInput}
                required
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-white/90 mb-2 font-semibold">Descrição</label>
              <input
                type="text"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Descrição do lançamento"
                className={glassInput}
                required
              />
            </div>
            <div>
              <label className="block text-white/90 mb-2 font-semibold">Faturado</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.faturado}
                onChange={(e) => setForm({ ...form, faturado: Number(e.target.value) || 0 })}
                className={glassInput}
              />
            </div>
            <div>
              <label className="block text-white/90 mb-2 font-semibold">Atraso</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.atraso}
                onChange={(e) => setForm({ ...form, atraso: Number(e.target.value) || 0 })}
                className={glassInput}
              />
            </div>
            <div>
              <label className="block text-white/90 mb-2 font-semibold">Vendido</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.vendido}
                onChange={(e) => setForm({ ...form, vendido: Number(e.target.value) || 0 })}
                className={glassInput}
              />
            </div>
            <div>
              <label className="block text-white/90 mb-2 font-semibold">Total</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.total}
                onChange={(e) => setForm({ ...form, total: Number(e.target.value) || 0 })}
                className={glassInput}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <button type="submit" className={`${gradientBtn} w-full md:w-auto justify-self-center`}>
                Adicionar Lançamento
              </button>
            </div>
          </form>
        </section>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-12 mt-12">
          {/* KPIs */}
          <div className={`${glass} text-center h-28 flex flex-col justify-center items-center`}>
            <div className="text-3xl lg:text-4xl font-bold text-white mb-1">
              {formatCurrency(totals.faturado)}
            </div>
            <p className="text-white/80 text-sm font-semibold">Faturado</p>
          </div>
          <div className={`${glass} text-center h-28 flex flex-col justify-center items-center`}>
            <div className="text-3xl lg:text-4xl font-bold text-white mb-1">
              {formatCurrency(totals.atraso)}
            </div>
            <p className="text-white/80 text-sm font-semibold">Atraso</p>
          </div>
          <div className={`${glass} text-center h-28 flex flex-col justify-center items-center`}>
            <div className="text-3xl lg:text-4xl font-bold text-white mb-1">
              {formatCurrency(totals.vendido)}
            </div>
            <p className="text-white/80 text-sm font-semibold">Vendido</p>
          </div>
          <div className={`${glass} text-center h-28 flex flex-col justify-center items-center`}>
            <div className="text-3xl lg:text-4xl font-bold text-white mb-1">
              {formatCurrency(totals.total)}
            </div>
            <p className="text-white/80 text-sm font-semibold">Total</p>
          </div>
          <div className={`${glass} text-center h-28 flex flex-col justify-center items-center`}>
            <div className="text-3xl lg:text-4xl font-bold text-white mb-1">
              {totals.count}
            </div>
            <p className="text-white/80 text-sm font-semibold">Registros</p>
          </div>
          <div className={`${glass} text-center h-28 flex flex-col justify-center items-center`}>
            <div className="text-3xl lg:text-4xl font-bold text-white mb-1">
              {formatCurrency(media)}
            </div>
            <p className="text-white/80 text-sm font-semibold">Média</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <section className={glass}>
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Evolução Total (Linha)</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                <XAxis dataKey="date" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={4} dot={{ fill: '#8884d8', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </section>
          <section className={glass}>
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Comparação por Categoria (Barras)</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                <XAxis dataKey="name" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>
        </div>

        {/* Tabela */}
        <section className={`${glass} overflow-hidden mb-12`}>
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Histórico de Lançamentos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="p-4 text-left font-bold bg-white/5 backdrop-blur-sm rounded-tl-2xl">Data</th>
                  <th className="p-4 text-left font-bold bg-white/5 backdrop-blur-sm">Descrição</th>
                  <th className="p-4 text-right font-bold bg-white/5 backdrop-blur-sm">Faturado</th>
                  <th className="p-4 text-right font-bold bg-white/5 backdrop-blur-sm">Atraso</th>
                  <th className="p-4 text-right font-bold bg-white/5 backdrop-blur-sm">Vendido</th>
                  <th className="p-4 text-right font-bold bg-white/5 backdrop-blur-sm">Total</th>
                  <th className="p-4 text-right font-bold bg-white/5 backdrop-blur-sm rounded-tr-2xl">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-white/20 transition-all border-b border-white/10 last:border-b-0">
                    <td className="p-4 font-semibold">{entry.data}</td>
                    <td className="p-4">{entry.descricao}</td>
                    <td className="p-4 text-right">{formatCurrency(entry.faturado)}</td>
                    <td className="p-4 text-right">{formatCurrency(entry.atraso)}</td>
                    <td className="p-4 text-right">{formatCurrency(entry.vendido)}</td>
                    <td className="p-4 text-right font-bold text-green-400">{formatCurrency(entry.total)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-2xl">
              <span className="text-white font-semibold">
                Página {currentPage} de {totalPages} ({sortedEntries.length} registros)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className={`${glass} px-4 py-2 rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`${glass} px-4 py-2 rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default FechamentoPage;
