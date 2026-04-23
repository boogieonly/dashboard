'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
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
  Legend
} from 'recharts';

type RecordType = {
  id: string;
  date: string;
  faturado: number;
  atraso: number;
  vendido: number;
  carteiraTotal: number;
  previsaoMesAtual: number;
  previsaoProximoMes: number;
};

type FormData = {
  date: string;
  faturado: number;
  atraso: number;
  vendido: number;
  carteiraTotal: number;
  previsaoMesAtual: number;
  previsaoProximoMes: number;
};

const FechamentoMensal: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    date: '',
    faturado: 0,
    atraso: 0,
    vendido: 0,
    carteiraTotal: 0,
    previsaoMesAtual: 0,
    previsaoProximoMes: 0,
  });
  const [records, setRecords] = useState<RecordType[]>([]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('fechamentoRecords');
    if (saved) {
      setRecords(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fechamentoRecords', JSON.stringify(records));
  }, [records]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name as keyof FormData]: name.includes('date') ? value : parseFloat(value) || 0,
    });
  };

  const isWeekday = (date: string): boolean => {
    const day = new Date(date).getDay();
    return day >= 1 && day <= 5;
  };

  const hasDuplicateDate = (date: string): boolean => {
    return records.some((r) => r.date === date);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !isWeekday(formData.date)) {
      showMessage('Data obrigatória e deve ser dia útil (seg-sex)!', 'error');
      return;
    }
    if (hasDuplicateDate(formData.date)) {
      showMessage('Data já existe! Sem duplicatas.', 'error');
      return;
    }
    const newRecord: RecordType = {
      id: Date.now().toString(),
      ...formData,
    };
    setRecords([...records, newRecord]);
    setFormData({
      date: '',
      faturado: 0,
      atraso: 0,
      vendido: 0,
      carteiraTotal: 0,
      previsaoMesAtual: 0,
      previsaoProximoMes: 0,
    });
    showMessage('Registro salvo com sucesso!', 'success');
  };

  const deleteRecord = (id: string) => {
    setRecords(records.filter((r) => r.id !== id));
    showMessage('Registro deletado!', 'success');
  };

  const clearAll = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os registros?')) {
      setRecords([]);
      showMessage('Todos os registros limpos!', 'success');
    }
  };

  const totals = {
    faturado: records.reduce((sum, r) => sum + r.faturado, 0),
    atraso: records.reduce((sum, r) => sum + r.atraso, 0),
    vendido: records.reduce((sum, r) => sum + r.vendido, 0),
    carteiraTotal: records.reduce((sum, r) => sum + r.carteiraTotal, 0),
    previsaoMesAtual: records.reduce((sum, r) => sum + r.previsaoMesAtual, 0),
    previsaoProximoMes: records.reduce((sum, r) => sum + r.previsaoProximoMes, 0),
  };

  const chartData = records.map((r) => ({
    date: r.date,
    faturado: r.faturado,
    vendido: r.vendido,
    atraso: r.atraso,
    previsao: r.previsaoMesAtual,
  }));

  const kpiData = [
    { label: 'Faturado 💰', value: totals.faturado, color: 'from-green-400 to-green-600' },
    { label: 'Atraso ⚠️', value: totals.atraso, color: 'from-orange-400 to-orange-600' },
    { label: 'Vendido 📈', value: totals.vendido, color: 'from-blue-400 to-blue-600' },
    { label: 'Carteira Total 💼', value: totals.carteiraTotal, color: 'from-purple-400 to-purple-600' },
    { label: 'Previsão Mês Atual 🔮', value: totals.previsaoMesAtual, color: 'from-indigo-400 to-indigo-600' },
    { label: 'Previsão Próximo Mês 🚀', value: totals.previsaoProximoMes, color: 'from-pink-400 to-pink-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white/90 backdrop-blur-sm bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
            Fechamento Mensal 📊
          </h1>
        </div>

        {/* Form */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Novo Registro</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="p-3 rounded-2xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all"
              />
              {['faturado', 'atraso', 'vendido', 'carteiraTotal', 'previsaoMesAtual', 'previsaoProximoMes'].map((field) => (
                <input
                  key={field}
                  type="number"
                  name={field}
                  value={formData[field as keyof FormData] || ''}
                  onChange={handleInputChange}
                  placeholder={field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                  step="0.01"
                  className="p-3 rounded-2xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all"
                />
              ))}
              <button
                type="submit"
                className="md:col-span-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 px-8 rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white/20"
              >
                Salvar Registro ✅
              </button>
            </form>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpiData.map(({ label, value, color }, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${color} text-white p-6 rounded-3xl shadow-2xl backdrop-blur-sm border border-white/30 hover:scale-105 transition-all duration-300`}
              >
                <p className="text-sm opacity-90 mb-2">{label}</p>
                <p className="text-3xl font-bold">R$ {value.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Faturado vs Vendido 📉</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="white/20" />
                <XAxis dataKey="date" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="faturado" stroke="#10B981" name="Faturado" />
                <Line type="monotone" dataKey="vendido" stroke="#3B82F6" name="Vendido" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Atraso vs Previsão 📊</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="white/20" />
                <XAxis dataKey="date" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Legend />
                <Bar dataKey="atraso" fill="#F59E0B" name="Atraso" />
                <Bar dataKey="previsao" fill="#8B5CF6" name="Previsão" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl overflow-x-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-white">Registros Salvos ({records.length})</h3>
            <button
              onClick={clearAll}
              className="bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold py-2 px-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white/20"
            >
              Limpar Todos 🗑️
            </button>
          </div>
          {records.length === 0 ? (
            <p className="text-white/70 text-center py-12">Nenhum registro salvo ainda.</p>
          ) : (
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="p-4 text-left">Data</th>
                  <th className="p-4 text-left">Faturado</th>
                  <th className="p-4 text-left">Atraso</th>
                  <th className="p-4 text-left">Vendido</th>
                  <th className="p-4 text-left">Carteira</th>
                  <th className="p-4 text-left">Prev. Atual</th>
                  <th className="p-4 text-left">Prev. Próx.</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-white/10 hover:bg-white/10 transition-all">
                    <td className="p-4">{record.date}</td>
                    <td className="p-4">R$ {record.faturado.toLocaleString()}</td>
                    <td className="p-4">R$ {record.atraso.toLocaleString()}</td>
                    <td className="p-4">R$ {record.vendido.toLocaleString()}</td>
                    <td className="p-4">R$ {record.carteiraTotal.toLocaleString()}</td>
                    <td className="p-4">R$ {record.previsaoMesAtual.toLocaleString()}</td>
                    <td className="p-4">R$ {record.previsaoProximoMes.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => deleteRecord(record.id)}
                        className="bg-red-500 text-white px-4 py-1 rounded-xl hover:bg-red-600 transition-all"
                      >
                        Deletar 🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Message */}
        {message && (
          <div
            className={`fixed top-4 right-4 z-50 p-6 rounded-3xl shadow-2xl backdrop-blur-sm border border-white/20 transform translate-x-full animate-slide-in text-white font-bold ${
              message.type === 'success' ? 'bg-green-500/90' : 'bg-red-500/90'
            }`}
          >
            {message.text}
          </div>
        )}

        <style jsx>{`
          @keyframes slide-in {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          .animate-slide-in {
            animation: slide-in 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default FechamentoMensal;
