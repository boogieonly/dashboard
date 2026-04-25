'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import React from 'react';

type DataItem = {
  name: string;
  [key: string]: number | string;
};

interface BarChartProps {
  data: DataItem[];
  dataKeys: string[];
}

const BarChartComponent: React.FC<BarChartProps> = ({ data, dataKeys }) => {
  const colors = [
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7300',
    '#a4de6c',
    '#d0ed57',
    '#ffbb28',
    '#ff8042',
  ];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {dataKeys.map((dataKey, index) => (
          <Bar
            key={dataKey}
            dataKey={dataKey}
            fill={colors[index % colors.length]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartComponent;
