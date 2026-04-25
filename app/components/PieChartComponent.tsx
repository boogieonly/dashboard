'use client';

import React from 'react';
import {
  ResponsiveContainer,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from 'recharts';

type PieData = {
  name: string;
  value: number;
};

type PieChartProps = {
  data: PieData[];
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const PieChartComponent: React.FC<PieChartProps> = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <Pie
      data={data}
      cx="50%"
      cy="50%"
      outerRadius={80}
      dataKey="value"
      nameKey="name"
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
    <Legend />
  </ResponsiveContainer>
);

export default PieChartComponent;

// Example data
const exampleData: PieData[] = [
  { name: 'Group A', value: 400 },
  { name: 'Group B', value: 300 },
  { name: 'Group C', value: 300 },
  { name: 'Group D', value: 200 },
];

// Usage example:
// <PieChartComponent data={exampleData} />
