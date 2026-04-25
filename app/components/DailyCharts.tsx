'use client';

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type DailyChartData = {
  date: string;
  faturamento: number;
  atrasos: number;
  vendas: number;
  carteiraTotal: number;
  previsaoMesVigente: number;
  previsaoMesSeguinte: number;
};

const formatDate = (value: string): string => {
  const date = new Date(value);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const DailyCharts: React.FC<{ data: DailyChartData[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-lg">
        Sem dados
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {/* Faturamento LineChart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Faturamento</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatDate} />
            <YAxis tickFormatter={formatNumber} />
            <Tooltip
              labelFormatter={formatDate}
              formatter={(value: number, name: string) => [formatNumber(value), name]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="faturamento"
              stroke="#2563eb"
              name="Faturamento"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Atrasos BarChart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Atrasos</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatDate} />
            <YAxis tickFormatter={formatNumber} />
            <Tooltip
              labelFormatter={formatDate}
              formatter={(value: number, name: string) => [formatNumber(value), name]}
            />
            <Legend />
            <Bar dataKey="atrasos" fill="#dc2626" name="Atrasos" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Vendas AreaChart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Vendas</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatDate} />
            <YAxis tickFormatter={formatNumber} />
            <Tooltip
              labelFormatter={formatDate}
              formatter={(value: number, name: string) => [formatNumber(value), name]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="vendas"
              stroke="#16a34a"
              fill="#16a34a"
              name="Vendas"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Carteira Total LineChart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Carteira Total</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatDate} />
            <YAxis tickFormatter={formatNumber} />
            <Tooltip
              labelFormatter={formatDate}
              formatter={(value: number, name: string) => [formatNumber(value), name]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="carteiraTotal"
              stroke="#9333ea"
              name="Carteira Total"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Previsão Mês Vigente LineChart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Previsão Mês Vigente</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatDate} />
            <YAxis tickFormatter={formatNumber} />
            <Tooltip
              labelFormatter={formatDate}
              formatter={(value: number, name: string) => [formatNumber(value), name]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="previsaoMesVigente"
              stroke="#ea580c"
              name="Previsão Mês Vigente"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Previsão Mês Seguinte LineChart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Previsão Mês Seguinte</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatDate} />
            <YAxis tickFormatter={formatNumber} />
            <Tooltip
              labelFormatter={formatDate}
              formatter={(value: number, name: string) => [formatNumber(value), name]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="previsaoMesSeguinte"
              stroke="#06b6d4"
              name="Previsão Mês Seguinte"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailyCharts;
