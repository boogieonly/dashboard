"use client";

import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Item = {
  material: string;
  peso: number;
  valor: number;
};

const sampleData: Item[] = [
  { material: 'Cobre', peso: 150, valor: 7500 },
  { material: 'Cobre', peso: 200, valor: 10000 },
  { material: 'Latão', peso: 80, valor: 3200 },
  { material: 'Latão', peso: 120, valor: 4800 },
  { material: 'Alumínio', peso: 300, valor: 4500 },
  { material: 'Alumínio', peso: 250, valor: 3750 },
  { material: 'Inox', peso: 90, valor: 9000 },
  { material: 'Inox', peso: 110, valor: 11000 },
];

export default function Page() {
  const [data, setData] = useState<Item[]>(sampleData);
  const [pesoExpanded, setPesoExpanded] = useState(false);
  const [valorExpanded, setValorExpanded] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  const pesoFormatter = useMemo(() => new Intl.NumberFormat('pt-BR'), []);
  const currencyFormatter = useMemo(() => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }), []);

  const totals = useMemo(() => ({
    totalPeso: data.reduce((sum, i) => sum + i.peso, 0),
    totalValor: data.reduce((sum, i) => sum + i.valor, 0),
  }), [data]);

  const groups = useMemo(() => {
    const g: Record<string, Item[]> = {};
    data.forEach((i) => {
      if (!g[i.material]) g[i.material] = [];
      g[i.material]!.push(i);
    });
    return g;
  }, [data]);

  const pesoTableData = useMemo(() => [...data].sort((a, b) => b.peso - a.peso), [data]);
  const valorTableData = useMemo(() => [...data].sort((a, b) => b.valor - a.valor), [data]);

  const chartData = useMemo(() => {
    const materials = ['Cobre', 'Latão', 'Alumínio', 'Inox'];
    return materials.map((mat) => ({
      material: mat,
      peso: groups[mat]?.reduce((s, i) => s + i.peso, 0) || 0,
      valor: groups[mat]?.reduce((s, i) => s + i.valor, 0) || 0,
    }));
  }, [groups]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const bstr = ev.target?.result as string;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws);
      const newData: Item[] = json
        .map((row) => ({
          material: String(row.Material || ''),
          peso: Number(row.Peso) || 0,
          valor: Number(row.Valor) || 0,
        }))
        .filter((i) => i.material && (i.peso > 0 || i.valor > 0));
      setData(newData);
    };
    reader.readAsBinaryString(file);
  };

  const toggleCat = (mat: string) => {
    setExpandedCats((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(mat)) {
        newSet.delete(mat);
      } else {
        newSet.add(mat);
      }
      return newSet;
    });
  };

  const getColorClass = (mat: string): string => {
    switch (mat) {
      case 'Cobre': return 'orange-500';
      case 'Latão': return 'yellow-500';
      case 'Alumínio': return 'gray-500';
      case 'Inox': return 'blue-900';
      default: return 'gray-500';
    }
  };

  return (
    <>
      <div className="w-full bg-gradient-to-r from-slate-950 to-blue-500 py-20 px-6 md:px-12">
        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight text-center">
          Dashboard Comercial
        </h1>
      </div>
      <main className="bg-slate-50 min-h-screen pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* File Upload */}
          <div className="text-center mb-20">
            <label
              htmlFor="file-upload"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl cursor-pointer transition-all"
            >
              📊 Carregar Arquivo Excel
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFile}
              accept=".xlsx,.xls"
              className="hidden"
            />
          </div>

          {/* KPIs */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {/* Total Peso */}
            <div
              className="group relative bg-white rounded-3xl shadow-2xl p-10 cursor-pointer hover:shadow-3xl transition-all duration-300"
              onClick={() => setPesoExpanded((p) => !p)}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-8 py-3 rounded-3xl font-bold shadow-2xl">
                📦 Total em Peso
              </div>
              <div className="text-4xl md:text-5xl font-black text-slate-900 mt-12">
                {pesoFormatter.format(totals.totalPeso)} kg
              </div>
              <div className="text-lg text-slate-500 mt-2">Clique para detalhes</div>
              <div
                className={`mt-10 overflow-hidden transition-all duration-500 ${
                  pesoExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="pt-6">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="text-left font-bold text-xl text-slate-800 py-4">Material</th>
                        <th className="text-left font-bold text-xl text-slate-800 py-4">Peso (kg)</th>
                        <th className="text-left font-bold text-xl text-slate-800 py-4">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pesoTableData.map((item, idx) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? 'bg-slate-50' : ''}
                        >
                          <td className="py-4 font-medium text-slate-900">{item.material}</td>
                          <td className="py-4 font-medium text-slate-900">
                            {pesoFormatter.format(item.peso)}
                          </td>
                          <td className="py-4 font-medium text-slate-900">
                            {currencyFormatter.format(item.valor)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Total Valor */}
            <div
              className="group relative bg-white rounded-3xl shadow-2xl p-10 cursor-pointer hover:shadow-3xl transition-all duration-300"
              onClick={() => setValorExpanded((v) => !v)}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-500 text-white px-8 py-3 rounded-3xl font-bold shadow-2xl">
                💰 Valor Total
              </div>
              <div className="text-4xl md:text-5xl font-black text-slate-900 mt-12">
                {currencyFormatter.format(totals.totalValor)}
              </div>
              <div className="text-lg text-slate-500 mt-2">Clique para detalhes</div>
              <div
                className={`mt-10 overflow-hidden transition-all duration-500 ${
                  valorExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="pt-6">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="text-left font-bold text-xl text-slate-800 py-4">Material</th>
                        <th className="text-left font-bold text-xl text-slate-800 py-4">Peso (kg)</th>
                        <th className="text-left font-bold text-xl text-slate-800 py-4">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {valorTableData.map((item, idx) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? 'bg-slate-50' : ''}
                        >
                          <td className="py-4 font-medium text-slate-900">{item.material}</td>
                          <td className="py-4 font-medium text-slate-900">
                            {pesoFormatter.format(item.peso)}
                          </td>
                          <td className="py-4 font-medium text-slate-900">
                            {currencyFormatter.format(item.valor)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {['Cobre', 'Latão', 'Alumínio', 'Inox'].map((mat) => {
              const items = groups[mat] || [];
              const subTotalPeso = items.reduce((s, i) => s + i.peso, 0);
              const subTotalValor = items.reduce((s, i) => s + i.valor, 0);
              const colorClass = getColorClass(mat);
              const isExpanded = expandedCats.has(mat);
              return (
                <div
                  key={mat}
                  className="bg-white rounded-3xl shadow-2xl p-10 cursor-pointer hover:shadow-3xl transition-all duration-300 group"
                  onClick={() => toggleCat(mat)}
                >
                  <div
                    className={`bg-${colorClass} text-white px-6 py-4 rounded-2xl font-bold mb-8 shadow-xl text-center`}
                  >
                    {mat}
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-2">
                    {pesoFormatter.format(subTotalPeso)} kg
                  </div>
                  <div className="text-2xl font-bold text-slate-700 mb-4">
                    {currencyFormatter.format(subTotalValor)}
                  </div>
                  <div className="text-sm text-slate-500">Peso / Valor</div>
                  <div
                    className={`mt-12 overflow-hidden transition-all duration-500 ${
                      isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="pt-6">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b-2 border-slate-200">
                            <th className="text-left font-bold text-lg text-slate-800 py-3">Peso (kg)</th>
                            <th className="text-left font-bold text-lg text-slate-800 py-3">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, idx) => (
                            <tr
                              key={idx}
                              className={idx % 2 === 0 ? 'bg-slate-50' : ''}
                            >
                              <td className="py-3 font-medium text-slate-900">
                                {pesoFormatter.format(item.peso)}
                              </td>
                              <td className="py-3 font-medium text-slate-900">
                                {currencyFormatter.format(item.valor)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chart */}
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Visão Geral por Material</h2>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="material"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={20}
                  tick={{ fontSize: 14, fontWeight: 600 }}
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="#3b82f6"
                  tickMargin={20}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#10b981"
                  tickMargin={20}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar
                  yAxisId="left"
                  dataKey="peso"
                  fill="#3b82f6"
                  name="Peso (kg)"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="valor"
                  fill="#10b981"
                  name="Valor (R$)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </>
  );
}
