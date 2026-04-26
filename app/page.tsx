'use client';

import { useState, useEffect, useMemo } from 'react';

type MetalData = {
  name: string;
  dailyClose: number;
  dailyVar: number;
  weeklyAvg: number;
  weeklyVar: number;
  monthlyAvg: number;
  monthlyVar: number;
  min: number;
  max: number;
  trend: string;
};

type MetalsData = MetalData[];

const exampleData: MetalsData = [
  {
    name: 'Cobre',
    dailyClose: 9523.5,
    dailyVar: 1.45,
    weeklyAvg: 9450,
    weeklyVar: 0.78,
    monthlyAvg: 9350,
    monthlyVar: 1.87,
    min: 9480,
    max: 9550,
    trend: '📈'
  },
  {
    name: 'Alumínio',
    dailyClose: 2487.2,
    dailyVar: -0.82,
    weeklyAvg: 2512,
    weeklyVar: -1.00,
    monthlyAvg: 2540,
    monthlyVar: -2.11,
    min: 2475,
    max: 2505,
    trend: '📉'
  },
  {
    name: 'Níquel',
    dailyClose: 18120,
    dailyVar: 3.25,
    weeklyAvg: 17540,
    weeklyVar: 3.30,
    monthlyAvg: 17100,
    monthlyVar: 5.96,
    min: 17800,
    max: 18250,
    trend: '📈'
  },
  {
    name: 'Zinco',
    dailyClose: 2792.1,
    dailyVar: -1.15,
    weeklyAvg: 2815,
    weeklyVar: -0.82,
    monthlyAvg: 2842,
    monthlyVar: -1.75,
    min: 2780,
    max: 2810,
    trend: '📉'
  },
  {
    name: 'Chumbo',
    dailyClose: 2105.3,
    dailyVar: 0.92,
    weeklyAvg: 2087,
    weeklyVar: 0.86,
    monthlyAvg: 2060,
    monthlyVar: 2.23,
    min: 2090,
    max: 2112,
    trend: '➡️'
  },
  {
    name: 'Estanho',
    dailyClose: 32150,
    dailyVar: 2.58,
    weeklyAvg: 31520,
    weeklyVar: 2.01,
    monthlyAvg: 31120,
    monthlyVar: 3.37,
    min: 31800,
    max: 32280,
    trend: '📈'
  },
  {
    name: 'Dólar',
    dailyClose: 5.512,
    dailyVar: 0.22,
    weeklyAvg: 5.492,
    weeklyVar: 0.36,
    monthlyAvg: 5.465,
    monthlyVar: 0.86,
    min: 5.498,
    max: 5.520,
    trend: '➡️'
  }
];

