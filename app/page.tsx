'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import * as XLSX from 'xlsx';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6B9D'];

const glassmorphism = 'bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 hover:shadow-3xl transition-all duration-300';

const glassmorphismSmall = 'bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6 hover:shadow-2xl transition-all duration-300';

interface PieData {
  name: string;
  value: number;
}

interface BarData {
  month: string;
  sales: number;
}

interface ExcelRow {
  Category: string;
  Value: string | number;
}

interface Payload {
  name?: string;
  value: number | string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Payload[];
  label?: React.ReactNode;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const formattedValue = Number(data.value || 0).toFixed(2);
    return (
      <div className={`${glassmorphismSmall} min-w-[140px]`}>
        <p className="text-white font-bold text-lg mb-1">{data.name}</p>
        <p className="text-white/90 text-2xl font-bold">${parseFloat(formattedValue).toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [pieData, setPieData] = useState<PieData[]>([
    { name: 'Electronics', value: 400 },
    { name: 'Clothing', value: 300 },
    { name: 'Books', value: 200 },
    { name: 'Furniture', value: 278 },
    { name: 'Others', value: 189 },
  ]);
  const [barData] = useState<BarData[]>([
    { month: 'Jan', sales: 4000 },
    { month: 'Feb', sales: 3000 },
    { month: 'Mar', sales: 5000 },
    { month: 'Apr', sales: 4500 },
    { month: 'May', sales: 6000 },
    { month: 'Jun', sales: 5500 },
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [fileInputKey, setFileInputKey] = useState(0);

  const totalRevenue = pieData.reduce((sum, item) => sum + item.value, 0);
  const totalCategories = pieData.length;
  const avgValue = totalCategories > 0 ? totalRevenue / totalCategories : 0;
  const growthRate = 12.5; // Mock growth

  useEffect(() => {
    const savedCategory = localStorage.getItem('selectedCategory');
    if (savedCategory) {
      setSelectedCategory(savedCategory);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('selectedCategory', selectedCategory);
  }, [selectedCategory]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt: ProgressEvent<FileReader>) => {
      const bstr = evt.target?.result as string;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert to array of objects */
      const data = XLSX.utils.sheet_to_json<ExcelRow>(ws);
      const newPieData: PieData[] = data.map((row: ExcelRow) => ({
        name: row.Category,
        value: Number(row.Value),
      })).filter(item => item.value > 0);
      setPieData(newPieData);
      setFileInputKey(prev => prev + 1);
    };
    reader.readAsBinaryString(file);
  }, []);

  const exportToExcel = useCallback(() => {
    const wsPie = XLSX.utils.json_to_sheet(pieData.map(d => ({ Category: d.name, Value: d.value })));
    const wsBar = XLSX.utils.json_to_sheet(barData.map(d => ({ Month: d.month, Sales: d.sales })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsPie, 'Pie Data');
    XLSX.utils.book_append_sheet(wb, wsBar, 'Bar Data');
    XLSX.writeFile(wb, 'dashboard_data.xlsx');
  }, [pieData, barData]);

  const filteredPieData = selectedCategory === 'all' ? pieData : pieData.filter(d => d.name === selectedCategory);

  const categories = ['all', ...pieData.map(d => d.name)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className={`${glassmorphism} fixed top-0 left-0 right-0 z-50 shadow-3xl`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-black bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Premium Dashboard
            </h1>
            <div className="flex gap-4">
              <span className="text-sm text-white/80">Glassmorphism UI</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Filters & Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className={glassmorphismSmall}>
              <label className="block text-white font-semibold mb-2">Upload Excel</label>
              <input
                key={fileInputKey}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="w-full p-3 bg-white/20 rounded-xl border border-white/30 text-white file:bg-white/30 file:backdrop-blur file:border-white/30 file:text-purple-900 file:rounded-lg file:px-4 file:py-2 file:font-semibold file:cursor-pointer hover:file:bg-white/40 transition-all"
              />
            </div>
            <button
              onClick={exportToExcel}
              className={`${glassmorphismSmall} flex items-center justify-center text-xl font-bold hover:scale-105`}
            >
              📊 Export Excel
            </button>
            <div className={glassmorphismSmall}>
              <label className="block text-white font-semibold mb-2">Filter Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 bg-white/20 rounded-xl border border-white/30 text-white focus:outline-none focus:ring-4 focus:ring-white/30"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-gray-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className={glassmorphismSmall} />
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className={glassmorphismSmall}>
              <h3 className="text-lg font-semibold text-white/90 mb-2">Total Revenue</h3>
              <p className="text-4xl font-black text-white">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className={glassmorphismSmall}>
              <h3 className="text-lg font-semibold text-white/90 mb-2">Total Categories</h3>
              <p className="text-4xl font-black text-white">{totalCategories}</p>
            </div>
            <div className={glassmorphismSmall}>
              <h3 className="text-lg font-semibold text-white/90 mb-2">Avg Value</h3>
              <p className="text-4xl font-black text-white">${avgValue.toFixed(0)}</p>
            </div>
            <div className={glassmorphismSmall}>
              <h3 className="text-lg font-semibold text-white/90 mb-2">Growth Rate</h3>
              <p className={`text-4xl font-black ${growthRate > 0 ? 'text-green-400' : 'text-red-400'}`}>+{growthRate}%</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <section className={glassmorphism}>
              <h2 className="text-2xl font-black text-white mb-6">Sales by Category</h2>
              <ResponsiveContainer width="100%" height={450}>
                <PieChart>
                  <Pie
                    data={filteredPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {filteredPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </section>

            {/* Column Chart */}
            <section className={glassmorphism}>
              <h2 className="text-2xl font-black text-white mb-6">Monthly Sales</h2>
              <ResponsiveContainer width="100%" height={450}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" fontSize={14} />
                  <YAxis stroke="rgba(255,255,255,0.7)" fontSize={14} />
                  <Bar dataKey="sales" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
