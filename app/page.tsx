"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Scale, DollarSign, ShoppingCart, Upload, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

type DataRow = {
  material: string;
  peso: number;
  valor: number;
};

type Stats = {
  peso: number;
  valor: number;
  count: number;
  ticketMedio: number;
};

const materialColors: Record<string, string> = {
  Cobre: 'bg-orange-500',
  Latão: 'bg-yellow-500',
  Alumínio: 'bg-gray-500',
  Inox: 'bg-blue-500',
};

const initialData: DataRow[] = [
  { material: 'Cobre', peso: 150.5, valor: 12045 },
  { material: 'Cobre', peso: 75.2, valor: 6016 },
  { material: 'Latão', peso: 180.0, valor: 16200 },
  { material: 'Latão', peso: 95.5, valor: 8595 },
  { material: 'Latão', peso: 120.3, valor: 10827 },
  { material: 'Alumínio', peso: 300.0, valor: 9000 },
  { material: 'Alumínio', peso: 250.7, valor: 7521 },
  { material: 'Inox', peso: 100.0, valor: 15000 },
  { material: 'Inox', peso: 80.4, valor: 12060 },
];

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [materials, setMaterials] = useState<Record<string, Stats>>({});
  const [totals, setTotals] = useState<Stats>({ peso: 0, valor: 0, count: 0, ticketMedio: 0 });
  const [chartData, setChartData] = useState<{ name: string; peso: number }[]>([]);
  const [openMaterials, setOpenMaterials] = useState<Set<string>>(new Set(['Cobre']));
  const [dragActive, setDragActive] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const computeAggregates = useCallback((dataRows: DataRow[]): { materials: Record<string, Stats>; totals: Stats } => {
    const mats: Record<string, Stats> = {};
    let totPeso = 0;
    let totValor = 0;
    let totCount = 0;

    for (const row of dataRows) {
      const m = row.material;
      if (!mats[m]) {
        mats[m] = { peso: 0, valor: 0, count: 0, ticketMedio: 0 };
      }
      mats[m].peso += row.peso;
      mats[m].valor += row.valor;
      mats[m].count += 1;
      totPeso += row.peso;
      totValor += row.valor;
      totCount += 1;
    }

    for (const m in mats) {
      mats[m].ticketMedio = mats[m].peso > 0 ? mats[m].valor / mats[m].peso : 0;
    }

    const totalStats: Stats = {
      peso: totPeso,
      valor: totValor,
      count: totCount,
      ticketMedio: totPeso > 0 ? totValor / totPeso : 0,
    };

    return { materials: mats, totals: totalStats };
  }, []);

  useEffect(() => {
    setData(initialData);
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      const aggs = computeAggregates(data);
      setMaterials(aggs.materials);
      setTotals(aggs.totals);
      setChartData(
        Object.entries(aggs.materials).map(([name, stats]) => ({
          name,
          peso: stats.peso,
        }))
      );
    }
  }, [data, computeAggregates]);

  const toggleMaterial = (mat: string) => {
    setOpenMaterials((prev) => {
      const next = new Set(prev);
      if (next.has(mat)) {
        next.delete(mat);
      } else {
        next.add(mat);
      }
      return next;
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet) as DataRow[];
      setData(json);
    };
    reader.readAsArrayBuffer(file);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4 md:gap-0">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
            Metalfama | BI
          </h1>
          <div className="text-xl font-semibold text-gray-700">
            {new Date().toLocaleDateString('pt-BR')}
          </div>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center hover:shadow-3xl transition-all duration-300">
            <Scale className="w-16 h-16 mx-auto mb-4 text-orange-500" />
            <h2 className="text-3xl font-bold text-gray-900">
              {totals.peso.toLocaleString('pt-BR')} kg
            </h2>
            <p className="text-gray-600 mt-2 text-lg">Peso Total</p>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center hover:shadow-3xl transition-all duration-300">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-3xl font-bold text-gray-900">
              {formatCurrency(totals.valor)}
            </h2>
            <p className="text-gray-600 mt-2 text-lg">Valor Total</p>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center hover:shadow-3xl transition-all duration-300">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h2 className="text-3xl font-bold text-gray-900">
              {totals.ticketMedio.toFixed(2)} R$/kg
            </h2>
            <p className="text-gray-600 mt-2 text-lg">Ticket Médio</p>
          </div>
        </div>

        {/* Upload Area */}
        <div
          className={`bg-white rounded-3xl shadow-2xl p-12 mb-12 border-2 border-dashed transition-all duration-300 text-center group ${
            dragActive ? 'border-orange-400 bg-orange-50 shadow-3xl scale-[1.02]' : 'border-gray-300 hover:border-orange-400 hover:shadow-3xl'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-20 h-20 mx-auto mb-6 text-gray-400 group-hover:text-orange-500 transition-colors duration-300" />
          <p className="text-xl font-semibold text-gray-700 mb-2">Arraste seu arquivo Excel aqui</p>
          <p className="text-gray-500 mb-6">ou clique para selecionar</p>
          <input
            ref={fileInput}
            type="file"
            className="hidden"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-orange-600 transition-colors duration-300"
          >
            Selecionar Arquivo
          </button>
        </div>

        {/* Materials Accordions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {Object.entries(materials).map(([mat, stats]) => (
            materialColors[mat as keyof typeof materialColors] ? (
              <div key={mat} className="bg-white rounded-3xl shadow-2xl overflow-hidden relative">
                <div
                  className={`absolute left-0 top-0 h-full w-4 ${materialColors[mat as keyof typeof materialColors]} z-10`}
                />
                <div className="relative pl-4">
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-300 flex justify-between items-center"
                    onClick={() => toggleMaterial(mat)}
                  >
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 capitalize">{mat}</h3>
                      <p className="text-gray-600">{stats.count} itens</p>
                    </div>
                    <ChevronDown
                      className={`w-8 h-8 text-gray-500 transition-transform duration-300 ${
                        openMaterials.has(mat) ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                  {openMaterials.has(mat) && (
                    <div className="p-6 pt-0 border-t border-gray-100 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{stats.peso.toLocaleString('pt-BR')} kg</div>
                          <p className="text-sm text-gray-600 mt-1">Peso</p>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.valor)}</div>
                          <p className="text-sm text-gray-600 mt-1">Valor</p>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-orange-500">{stats.ticketMedio.toFixed(2)} R$/kg</div>
                          <p className="text-sm text-gray-600 mt-1">Ticket Médio</p>
                        </div>
                        <div>
                          <div className="text-xl font-semibold text-gray-900">
                            {totals.valor > 0 ? ((stats.valor / totals.valor) * 100).toFixed(1) : '0'}%
                          </div>
                          <p className="text-sm text-gray-600 mt-1">do total</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null
          ))}
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">Peso por Material</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={14} fontWeight="bold" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="peso" fill="#f97316" name="Peso (kg)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
