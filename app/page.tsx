"use client";

import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
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

type Item = {
  Material: string;
  Peso: number;
  Valor: number;
};

export default function DashboardPage() {
  const [data, setData] = useState<Item[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const initialData: Item[] = [
    { Material: 'Cobre', Peso: 120.5, Valor: 8560.75 },
    { Material: 'Cobre', Peso: 85.0, Valor: 6120.00 },
    { Material: 'Cobre', Peso: 200.0, Valor: 14200.00 },
    { Material: 'Cobre', Peso: 95.3, Valor: 6785.50 },
    { Material: 'Latão', Peso: 150.2, Valor: 9451.25 },
    { Material: 'Latão', Peso: 75.8, Valor: 4770.50 },
    { Material: 'Latão', Peso: 180.0, Valor: 11340.00 },
    { Material: 'Alumínio', Peso: 300.5, Valor: 4510.75 },
    { Material: 'Alumínio', Peso: 250.0, Valor: 3750.00 },
    { Material: 'Alumínio', Peso: 400.0, Valor: 6000.00 },
    { Material: 'Inox', Peso: 90.0, Valor: 11250.00 },
    { Material: 'Inox', Peso: 110.5, Valor: 13812.50 },
    { Material: 'Inox', Peso: 75.0, Valor: 9375.00 },
  ];

  useEffect(() => {
    setData(initialData);
  }, []);

  const totalPeso = useMemo(() => data.reduce((sum, item) => sum + item.Peso, 0), [data]);
  const totalValor = useMemo(() => data.reduce((sum, item) => sum + item.Valor, 0), [data]);

  const materials = ['Cobre', 'Latão', 'Alumínio', 'Inox'];

  const materialTotals = useMemo(
    () =>
      materials.map((m) => ({
        name: m,
        Peso: data.filter((i) => i.Material === m).reduce((s, i) => s + i.Peso, 0),
      })),
    [data]
  );

  const filteredData = useMemo(
    () => (selectedCategory === 'Todos' ? data : data.filter((item) => item.Material === selectedCategory)),
    [data, selectedCategory]
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const buffer = ev.target?.result as ArrayBuffer;
        const wb = XLSX.read(buffer, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Item>(ws);
        setData(json as Item[]);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const openModal = (category: string) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-blue-900 to-blue-400 py-20 text-white">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter drop-shadow-2xl leading-none">
              Dashboard Comercial
            </h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
          {/* File Upload Button */}
          <label className="fixed top-6 right-6 z-40 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-xl transition-all duration-300 font-semibold cursor-pointer">
            Carregar Excel
            <input
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Total Peso Card */}
            <div
              className="group bg-white rounded-2xl shadow-xl border-l-[12px] border-blue-900 p-10 text-center cursor-pointer hover:scale-[1.02] hover:shadow-2xl transition-all duration-300"
              onClick={() => openModal('Todos')}
            >
              <div className="text-5xl mb-4">📦</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Total em Peso</h2>
              <p className="text-5xl md:text-6xl font-black text-blue-900">
                {totalPeso.toLocaleString('pt-BR')} kg
              </p>
            </div>

            {/* Valor Total Card */}
            <div
              className="group bg-white rounded-2xl shadow-xl border-l-[12px] border-emerald-600 p-10 text-center cursor-pointer hover:scale-[1.02] hover:shadow-2xl transition-all duration-300"
              onClick={() => openModal('Todos')}
            >
              <div className="text-5xl mb-4">💰</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Valor Total</h2>
              <p className="text-5xl md:text-6xl font-black text-emerald-700">
                R$ {totalValor.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Materials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {materials.map((material) => {
              const matTotal = materialTotals.find((m) => m.name === material)?.Peso || 0;
              const colorMap: Record<string, { border: string; text: string; emoji: string }> = {
                Cobre: { border: 'border-orange-500', text: 'text-orange-600', emoji: '🟠' },
                Latão: { border: 'border-amber-500', text: 'text-amber-600', emoji: '🟡' },
                Alumínio: { border: 'border-gray-400', text: 'text-gray-600', emoji: '⚪' },
                Inox: { border: 'border-indigo-600', text: 'text-indigo-700', emoji: '🔵' },
              };
              const colors = colorMap[material];

              return (
                <div
                  key={material}
                  className={`group bg-white rounded-2xl shadow-xl ${colors.border} p-8 text-center cursor-pointer hover:scale-[1.02] hover:shadow-2xl transition-all duration-300`}
                  onClick={() => openModal(material)}
                >
                  <div className="text-4xl mb-4">{colors.emoji}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 capitalize">{material}</h3>
                  <p className="text-3xl font-black ${colors.text}">
                    {matTotal.toLocaleString('pt-BR')} kg
                  </p>
                </div>
              );
            })}
          </div>

          {/* Chart */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Distribuição por Material (Peso)</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={materialTotals}>
                <defs>
                  <linearGradient id="colorPeso" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="90%" stopColor="#047857" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Peso" fill="url(#colorPeso)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b rounded-t-3xl">
              <h2 className="text-2xl font-black text-gray-800">
                Detalhes {selectedCategory === 'Todos' ? 'Gerais' : ` - ${selectedCategory}`}
              </h2>
              <button
                onClick={closeModal}
                className="text-2xl hover:text-red-500 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border-b p-4 text-left font-bold text-gray-700">Material</th>
                    <th className="border-b p-4 text-left font-bold text-gray-700">Peso (kg)</th>
                    <th className="border-b p-4 text-left font-bold text-gray-700">Valor (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium capitalize">{item.Material}</td>
                      <td className="p-4">{item.Peso.toLocaleString('pt-BR')}</td>
                      <td className="p-4 font-semibold">
                        R$ {item.Valor.toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length === 0 && (
                <p className="text-center py-8 text-gray-500">Nenhum dado disponível.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
