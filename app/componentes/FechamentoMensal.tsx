'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

type DailyRecord = {
  data: number;
  faturado: number;
  atraso: number;
  vendido: number;
  carteiraTotal: number;
  previsaoMesAtual: number;
  previsaoProxMes: number;
};

type Metrics = {
  totalFaturado: number;
  totalAtraso: number;
  totalVendido: number;
  totalCarteira: number;
  mediaPrevisaoMes: number;
  mediaPrevisaoProxMes: number;
};

type FormState = {
  data: string;
  faturado: number;
  atraso: number;
  vendido: number;
  carteiraTotal: number;
  previsaoMesAtual: number;
  previsaoProxMes: number;
};

type Errors = Partial<Record<keyof FormState, string>>;

const STORAGE_KEY = 'fechamentoMensalRecords';

const glassClass = 'bg-white/20 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]';

const inputClass = 'w-full px-4 py-3 bg-white/60 border border-white/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-transparent backdrop-blur-sm text-gray-900 placeholder-gray-500 transition-all duration-300 text-lg';

const labelClass = 'block text-sm font-semibold text-gray-700 mb-2 tracking-wide';

const FechamentoMensal: React.FC = () => {
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);
  const [formState, setFormState] = useState<FormState>({
    data: '',
    faturado: 0,
    atraso: 0,
    vendido: 0,
    carteiraTotal: 0,
    previsaoMesAtual: 0,
    previsaoProxMes: 0,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const metrics = useMemo((): Metrics => {
    const n = dailyRecords.length;
    if (n === 0) {
      return {
        totalFaturado: 0,
        totalAtraso: 0,
        totalVendido: 0,
        totalCarteira: 0,
        mediaPrevisaoMes: 0,
        mediaPrevisaoProxMes: 0,
      };
    }
    const sums = dailyRecords.reduce(
      (acc, r) => ({
        faturado: acc.faturado + r.faturado,
        atraso: acc.atraso + r.atraso,
        vendido: acc.vendido + r.vendido,
        carteiraTotal: acc.carteiraTotal + r.carteiraTotal,
      }),
      { faturado: 0, atraso: 0, vendido: 0, carteiraTotal: 0 }
    );
    const avgs = dailyRecords.reduce(
      (acc, r) => ({
        prevMes: acc.prevMes + r.previsaoMesAtual,
        prevProx: acc.prevProx + r.previsaoProxMes,
      }),
      { prevMes: 0, prevProx: 0 }
    );
    return {
      totalFaturado: sums.faturado,
      totalAtraso: sums.atraso,
      totalVendido: sums.vendido,
      totalCarteira: sums.carteiraTotal,
      mediaPrevisaoMes: avgs.prevMes / n,
      mediaPrevisaoProxMes: avgs.prevProx / n,
    };
  }, [dailyRecords]);

  const chartData = useMemo(() => {
    const sorted = [...dailyRecords].sort((a, b) => a.data - b.data);
    return sorted.map((r) => ({
      date: new Date(r.data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      }),
      faturado: r.faturado,
      vendido: r.vendido,
      atraso: r.atraso,
      previsao: r.previsaoMesAtual,
    }));
  }, [dailyRecords]);

  const tableRecords = useMemo(
    () => [...dailyRecords].sort((a, b) => b.data - a.data),
    [dailyRecords]
  );

  const saveToStorage = useCallback((records: DailyRecord[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (err) {
      console.error('Erro ao salvar no localStorage:', err);
    }
  }, []);

  const loadFromStorage = useCallback(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        setDailyRecords(JSON.parse(data));
      }
    } catch (err) {
      console.error('Erro ao carregar do localStorage:', err);
      setDailyRecords([]);
    }
  }, []);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    saveToStorage(dailyRecords);
  }, [dailyRecords, saveToStorage]);

  const clearFieldError = useCallback((field: keyof FormState) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const handleAddRecord = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setErrorMsg('');
    setSuccessMsg('');

    const newErrors: Errors = {};

    // Validate data
    if (!formState.data) {
      newErrors.data = 'Data é obrigatória.';
    } else {
      const date = new Date(formState.data + 'T12:00:00'); // Midday to avoid timezone issues
      if (isNaN(date.getTime())) {
        newErrors.data = 'Data inválida.';
      } else {
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          newErrors.data = 'Apenas dias úteis (segunda a sexta).';
        } else {
          const timestamp = date.getTime();
          if (dailyRecords.some((r) => r.data === timestamp)) {
            newErrors.data = 'Já existe um registro para esta data.';
          }
        }
      }
    }

    // Validate numbers
    const numFields: (keyof FormState)[] = [
      'faturado',
      'atraso',
      'vendido',
      'carteiraTotal',
      'previsaoMesAtual',
      'previsaoProxMes',
    ];
    numFields.forEach((field) => {
      if (formState[field] < 0 || isNaN(formState[field])) {
        newErrors[field] = 'Valor deve ser maior ou igual a 0.';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const date = new Date(formState.data + 'T12:00:00');
      const newRecord: DailyRecord = {
        data: date.getTime(),
        faturado: formState.faturado,
        atraso: formState.atraso,
        vendido: formState.vendido,
        carteiraTotal: formState.carteiraTotal,
        previsaoMesAtual: formState.previsaoMesAtual,
        previsaoProxMes: formState.previsaoProxMes,
      };
      setDailyRecords((prev) => [...prev, newRecord]);
      setFormState({
        data: '',
        faturado: 0,
        atraso: 0,
        vendido: 0,
        carteiraTotal: 0,
        previsaoMesAtual: 0,
        previsaoProxMes: 0,
      });
      setSuccessMsg('✅ Registro adicionado com sucesso!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setErrorMsg(`❌ Erro ao adicionar registro: ${message}`);
    }
  };

  const handleRemoveRecord = (dataToRemove: number) => {
    if (!confirm('Tem certeza que deseja remover este registro?')) return;
    setDailyRecords((prev) => prev.filter((r) => r.data !== dataToRemove));
    setSuccessMsg('🗑️ Registro removido com sucesso!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleClearAll = () => {
    if (!confirm(`Tem certeza que deseja limpar TODOS os ${dailyRecords.length} registros?`)) return;
    setDailyRecords([]);
    setSuccessMsg('🧹 Todos os registros foram limpos!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-6 drop-shadow-2xl">
            Fechamento Mensal
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Gerencie registros diários, acompanhe KPIs e visualize evoluções com gráficos interativos.
          </p>
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="max-w-2xl mx-auto mb-8 p-6 bg-red-100/80 border-2 border-red-400/50 backdrop-blur-sm rounded-3xl shadow-2xl text-red-800 font-semibold text-lg text-center animate-pulse">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="max-w-2xl mx-auto mb-8 p-6 bg-emerald-100/80 border-2 border-emerald-400/50 backdrop-blur-sm rounded-3xl shadow-2xl text-emerald-800 font-semibold text-lg text-center animate-bounce">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <section className={`${glassClass} p-10 mb-16 max-w-4xl mx-auto shadow-3xl`}>
          <h2 className="text-4xl font-bold text-gray-800 mb-10 flex items-center justify-center gap-4">
            ➕ Adicionar Novo Registro Diário
          </h2>
          <form onSubmit={handleAddRecord} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <label htmlFor="data" className={labelClass}>
                📅 Data
              </label>
              <input
                id="data"
                type="date"
                value={formState.data}
                onChange={(e) => {
                  setFormState((prev) => ({ ...prev, data: e.target.value }));
                  clearFieldError('data');
                }}
                className={inputClass}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.data && <p className="text-red-500 text-sm mt-2 font-medium">{errors.data}</p>}
            </div>
            <div>
              <label htmlFor="faturado" className={labelClass}>
                💰 Faturado
              </label>
              <input
                id="faturado"
                type="number"
                step="0.01"
                min="0"
                value={formState.faturado}
                onChange={(e) => {
                  setFormState((prev) => ({ ...prev, faturado: Number(e.target.value) || 0 }));
                  clearFieldError('faturado');
                }}
                className={inputClass}
              />
              {errors.faturado && <p className="text-red-500 text-sm mt-2 font-medium">{errors.faturado}</p>}
            </div>
            <div>
              <label htmlFor="atraso" className={labelClass}>
                ⏰ Atraso
              </label>
              <input
                id="atraso"
                type="number"
                step="0.01"
                min="0"
                value={formState.atraso}
                onChange={(e) => {
                  setFormState((prev) => ({ ...prev, atraso: Number(e.target.value) || 0 }));
                  clearFieldError('atraso');
                }}
                className={inputClass}
              />
              {errors.atraso && <p className="text-red-500 text-sm mt-2 font-medium">{errors.atraso}</p>}
            </div>
            <div>
              <label htmlFor="vendido" className={labelClass}>
                🛒 Vendido
              </label>
              <input
                id="vendido"
                type="number"
                step="0.01"
                min="0"
                value={formState.vendido}
                onChange={(e) => {
                  setFormState((prev) => ({ ...prev, vendido: Number(e.target.value) || 0 }));
                  clearFieldError('vendido');
                }}
                className={inputClass}
              />
              {errors.vendido && <p className="text-red-500 text-sm mt-2 font-medium">{errors.vendido}</p>}
            </div>
            <div>
              <label htmlFor="carteiraTotal" className={labelClass}>
                💼 Carteira Total
              </label>
              <input
                id="carteiraTotal"
                type="number"
                step="0.01"
                min="0"
                value={formState.carteiraTotal}
                onChange={(e) => {
                  setFormState((prev) => ({ ...prev, carteiraTotal: Number(e.target.value) || 0 }));
                  clearFieldError('carteiraTotal');
                }}
                className={inputClass}
              />
              {errors.carteiraTotal && <p className="text-red-500 text-sm mt-2 font-medium">{errors.carteiraTotal}</p>}
            </div>
            <div>
              <label htmlFor="previsaoMesAtual" className={labelClass}>
                🔮 Previsão Mês Atual
              </label>
              <input
                id="previsaoMesAtual"
                type="number"
                step="0.01"
                min="0"
                value={formState.previsaoMesAtual}
                onChange={(e) => {
                  setFormState((prev) => ({ ...prev, previsaoMesAtual: Number(e.target.value) || 0 }));
                  clearFieldError('previsaoMesAtual');
                }}
                className={inputClass}
              />
              {errors.previsaoMesAtual && <p className="text-red-500 text-sm mt-2 font-medium">{errors.previsaoMesAtual}</p>}
            </div>
            <div className="md:col-span-2 lg:col-span-1">
              <label htmlFor="previsaoProxMes" className={labelClass}>
                📈 Previsão Próximo Mês
              </label>
              <input
                id="previsaoProxMes"
                type="number"
                step="0.01"
                min="0"
                value={formState.previsaoProxMes}
                onChange={(e) => {
                  setFormState((prev) => ({ ...prev, previsaoProxMes: Number(e.target.value) || 0 }));
                  clearFieldError('previsaoProxMes');
                }}
                className={inputClass}
              />
              {errors.previsaoProxMes && <p className="text-red-500 text-sm mt-2 font-medium">{errors.previsaoProxMes}</p>}
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-4 px-12 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 text-xl transform hover:scale-105 active:scale-95"
              >
                💾 Adicionar Registro
              </button>
            </div>
          </form>
        </section>

        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <div className={`${glassClass} p-8 text-center group cursor-pointer`}>
            <span className="text-6xl lg:text-7xl mb-4 block group-hover:scale-110 transition-transform duration-300">💰</span>
            <h3 className="text-4xl lg:text-5xl font-black text-gray-900 mb-2">
              {metrics.totalFaturado.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
            </h3>
            <p className="text-lg text-gray-600 font-semibold tracking-wide">Total Faturado</p>
          </div>
          <div className={`${glassClass} p-8 text-center group cursor-pointer`}>
            <span className="text-6xl lg:text-7xl mb-4 block group-hover:scale-110 transition-transform duration-300">⏰</span>
            <h3 className="text-4xl lg:text-5xl font-black text-gray-900 mb-2">
              {metrics.totalAtraso.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
            </h3>
            <p className="text-lg text-gray-600 font-semibold tracking-wide">Total Atraso</p>
          </div>
          <div className={`${glassClass} p-8 text-center group cursor-pointer`}>
            <span className="text-6xl lg:text-7xl mb-4 block group-hover:scale-110 transition-transform duration-300">🛒</span>
            <h3 className="text-4xl lg:text-5xl font-black text-gray-900 mb-2">
              {metrics.totalVendido.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
            </h3>
            <p className="text-lg text-gray-600 font-semibold tracking-wide">Total Vendido</p>
          </div>
          <div className={`${glassClass} p-8 text-center group cursor-pointer`}>
            <span className="text-6xl lg:text-7xl mb-4 block group-hover:scale-110 transition-transform duration-300">💼</span>
            <h3 className="text-4xl lg:text-5xl font-black text-gray-900 mb-2">
              {metrics.totalCarteira.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
            </h3>
            <p className="text-lg text-gray-600 font-semibold tracking-wide">Carteira Total</p>
          </div>
          <div className={`${glassClass} p-8 text-center group cursor-pointer`}>
            <span className="text-6xl lg:text-7xl mb-4 block group-hover:scale-110 transition-transform duration-300">🔮</span>
            <h3 className="text-4xl lg:text-5xl font-black text-gray-900 mb-2">
              {metrics.mediaPrevisaoMes.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
            </h3>
            <p className="text-lg text-gray-600 font-semibold tracking-wide">Média Previsão Mês</p>
          </div>
          <div className={`${glassClass} p-8 text-center group cursor-pointer`}>
            <span className="text-6xl lg:text-7xl mb-4 block group-hover:scale-110 transition-transform duration-300">📈</span>
            <h3 className="text-4xl lg:text-5xl font-black text-gray-900 mb-2">
              {metrics.mediaPrevisaoProxMes.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
            </h3>
            <p className="text-lg text-gray-600 font-semibold tracking-wide">Média Próximo Mês</p>
          </div>
        </section>

        {/* Charts */}
        {chartData.length > 0 && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <div className={`${glassClass} p-8 shadow-3xl`}>
              <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">📊 Evolução Faturado vs Vendido</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis dataKey="date" fontSize={14} />
                  <YAxis fontSize={14} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="faturado"
                    stroke="#8884d8"
                    strokeWidth={4}
                    name="Faturado"
                    dot={{ fill: '#8884d8', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="vendido"
                    stroke="#82ca9d"
                    strokeWidth={4}
                    name="Vendido"
                    dot={{ fill: '#82ca9d', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className={`${glassClass} p-8 shadow-3xl`}>
              <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">📈 Comparação Atraso vs Previsão</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis dataKey="date" fontSize={14} />
                  <YAxis fontSize={14} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="atraso" fill="#ff7300" name="Atraso" barSize={30} />
                  <Bar dataKey="previsao" fill="#8884d8" name="Previsão Mês" barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Table */}
        <section className={`${glassClass} p-10 shadow-3xl overflow-hidden`}>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-4">
            <h2 className="text-4xl font-bold text-gray-800 flex items-center gap-4">
              📋 Todos os Registros ({dailyRecords.length})
            </h2>
            {dailyRecords.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 text-xl transform hover:scale-105 active:scale-95"
              >
                🗑️ Limpar Todos
              </button>
            )}
          </div>
          {tableRecords.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-500 mb-4">📭 Nenhum registro encontrado</p>
              <p className="text-lg text-gray-400">Adicione o primeiro registro usando o formulário acima!</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/50">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-white/50 backdrop-blur-sm">
                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Faturado</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Atraso</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Vendido</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Carteira</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Prev. Mês</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Prev. Próx</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-24">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {tableRecords.map((record) => (
                    <tr key={record.data} className="hover:bg-white/30 transition-colors duration-200">
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {new Date(record.data).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.faturado.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-orange-600">
                        {record.atraso.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-emerald-600">
                        {record.vendido.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-blue-600">
                        {record.carteiraTotal.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-purple-600">
                        {record.previsaoMesAtual.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-indigo-600">
                        {record.previsaoProxMes.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleRemoveRecord(record.data)}
                          className="px-4 py-2 bg-red-500/90 hover:bg-red-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1 w-full sm:w-auto"
                          title="Remover registro"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default FechamentoMensal;
