'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import * as XLSX from 'xlsx';

type Transaction = {
  id: string;
  category: string;
  amount: number;
  date: string;
};

const exampleData: Transaction[] = [
  { id: '1', category: 'Food', amount: 200, date: '2024-01-10' },
  { id: '2', category: 'Food', amount: 150, date: '2024-01-25' },
  { id: '3', category: 'Transport', amount: 80, date: '2024-01-15' },
  { id: '4', category: 'Entertainment', amount: 120, date: '2024-01-20' },
  { id: '5', category: 'Food', amount: 220, date: '2024-02-05' },
  { id: '6', category: 'Transport', amount: 90, date: '2024-02-18' },
  { id: '7', category: 'Bills', amount: 300, date: '2024-02-01' },
  { id: '8', category: 'Shopping', amount: 100, date: '2024-02-28' },
  { id: '9', category: 'Food', amount: 180, date: '2024-03-12' },
  { id: '10', category: 'Entertainment', amount: 150, date: '2024-03-22' },
  { id: '11', category: 'Bills', amount: 320, date: '2024-03-10' },
  { id: '12', category: 'Transport', amount: 100, date: '2024-04-08' },
  { id: '13', category: 'Shopping', amount: 150, date: '2024-04-20' },
  { id: '14', category: 'Food', amount: 250, date: '2024-04-30' },
  { id: '15', category: 'Entertainment', amount: 200, date: '2024-05-15' },
  { id: '16', category: 'Bills', amount: 310, date: '2024-05-05' },
  { id: '17', category: 'Transport', amount: 110, date: '2024-05-25' },
  { id: '18', category: 'Food', amount: 300, date: '2024-06-10' },
  { id: '19', category: 'Shopping', amount: 200, date: '2024-06-20' },
  { id: '20', category: 'Entertainment', amount: 180, date: '2024-06-28' }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A78BFA'];

const Page = () => {
  const [data, setData] = useState<Transaction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const glassStyle = "bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl";

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('transactions');
      if (saved) {
        try {
          setData(JSON.parse(saved));
        } catch (e) {
          console.error('Invalid saved data, loading example');
          setData(exampleData);
        }
      } else {
        setData(exampleData);
      }
    }
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      localStorage.setItem('transactions', JSON.stringify(data));
    }
  }, [data]);

  const categories = useMemo(
    () => Array.from(new Set(data.map((t) => t.category))).sort(),
    [data]
  );

  const categoryOptions = useMemo(() => ['All', ...categories], [categories]);

  const filteredData = useMemo(
    () => (selectedCategory ? data.filter((t) => t.category === selectedCategory) : data),
    [data, selectedCategory]
  );

  const totalRevenueNum = useMemo(
    () => filteredData.reduce((sum, t) => sum + t.amount, 0),
    [filteredData]
  );

  const totalCategoriesNum = useMemo(
    () => new Set(filteredData.map((t) => t.category)).size,
    [filteredData]
  );

  const avgValueNum = useMemo(
    () => (filteredData.length ? totalRevenueNum / filteredData.length : 0),
    [filteredData, totalRevenueNum]
  );

  const getMonthlyData = useCallback((transactions: Transaction[]) => {
    const monthlyMap = new Map<string, number>();
    transactions.forEach((t) => {
      const monthKey = t.date.slice(0, 7);
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + t.amount);
    });
    return Array.from(monthlyMap.entries())
      .map(([month, value]) => ({ month, value }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, []);

  const monthlyData = useMemo(() => getMonthlyData(filteredData), [filteredData, getMonthlyData]);

  const growthRateNum = useMemo(() => {
    if (monthlyData.length < 2) return 0;
    const prev = monthlyData[monthlyData.length - 2].value;
    const curr = monthlyData[monthlyData.length - 1].value;
    return ((curr - prev) / prev) * 100;
  }, [monthlyData]);

  const allPieData = useMemo(() => {
    const cats = new Map<string, number>();
    data.forEach((t) => {
      cats.set(t.category, (cats.get(t.category) || 0) + t.amount);
    });
    return Array.from(cats.entries()).map(([name, value]) => ({ name, value }));
  }, [data]);

  const isValidDate = (dateStr: string): boolean => {
    const d = new Date(dateStr);
    return !isNaN(d.getTime()) && dateStr === d.toISOString().slice(0, 10);
  };

  const handleFile = useCallback((file: File) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const wb = XLSX.read(arrayBuffer, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws);

        const newTrans: Transaction[] = [];
        json.forEach((row: any, i: number) => {
          const category = row.category?.toString().trim();
          const amountStr = row.amount?.toString().trim();
          const date = row.date?.toString().trim();
          if (
            category &&
            amountStr &&
            date &&
            !isNaN(parseFloat(amountStr)) &&
            isValidDate(date)
          ) {
            newTrans.push({
              id: crypto.randomUUID(),
              category,
              amount: parseFloat(amountStr),
              date,
            });
          } else {
            console.warn(`Skipping invalid row ${i + 1}:`, row);
          }
        });

        if (newTrans.length > 0) {
          setData((prev) => [...prev, ...newTrans]);
        } else {
          alert('No valid data found in the file. Expected columns: category (string), amount (number), date (YYYY-MM-DD).');
        }
      } catch (err) {
        console.error('Error parsing Excel:', err);
        alert('Error parsing Excel file.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const exportExcel = useCallback(() => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    XLSX.writeFile(wb, `transactions-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, [data]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-12 text-center">
          Premium Dashboard
        </h1>

        <div className="flex flex-wrap gap-6 justify-center lg:justify-start mb-12">
          {/* Upload Card */}
          <div
            className={`${glassStyle} ${
              dragActive || uploading
                ? 'ring-4 ring-purple-400/50 scale-[1.02]'
                : ''
            } transition-all duration-300 flex flex-col items-center justify-center h-48 min-w-[280px] lg:min-w-[320px] cursor-pointer hover:shadow-3xl group relative overflow-hidden`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFile(e.target.files[0]);
                  e.target.value = '';
                }
              }}
            />
            {uploading ? (
              <>
                <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-6" />
                <p className="text-white font-semibold text-lg">Processing...</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/30 transition-all">
                  📁
                </div>
                <p className="text-white font-semibold text-lg mb-2 text-center px-4">
                  Drag & drop Excel or click to browse
                </p>
                <p className="text-gray-300 text-sm">category, amount, date (YYYY-MM-DD)</p>
              </>
            )}
          </div>

          {/* Filter */}
          <div className={`${glassStyle} p-6 min-w-[200px] hover:scale-105 transition-all cursor-pointer`}>
            <label className="block text-white font-semibold mb-3">Category Filter</label>
            <select
              value={selectedCategory || 'All'}
              onChange={(e) => setSelectedCategory(e.target.value === 'All' ? null : e.target.value)}
              className="w-full bg-white/20 border border-white/30 rounded-2xl px-4 py-3 text-white font-medium focus:outline-none focus:ring-4 ring-purple-400/50 transition-all text-lg"
            >
              {categoryOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-gray-900 text-white">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={exportExcel}
            className={`${glassStyle} p-6 hover:scale-105 transition-all text-lg font-semibold hover:shadow-3xl min-w-[200px]`}
          >
            📊 Export to Excel
          </button>

          {/* Fechamento Button */}
          <Link
            href="/fechamento"
            className="px-10 py-6 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-3xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 text-lg flex items-center gap-3 min-w-[220px] justify-center hover:scale-105"
          >
            → Go to Fechamento
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className={`${glassStyle} h-32 p-6 flex flex-col items-center justify-center text-center group hover:scale-105 transition-all hover:shadow-3xl`}>
            <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
              ${totalRevenueNum.toLocaleString()}
            </div>
            <div className="text-gray-200 text-sm uppercase tracking-wide">Total Revenue</div>
          </div>
          <div className={`${glassStyle} h-32 p-6 flex flex-col items-center justify-center text-center group hover:scale-105 transition-all hover:shadow-3xl`}>
            <div className="text-3xl lg:text-4xl font-bold text-white mb-2">{totalCategoriesNum}</div>
            <div className="text-gray-200 text-sm uppercase tracking-wide">Total Categories</div>
          </div>
          <div className={`${glassStyle} h-32 p-6 flex flex-col items-center justify-center text-center group hover:scale-105 transition-all hover:shadow-3xl`}>
            <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
              ${avgValueNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-gray-200 text-sm uppercase tracking-wide">Avg Value</div>
          </div>
          <div className={`${glassStyle} h-32 p-6 flex flex-col items-center justify-center text-center group hover:scale-105 transition-all hover:shadow-3xl`}>
            <div
              className={`text-3xl lg:text-4xl font-bold mb-2 ${
                growthRateNum >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {growthRateNum.toFixed(1)}%
            </div>
            <div className="text-gray-200 text-sm uppercase tracking-wide">Growth Rate</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div className={`${glassStyle} h-[400px] sm:h-[450px] lg:h-[500px] p-6 hover:shadow-3xl transition-all`}>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-8 text-center">Categories Distribution</h2>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={allPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {allPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className={`${glassStyle} h-[400px] sm:h-[450px] lg:h-[500px] p-6 hover:shadow-3xl transition-all`}>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-8 text-center">
              Monthly {selectedCategory || 'Total'} Revenue
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="month"
                  angle={-45}
                  textAnchor="end"
                  stroke="rgba(255,255,255,0.8)"
                  fontSize={12}
                  height={80}
                />
                <YAxis stroke="rgba(255,255,255,0.8)" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Revenue" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
