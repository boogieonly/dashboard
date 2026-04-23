'use client';

import React, { useState, useEffect, useMemo, FC } from 'react';
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

type RecordType = {
  id: string;
  date: string;
  faturado: number;
  vendido: number;
  atraso: number;
};

type FormDataType = {
  date: string;
  faturado: string;
  vendido: string;
  atraso: string;
};

const FechamentoMensal: FC = () => {
  const [records, setRecords] = useState<RecordType[]>([]);
  const [formData, setFormData] = useState<FormDataType>({
    date: '',
    faturado: '0',
    vendido: '0',
    atraso: '0',
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');

  const formatCurrency = (num: number): string =>
    num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const loadFromLocalStorage = (): RecordType[] => {
    try {
      const item = localStorage.getItem('fechamentoMensalRecords');
      return item ? (JSON.parse(item) as RecordType[]) : [];
    } catch {
      return [];
    }
  };

  const saveToLocalStorage = (data: RecordType[]) => {
    try {
      localStorage.setItem('fechamentoMensalRecords', JSON.stringify(data));
    } catch {}
  };

  useEffect(() => {
    setRecords(loadFromLocalStorage());
  }, []);

  useEffect(() => {
    saveToLocalStorage(records);
  }, [records]);

  const computeTotals = (recs: RecordType[]) => {
    const totalFaturado = recs.reduce((sum, r) => sum + r.faturado, 0);
    const totalVendido = recs.reduce((sum, r) => sum + r.vendido, 0);
    const totalAtraso = recs.reduce((sum, r) => sum + r.atraso, 0);
    const dias = recs.length;
    const avgVendido = dias > 0 ? totalVendido / dias : 0;
    const previsaoAtual = avgVendido * 22;
    const previsaoProx = previsaoAtual * 1.1;
    const carteiraTotal = totalVendido - totalFaturado;
    return {
      totalFaturado,
      totalVendido,
      totalAtraso,
      carteiraTotal,
      previsaoAtual,
      previsaoProx,
    };
  };

  const totals = useMemo(() => computeTotals(records), [records]);

  const lineData = useMemo(
    () =>
      records
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((r) => ({
          date: r.date.slice(5),
          faturado: r.faturado,
          vendido: r.vendido,
        })),
    [records]
  );

  const barData = useMemo(
    () => [
      { name: 'Atraso Total', atraso: totals.totalAtraso, previsao: 0 },
      { name: 'Previsão Mês Atual', atraso: 0, previsao: totals.previsaoAtual },
    ],
    [totals.totalAtraso, totals.previsaoAtual]
  );

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => b.date.localeCompare(a.date)),
    [records]
  );

  const validateForm = (form: FormDataType, recs: RecordType[]): string[] => {
    const errors: string[] = [];
    const { date, faturado, vendido, atraso } = form;

    if (!date) {
      errors.push('Data é obrigatória');
    } else {
      const d = new Date(date + 'T12:00');
      if (d.getDay() === 0 || d.getDay() === 6) {
        errors.push('Apenas dias úteis (segunda a sexta)');
      }
      if (recs.some((r) => r.date === date)) {
        errors.push('Data já possui registro');
      }
    }

    const fields = [
      { key: 'faturado', label: 'Faturado' },
      { key: 'vendido', label: 'Vendido' },
      { key: 'atraso', label: 'Atraso' },
    ];

    fields.forEach(({ key, label }) => {
      const val = Number(form[key as keyof FormDataType]);
      if (isNaN(val) || val < 0) {
        errors.push(`${label} deve ser um número maior ou igual a 0`);
      }
    });

    return errors;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors.length > 0) setFormErrors([]);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage('Valor copiado para área de transferência!');
    } catch {
      setMessage('Erro ao copiar valor');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(formData, records);
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    const newRecord: RecordType = {
      id: crypto.randomUUID(),
      date: formData.date,
      faturado: Number(formData.faturado),
      vendido: Number(formData.vendido),
      atraso: Number(formData.atraso),
    };

    setRecords((prev) => [...prev, newRecord]);
    setFormData({ date: '', faturado: '0', vendido: '0', atraso: '0' });
    setFormErrors([]);
    setMessage('Registro adicionado com sucesso!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleClearAll = () => {
    setRecords([]);
    setMessage('Todos os registros foram limpos!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setMessage('Registro removido com sucesso!');
    setTimeout(() => setMessage(''), 3000);
  };

  const KPI: FC<{
    emoji: string;
    title: string;
    value: number;
  }> = ({ emoji, title, value }) => (
    <div
      className="group cursor-pointer bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 sm:p-8 shadow-2xl hover:scale-105 hover:shadow-3xl hover:bg-white/30 transition-all duration-300 text-center"
      onClick={() => handleCopy(`${title}: ${formatCurrency(value)}`)}
    >
      <span className="text-4xl sm:text-5xl block mb-3 group-hover:scale-110 transition-transform duration-300">
        {emoji}
      </span>
      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 drop-shadow-lg">
        {title}
      </h3>
      <p className="text-xl sm:text-2xl md:text-3xl font-black text-white drop-shadow-2xl">
        {formatCurrency(value)}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500/50 to-pink-500 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white text-center mb-8 sm:mb-12 drop-shadow-2xl tracking-tight">
          Fechamento Mensal
        </h1>

        {message && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl text-white font-semibold text-center mx-auto max-w-lg shadow-2xl backdrop-blur-xl border border-green-300/50 bg-green-500/90 animate-in slide-in-from-top-2 duration-300">
            {message}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
          <KPI emoji="💰" title="Faturado" value={totals.totalFaturado} />
          <KPI emoji="⏳" title="Atraso" value={totals.totalAtraso} />
          <KPI emoji="🛒" title="Vendido" value={totals.totalVendido} />
          <KPI emoji="💼" title="Carteira Total" value={totals.carteiraTotal} />
          <KPI emoji="📈" title="Previsão Mês Atual" value={totals.previsaoAtual} />
          <KPI emoji="🔮" title="Previsão Próximo Mês" value={totals.previsaoProx} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 mb-12 shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center drop-shadow-lg">
            Adicionar Registro
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
            <div>
              <label className="block text-white/90 mb-3 font-semibold text-sm sm:text-base">
                Data (Seg-Sex)
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full p-4 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/60 font-semibold focus:outline-none focus:ring-4 focus:ring-blue-400/60 focus:border-transparent transition-all duration-300 text-lg shadow-lg"
                required
              />
            </div>
            <div>
              <label className="block text-white/90 mb-3 font-semibold text-sm sm:text-base">
                Faturado
              </label>
              <input
                type="number"
                name="faturado"
                min="0"
                step="0.01"
                value={formData.faturado}
                onChange={handleInputChange}
                className="w-full p-4 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/60 font-semibold focus:outline-none focus:ring-4 focus:ring-green-400/60 focus:border-transparent transition-all duration-300 text-lg shadow-lg"
                required
              />
            </div>
            <div>
              <label className="block text-white/90 mb-3 font-semibold text-sm sm:text-base">
                Vendido
              </label>
              <input
                type="number"
                name="vendido"
                min="0"
                step="0.01"
                value={formData.vendido}
                onChange={handleInputChange}
                className="w-full p-4 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/60 font-semibold focus:outline-none focus:ring-4 focus:ring-blue-400/60 focus:border-transparent transition-all duration-300 text-lg shadow-lg"
                required
              />
            </div>
            <div>
              <label className="block text-white/90 mb-3 font-semibold text-sm sm:text-base">
                Atraso
              </label>
              <input
                type="number"
                name="atraso"
                min="0"
                step="0.01"
                value={formData.atraso}
                onChange={handleInputChange}
                className="w-full p-4 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/60 font-semibold focus:outline-none focus:ring-4 focus:ring-red-400/60 focus:border-transparent transition-all duration-300 text-lg shadow-lg"
                required
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <button
              type="submit"
              className="flex-1 sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-lg"
            >
              Adicionar Registro
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="flex-1 sm:w-auto px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-lg"
            >
              Limpar Todos
            </button>
          </div>
          {formErrors.length > 0 && (
            <div className="mt-6 p-5 bg-red-500/40 backdrop-blur-sm border border-red-400/50 rounded-2xl shadow-xl">
              <h4 className="text-white font-bold mb-2">Erros:</h4>
              <ul className="text-white/95 text-sm space-y-1 list-disc pl-5">
                {formErrors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </form>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6 text-center drop-shadow-lg">
              Faturado vs Vendido
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="faturado"
                  stroke="#10b981"
                  name="Faturado"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="vendido"
                  stroke="#3b82f6"
                  name="Vendido"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6 text-center drop-shadow-lg">
              Atraso vs Previsão
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" angle={-45} height={80} />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip />
                <Legend />
                <Bar dataKey="atraso" fill="#ef4444" name="Atraso" />
                <Bar dataKey="previsao" fill="#10b981" name="Previsão" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        {records.length > 0 && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6 drop-shadow-lg">
              Todos os Registros
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-white/95 text-sm md:text-base">
                <thead>
                  <tr className="bg-white/10 backdrop-blur-sm border-b border-white/20">
                    <th className="p-4 text-left font-bold rounded-tl-xl">Data</th>
                    <th className="p-4 text-left font-bold">Faturado</th>
                    <th className="p-4 text-left font-bold">Vendido</th>
                    <th className="p-4 text-left font-bold">Atraso</th>
                    <th className="p-4 text-left font-bold rounded-tr-xl">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRecords.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-white/20 transition-all duration-200 border-b border-white/10 last:border-b-0"
                    >
                      <td className="p-4 font-semibold">{r.date}</td>
                      <td className="p-4">{formatCurrency(r.faturado)}</td>
                      <td className="p-4">{formatCurrency(r.vendido)}</td>
                      <td className="p-4">{formatCurrency(r.atraso)}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="bg-red-500/90 hover:bg-red-600/90 px-4 py-2 rounded-xl text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FechamentoMensal;
