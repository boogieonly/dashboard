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

interface BarChartData {
  name: string;
  [key: string]: string | number;
}

interface BarChartComponentProps {
  data: BarChartData[];
  title?: string;
  dataKey?: string;
  barColor?: string;
}

const defaultData = [
  { month: 'Jan', vendas: 4000, meta: 5000 },
  { month: 'Fev', vendas: 3000, meta: 4500 },
  { month: 'Mar', vendas: 5000, meta: 5000 },
  { month: 'Abr', vendas: 6000, meta: 5500 },
  { month: 'Mai', vendas: 5500, meta: 5000 },
  { month: 'Jun', vendas: 7000, meta: 6500 },
];

export default function BarChartComponent({
  data = defaultData,
  title = 'Vendas Mensais',
  dataKey = 'vendas',
  barColor = '#3b82f6',
}: BarChartComponentProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">
      <h3 className="text-white font-semibold text-lg mb-6">{title}</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
          <YAxis stroke="rgba(255,255,255,0.6)" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Legend />
          <Bar
            dataKey={dataKey}
            fill={barColor}
            radius={[8, 8, 0, 0]}
            animationDuration={800}
          />
          <Bar dataKey="meta" fill="rgba(255,255,255,0.2)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
