'use client';

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PieChartData {
  name: string;
  value: number;
}

interface PieChartComponentProps {
  data: PieChartData[];
  title?: string;
  colors?: string[];
}

const defaultData = [
  { name: 'Cobre', value: 195.7 },
  { name: 'Latão', value: 110.2 },
  { name: 'Alumínio', value: 300.6 },
  { name: 'Inox', value: 75.3 },
];

const defaultColors = ['#f97316', '#eab308', '#06b6d4', '#8b8b8b'];

export default function PieChartComponent({
  data = defaultData,
  title = 'Distribuição por Material',
  colors = defaultColors,
}: PieChartComponentProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">
      <h3 className="text-white font-semibold text-lg mb-6">{title}</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value.toFixed(1)}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
