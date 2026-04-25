'use client';

import React from 'react';

type HistoricalData = {
  date: string;
  faturamento: number;
  atrasos: number;
  vendas: number;
  carteira: number;
  previsaoVigente: number;
  previsaoSeguinte: number;
  metaFaturamento: number;
};

type RowData = HistoricalData & {
  varPct: number;
};

interface Props {
  data: HistoricalData[];
}

const HistoricalTable: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 bg-white rounded-lg shadow-lg border border-gray-200">
        Sem dados históricos.
      </div>
    );
  }

  const sorted = React.useMemo(
    () => [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [data]
  );

  const dataWithVar: RowData[] = React.useMemo(() => {
    return sorted.map((item, idx) => {
      const prev = idx === 0 ? 0 : sorted[idx - 1].faturamento;
      const varPct = prev === 0 ? 0 : ((item.faturamento - prev) / prev) * 100;
      return { ...item, varPct };
    }).reverse();
  }, [sorted]);

  const count = dataWithVar.length;

  const totals = React.useMemo(
    () => ({
      faturamento: dataWithVar.reduce((s, i) => s + i.faturamento, 0),
      atrasos: dataWithVar.reduce((s, i) => s + i.atrasos, 0),
      vendas: dataWithVar.reduce((s, i) => s + i.vendas, 0),
      carteira: dataWithVar.reduce((s, i) => s + i.carteira, 0),
      previsaoVigente: dataWithVar.reduce((s, i) => s + i.previsaoVigente, 0),
    }),
    [dataWithVar]
  );

  const averages = React.useMemo(
    () => ({
      faturamento: totals.faturamento / count,
      atrasos: totals.atrasos / count,
      vendas: totals.vendas / count,
      carteira: totals.carteira / count,
      previsaoVigente: totals.previsaoVigente / count,
      varPct: dataWithVar.reduce((s, i) => s + i.varPct, 0) / count,
    }),
    [totals, dataWithVar, count]
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatPercent = (value: number) =>
    `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

  const formatNumber = (value: number) => value.toLocaleString('pt-BR');

  const getStatus = (fat: number, meta: number) => {
    if (fat > meta) {
      return { text: 'Acima', bg: 'bg-emerald-100', textColor: 'text-emerald-800' };
    } else if (fat < meta) {
      return { text: 'Abaixo', bg: 'bg-red-100', textColor: 'text-red-800' };
    } else {
      return { text: 'Meta', bg: 'bg-gray-100', textColor: 'text-gray-800' };
    }
  };

  const getVarColor = (pct: number) => {
    if (pct > 0) return 'bg-emerald-100 text-emerald-800 font-medium';
    if (pct < 0) return 'bg-red-100 text-red-800 font-medium';
    return 'bg-gray-100 text-gray-800 font-medium';
  };

  const getFaturamentoColor = (fat: number, meta: number) => {
    if (fat > meta) return 'bg-emerald-100 text-emerald-800 font-semibold';
    if (fat < meta) return 'bg-red-100 text-red-800 font-semibold';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="w-full overflow-x-auto shadow-xl rounded-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white table-auto">
        <thead>
          <tr className="bg-gradient-to-r from-blue-50 to-indigo-100">
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-300">
              Data
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-300">
              Faturamento
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-300">
              Var %
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-300">
              Atrasos
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-300">
              Vendas
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-300">
              Carteira
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-300">
              Previsão Mês
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-300">
              Status Meta
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {dataWithVar.map((item) => (
            <tr key={item.date} className="hover:bg-gray-50 transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.date}
              </td>
              <td
                className={`px-6 py-4 whitespace-nowrap text-sm text-right ${getFaturamentoColor(
                  item.faturamento,
                  item.metaFaturamento
                )}`}
              >
                {formatCurrency(item.faturamento)}
              </td>
              <td
                className={`px-6 py-4 whitespace-nowrap text-sm text-right ${getVarColor(item.varPct)}`}
              >
                {formatPercent(item.varPct)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {formatNumber(item.atrasos)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {formatNumber(item.vendas)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {formatCurrency(item.carteira)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {formatCurrency(item.previsaoVigente)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatus(
                    item.faturamento,
                    item.metaFaturamento
                  ).bg} ${
                    getStatus(item.faturamento, item.metaFaturamento).textColor
                  }`}
                >
                  {getStatus(item.faturamento, item.metaFaturamento).text}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gradient-to-r from-gray-50 to-gray-100 divide-y divide-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 border-t-2 border-gray-300">
              Total
            </th>
            <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 border-t-2 border-gray-300">
              {formatCurrency(totals.faturamento)}
            </th>
            <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 border-t-2 border-gray-300">
              -
            </th>
            <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 border-t-2 border-gray-300">
              {formatNumber(totals.atrasos)}
            </th>
            <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 border-t-2 border-gray-300">
              {formatNumber(totals.vendas)}
            </th>
            <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 border-t-2 border-gray-300">
              {formatCurrency(totals.carteira)}
            </th>
            <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 border-t-2 border-gray-300">
              {formatCurrency(totals.previsaoVigente)}
            </th>
            <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 border-t-2 border-gray-300">
              -
            </th>
          </tr>
          <tr>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
              Média
            </th>
            <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">
              {formatCurrency(averages.faturamento)}
            </th>
            <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 ${getVarColor(averages.varPct)}">
              {formatPercent(averages.varPct)}
            </th>
            <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">
              {formatNumber(averages.atrasos)}
            </th>
            <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">
              {formatNumber(averages.vendas)}
            </th>
            <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">
              {formatCurrency(averages.carteira)}
            </th>
            <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">
              {formatCurrency(averages.previsaoVigente)}
            </th>
            <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">
              -
            </th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default HistoricalTable;
