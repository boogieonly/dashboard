"use client";

import { useState, useMemo, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';

type Material = 'Cobre' | 'Latão' | 'Alumínio' | 'Inox';

interface Item {
  material: Material;
  peso: number;
  valor: number;
}

const initialData: Item[] = [
  { material: 'Cobre', peso: 150.5, valor: 1204.75 },
  { material: 'Cobre', peso: 45.2, valor: 362.40 },
  { material: 'Latão', peso: 80.2, valor: 904.26 },
  { material: 'Latão', peso: 30.0, valor: 338.10 },
  { material: 'Alumínio', peso: 200.1, valor: 601.30 },
  { material: 'Alumínio', peso: 100.5, valor: 301.50 },
  { material: 'Inox', peso: 50.0, valor: 850.00 },
  { material: 'Inox', peso: 25.3, valor: 428.55 },
];

const materials: Material[] = ['Cobre', 'Latão', 'Alumínio', 'Inox'];

const materialColors: Record<Material, string> = {
  Cobre: 'from-orange-500 to-orange-400',
  Latão: 'from-yellow-500 to-yellow-400',
  Alumínio: 'from-blue-400 to-indigo-400',
  Inox: 'from-gray-400 to-gray-200',
};

export default function Page() {
  const [data, setData] = useState<Item[]>(initialData);
  const [selectedMaterial, setSelectedMaterial] = useState<Material>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const materialTotals = useMemo(() => {
    const totals: Record<string, { peso: number; valor: number }> = {};
    for (const item of data) {
      if (!totals[item.material]) {
        totals[item.material] = { peso: 0, valor: 0 };
      }
      totals[item.material].peso += item.peso;
      totals[item.material].valor += item.valor;
    }
    return totals;
  }, [data]);

  const totalPeso = useMemo(
    () => Object.values(materialTotals).reduce((sum, t) => sum + t.peso, 0),
    [materialTotals]
  );

  const totalValor = useMemo(
    () => Object.values(materialTotals).reduce((sum, t) => sum + t.valor, 0),
    [materialTotals]
  );

  const maxPeso = useMemo(
    () => Math.max(...Object.values(materialTotals).map((t) => t.peso), 0) || 1,
    [materialTotals]
  );

  const chartData = useMemo(
    () => materials.map((m) => ({ name: m, peso: materialTotals[m]?.peso || 0 })),
    [materialTotals]
  );

  const selectedData = useMemo(
    () => data.filter((item) => item.material === selectedMaterial),
    [data, selectedMaterial]
  );

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

      const newItems: Item[] = jsonData
        .map((row: any) => ({
          material: (row.Material || row.material || '').toString().trim() as Material,
          peso: parseFloat((row.Peso || row.peso || '0').toString()) || 0,
          valor: parseFloat((row.Valor || row.valor || '0').toString()) || 0,
        }))
        .filter((item: Item) => item.material && materials.includes(item.material as Material) && item.peso > 0);

      setData((prev) => [...prev, ...newItems]);
    } catch (error) {
      console.error('Error uploading Excel file:', error);
    }

    e.target.value = '';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900/30 to-slate-900 text-white p-8 lg:p-12 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
          <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent drop-shadow-2xl">
            Metalfama Premium Dashboard
          </h1>
          <label
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer font-semibold"
            onClick={() => fileInputRef.current?.click()}
          >
            📁 Upload Excel
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] text-center">
            <div className="text-5xl lg:text-6xl font-black text-blue-400 mb-4 drop-shadow-lg">
              {totalPeso.toFixed(1)}
            </div>
            <div className="text-xl font-semibold text-blue-200 mb-4">Total em Peso</div>
            <div className="inline-flex items-center px-6 py-2 bg-blue-500/30 border border-blue-400/50 rounded-full text-blue-200 font-medium text-sm backdrop-blur-sm">
              <span className="w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
              {totalPeso.toFixed(1)} kg
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] text-center">
            <div className="text-5xl lg:text-6xl font-black text-emerald-400 mb-4 drop-shadow-lg">
              R$ {totalValor.toFixed(2)}
            </div>
            <div className="text-xl font-semibold text-emerald-200 mb-4">Valor Total</div>
            <div className="inline-flex items-center px-6 py-2 bg-emerald-500/30 border border-emerald-400/50 rounded-full text-emerald-200 font-medium text-sm backdrop-blur-sm">
              <span className="w-3 h-3 bg-emerald-400 rounded-full mr-2"></span>
              R$ {totalValor.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Material Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {materials.map((material) => {
            const tot = materialTotals[material];
            return (
              <div
                key={material}
                className="group cursor-pointer bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl hover:shadow-3xl hover:scale-[1.05] hover:bg-white/20 transition-all duration-500 overflow-hidden relative"
                onClick={() => setSelectedMaterial(material)}
              >
                <div className="text-4xl font-black mb-4 drop-shadow-lg">
                  {tot?.peso.toFixed(1) ?? '0'}
                </div>
                <div className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{material}</div>
                <div className="text-lg text-gray-300 mb-6">R$ {tot?.valor.toFixed(2) ?? '0'}</div>
                <div className="absolute inset-0 bg-gradient-to-t opacity-0 group-hover:opacity-100 transition-opacity duration-500 from-black/20 to-transparent pointer-events-none"></div>
              </div>
            );
          })}
        </div>

        {/* BarChart */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-lg">
            Pesos por Material
          </h2>
          <div className="flex gap-6 items-end pb-8 h-80 lg:h-96 justify-center">
            {chartData.map(({ name, peso }) => (
              <div key={name} className="flex flex-col items-center gap-3 flex-1 max-w-[100px] mx-2">
                <div
                  className={`w-16 lg:w-20 bg-gradient-to-t ${materialColors[name as Material]} rounded-t-lg shadow-xl transition-all duration-500 hover:scale-110 mx-auto ${peso === 0 ? 'h-12 opacity-50' : ''}`}
                  style={{
                    height: `${Math.max((peso / maxPeso) * 280, 20)}px`,
                  }}
                />
                <div className="text-lg font-bold text-white drop-shadow-md">{peso.toFixed(1)} kg</div>
                <div className="text-sm font-medium text-gray-300 uppercase tracking-wide">{name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedMaterial && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedMaterial(undefined)}
        >
          <div
            className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-8 lg:p-12 max-w-6xl max-h-[90vh] w-full overflow-y-auto shadow-3xl hover:shadow-4xl transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/20">
              <h2 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent drop-shadow-2xl">
                {selectedMaterial} - Detalhes
              </h2>
              <button
                onClick={() => setSelectedMaterial(undefined)}
                className="text-3xl hover:text-red-400 transition-colors p-2 rounded-xl hover:bg-white/20"
              >
                &times;
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm lg:text-base border-collapse">
                <thead>
                  <tr className="bg-white/10 backdrop-blur-sm border-b border-white/30">
                    <th className="p-4 text-left font-bold rounded-l-xl">Material</th>
                    <th className="p-4 text-left font-bold">Peso (kg)</th>
                    <th className="p-4 text-left font-bold rounded-r-xl">Valor (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedData.length > 0 ? (
                    selectedData.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-white/20 transition-all duration-200 border-b border-white/10 last:border-b-0"
                      >
                        <td className="p-4 font-semibold text-white/90">{item.material}</td>
                        <td className="p-4 font-mono text-blue-300">{item.peso.toFixed(1)}</td>
                        <td className="p-4 font-mono text-emerald-300">R$ {item.valor.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-12 text-center text-gray-400 font-medium">
                        Nenhum registro encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-8 pt-8 border-t border-white/20 text-center space-y-2">
              <div className="text-2xl font-bold text-blue-400">
                Total Peso: {materialTotals[selectedMaterial]?.peso.toFixed(1) ?? '0'} kg
              </div>
              <div className="text-2xl font-bold text-emerald-400">
                Total Valor: R$ {materialTotals[selectedMaterial]?.valor.toFixed(2) ?? '0'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
