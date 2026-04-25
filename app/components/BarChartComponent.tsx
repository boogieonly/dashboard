'use client';

import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BarChartData {
  name: string;
  [key: string]: number | string;
}

interface BarChartProps {
  data: BarChartData[];
  dataKeys: string[];
  height?: number;
}

const BarChartComponent: React.FC<BarChartProps> = ({
  data,
  dataKeys,
  height = 300,
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <RechartsBarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      {dataKeys.map((dataKey, index) => (
        <Bar
          key={dataKey}
          dataKey={dataKey}
          fill={`hsl(${(index * 360) / dataKeys.length}, 70%, 50%)`}
        />
      ))}
    </RechartsBarChart>
  </ResponsiveContainer>
);

export const exampleData: BarChartData[] = [
  {
    name: 'January',
    apples: 4000,
    oranges: 2400,
    bananas: 2400,
  },
  {
    name: 'February',
    apples: 3000,
    oranges: 1398,
    bananas: 2210,
  },
  {
    name: 'March',
    apples: 2000,
    oranges: 9800,
    bananas: 2290,
  },
  {
    name: 'April',
    apples: 2780,
    oranges: 3908,
    bananas: 2000,
  },
  {
    name: 'May',
    apples: 1890,
    oranges: 4800,
    bananas: 2181,
  },
  {
    name: 'June',
    apples: 2390,
    oranges: 3800,
    bananas: 2500,
  },
];

export default BarChartComponent;
