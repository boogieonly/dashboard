'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type BarChartData = {
  name: string;
  sales: number;
  expenses: number;
};

type BarChartProps = {
  data?: BarChartData[];
  colors?: string[];
  height?: number;
};

const defaultData: BarChartData[] = [
  { name: 'Jan', sales: 400, expenses: 240 },
  { name: 'Feb', sales: 300, expenses: 139 },
  { name: 'Mar', sales: 200, expenses: 380 },
  { name: 'Apr', sales: 278, expenses: 390 },
  { name: 'May', sales: 189, expenses: 480 },
  { name: 'Jun', sales: 239, expenses: 380 },
];

const BarChartComponent = ({
  data = defaultData,
  colors = ['#8884d8', '#82ca9d'],
  height = 300,
}: BarChartProps) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="sales" fill={colors[0]} name="Sales" />
      <Bar dataKey="expenses" fill={colors[1]} name="Expenses" />
    </BarChart>
  </ResponsiveContainer>
);

export default BarChartComponent;
