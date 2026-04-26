'use client';

import { useState, useEffect } from 'react';

type Commodity = 'Cobre' | 'Zinco' | 'Alumínio' | 'Chumbo' | 'Níquel' | 'Dólar';

interface PriceData {
  date: string;
  prices: Record<Commodity, number>;
}

const commodities: Commodity[] = ['Cobre', 'Zinco', 'Alumínio', 'Chumbo', 'Níquel', 'Dólar'];

interface Variation {
  pct: string;
  arrow: string;
  className: string;
}

function computeVariation(current: number, previous: number): Variation {
  if (previous <= 0) {
    return { pct: '0.00%', arrow: '', className: 'text-gray-600' };
  }
  const ratio = (current - previous) / previous * 100;
  const absPct = Math.abs(ratio).toFixed(2);
  const sign = ratio >= 0 ? '+' : '';
  const pct = sign + absPct + '%';
  const arrow = ratio > 0 ? '↑' : ratio < 0 ? '↓' : '';
  const className = ratio > 0 ? 'text-green-600' : ratio < 0 ? 'text-red-600' : 'text-gray-600';
  return { pct, arrow, className };
}

const Page = () => {
  const [data, setData] = useState<PriceData[]>([]);
  const [period, setPeriod] = useState<number>(7);

  const generateMockData = (): PriceData[] => {
    const days = 31;
    const basePrices: Record<Commodity, number> = {
      Cobre: 10250,
      Zinco: 2850,
      Alumínio: 2480,
      Chumbo: 2150,
      Níquel: 17200,
      Dólar: 5.62,
    };
    const historical: PriceData[] = [];
    let prices = { ...basePrices };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oldest = new Date(today);
    oldest.setDate(today.getDate() - days + 1);
    for (let d = 0; d < days; d++) {
      const date = new Date(oldest);
      date.setDate(oldest.getDate() + d);
      const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const newPrices: Record<Commodity, number> = { ...prices };
      commodities.forEach((comm) => {
        const volatility = comm === 'Dólar' ? 0.015 : 0.04;
        const change = (Math.random() - 0.5) * volatility * 2;
        newPrices[comm] = Math.max(0.01, prices[comm] * (1 + change));
      });
      historical.push({ date: dateStr, prices: newPrices });
      prices = newPrices;
    }
    return historical.reverse(); // Most recent first
  };

  const handleRefresh = () => {
    setData(generateMockData());
  };

  useEffect(() => {
    setData(generateMockData());
  }, []);

  if (data.length === 0) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50">Carregando...</div>;
  }

  // Compute averages
  const avgSemanal = commodities.reduce((acc, comm) => {
    const sum = data.slice(0, 7).reduce((s, row) => s + row.prices[comm], 0);
    acc[comm] = Math.round(sum / 7);
    return acc;
  }, {} as Record<Commodity, number>);

  const avgMensal = commodities.reduce((acc, comm) => {
    const sum = data.slice(0, 30).reduce((s, row) => s + row.prices[comm], 0);
    acc[comm] = Math.round(sum / 30);
    return acc;
  }, {} as Record<Commodity, number>);

  const displayDays = data.slice(0, period);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 text-center shadow-xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard de Commodities</h1>
        <p className="opacity-90 text-lg">Monitoramento de Preços</p>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:px-8 lg:px-12 max-w-7xl">
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 text-center">Situação Atual</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 md:gap-6">
            {commodities.map((comm) => {
              const current = data[0].prices[comm];
              const dayAgo = data[1]?.prices[comm] ?? current;
              const weekAgo = data[7]?.prices[comm] ?? dayAgo;
              const monthAgo = data[30]?.prices[comm] ?? weekAgo;
              const vsDia = computeVariation(current, dayAgo);
              const vsSem = computeVariation(current, weekAgo);
              const vsMes = computeVariation(current, monthAgo);
              const unit = comm === 'Dólar' ? 'R$' : 'USD/t';
              const priceStr = comm === 'Dólar' 
                ? current.toFixed(2)
                : current.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
              return (
                <div key={comm} className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-200 flex flex-col items-center text-center min-w-0">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 capitalize tracking-wide">{comm}</h3>
                  <div className="mb-6">
                    <span className="text-3xl md:text-4xl font-bold text-gray-900">{priceStr}</span>
                    <span className="ml-2 text-lg text-gray-600 font-medium">{unit}</span>
                  </div>
                  <div className="space-y-3 text-sm w-full">
                    <div className={`${vsDia.className} font-semibold py-1`}>vs Dia Anterior: {vsDia.pct} {vsDia.arrow}</div>
                    <div className={`${vsSem.className} font-semibold py-1`}>vs Semana Anterior: {vsSem.pct} {vsSem.arrow}</div>
                    <div className={`${vsMes.className} font-semibold py-1`}>vs Mês Anterior: {vsMes.pct} {vsMes.arrow}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Tabela Analítica</h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-start sm:items-center">
            <div className="flex items-center gap-2 text-lg">
              <label htmlFor="period" className="font-semibold text-gray-700">Período:</label>
              <select
                id="period"
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
              >
                <option value={7}>7 Dias</option>
                <option value={30}>30 Dias</option>
              </select>
            </div>
            <button
              onClick={handleRefresh}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 justify-center w-full sm:w-auto"
            >
              🔄 Atualizar
            </button>
          </div>
          <div className="overflow-x-auto shadow-2xl rounded-xl border border-gray-200 bg-white">
            <table className="w-full table-auto divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Dia</th>
                  {commodities.map((comm) => (
                    <th key={comm} className="px-6 py-4 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">
                      {comm}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {displayDays.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.date}</td>
                    {commodities.map((comm) => (
                      <td key={comm} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {Math.round(row.prices[comm]).toLocaleString('pt-BR')}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-blue-50 border-t-2 border-blue-200">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 bg-blue-100">Média Semanal</td>
                  {commodities.map((comm) => (
                    <td key={comm} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right bg-blue-50">
                      {avgSemanal[comm].toLocaleString('pt-BR')}
                    </td>
                  ))}
                </tr>
                <tr className="bg-indigo-50">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 bg-indigo-100">Média Mensal</td>
                  {commodities.map((comm) => (
                    <td key={comm} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right bg-indigo-50">
                      {avgMensal[comm].toLocaleString('pt-BR')}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-8 mt-auto border-t border-gray-800">
        <div className="container mx-auto px-4 text-center max-w-7xl">
          <p className="text-lg font-medium">&copy; 2024 Dashboard Commodities. Todos os direitos reservados.</p>
          <p className="mt-2 text-sm opacity-75">Dados simulados para demonstração.</p>
        </div>
      </footer>
    </div>
  );
};

export default Page;
