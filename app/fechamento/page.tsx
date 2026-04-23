'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import Link from 'next/link';

type Entry = {
  date: string;
  faturado: number;
  atraso: number;
  vendido: number;
  carteiraTotal: number;
  previsaoMesAtual: number;
  previsaoProxMes: number;
};

type FormData = Partial<Entry>;

export default function FechamentoPage() {
  const [data, setData] = useState<Entry[]>([]);
  const [form, setForm] = useState<FormData>({
    date: '',
    faturado: 0,
    atraso: 0,
    vendido: 0,
    carteiraTotal: 0,
    previsaoMesAtual: 0,
    previsaoProxMes: 0,
  });
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const saved = localStorage.getItem('fechamentoData');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch {
        console.error('Erro ao carregar dados');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fechamentoData', JSON.stringify(data));
  }, [data]);

  const kpis = useMemo(() => ({
    totalFaturado: data.reduce((sum, d) => sum + d.faturado, 0),
    totalVendido: data.reduce((sum, d) => sum + d.vendido, 0),
    totalAtraso: data.reduce((sum, d) => sum + d.atraso, 0),
    totalCarteira: data.reduce((sum, d) => sum + d.carteiraTotal, 0),
    totalPrevisaoAtual: data.reduce((sum, d) => sum + d.previsaoMesAtual, 0),
    totalPrevisaoProx: data.reduce((sum, d) => sum + d.previsaoProxMes, 0),
  }), [data]);

  const chartDataLine = useMemo(
    () =>
      data
        .map((d) => ({ date: d.date, faturado: d.faturado, vendido: d.vendido }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [data]
  );

  const chartDataBar = useMemo(
    () =>
      data
        .map((d) => ({ date: d.date, atraso: d.atraso }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [data]
  );

  const tableData = useMemo(
    () => [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [data]
  );

  const updateForm = (field: keyof Entry, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: field === 'date' ? value : Number(value) || 0,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const date = form.date as string;
    if (!date) {
      setError('Data é obrigatória');
      return;
    }

    const dateObj = new Date(date + 'T00:00:00');
    const day = dateObj.getDay();
    if (day === 0 || day === 6) {
      setError('Apenas dias úteis (segunda a sexta)');
      return;
    }

    if (data.some((d) => d.date === date)) {
      setError('Registro para esta data já existe');
      return;
    }

    const entryValues = {
      faturado: Number(form.faturado) || 0,
      atraso: Number(form.atraso) || 0,
      vendido: Number(form.vendido) || 0,
      carteiraTotal: Number(form.carteiraTotal) || 0,
      previsaoMesAtual: Number(form.previsaoMesAtual) || 0,
      previsaoProxMes: Number(form.previsaoProxMes) || 0,
    };

    if (Object.values(entryValues).some((v) => v < 0)) {
      setError('Todos os valores devem ser maiores ou iguais a 0');
      return;
    }

    const newEntry: Entry = {
      date,
      ...entryValues,
    };

    setData((prev) => [...prev, newEntry]);
    setForm({
      date: '',
      faturado: 0,
      atraso: 0,
      vendido: 0,
      carteiraTotal: 0,
      previsaoMesAtual: 0,
      previsaoProxMes: 0,
    });
  };

  const handleClear = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      setData([]);
      localStorage.removeItem('fechamentoData');
    }
  };

  const glassCard = 'bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-6 md:p-8';
  const glassInput =
    'w-full px-4 py-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm';
  const glassBtn =
    'px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-xl hover:shadow-2xl transition-all border border-white/20 backdrop-blur-sm inline-flex items-center gap-2';
  const glassBtnClear =
    'px-6 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold shadow-xl hover:shadow-2xl transition-all border border-white/20 backdrop-blur-sm inline-flex items-center gap-2';
  const glassBtnBack =
    'px-6 py-3 rounded-2xl bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold shadow-xl hover:shadow-2xl transition-all border border-white/20 backdrop-blur-sm inline-flex items-center gap-2';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${glassCard} mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-lg">
            Fechamento Diário
          </h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleClear} className={glassBtnClear}>
              🗑️ Limpar Todos
            </button>
            <Link href="/" className={glassBtnBack}>
              ← Voltar ao Dashboard
            </Link>
          </div>
        </div>

        {/* Form */}
        <div className={`${glassCard} mb-8`}>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Novo Registro Diário
          </h2>
          {error && (
            <div className="bg-red-100/80 border border-red-300/50 text-red-700 p-4 rounded-2xl mb-6 backdrop-blur-sm">
              ⚠️ {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-semibold mb-2 text-gray-700">
                Data *
              </label>
              <input
                id="date"
                type="date"
                max={today}
                value={form.date as string || ''}
                onChange={(e) => updateForm('date', e.target.value)}
                className={glassInput}
                required
              />
            </div>
            <div>
              <label htmlFor="faturado" className="block text-sm font-semibold mb-2 text-gray-700">
                Faturado (R$)
              </label>
              <input
                id="faturado"
                type="number"
                min="0"
                step="0.01"
                value={(form.faturado ?? 0).toString()}
                onChange={(e) => updateForm('faturado', e.target.value)}
                className={glassInput}
              />
            </div>
            <div>
              <label htmlFor="atraso" className="block text-sm font-semibold mb-2 text-gray-700">
                Atraso (R$)
              </label>
              <input
                id="atraso"
                type="number"
                min="0"
                step="0.01"
                value={(form.atraso ?? 0).toString()}
                onChange={(e) => updateForm('atraso', e.target.value)}
                className={glassInput}
              />
            </div>
            <div>
              <label htmlFor="vendido" className="block text-sm font-semibold mb-2 text-gray-700">
                Vendido (R$)
              </label>
              <input
                id="vendido"
                type="number"
                min="0"
                step="0.01"
                value={(form.vendido ?? 0).toString()}
                onChange={(e) => updateForm('vendido', e.target.value)}
                className={glassInput}
              />
            </div>
            <div>
              <label htmlFor="carteiraTotal" className="block text-sm font-semibold mb-2 text-gray-700">
                Carteira Total (R$)
              </label>
              <input
                id="carteiraTotal"
                type="number"
                min="0"
                step="0.01"
                value={(form.carteiraTotal ?? 0).toString()}
                onChange={(e) => updateForm('carteiraTotal', e.target.value)}
                className={glassInput}
              />
            </div>
            <div>
              <label htmlFor="previsaoMesAtual" className="block text-sm font-semibold mb-2 text-gray-700">
                Previsão Mês Atual (R$)
              </label>
              <input
                id="previsaoMesAtual"
                type="number"
                min="0"
                step="0.01"
                value={(form.previsaoMesAtual ?? 0).toString()}
                onChange={(e) => updateForm('previsaoMesAtual', e.target.value)}
                className={glassInput}
              />
            </div>
            <div>
              <label htmlFor="previsaoProxMes" className="block text-sm font-semibold mb-2 text-gray-700">
                Previsão Próx. Mês (R$)
              </label>
              <input
                id="previsaoProxMes"
                type="number"
                min="0"
                step="0.01"
                value={(form.previsaoProxMes ?? 0).toString()}
                onChange={(e) => updateForm('previsaoProxMes', e.target.value)}
                className={glassInput}
              />
            </div>
          </form>
          <button type="submit" className="mt-8 w-full md:w-auto ${glassBtn} text-lg py-4">
            ➕ Adicionar Registro
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className={`${glassCard} text-center p-6 hover:scale-105 transition-transform`}>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Faturado</h3>
            <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              R$ {kpis.totalFaturado.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className={`${glassCard} text-center p-6 hover:scale-105 transition-transform`}>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Vendido</h3>
            <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
              R$ {kpis.totalVendido.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className={`${glassCard} text-center p-6 hover:scale-105 transition-transform`}>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Atraso</h3>
            <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-600 bg-clip-text text-transparent">
              R$ {kpis.totalAtraso.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className={`${glassCard} text-center p-6 hover:scale-105 transition-transform`}>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Carteira Total</h3>
            <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-500 to-violet-600 bg-clip-text text-transparent">
              R$ {kpis.totalCarteira.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className={`${glassCard} text-center p-6 hover:scale-105 transition-transform`}>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Previsão Mês Atual</h3>
            <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent">
              R$ {kpis.totalPrevisaoAtual.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className={`${glassCard} text-center p-6 hover:scale-105 transition-transform`}>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Previsão Próx. Mês</h3>
            <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent">
              R$ {kpis.totalPrevisaoProx.toLocaleString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Charts - Stacked vertically */}
        <div className="space-y-8 mb-12">
          <div className={glassCard}>
            <h3 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              📈 Faturado vs Vendido
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartDataLine}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.3} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="faturado" stroke="#3B82F6" strokeWidth={3} name="Faturado" />
                <Line type="monotone" dataKey="vendido" stroke="#10B981" strokeWidth={3} name="Vendido" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className={glassCard}>
            <h3 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              📊 Atraso por Dia
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartDataBar}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.3} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="atraso" fill="#EF4444" name="Atraso" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Historical Table */}
        <div className={glassCard}>
          <h3 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            📋 Histórico Completo
          </h3>
          {tableData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500 mb-4">Nenhum registro cadastrado ainda</p>
              <p className="text-gray-400">Adicione o primeiro registro acima! 🎯</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/20">
              <table className="w-full min-w-[750px] table-auto divide-y divide-white/20">
                <thead className="bg-white/10 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Faturado</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Atraso</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Vendido</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Carteira Total</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Previsão Atual</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Previsão Próx.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-white/5 backdrop-blur-sm">
                  {tableData.map((entry) => (
                    <tr key={entry.date} className="hover:bg-white/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                        R$ {entry.faturado.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                        R$ {entry.atraso.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                        R$ {entry.vendido.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-semibold">
                        R$ {entry.carteiraTotal.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-semibold">
                        R$ {entry.previsaoMesAtual.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600 font-semibold">
                        R$ {entry.previsaoProxMes.toLocaleString('pt-BR')}
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
