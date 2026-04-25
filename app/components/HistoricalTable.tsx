'use client';

import React, { useMemo } from 'react';

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

interface HistoricalTableProps {
  data: HistoricalData[];
}

const HistoricalTable: React.FC<HistoricalTableProps> = ({ data }) => {
  const sortedData = useMemo(
    () => [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [data]
  );

  const dataWithVar = useMemo(
    () =>
      sortedData.map((item) => ({
        ...item,
        variacao:
          item.metaFaturamento !== 0
            ? ((item.faturamento - item.metaFaturamento) / item.metaFaturamento) * 100
            : 0,
      })),
    [sortedData]
  );

  const totals = useMemo(() => {
    const sums = {
      faturamento: 0,
      atrasos: 0,
      vendas: 0,
      carteira: 0,
      previsaoVigente: 0,
    };
    dataWithVar.forEach((item) => {
      sums.faturamento += item.faturamento;
      sums.atrasos += item.atrasos;
      sums.vendas += item.vendas;
      sums.carteira += item.carteira;
      sums.previsaoVigente += item.previsaoVigente;
    });
    return sums;
  }, [dataWithVar]);

  const averages = useMemo(() => {
    const n = dataWithVar.length;
    if (n === 0) return { faturamento: 0, atrasos: 0, vendas: 0, carteira: 0, previsaoVigente: 0 };
    return {
      faturamento: totals.faturamento / n,
      atrasos: totals.atrasos / n,
      vendas: totals.vendas / n,
      carteira: totals.carteira / n,
      previsaoVigente: totals.previsaoVigente / n,
    };
  }, [totals, dataWithVar.length]);

  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-500">Nenhum dado disponível.</div>;
  }

  const getStatusColor = (item: HistoricalData & { variacao: number }) => {
    if (item.faturamento >= item.metaFaturamento) {
      return 'bg-green-100 text-green-800';
    } else if (item.metaFaturamento > 0) {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  const getVarColor = (variacao: number) => {
    if (variacao > 0) return 'text-green-600 font-semibold';
    if (variacao < 0) return 'text-red-600 font-semibold';
    return 'text-gray-600';
  };

  const getStatusText = (item: HistoricalData & { variacao: number }) => {
    if (item.faturamento >= item.metaFaturamento) return '✅ Atingida';
    return '❌ Não Atingida';
  };

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Faturamento</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Var%</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Atrasos</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Vendas</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Carteira</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Previsão</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status Meta</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dataWithVar.map((item, index) => (
            <tr key={item.date || index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.date}</td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${getStatusColor(item)}`}>
                {item.faturamento.toLocaleString('pt-BR')}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${getVarColor(item.variacao)}`}>
                {item.variacao.toFixed(1)}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{item.atrasos.toLocaleString('pt-BR')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{item.vendas.toLocaleString('pt-BR')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{item.carteira.toLocaleString('pt-BR')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{item.previsaoVigente.toLocaleString('pt-BR')}</td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${getStatusColor(item)}`}>
                {getStatusText(item)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50 divide-y divide-gray-200">
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">Total</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">{totals.faturamento.toLocaleString('pt-BR')}</td>
            <td className="px-6 py-4" />
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">{totals.atrasos.toLocaleString('pt-BR')}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">{totals.vendas.toLocaleString('pt-BR')}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">{totals.carteira.toLocaleString('pt-BR')}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">{totals.previsaoVigente.toLocaleString('pt-BR')}</td>
            <td className="px-6 py-4" />
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">Média</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 text-right">{averages.faturamento.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
            <td className="px-6 py-4" />
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 text-right">{averages.atrasos.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 text-right">{averages.vendas.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 text-right">{averages.carteira.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 text-right">{averages.previsaoVigente.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
            <td className="px-6 py-4" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default HistoricalTable;
