"use client";

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

type DataRow = {
  material: string;
  peso: number;
  valor: number;
};

type ChartData = {
  name: string;
  peso: number;
  valor: number;
};

const EXAMPLE_DATA: DataRow[] = [
  { material: 'Cobre', peso: 150.5, valor: 7525 },
  { material: 'Cobre', peso: 200, valor: 10000 },
  { material: 'Cobre', peso: 100, valor: 5000 },
  { material: 'Latão', peso: 100, valor: 4500 },
  { material: 'Latão', peso: 50, valor: 2250 },
  { material: 'Latão', peso: 75, valor: 3375 },
  { material: 'Alumínio', peso: 300, valor: 3600 },
  { material: 'Alumínio', peso: 250, valor: 3000 },
  { material: 'Alumínio', peso: 180, valor: 2160 },
  { material: 'Inox', peso: 120, valor: 7200 },
  { material: 'Inox', peso: 80, valor: 4800 },
  { material: 'Inox', peso: 90, valor: 5400 }
];

const TableModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  tableData: DataRow[];
}> = ({ isOpen, onClose, title, tableData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-8 border-b bg-gradient-to-r from-slate-50 to-blue-50 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-3xl font-bold text-slate-500 hover:text-slate-700 p-2 -m-2 rounded-xl hover:bg-slate-200 transition-all"
          >
            ×
          </button>
        </div>
        <div className="overflow-auto flex-1 p-8">
          <table className="w-full table-auto border-collapse bg-white">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100">
                <th className="p-6 text-left font-black text-lg text-slate-700 border-r border-slate-200">Material</th>
                <th className="p-6 text-right font-black text-lg text-slate-700">Peso (kg)</th>
                <th className="p-6 text-right font-black text-lg text-slate-700">Valor (R$)</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-blue-50 transition-colors">
                  <td className="p-6 font-semibold text-slate-800">{row.material}</td>
                  <td className="p-6 text-right font-mono text-2xl text-emerald-600">{row.peso.toLocaleString()}</td>
                  <td className="p-6 text-right font-mono text-2xl text-blue-600">{row.valor.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const DashboardComercial: React.FC = () => {
  const [data, setData] = useState<DataRow[]>(EXAMPLE_DATA);
  const [totalPeso, setTotalPeso] = useState(0);
  const [totalValor, setTotalValor] = useState(0);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [showPesoModal, setShowPesoModal] = useState(false);
  const [showValorModal, setShowValorModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');

  const pesoSortedData = React.useMemo(() => [...data].sort((a, b) => b.peso - a.peso), [data]);
  const valorSortedData = React.useMemo(() => [...data].sort((a, b) => b.valor - a.valor), [data]);
  const filteredData = React.useMemo(
    () => selectedMaterial ? data.filter((d) => d.material === selectedMaterial) : data,
    [data, selectedMaterial]
  );

  useEffect(() => {
    const tp = data.reduce((sum, row) => sum + row.peso, 0);
    const tv = data.reduce((sum, row) => sum + row.valor, 0);
    setTotalPeso(tp);
    setTotalValor(tv);

    const agg: Record<string, { peso: number; valor: number }> = {};
    data.forEach((row) => {
      if (!agg[row.material]) {
        agg[row.material] = { peso: 0, valor: 0 };
      }
      agg[row.material].peso += row.peso;
      agg[row.material].valor += row.valor;
    });
    const cd: ChartData[] = Object.entries(agg).map(([name, vals]) => ({
      name,
      peso: vals.peso,
      valor: vals.valor,
    }));
    setChartData(cd);
  }, [data]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result as string;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const json: any[] = XLSX.utils.sheet_to_json(ws);
        /* eslint-enable @typescript-eslint/no-explicit-any */
        const newData: DataRow[] = json
          .map((row) => ({
            material: String(row.Material || ''),
            peso: Number(row.Peso) || 0,
            valor: Number(row.Valor) || 0,
          }))
          .filter((row) => row.material && (row.peso > 0 || row.valor > 0));
        setData(newData);
      };
      reader.readAsBinaryString(selectedFile);
    }
  };

  const openMaterialModal = (mat: string) => {
    setSelectedMaterial(mat);
    setShowMaterialModal(true);
  };

  const getMaterialTotals = (material: string) => {
    const matData = chartData.find((c) => c.name === material);
    return {
      peso: matData?.peso || 0,
      valor: matData?.valor || 0,
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 md:p-12">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 to-blue-500 text-white py-16 px-8 rounded-b-3xl mb-16 shadow-2xl text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black drop-shadow-2xl">
            Dashboard Comercial
          </h1>
          <p className="text-2xl mt-4 opacity-90 drop-shadow-lg">Metalfama Premium</p>
        </div>

        {/* Upload Button */}
        <div className="flex justify-end mb-12">
          <label className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl shadow-2xl hover:scale-105 hover:shadow-3xl transition-all cursor-pointer font-semibold">
            📁 Carregar Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          <div
            className="group bg-white rounded-3xl shadow-2xl p-12 md:p-16 text-center cursor-pointer hover:scale-[1.02] transition-all border-l-[15px] border-slate-900 hover:border-slate-800 hover:shadow-3xl"
            onClick={() => setShowPesoModal(true)}
          >
            <div className="text-7xl mb-6 group-hover:scale-110 transition-transform">📦</div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">Total em Peso</h2>
            <p className="text-5xl md:text-6xl font-black text-slate-900 mb-4">
              {totalPeso.toLocaleString()}
            </p>
            <p className="text-2xl text-slate-600 font-semibold">kg</p>
            <div className="mt-6 text-lg text-slate-500 group-hover:text-slate-700 transition-colors">
              Clique para ver detalhes
            </div>
          </div>
          <div
            className="group bg-white rounded-3xl shadow-2xl p-12 md:p-16 text-center cursor-pointer hover:scale-[1.02] transition-all border-l-[15px] border-emerald-600 hover:border-emerald-500 hover:shadow-3xl"
            onClick={() => setShowValorModal(true)}
          >
            <div className="text-7xl mb-6 group-hover:scale-110 transition-transform">💰</div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">Valor Total</h2>
            <p className="text-5xl md:text-6xl font-black text-slate-900 mb-4">
              R$ {totalValor.toLocaleString()}
            </p>
            <div className="mt-6 text-lg text-slate-500 group-hover:text-slate-700 transition-colors">
              Clique para ver detalhes
            </div>
          </div>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <div
            className="group bg-white rounded-3xl shadow-2xl p-10 cursor-pointer hover:scale-[1.02] transition-all border-l-[15px] border-orange-500 hover:border-orange-400 hover:shadow-3xl"
            onClick={() => openMaterialModal('Cobre')}
          >
            <h3 className="text-3xl font-black text-orange-600 mb-6 drop-shadow-sm">Cobre</h3>
            <p className="text-5xl font-black text-slate-900">
              {getMaterialTotals('Cobre').peso.toLocaleString()}
            </p>
            <p className="text-2xl text-slate-600 mt-2 font-semibold">
              R$ {getMaterialTotals('Cobre').valor.toLocaleString()}
            </p>
          </div>
          <div
            className="group bg-white rounded-3xl shadow-2xl p-10 cursor-pointer hover:scale-[1.02] transition-all border-l-[15px] border-yellow-500 hover:border-yellow-400 hover:shadow-3xl"
            onClick={() => openMaterialModal('Latão')}
          >
            <h3 className="text-3xl font-black text-yellow-600 mb-6 drop-shadow-sm">Latão</h3>
            <p className="text-5xl font-black text-slate-900">
              {getMaterialTotals('Latão').peso.toLocaleString()}
            </p>
            <p className="text-2xl text-slate-600 mt-2 font-semibold">
              R$ {getMaterialTotals('Latão').valor.toLocaleString()}
            </p>
          </div>
          <div
            className="group bg-white rounded-3xl shadow-2xl p-10 cursor-pointer hover:scale-[1.02] transition-all border-l-[15px] border-gray-500 hover:border-gray-400 hover:shadow-3xl"
            onClick={() => openMaterialModal('Alumínio')}
          >
            <h3 className="text-3xl font-black text-gray-700 mb-6 drop-shadow-sm">Alumínio</h3>
            <p className="text-5xl font-black text-slate-900">
              {getMaterialTotals('Alumínio').peso.toLocaleString()}
            </p>
            <p className="text-2xl text-slate-600 mt-2 font-semibold">
              R$ {getMaterialTotals('Alumínio').valor.toLocaleString()}
            </p>
          </div>
          <div
            className="group bg-white rounded-3xl shadow-2xl p-10 cursor-pointer hover:scale-[1.02] transition-all border-l-[15px] border-indigo-700 hover:border-indigo-600 hover:shadow-3xl"
            onClick={() => openMaterialModal('Inox')}
          >
            <h3 className="text-3xl font-black text-indigo-700 mb-6 drop-shadow-sm">Inox</h3>
            <p className="text-5xl font-black text-slate-900">
              {getMaterialTotals('Inox').peso.toLocaleString()}
            </p>
            <p className="text-2xl text-slate-600 mt-2 font-semibold">
              R$ {getMaterialTotals('Inox').valor.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 md:p-16">
          <h2 className="text-4xl font-black text-center mb-12 text-slate-800 drop-shadow-sm">
            Análise por Material
          </h2>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                fontSize={16}
                fontWeight="bold"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="peso"
                orientation="left"
                stroke="#f97316"
                fontSize={14}
                tickLine={false}
              />
              <YAxis
                yAxisId="valor"
                orientation="right"
                stroke="#10b981"
                fontSize={14}
                tickLine={false}
              />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="peso"
                yAxisId="peso"
                fill="#f97316"
                name="Peso (kg)"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="valor"
                yAxisId="valor"
                fill="#10b981"
                name="Valor (R$)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Modals */}
      <TableModal
        isOpen={showPesoModal}
        onClose={() => setShowPesoModal(false)}
        title="📦 Total em Peso - Detalhes Completos"
        tableData={pesoSortedData}
      />
      <TableModal
        isOpen={showValorModal}
        onClose={() => setShowValorModal(false)}
        title="💰 Valor Total - Detalhes Completos"
        tableData={valorSortedData}
      />
      <TableModal
        isOpen={showMaterialModal}
        onClose={() => setShowMaterialModal(false)}
        title={`Detalhes Completos - ${selectedMaterial}`}
        tableData={filteredData}
      />
    </div>
  );
};

export default DashboardComercial;
