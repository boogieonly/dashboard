"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

type Registro = {
  date: string;
  faturado: number;
  atraso: number;
  vendido: number;
  carteiraTotal: number;
  previsaoMesAtual: number;
  previsaoProxMes: number;
};

type FormData = Registro;

type ChartDataPoint = {
  date: string;
  faturado: number;
  vendido: number;
  atraso: number;
};

export default function Fechamento() {
  const [data, setData] = useState<Registro[]>([]);
  const [form, setForm] = useState<FormData>({
    date: '',
    faturado: 0,
    atraso: 0,
    vendido: 0,
    carteiraTotal: 0,
    previsaoMesAtual: 0,
    previsaoProxMes: 0,
  });

  const defaultForm: FormData = {
    date: '',
    faturado: 0,
    atraso: 0,
    vendido: 0,
    carteiraTotal: 0,
    previsaoMesAtual: 0,
    previsaoProxMes: 0,
  };

  useEffect(() => {
    const saved = localStorage.getItem('fechamentoData');
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fechamentoData', JSON.stringify(data));
  }, [data]);

  const addRegistro = () => {
    if (!form.date) {
      alert('Data é obrigatória');
      return;
    }
    const dt = new Date(form.date);
    const day = dt.getDay();
    if (day === 0 || day === 6) {
      alert('Apenas dias úteis (segunda a sexta)');
      return;
    }
    if (data.some((d) => d.date === form.date)) {
      alert('Registro para esta data já existe');
      return;
    }
    if (
      form.faturado < 0 ||
      form.atraso < 0 ||
      form.vendido < 0 ||
      form.carteiraTotal < 0 ||
      form.previsaoMesAtual < 0 ||
      form.previsaoProxMes < 0
    ) {
      alert('Todos os valores devem ser >= 0');
      return;
    }
    const newReg: Registro = { ...form };
    setData((prev) => [...prev, newReg]);
    setForm(defaultForm);
  };

  const deleteReg = (date: string) => {
    if (confirm(`Deletar registro de ${new Date(date).toLocaleDateString('pt-BR')}?`)) {
      setData((prev) => prev.filter((d) => d.date !== date));
    }
  };

  const limparTodos = () => {
    if (confirm('Tem certeza que deseja limpar todos os registros?')) {
      setData([]);
      localStorage.removeItem('fechamentoData');
    }
  };

  const totalFaturado = data.reduce((sum, d) => sum + d.faturado, 0);
  const totalAtraso = data.reduce((sum, d) => sum + d.atraso, 0);
  const totalVendido = data.reduce((sum, d) => sum + d.vendido, 0);
  const carteiraMedia =
    data.length > 0
      ? data.reduce((sum, d) => sum + d.carteiraTotal, 0) / data.length
      : 0;
  const prevMesAtual = data.reduce((sum, d) => sum + d.previsaoMesAtual, 0);
  const prevProxMes = data.reduce((sum, d) => sum + d.previsaoProxMes, 0);

  const chartData: ChartDataPoint[] = data
    .map((d) => ({
      date: new Date(d.date).toLocaleDateString('pt-BR'),
      faturado: d.faturado,
      vendido: d.vendido,
      atraso: d.atraso,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const sortedData = [...data].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const updateFormField = (field: keyof FormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: Number(value) || 0 }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4 md:p-8 font-sans">
      {/* Header */}
      <div className="glass mb-8 flex flex-col sm:flex-row justify-between items-center p-6 rounded-3xl">
        <div className="flex items-center gap-4">
          <span className="text-4xl">📊</span>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            Fechamento Mensal
          </h1>
        </div>
        <Link
          href="/dashboard"
          className="mt-4 sm:mt-0 glass px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2 border border-white/30"
        >
          ← Voltar para Dashboard
        </Link>
      </div>

      {/* Seção 1: Formulário */}
      <section className="glass mb-8 p-8 rounded-3xl">
        <h2 className="text-2xl font-bold mb-6 text-white">Entrada Diária</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addRegistro();
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div>
            <label className="block text-white mb-2 font-medium">Data</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full p-4 rounded-2xl glass border border-white/20 focus:border-blue-400 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-white mb-2 font-medium">Faturado</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.faturado}
              onChange={(e) => updateFormField('faturado', e.target.value)}
              className="w-full p-4 rounded-2xl glass border border-white/20 focus:border-blue-400 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-white mb-2 font-medium">Atraso</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.atraso}
              onChange={(e) => updateFormField('atraso', e.target.value)}
              className="w-full p-4 rounded-2xl glass border border-white/20 focus:border-orange-400 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-white mb-2 font-medium">Vendido</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.vendido}
              onChange={(e) => updateFormField('vendido', e.target.value)}
              className="w-full p-4 rounded-2xl glass border border-white/20 focus:border-green-400 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-white mb-2 font-medium">Carteira Total</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.carteiraTotal}
              onChange={(e) => updateFormField('carteiraTotal', e.target.value)}
              className="w-full p-4 rounded-2xl glass border border-white/20 focus:border-purple-400 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-white mb-2 font-medium">Previsão Mês Atual</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.previsaoMesAtual}
              onChange={(e) => updateFormField('previsaoMesAtual', e.target.value)}
              className="w-full p-4 rounded-2xl glass border border-white/20 focus:border-cyan-400 focus:outline-none transition-all"
            />
          </div>
          <div className="lg:col-span-3">
            <label className="block text-white mb-2 font-medium">Previsão Próx Mês</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.previsaoProxMes}
              onChange={(e) => updateFormField('previsaoProxMes', e.target.value)}
              className="w-full p-4 rounded-2xl glass border border-white/20 focus:border-pink-400 focus:outline-none transition-all"
            />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <button
              type="submit"
              className="w-full glass bg-gradient-to-r from-green-500/30 to-emerald-500/30 hover:from-green-500/50 hover:to-emerald-500/50 border border-green-400/50 p-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
            >
              Adicionar Registro
            </button>
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <button
              type="button"
              onClick={limparTodos}
              className="w-full glass bg-gradient-to-r from-red-500/30 to-rose-500/30 hover:from-red-500/50 hover:to-rose-500/50 border border-red-400/50 p-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
            >
              Limpar Todos
            </button>
          </div>
        </form>
      </section>

      {/* Seção 2: KPIs */}
      <section className="glass mb-8 p-8 rounded-3xl">
        <h2 className="text-2xl font-bold mb-8 text-white">KPIs Totalizadores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass p-8 rounded-2xl text-center hover:scale-105 transition-all duration-300 border border-white/20 bg-gradient-to-br from-blue-500/20 to-blue-600/20">
            <div className="emoji text-5xl mx-auto mb-4 hover:scale-110 transition-transform duration-200">💰</div>
            <h3 className="text-3xl font-bold text-blue-300 mb-2">{totalFaturado.toLocaleString('pt-BR')}</h3>
            <p className="text-white/70 font-medium">Total Faturado</p>
          </div>
          <div className="glass p-8 rounded-2xl text-center hover:scale-105 transition-all duration-300 border border-white/20 bg-gradient-to-br from-orange-500/20 to-orange-600/20">
            <div className="emoji text-5xl mx-auto mb-4 hover:scale-110 transition-transform duration-200">⏰</div>
            <h3 className="text-3xl font-bold text-orange-300 mb-2">{totalAtraso.toLocaleString('pt-BR')}</h3>
            <p className="text-white/70 font-medium">Total Atraso</p>
          </div>
          <div className="glass p-8 rounded-2xl text-center hover:scale-105 transition-all duration-300 border border-white/20 bg-gradient-to-br from-green-500/20 to-emerald-600/20">
            <div className="emoji text-5xl mx-auto mb-4 hover:scale-110 transition-transform duration-200">🛒</div>
            <h3 className="text-3xl font-bold text-green-300 mb-2">{totalVendido.toLocaleString('pt-BR')}</h3>
            <p className="text-white/70 font-medium">Total Vendido</p>
          </div>
          <div className="glass p-8 rounded-2xl text-center hover:scale-105 transition-all duration-300 border border-white/20 bg-gradient-to-br from-purple-500/20 to-violet-600/20">
            <div className="emoji text-5xl mx-auto mb-4 hover:scale-110 transition-transform duration-200">💼</div>
            <h3 className="text-3xl font-bold text-purple-300 mb-2">{carteiraMedia.toLocaleString('pt-BR')}</h3>
            <p className="text-white/70 font-medium">Carteira Média</p>
          </div>
          <div className="glass p-8 rounded-2xl text-center hover:scale-105 transition-all duration-300 border border-white/20 bg-gradient-to-br from-cyan-500/20 to-sky-600/20">
            <div className="emoji text-5xl mx-auto mb-4 hover:scale-110 transition-transform duration-200">📈</div>
            <h3 className="text-3xl font-bold text-cyan-300 mb-2">{prevMesAtual.toLocaleString('pt-BR')}</h3>
            <p className="text-white/70 font-medium">Previsão Mês Atual</p>
          </div>
          <div className="glass p-8 rounded-2xl text-center hover:scale-105 transition-all duration-300 border border-white/20 bg-gradient-to-br from-pink-500/20 to-rose-600/20">
            <div className="emoji text-5xl mx-auto mb-4 hover:scale-110 transition-transform duration-200">🔮</div>
            <h3 className="text-3xl font-bold text-pink-300 mb-2">{prevProxMes.toLocaleString('pt-BR')}</h3>
            <p className="text-white/70 font-medium">Previsão Próximo Mês</p>
          </div>
        </div>
      </section>

      {/* Seção 3: Gráficos */}
      <section className="glass mb-8 p-8 rounded-3xl">
        <h2 className="text-2xl font-bold mb-8 text-white">Gráficos</h2>
        {chartData.length > 0 && (
          <>
            <div className="mb-12">
              <h3 className="text-xl font-bold mb-4 text-white">Faturado vs Vendido por Dia</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="white/10" />
                  <XAxis dataKey="date" stroke="white" />
                  <YAxis stroke="white" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="faturado" stroke="#8884d8" strokeWidth={3} name="Faturado" />
                  <Line type="monotone" dataKey="vendido" stroke="#82ca9d" strokeWidth={3} name="Vendido" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">Atraso por Dia</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="white/10" />
                  <XAxis dataKey="date" stroke="white" />
                  <YAxis stroke="white" />
                  <Tooltip />
                  <Bar dataKey="atraso" fill="#ff7300" name="Atraso" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </section>

      {/* Seção 4: Tabela Histórica */}
      {sortedData.length > 0 && (
        <section className="glass p-8 rounded-3xl">
          <h2 className="text-2xl font-bold mb-6 text-white">Histórico</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/20">
                  <th className="p-4 font-bold text-white">Data</th>
                  <th className="p-4 font-bold text-white">Faturado</th>
                  <th className="p-4 font-bold text-white">Atraso</th>
                  <th className="p-4 font-bold text-white">Vendido</th>
                  <th className="p-4 font-bold text-white">Carteira Total</th>
                  <th className="p-4 font-bold text-white">Previsão Mês</th>
                  <th className="p-4 font-bold text-white">Previsão Próx Mês</th>
                  <th className="p-4 font-bold text-white">Ação</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((reg) => (
                  <tr key={reg.date} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                    <td className="p-4 font-medium text-white">{new Date(reg.date).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4 text-blue-300">{reg.faturado.toLocaleString('pt-BR')}</td>
                    <td className="p-4 text-orange-300">{reg.atraso.toLocaleString('pt-BR')}</td>
                    <td className="p-4 text-green-300">{reg.vendido.toLocaleString('pt-BR')}</td>
                    <td className="p-4 text-purple-300">{reg.carteiraTotal.toLocaleString('pt-BR')}</td>
                    <td className="p-4 text-cyan-300">{reg.previsaoMesAtual.toLocaleString('pt-BR')}</td>
                    <td className="p-4 text-pink-300">{reg.previsaoProxMes.toLocaleString('pt-BR')}</td>
                    <td className="p-4">
                      <button
                        onClick={() => deleteReg(reg.date)}
                        className="bg-gradient-to-r from-red-500/80 to-rose-500/80 hover:from-red-500 hover:to-rose-500 text-white px-6 py-2 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

const glass =
  'bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300';
