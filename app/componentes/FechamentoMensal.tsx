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
  Bar
} from 'recharts';

interface DailyData {
  date: string;
  faturado: number;
  atraso: number;
  vendido: number;
  carteiraTotal: number;
  previsaoMesAtual: number;
  previsaoProxMes: number;
}

type Totals = Omit<DailyData, 'date'>;

type FormValues = {
  [K in keyof DailyData]: string;
};

type NumericFields = keyof Omit<DailyData, 'date'>;

const FechamentoMensal: React.FC = () => {
  const [data, setData] = useState<DailyData[]>([]);
  const [formData, setFormData] = useState<FormValues>({
    date: '',
    faturado: '',
    atraso: '',
    vendido: '',
    carteiraTotal: '',
    previsaoMesAtual: '',
    previsaoProxMes: ''
  });
  const [error, setError] = useState('');

  const storageKey = 'metalfama_fechamento_mensal';

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data]);

  const totals = useMemo<Totals>(() => {
    return data.reduce(
      (acc: Totals, d: DailyData) => ({
        faturado: acc.faturado + d.faturado,
        atraso: acc.atraso + d.atraso,
        vendido: acc.vendido + d.vendido,
        carteiraTotal: acc.carteiraTotal + d.carteiraTotal,
        previsaoMesAtual: acc.previsaoMesAtual + d.previsaoMesAtual,
        previsaoProxMes: acc.previsaoProxMes + d.previsaoProxMes
      }),
      { faturado: 0, atraso: 0, vendido: 0, carteiraTotal: 0, previsaoMesAtual: 0, previsaoProxMes: 0 }
    );
  }, [data]);

  const sortedData = useMemo(
    () => [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [data]
  );

  const chartData = useMemo(() => {
    return [...data]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((d) => ({
        date: d.date.slice(5, 10),
        faturado: d.faturado,
        vendido: d.vendido,
        atraso: d.atraso
      }));
  }, [data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as keyof FormValues]: value }));
    setError('');
  };

  const isBusinessDay = (dateStr: string): boolean => {
    const date = new Date(dateStr);
    const day = date.getDay();
    return day >= 1 && day <= 5;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.date) {
      setError('Selecione uma data.');
      return;
    }

    if (!isBusinessDay(formData.date)) {
      setError('Apenas dias úteis (segunda a sexta).');
      return;
    }

    const fields: NumericFields[] = [
      'faturado',
      'atraso',
      'vendido',
      'carteiraTotal',
      'previsaoMesAtual',
      'previsaoProxMes'
    ];

    const newEntry: DailyData = {
      date: formData.date,
      faturado: 0,
      atraso: 0,
      vendido: 0,
      carteiraTotal: 0,
      previsaoMesAtual: 0,
      previsaoProxMes: 0
    };

    for (const field of fields) {
      const value = parseFloat(formData[field]);
      if (isNaN(value) || value < 0) {
        setError(`Valor inválido para ${field}. Deve ser número não-negativo.`);
        return;
      }
      newEntry[field] = value;
    }

    if (data.some((d) => d.date === formData.date)) {
      setError('Dados para esta data já existem.');
      return;
    }

    setData([...data, newEntry]);

    const resetForm: FormValues = {
      date: '',
      faturado: '',
      atraso: '',
      vendido: '',
      carteiraTotal: '',
      previsaoMesAtual: '',
      previsaoProxMes: ''
    };
    setFormData(resetForm);
  };

  const clearData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados do fechamento mensal?')) {
      setData([]);
    }
  };

  const emojis: Record<keyof Totals, string> = {
    faturado: '💰',
    atraso: '⏰',
    vendido: '🛒',
    carteiraTotal: '💼',
    previsaoMesAtual: '🔮',
    previsaoProxMes: '🔮'
  };

  const labels: Record<keyof Totals, string> = {
    faturado: 'Faturado Total',
    atraso: 'Atraso Total',
    vendido: 'Vendido Total',
    carteiraTotal: 'Carteira Total',
    previsaoMesAtual: 'Previsão Atual',
    previsaoProxMes: 'Previsão Próxima'
  };

  return (
    <section className="w-full py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            📊 Fechamento Mensal
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Insira dados diários e acompanhe a evolução dos indicadores.
          </p>
        </div>

        {/* Input Form & Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              ➕ Inserir Dados Diários
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">📅 Data (Dia Útil)</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all backdrop-blur-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'faturado', label: '💰 Faturado' },
                  { name: 'atraso', label: '⏰ Atraso' },
                  { name: 'vendido', label: '🛒 Vendido' },
                  { name: 'carteiraTotal', label: '💼 Carteira Total' },
                  { name: 'previsaoMesAtual', label: '🔮 Previsão Mês Atual' },
                  { name: 'previsaoProxMes', label: '🔮 Previsão Próximo Mês' }
                ].map(({ name, label }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      {label}
                    </label>
                    <input
                      type="number"
                      name={name}
                      value={formData[name as keyof FormValues]}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all backdrop-blur-sm"
                      placeholder="0.00"
                    />
                  </div>
                ))}
              </div>
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200 text-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm border border-white/20"
              >
                💾 Salvar Dados
              </button>
            </form>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(totals).map(([key, value]) => {
              const field = key as keyof Totals;
              return (
                <div
                  key={key}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 group cursor-pointer"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    {emojis[field]}
                  </div>
                  <div className="text-4xl font-bold text-white mb-1">
                    {value.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </div>
                  <div className="text-white/70 text-sm capitalize">
                    {labels[field]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              📈 Evolução Faturado vs Vendido
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                <XAxis dataKey="date" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip
                  formatter={(value: number) => [
                    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                    ''
                  ]}
                />
                <Legend />
                <Line type="monotone" dataKey="faturado" stroke="#8884d8" name="Faturado" />
                <Line type="monotone" dataKey="vendido" stroke="#82ca9d" name="Vendido" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              📊 Atraso por Dia
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                <XAxis dataKey="date" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip
                  formatter={(value: number) => [
                    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                    'Atraso'
                  ]}
                />
                <Bar dataKey="atraso" fill="#ff7300" name="Atraso" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Historical Table */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-2xl font-bold text-white flex items-center">
              📋 Histórico de Dados
            </h3>
            <button
              onClick={clearData}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2 px-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              disabled={data.length === 0}
            >
              🗑️ Limpar Todos
            </button>
          </div>
          {data.length === 0 ? (
            <div className="text-center py-12 text-white/60">
              Nenhum dado inserido ainda. Comece inserindo os primeiros dados!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-4 font-bold text-white">Data</th>
                    <th className="text-right p-4 font-bold text-white">Faturado</th>
                    <th className="text-right p-4 font-bold text-white">Atraso</th>
                    <th className="text-right p-4 font-bold text-white">Vendido</th>
                    <th className="text-right p-4 font-bold text-white">Carteira</th>
                    <th className="text-right p-4 font-bold text-white">Prev. Atual</th>
                    <th className="text-right p-4 font-bold text-white">Prev. Próx.</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((row) => (
                    <tr
                      key={row.date}
                      className="hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
                    >
                      <td className="p-4 font-medium text-white">
                        {new Date(row.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4 text-right text-white">
                        {row.faturado.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </td>
                      <td className="p-4 text-right text-white">
                        {row.atraso.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </td>
                      <td className="p-4 text-right text-white">
                        {row.vendido.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </td>
                      <td className="p-4 text-right text-white">
                        {row.carteiraTotal.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </td>
                      <td className="p-4 text-right text-white">
                        {row.previsaoMesAtual.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </td>
                      <td className="p-4 text-right text-white">
                        {row.previsaoProxMes.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FechamentoMensal;
