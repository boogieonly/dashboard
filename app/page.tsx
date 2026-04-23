import 'use client';
import React, { useState, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';

type DataRow = {
  Date: string;
  Product: string;
  Category: string;
  Quantity: number;
  Price: number;
  Total: number;
};

type Filters = {
  dateFrom: string;
  dateTo: string;
  product: string;
};

const Page: React.FC = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [filteredData, setFilteredData] = useState<DataRow[]>([]);
  const [filters, setFilters] = useState<Filters>({ dateFrom: '', dateTo: '', product: '' });
  const [lastUpdate, setLastUpdate] = useState<string>('Never');
  const [loading, setLoading] = useState<boolean>(false);

  const kpis = useMemo(() => {
    const totalSales = filteredData.reduce((sum, row) => sum + row.Total, 0);
    const totalOrders = filteredData.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    const topProduct = [...filteredData.reduce((acc, row) => {
      acc[row.Product] = (acc[row.Product] || 0) + row.Total;
      return acc;
    }, {} as Record<string, number>)]
      .sort(([, a], [, b]) => b - a)[0];

    return {
      totalSales,
      totalOrders,
      avgOrderValue: Number(avgOrderValue.toFixed(2)),
      topProduct: topProduct ? `${topProduct[0]} (${topProduct[1].toFixed(0)})` : 'None',
    };
  }, [filteredData]);

  const salesOverTime = useMemo(() => {
    const grouped = filteredData.reduce((acc, row) => {
      const date = row.Date.split('T')[0];
      acc[date] = (acc[date] || 0) + row.Total;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(grouped)
      .map(([date, sales]) => ({ date, sales: Number(sales) }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData]);

  const topProducts = useMemo(() => {
    const grouped = filteredData.reduce((acc, row) => {
      acc[row.Product] = (acc[row.Product] || 0) + row.Total;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(grouped)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([product, sales]) => ({ product, sales: Number(sales) }));
  }, [filteredData]);

  const categoryData = useMemo(() => {
    const grouped = filteredData.reduce((acc, row) => {
      acc[row.Category] = (acc[row.Category] || 0) + row.Total;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(grouped).map(([name, value]) => ({ name, value: Number(value) }));
  }, [filteredData]);

  const applyFilters = useCallback(() => {
    let result = data;
    if (filters.dateFrom) {
      result = result.filter(row => row.Date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      result = result.filter(row => row.Date <= filters.dateTo);
    }
    if (filters.product) {
      result = result.filter(row => row.Product === filters.product);
    }
    setFilteredData(result);
  }, [data, filters]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result as string;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const json = XLSX.utils.sheet_to_json<DataRow>(ws);
      setData(json as DataRow[]);
      setFilteredData(json as DataRow[]);
      setLastUpdate(new Date().toLocaleString('en-US'));
      setLoading(false);
    };
    reader.readAsBinaryString(file);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Filtered Data');
    XLSX.writeFile(wb, 'dashboard_data.xlsx');
  };

  const clearData = () => {
    setData([]);
    setFilteredData([]);
    setFilters({ dateFrom: '', dateTo: '', product: '' });
    setLastUpdate('Never');
  };

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const COLORS = ['#8B5CF6', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 p-4 sm:p-8 text-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4">
            Premium Dashboard
          </h1>
          <p className="text-xl opacity-90">Advanced analytics with glassmorphism design</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <input
            type="file"
            onChange={handleFile}
            className="hidden"
            id="file-upload"
            accept=".xlsx,.xls"
          />
          <label
            htmlFor="file-upload"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-500 hover:to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm border border-white/20 cursor-pointer text-center"
          >
            {loading ? 'Loading...' : '📁 Import Excel'}
          </label>
          <button
            onClick={exportExcel}
            disabled={filteredData.length === 0}
            className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-blue-500 hover:to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            💾 Export Excel
          </button>
          <button
            onClick={clearData}
            className="bg-gradient-to-r from-purple-500 to-red-600 hover:from-red-500 hover:to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm border border-white/20"
          >
            🗑️ Clear Data
          </button>
        </div>

        {/* Last Update */}
        <div className="text-center mb-12">
          <p className="text-lg opacity-80">⏰ Last Update: <span className="font-semibold text-blue-300">{lastUpdate}</span></p>
        </div>
      </div>

      {/* KPIs */}
      <div className="max-w-7xl mx-auto mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 hover:shadow-3xl transition-all duration-300">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Total Sales</h3>
            <p className="text-3xl font-bold text-blue-300">${kpis.totalSales.toLocaleString()}</p>
          </div>
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 hover:shadow-3xl transition-all duration-300">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-purple-300">{kpis.totalOrders.toLocaleString()}</p>
          </div>
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 hover:shadow-3xl transition-all duration-300">
            <div className="text-4xl mb-4">💵</div>
            <h3 className="text-xl font-semibold mb-2">Avg Order Value</h3>
            <p className="text-3xl font-bold text-indigo-300">${kpis.avgOrderValue.toLocaleString()}</p>
          </div>
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 hover:shadow-3xl transition-all duration-300">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold mb-2">Top Product</h3>
            <p className="text-lg font-bold text-green-300">{kpis.topProduct}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-4xl mx-auto mb-16">
        <details className="relative bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 hover:shadow-3xl transition-all duration-300">
          <summary className="text-2xl font-bold mb-6 cursor-pointer list-none select-none bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            ⚙️ Filters
          </summary>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                className="w-full p-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:border-blue-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
                className="w-full p-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:border-blue-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Product</label>
              <select
                value={filters.product}
                onChange={(e) => updateFilter('product', e.target.value)}
                className="w-full p-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:outline-none focus:border-blue-400 transition-all"
              >
                <option value="">All Products</option>
                {[...new Set(data.map(d => d.Product))].map(p => (
                  <option key={p} value={p as string}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </details>
      </div>

      {/* Charts */}
      <div className="max-w-6xl mx-auto space-y-16 mb-16">
        <div>
          <h3 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Sales Over Time</h3>
          <div className="h-96 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesOverTime}>
                <CartesianGrid strokeDasharray="5 5" strokeOpacity={0.3} />
                <XAxis dataKey="date" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Top Products</h3>
          <div className="h-96 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="5 5" strokeOpacity={0.3} />
                <XAxis dataKey="product" stroke="white" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="white" />
                <Tooltip />
                <Bar dataKey="sales">
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Sales by Category</h3>
          <div className="h-96 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto">
        <h3 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Data Table</h3>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-white/20">
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white">Quantity</th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {filteredData.map((row, index) => (
                  <tr key={index} className="hover:bg-white/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">{row.Date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{row.Product}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{row.Category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{row.Quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">${row.Price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-300">${row.Total.toFixed(2)}</td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-lg text-gray-300">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
