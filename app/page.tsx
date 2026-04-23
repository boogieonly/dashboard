'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import * as XLSX from 'xlsx';

type Transaction = {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'revenue' | 'expense';
};

type Totals = {
  revenue: number;
  expense: number;
  net: number;
};

type MonthlySummary = {
  month: string;
  revenue: number;
  expense: number;
  net: number;
};

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#912EFF',
  '#FF4444',
  '#00FF00',
  '#FFD700',
  '#FF69B4',
  '#00BFFF',
];

const FechamentoMensal = ({ summary }: { summary: MonthlySummary[] }) => (
  <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8">
    <h2 className="text-3xl font-bold mb-6 text-white drop-shadow-lg">Fechamento Mensal</h2>
    <div className="overflow-x-auto">
      <table className="w-full text-white text-lg">
        <thead>
          <tr className="bg-white/20">
            <th className="p-4 text-left font-semibold">Mês</th>
            <th className="p-4 text-left font-semibold">Receita</th>
            <th className="p-4 text-left font-semibold">Despesa</th>
            <th className="p-4 text-left font-semibold">Líquido</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((row, index) => (
            <tr key={row.month} className={index % 2 === 0 ? 'bg-white/5' : ''}>
              <td className="p-4">{row.month}</td>
              <td className="p-4">R$ {row.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td className="p-4">R$ {row.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td className={`p-4 font-semibold ${row.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                R$ {row.net.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState<Transaction[]>([]);
  const [filteredData, setFilteredData] = useState<Transaction[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const availableYears = useMemo(() => {
    const years = new Set(data.map((d) => d.date.slice(0, 4)));
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [data]);

  const chartData = useMemo(() => {
    const monthly: Record<string, { month: string; revenue: number; expense: number }> = {};
    filteredData.forEach((t) => {
      const monthKey = t.date.slice(0, 7);
      if (!monthly[monthKey]) {
        monthly[monthKey] = { month: monthKey, revenue: 0, expense: 0 };
      }
      if (t.type === 'revenue') {
        monthly[monthKey].revenue += t.amount;
      } else {
        monthly[monthKey].expense += t.amount;
      }
    });
    return Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredData]);

  const pieData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    filteredData.forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value: Number(value) }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  const totals = useMemo((): Totals => {
    const res = filteredData.reduce(
      (acc, t) => {
        if (t.type === 'revenue') acc.revenue += t.amount;
        else acc.expense += t.amount;
        return acc;
      },
      { revenue: 0, expense: 0 }
    );
    res.net = res.revenue - res.expense;
    return res;
  }, [filteredData]);

  const monthlySummary = useMemo((): MonthlySummary[] => {
    const summary: Record<string, { revenue: number; expense: number }> = {};
    filteredData.forEach((t) => {
      const monthKey = t.date.slice(0, 7);
      if (!summary[monthKey]) {
        summary[monthKey] = { revenue: 0, expense: 0 };
      }
      if (t.type === 'revenue') {
        summary[monthKey].revenue += t.amount;
      } else {
        summary[monthKey].expense += t.amount;
      }
    });
    return Object.entries(summary)
      .map(([month, s]) => ({ month, revenue: s.revenue, expense: s.expense, net: s.revenue - s.expense }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredData]);

  const importExcel = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Transaction>(sheet);
        setData(jsonData);
        setFilteredData(jsonData);
      } catch (error) {
        console.error('Error reading Excel:', error);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
  }, []);

  const exportExcel = useCallback(() => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fechamentos');
    XLSX.writeFile(wb, `fechamentos_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, [filteredData]);

  const updateFilters = useCallback(() => {
    const filtered = data.filter((item) => {
      const itemYear = item.date.slice(0, 4);
      const itemMonth = item.date.slice(5, 7);
      return (!selectedYear || itemYear === selectedYear) && (!selectedMonth || itemMonth === selectedMonth);
    });
    setFilteredData(filtered);
  }, [data, selectedYear, selectedMonth]);

  useEffect(() => {
    updateFilters();
  }, [updateFilters]);

  useEffect(() => {
    const sampleData: Transaction[] = [
      { id: 1, date: '2024-01-15', description: 'Venda produto A', category: 'Vendas', amount: 1500, type: 'revenue' },
      { id: 2, date: '2024-01-20', description: 'Aluguel loja', category: 'Aluguel', amount: 800, type: 'expense' },
      { id: 3, date: '2024-01-25', description: 'Serviço freelance', category: 'Serviços', amount: 1200, type: 'revenue' },
      { id: 4, date: '2024-02-10', description: 'Salários equipe', category: 'Pessoal', amount: 2000, type: 'expense' },
      { id: 5, date: '2024-02-18', description: 'Venda produto B', category: 'Vendas', amount: 1800, type: 'revenue' },
      { id: 6, date: '2024-03-05', description: 'Manutenção', category: 'Manutenção', amount: 300, type: 'expense' },
      { id: 7, date: '2024-03-12', description: 'Consultoria', category: 'Serviços', amount: 900, type: 'revenue' },
      { id: 8, date: '2024-04-08', description: 'Energia', category: 'Utilidades', amount: 450, type: 'expense' },
      { id: 9, date: '2024-04-22', description: 'Venda grande', category: 'Vendas', amount: 2500, type: 'revenue' },
      { id: 10, date: '2024-05-03', description: 'Marketing', category: 'Marketing', amount: 600, type: 'expense' },
      { id: 11, date: '2024-05-15', description: 'Serviço B', category: 'Serviços', amount: 1100, type: 'revenue' },
      { id: 12, date: '2024-06-01', description: 'Impostos', category: 'Impostos', amount: 700, type: 'expense' },
    ];
    setData(sampleData);
    setFilteredData(sampleData);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-orange-500 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 mb-8">
          <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent drop-shadow-2xl">
            Dashboard Financeiro
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Gerencie seus fechamentos mensais com gráficos interativos e exportação Excel.
          </p>
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <label className="flex-1 md:flex-none bg-white/20 backdrop-blur-lg border border-white/30 hover:border-white/50 shadow-xl rounded-2xl px-6 py-4 cursor-pointer transition-all duration-300 hover:bg-white/30 text-white font-semibold text-lg">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={importExcel}
                className="hidden"
                disabled={loading}
              />
              {loading ? 'Carregando...' : 'Importar Excel'}
            </label>
            <button
              onClick={exportExcel}
              className="flex-1 md:flex-none bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 border border-white/30 shadow-xl rounded-2xl px-8 py-4 text-white font-bold text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105"
              disabled={filteredData.length === 0}
            >
              Exportar Excel
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-6 mb-8">
          <h3 className="text-2xl font-bold mb-4 text-white drop-shadow-lg">Filtros</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value || '')}
              className="flex-1 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-white/50 transition-all"
            >
              <option value="">Todos os Anos</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value || '')}
              className="flex-1 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-white/50 transition-all"
            >
              <option value="">Todos os Meses</option>
              {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((m) => (
                <option key={m} value={m}>
                  {new Date(2024, parseInt(m) - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 text-center">
            <h4 className="text-lg font-semibold text-white/80 mb-2">Total Receita</h4>
            <p className="text-4xl font-bold text-green-400 drop-shadow-lg">
              R$ {totals.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 text-center">
            <h4 className="text-lg font-semibold text-white/80 mb-2">Total Despesa</h4>
            <p className="text-4xl font-bold text-red-400 drop-shadow-lg">
              R$ {totals.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 text-center">
            <h4 className="text-lg font-semibold text-white/80 mb-2">Líquido</h4>
            <p className={`text-4xl font-bold drop-shadow-lg ${totals.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              R$ {totals.net.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Charts Grid 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 h-96">
            <h3 className="text-2xl font-bold mb-6 text-white drop-shadow-lg">Receita vs Despesa Mensal (Bar)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'white' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'white' }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#00C49F" name="Receita" />
                <Bar dataKey="expense" fill="#FF8042" name="Despesa" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 h-96">
            <h3 className="text-2xl font-bold mb-6 text-white drop-shadow-lg">Tendência Mensal (Line)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'white' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'white' }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#00C49F" strokeWidth={3} name="Receita" />
                <Line type="monotone" dataKey="expense" stroke="#FF8042" strokeWidth={3} name="Despesa" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Grid 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 h-96">
            <h3 className="text-2xl font-bold mb-6 text-white drop-shadow-lg">Distribuição por Categoria (Pie)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Fechamento Mensal */}
          <FechamentoMensal summary={monthlySummary} />
        </div>

        {/* Data Table */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8">
          <h3 className="text-2xl font-bold mb-6 text-white drop-shadow-lg">
            Tabela de Transações ({filteredData.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-white text-lg">
              <thead>
                <tr className="bg-white/20">
                  <th className="p-4 text-left font-semibold">ID</th>
                  <th className="p-4 text-left font-semibold">Data</th>
                  <th className="p-4 text-left font-semibold">Descrição</th>
                  <th className="p-4 text-left font-semibold">Categoria</th>
                  <th className="p-4 text-left font-semibold">Valor</th>
                  <th className="p-4 text-left font-semibold">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-white/10 transition-colors">
                    <td className="p-4">{row.id}</td>
                    <td className="p-4">{new Date(row.date).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4">{row.description}</td>
                    <td className="p-4">{row.category}</td>
                    <td className={`p-4 font-semibold ${row.type === 'revenue' ? 'text-green-400' : 'text-red-400'}`}>
                      R$ {row.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`p-4 font-semibold ${row.type === 'revenue' ? 'text-green-400' : 'text-red-400'}`}>
                      {row.type === 'revenue' ? 'Receita' : 'Despesa'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