export default function Page() {
  const [data, setData] = useState<MetalsData>([]);
  const [filter, setFilter] = useState<string>('all');
  const [compactView, setCompactView] = useState<boolean>(false);
  const [timestamp, setTimestamp] = useState<string>('');

  useEffect(() => {
    let loadedData: MetalsData = [];
    const storedData = localStorage.getItem('lmeData');
    if (storedData) {
      try {
        loadedData = JSON.parse(storedData);
      } catch {
        loadedData = exampleData;
      }
    } else {
      loadedData = exampleData;
    }
    setData(loadedData);
    localStorage.setItem('lmeData', JSON.stringify(loadedData));
    setTimestamp(new Date().toLocaleString('pt-BR'));
  }, []);

  const kpis = useMemo(() => {
    if (!data.length) {
      return { best: null as MetalData | null, worst: null as MetalData | null, avgVar: 0, volatility: 0 };
    }
    const avgVar = data.reduce((sum, m) => sum + m.dailyVar, 0) / data.length;
    const volatility = Math.max(...data.map((d) => Math.abs(d.dailyVar)));
    const best = data.reduce((prev, curr) => (curr.dailyVar > prev.dailyVar ? curr : prev));
    const worst = data.reduce((prev, curr) => (curr.dailyVar < prev.dailyVar ? curr : prev));
    return { best, worst, avgVar, volatility };
  }, [data]);

  const filteredData = useMemo(
    () => (filter === 'all' ? data : data.filter((d) => d.name === filter)),
    [data, filter]
  );

  const alerts = useMemo(
    () =>
      data
        .filter((d) => Math.abs(d.dailyVar) > 2)
        .map(
          (d) =>
            `${d.name}: ${d.dailyVar >= 0 ? '+' : ''}${d.dailyVar.toFixed(2)}% ${d.dailyVar >= 0 ? '↑' : '↓'}`
        ),
    [data]
  );

  const summary = useMemo(() => {
    const { best, worst, avgVar, volatility } = kpis;
    if (!best || !worst) return 'Carregando...';
    const trend = avgVar > 0 ? 'alta' : 'baixa';
    return `O mercado de metais hoje apresentou ${trend} média de ${avgVar.toFixed(2)}%. Destaques: ${best.name} com +${best.dailyVar.toFixed(2)}% ↑ e ${worst.name} com ${worst.dailyVar.toFixed(2)}% ↓. Volatilidade máxima: ${volatility.toFixed(2)}%.`;
  }, [kpis]);

  const aggregates = useMemo(() => {
    if (!data.length) {
      return {
        dailyAvgClose: 0,
        dailyVarAvg: 0,
        weeklyAvgClose: 0,
        weeklyVarAvg: 0,
        monthlyAvgClose: 0,
        monthlyVarAvg: 0,
      };
    }
    return {
      dailyAvgClose: data.reduce((s, m) => s + m.dailyClose, 0) / data.length,
      dailyVarAvg: data.reduce((s, m) => s + m.dailyVar, 0) / data.length,
      weeklyAvgClose: data.reduce((s, m) => s + m.weeklyAvg, 0) / data.length,
      weeklyVarAvg: data.reduce((s, m) => s + m.weeklyVar, 0) / data.length,
      monthlyAvgClose: data.reduce((s, m) => s + m.monthlyAvg, 0) / data.length,
      monthlyVarAvg: data.reduce((s, m) => s + m.monthlyVar, 0) / data.length,
    };
  }, [data]);

  if (!data.length || !timestamp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center text-white">
        <div className="text-2xl font-bold">Carregando relatório LME...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/50 to-slate-900 text-white p-4 md:p-8 print:bg-white print:text-black print:from-white print:to-gray-100 print:shadow-none">
      {/* Header */}
      <header className="text-center mb-8 print:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Relatório Executivo de Fechamento LME
        </h1>
        <p className="text-lg md:text-xl opacity-80">Atualizado em: {timestamp}</p>
      </header>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 print:hidden">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-600 p-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none"
        >
          <option value="all">Todos os Metais</option>
          {data.map((m) => (
            <option key={m.name} value={m.name}>
              {m.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setCompactView(!compactView)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          {compactView ? 'Visualização Completa' : 'Visualização Compacta'}
        </button>
        <button
          onClick={() => setTimestamp(new Date().toLocaleString('pt-BR'))}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          Atualizar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="group bg-gradient-to-br from-green-500/90 to-emerald-600 p-6 md:p-8 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all backdrop-blur-sm border border-green-400/30">
          <h3 className="text-lg font-semibold opacity-90 mb-2">Melhor Metal</h3>
          <p className="text-3xl md:text-4xl font-black text-white drop-shadow-lg group-hover:drop-shadow-2xl">
            {kpis.best?.name ?? 'N/A'}
          </p>
          <p className="text-2xl font-bold text-green-100">
            +{kpis.best?.dailyVar?.toFixed(2) ?? '0'}% ↑
          </p>
        </div>
        <div className="group bg-gradient-to-br from-red-500/90 to-rose-600 p-6 md:p-8 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all backdrop-blur-sm border border-red-400/30">
          <h3 className="text-lg font-semibold opacity-90 mb-2">Pior Metal</h3>
          <p className="text-3xl md:text-4xl font-black text-white drop-shadow-lg group-hover:drop-shadow-2xl">
            {kpis.worst?.name ?? 'N/A'}
          </p>
          <p className="text-2xl font-bold text-red-100">
            {kpis.worst?.dailyVar?.toFixed(2) ?? '0'}% ↓
          </p>
        </div>
        <div className="group bg-gradient-to-br from-blue-500/90 to-indigo-600 p-6 md:p-8 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all backdrop-blur-sm border border-blue-400/30">
          <h3 className="text-lg font-semibold opacity-90 mb-2">Média Variação</h3>
          <p className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg group-hover:drop-shadow-2xl">
            {(kpis.avgVar >= 0 ? '+' : '') + kpis.avgVar.toFixed(2)}%
          </p>
          <p className={`text-xl font-bold ${kpis.avgVar >= 0 ? 'text-green-100' : 'text-red-100'}`}>
            {kpis.avgVar >= 0 ? '↑' : '↓'}
          </p>
        </div>
        <div className="group bg-gradient-to-br from-orange-500/90 to-amber-600 p-6 md:p-8 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all backdrop-blur-sm border border-orange-400/30">
          <h3 className="text-lg font-semibold opacity-90 mb-2">Volatilidade</h3>
          <p className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg group-hover:drop-shadow-2xl">
            {kpis.volatility.toFixed(2)}%
          </p>
          <p className="text-xl font-bold text-orange-100">Máx. |Var.|</p>
        </div>
      </div>

      {/* Tabela Analítica */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
          Tabela Analítica
          <span className="text-sm opacity-75">({filteredData.length} itens)</span>
        </h2>
        <div className="overflow-x-auto rounded-2xl shadow-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <table className="w-full table-auto print:table-fixed">
            <thead>
              <tr className="bg-gradient-to-r from-slate-700 to-slate-600/50 backdrop-blur-sm">
                <th className="p-4 text-left font-bold">Metal</th>
                <th className="p-4 text-right font-bold">Fech. Diário</th>
                <th className="p-4 text-right font-bold">Var. Dia %</th>
                <th className="p-4 text-right font-bold">Méd. Semanal</th>
                <th className="p-4 text-right font-bold">Var. Semana %</th>
                <th className="p-4 text-right font-bold">Méd. Mensal</th>
                <th className="p-4 text-right font-bold">Var. Mês %</th>
                <th className="p-4 text-right font-bold">Min/Máx</th>
                <th className="p-4 text-center font-bold">Tendência</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((metal) => (
                <tr
                  key={metal.name}
                  className="hover:bg-slate-700/50 transition-all border-b border-slate-600/50 hover:border-blue-500/30"
                >
                  <td className="p-4 font-semibold text-blue-300">{metal.name}</td>
                  <td className="p-4 text-right font-mono">{metal.dailyClose.toLocaleString('pt-BR')}</td>
                  <td className="p-4 text-right font-bold">
                    <span
                      className={`inline-flex items-center gap-1 ${
                        metal.dailyVar >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {(metal.dailyVar >= 0 ? '+' : '') + metal.dailyVar.toFixed(2)}%
                      <span>{metal.dailyVar >= 0 ? '↑' : '↓'}</span>
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono">{metal.weeklyAvg.toLocaleString('pt-BR')}</td>
                  <td className="p-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 ${
                        metal.weeklyVar >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {(metal.weeklyVar >= 0 ? '+' : '') + metal.weeklyVar.toFixed(2)}%
                      <span>{metal.weeklyVar >= 0 ? '↑' : '↓'}</span>
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono">{metal.monthlyAvg.toLocaleString('pt-BR')}</td>
                  <td className="p-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 ${
                        metal.monthlyVar >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {(metal.monthlyVar >= 0 ? '+' : '') + metal.monthlyVar.toFixed(2)}%
                      <span>{metal.monthlyVar >= 0 ? '↑' : '↓'}</span>
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono text-sm">
                    {metal.min.toLocaleString('pt-BR')}/{metal.max.toLocaleString('pt-BR')}
                  </td>
                  <td className="p-4 text-2xl">{metal.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Advanced Sections */}
      {!compactView && (
        <>
          {/* Resumo Executivo */}
          <section className="mb-12 p-8 md:p-12 bg-gradient-to-br from-blue-600/20 via-indigo-500/10 to-purple-600/20 rounded-3xl shadow-2xl backdrop-blur-lg border border-blue-500/20">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3 text-blue-200">
              Resumo Executivo
            </h2>
            <p className="text-lg md:text-xl leading-relaxed opacity-95 max-w-4xl mx-auto text-center md:text-left">
              {summary}
            </p>
          </section>

          {/* Alertas */}
          {alerts.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3 text-red-300">
                Alertas (Movimentos &gt;2%)
                <span className="text-sm bg-red-500/20 px-3 py-1 rounded-full font-mono">
                  {alerts.length}
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-8 rounded-3xl bg-gradient-to-br from-red-500/10 to-rose-500/10 shadow-2xl backdrop-blur-lg border border-red-400/30">
                {alerts.map((alert, i) => (
                  <div key={i} className="p-6 bg-red-500/20 rounded-2xl border-l-4 border-red-400 backdrop-blur-sm">
                    <p className="text-lg md:text-xl font-semibold text-red-200">{alert}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Comparativo Periódico */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Comparativo Periódico</h2>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-600/50">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-700 to-slate-600/50">
                    <th className="p-6 text-left font-bold text-lg">Período</th>
                    <th className="p-6 text-right font-bold text-lg">Média Fechamento</th>
                    <th className="p-6 text-right font-bold text-lg">Var. Média %</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-slate-700/50 transition-colors border-b-2 border-slate-600/50">
                    <td className="p-6 font-semibold">Dia Atual</td>
                    <td className="p-6 text-right font-mono text-xl">
                      {aggregates.dailyAvgClose.toLocaleString('pt-BR')}
                    </td>
                    <td className="p-6 text-right font-bold text-xl">
                      <span
                        className={`inline-flex items-center gap-2 ${
                          aggregates.dailyVarAvg >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {(aggregates.dailyVarAvg >= 0 ? '+' : '') + aggregates.dailyVarAvg.toFixed(2)}%
                        <span>{aggregates.dailyVarAvg >= 0 ? '↑' : '↓'}</span>
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-700/50 transition-colors border-b-2 border-slate-600/50">
                    <td className="p-6 font-semibold">Semana</td>
                    <td className="p-6 text-right font-mono text-xl">
                      {aggregates.weeklyAvgClose.toLocaleString('pt-BR')}
                    </td>
                    <td className="p-6 text-right font-bold text-xl">
                      <span
                        className={`inline-flex items-center gap-2 ${
                          aggregates.weeklyVarAvg >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {(aggregates.weeklyVarAvg >= 0 ? '+' : '') + aggregates.weeklyVarAvg.toFixed(2)}%
                        <span>{aggregates.weeklyVarAvg >= 0 ? '↑' : '↓'}</span>
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-700/50 transition-colors">
                    <td className="p-6 font-semibold">Mês</td>
                    <td className="p-6 text-right font-mono text-xl">
                      {aggregates.monthlyAvgClose.toLocaleString('pt-BR')}
                    </td>
                    <td className="p-6 text-right font-bold text-xl">
                      <span
                        className={`inline-flex items-center gap-2 ${
                          aggregates.monthlyVarAvg >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {(aggregates.monthlyVarAvg >= 0 ? '+' : '') + aggregates.monthlyVarAvg.toFixed(2)}%
                        <span>{aggregates.monthlyVarAvg >= 0 ? '↑' : '↓'}</span>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* Rodapé */}
      <footer className="text-center py-12 mt-24 border-t-2 border-slate-700/50 opacity-75 print:mt-12 print:border-gray-300 print:opacity-100">
        <p className="text-lg font-semibold mb-2">Fonte de Dados: LME Official Settlement Prices</p>
        <p>Última atualização: <span className="font-mono bg-slate-800 px-3 py-1 rounded-lg print:bg-gray-200">{timestamp}</span></p>
      </footer>
    </div>
  );
}
