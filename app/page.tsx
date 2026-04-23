'use client';

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

type MaterialType = 'Cobre' | 'Latão' | 'Alumínio' | 'Inox';

interface DataRow {
  Material: string;
  Peso: number;
  Valor: number;
}

const sampleData: DataRow[] = [
  { Material: 'Cobre', Peso: 150, Valor: 5000 },
  { Material: 'Cobre', Peso: 200, Valor: 7000 },
  { Material: 'Latão', Peso: 100, Valor: 3000 },
  { Material: 'Latão', Peso: 80, Valor: 2500 },
  { Material: 'Alumínio', Peso: 300, Valor: 2000 },
  { Material: 'Alumínio', Peso: 250, Valor: 1800 },
  { Material: 'Inox', Peso: 120, Valor: 6000 },
  { Material: 'Inox', Peso: 180, Valor: 8500 },
];

const materials = [
  {
    name: 'Cobre' as MaterialType,
    sideGradient: 'bg-gradient-to-b from-orange-500 via-orange-500/90 to-orange-600',
    cardGradient: 'bg-gradient-to-r from-orange-50/30 via-transparent to-orange-50/10',
  },
  {
    name: 'Latão' as MaterialType,
    sideGradient: 'bg-gradient-to-b from-amber-400 via-amber-400/90 to-amber-500',
    cardGradient: 'bg-gradient-to-r from-amber-50/30 via-transparent to-amber-50/10',
  },
  {
    name: 'Alumínio' as MaterialType,
    sideGradient: 'bg-gradient-to-b from-gray-400 via-gray-400/90 to-gray-500',
    cardGradient: 'bg-gradient-to-r from-gray-100/50 via-transparent to-gray-100/20',
  },
  {
    name: 'Inox' as MaterialType,
    sideGradient: 'bg-gradient-to-b from-slate-800 via-blue-900/90 to-indigo-900',
    cardGradient: 'bg-gradient-to-r from-slate-50/30 via-transparent to-blue-50/10',
  },
] as {
  name: MaterialType;
  sideGradient: string;
  cardGradient: string;
}[];

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [showAllModal, setShowAllModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState<MaterialType | null>(null);

  useEffect(() => {
    // Load sample data
    setData(sampleData);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result as string;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        /* eslint-disable */
        const parsedData = XLSX.utils.sheet_to_json<DataRow>(ws);
        /* eslint-enable */
        setData(parsedData as DataRow[]);
      };
      reader.readAsBinaryString(selectedFile);
    }
  };

  const totalPeso = useMemo(
    () => data.reduce((sum, row) => sum + (row.Peso || 0), 0),
    [data]
  );

  const materialStats = useMemo(() => {
    const stats: Record<MaterialType, { peso: number; valor: number; count: number }> = {
      Cobre: { peso: 0, valor: 0, count: 0 },
      Latão: { peso: 0, valor: 0, count: 0 },
      Alumínio: { peso: 0, valor: 0, count: 0 },
      Inox: { peso: 0, valor: 0, count: 0 },
    };
    data.forEach((row) => {
      const mat = row.Material as MaterialType;
      if (mat in stats) {
        stats[mat].peso += row.Peso || 0;
        stats[mat].valor += row.Valor || 0;
        stats[mat].count += 1;
      }
    });
    return stats;
  }, [data]);

  const filteredData =
    showMaterialModal ? data.filter((row) => row.Material === showMaterialModal) : data;

  const chartData = materials.map(({ name }) => ({
    material: name,
    peso: materialStats[name].peso,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/30 to-indigo-900 p-8 font-sans">
      {/* Header */}
      <div className="w-full h-36 bg-gradient-to-r from-slate-950 via-slate-800 to-blue-500 rounded-3xl p-12 mb-12 flex items-center justify-center shadow-3xl border border-white/20">
        <h1 className="text-6xl font-black tracking-tighter text-white drop-shadow-3xl bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
          Dashboard Comercial
        </h1>
      </div>

      {/* File Upload */}
      <div className="max-w-md mx-auto mb-12">
        <label className="block text-center text-lg font-semibold text-white/90 mb-4">
          Carregar Excel (Material, Peso, Valor)
        </label>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-8 file:rounded-3xl file:border-0 file:text-lg file:font-bold file:bg-gradient-to-r file:from-blue-500 file:to-indigo-600 file:text-white hover:file:from-blue-600 hover:file:to-purple-600 shadow-xl cursor-pointer transition-all"
        />
      </div>

      {/* Central KPI */}
      <div className="max-w-4xl mx-auto mb-16">
        <div
          className="relative bg-white/95 backdrop-blur-3xl shadow-4xl rounded-3xl p-16 text-center cursor-pointer hover:scale-[1.02] transition-all duration-500 border-8 border-blue-900/30 hover:border-blue-800/50 overflow-hidden group"
          onClick={() => setShowAllModal(true)}
        >
          <div className="w-full h-4 bg-gradient-to-r from-blue-900 to-blue-700 rounded-full mx-auto mb-12 shadow-2xl group-hover:shadow-blue-500/25 transition-shadow"></div>
          <div className="text-9xl mb-8">📦</div>
          <h2 className="text-4xl font-black text-gray-800 mb-4 tracking-tight">Total em Peso</h2>
          <p className="text-7xl font-black bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent drop-shadow-2xl">
            {totalPeso.toLocaleString()}
          </p>
          <p className="text-3xl font-bold text-gray-600 mt-2">kg</p>
        </div>
      </div>

      {/* Materials Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-20">
        {materials.map(({ name, sideGradient, cardGradient }) => (
          <div
            key={name}
            className={`relative bg-white/95 backdrop-blur-3xl shadow-3xl rounded-3xl p-12 cursor-pointer hover:scale-[1.02] transition-all duration-500 group overflow-hidden ${cardGradient} hover:shadow-4xl border border-white/50 hover:border-blue-200/50`}
            onClick={() => setShowMaterialModal(name)}
          >
            <div
              className={`${sideGradient} w-28 absolute left-0 top-0 h-full transform -skew-x-12 opacity-80 group-hover:opacity-100 group-hover:w-32 transition-all duration-500 z-10`}
            />
            <div className="relative z-20 text-center">
              <h3 className="text-3xl font-black text-gray-900 mb-8 tracking-tighter drop-shadow-lg">
                {name}
              </h3>
              <div className="text-6xl font-black text-gray-900 mb-4">
                {materialStats[name].peso.toLocaleString()}
              </div>
              <div className="text-3xl text-blue-900 font-bold mb-4">kg</div>
              <p className="text-2xl text-gray-700 font-semibold">
                R$ {materialStats[name].valor.toLocaleString()}
              </p>
              <p className="text-xl text-gray-500 mt-4 font-medium">
                {materialStats[name].count} itens
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-3xl shadow-4xl rounded-3xl p-12 border border-white/40">
        <h2 className="text-4xl font-black text-gray-900 mb-12 text-center tracking-tighter">
          Análise Visual por Material (Peso)
        </h2>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
            <XAxis dataKey="material" fontSize={16} fontWeight="bold" />
            <YAxis fontSize={14} />
            <Tooltip />
            <Legend />
            <Bar dataKey="peso" fill="#3B82F6" name="Peso (kg)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* All Items Modal */}
      {showAllModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-8"
          onClick={() => setShowAllModal(false)}
        >
          <div
            className="bg-white/95 backdrop-blur-3xl rounded-3xl shadow-4xl max-w-5xl max-h-[85vh] w-full overflow-auto border-4 border-blue-900/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/100 z-20 p-8 border-b-4 border-blue-900/30 shadow-lg">
              <h2 className="text-4xl font-black text-gray-900 inline-block">
                📦 Todos os Itens
              </h2>
              <span className="ml-8 text-3xl font-bold text-blue-900">
                Total: {totalPeso.toLocaleString()} kg
              </span>
              <button
                className="float-right text-4xl font-bold text-gray-500 hover:text-red-500 transition-colors"
                onClick={() => setShowAllModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="p-8 overflow-x-auto">
              <table className="w-full table-auto border-collapse bg-white shadow-md rounded-2xl overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
                    <th className="border border-blue-800 p-6 text-left font-black text-xl">Material</th>
                    <th className="border border-blue-800 p-6 text-left font-black text-xl">Peso (kg)</th>
                    <th className="border border-blue-800 p-6 text-left font-black text-xl">Valor (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i} className="hover:bg-blue-50 transition-colors even:bg-gray-50">
                      <td className="border p-6 font-semibold text-lg">{row.Material}</td>
                      <td className="border p-6 font-bold text-xl text-blue-900">{row.Peso?.toLocaleString()}</td>
                      <td className="border p-6 font-semibold text-lg">{row.Valor?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Material Modal */}
      {showMaterialModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-8"
          onClick={() => setShowMaterialModal(null)}
        >
          <div
            className="bg-white/95 backdrop-blur-3xl rounded-3xl shadow-4xl max-w-5xl max-h-[85vh] w-full overflow-auto border-4 border-blue-900/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/100 z-20 p-8 border-b-4 border-blue-900/30 shadow-lg">
              <h2 className="text-4xl font-black text-gray-900 inline-block">
                {showMaterialModal}
              </h2>
              <span className="ml-8 text-3xl font-bold text-blue-900">
                Total Peso: {materialStats[showMaterialModal].peso.toLocaleString()} kg
              </span>
              <button
                className="float-right text-4xl font-bold text-gray-500 hover:text-red-500 transition-colors"
                onClick={() => setShowMaterialModal(null)}
              >
                ✕
              </button>
            </div>
            <div className="p-8 overflow-x-auto">
              <table className="w-full table-auto border-collapse bg-white shadow-md rounded-2xl overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-800 to-blue-900 text-white">
                    <th className="border border-slate-700 p-6 text-left font-black text-xl">Material</th>
                    <th className="border border-slate-700 p-6 text-left font-black text-xl">Peso (kg)</th>
                    <th className="border border-slate-700 p-6 text-left font-black text-xl">Valor (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, i) => (
                    <tr key={i} className="hover:bg-blue-50 transition-colors even:bg-gray-50">
                      <td className="border p-6 font-semibold text-lg">{row.Material}</td>
                      <td className="border p-6 font-bold text-xl text-blue-900">{row.Peso?.toLocaleString()}</td>
                      <td className="border p-6 font-semibold text-lg">{row.Valor?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
