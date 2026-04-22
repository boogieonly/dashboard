'use client';

import { useState, useEffect } from 'react';

interface Material {
  name: string;
  kg: number;
  valor: number;
}

const Dashboard = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const exampleData: Material[] = [
    { name: 'Cobre', kg: 1500, valor: 25000 },
    { name: 'Latão', kg: 800, valor: 12000 },
    { name: 'Alumínio', kg: 2000, valor: 8000 },
  ];

  const exampleData2: Material[] = [
    { name: 'Cobre', kg: 1200, valor: 22000 },
    { name: 'Latão', kg: 1200, valor: 18000 },
    { name: 'Alumínio', kg: 2500, valor: 10000 },
  ];

  useEffect(() => {
    setMaterials(exampleData);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.xlsx')) {
      setFile(selectedFile);
      // Simulate Excel parsing by loading alternative example data
      setMaterials(exampleData2);
    } else {
      alert('Por favor, selecione um arquivo .xlsx válido.');
      e.target.value = '';
    }
  };

  const totalKg = materials.reduce((sum, m) => sum + m.kg, 0);
  const totalValor = materials.reduce((sum, m) => sum + m.valor, 0);

  const maxValor = Math.max(...materials.map((m) => m.valor), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-gray-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent mb-4">
            Dashboard Metalfama
          </h1>
          <p className="text-xl text-gray-700 font-semibold">Painel de Caique</p>
        </div>

        <div className="mb-12 p-6 bg-white rounded-xl shadow-xl border border-gray-200">
          <label className="block text-lg font-semibold text-gray-900 mb-4">
            📁 Carregar Arquivo Excel (.xlsx)
          </label>
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-gradient-to-r file:from-orange-500 file:to-yellow-500 file:text-white hover:file:from-orange-600 hover:file:to-yellow-600 shadow-md transition-all"
          />
          {file && (
            <p className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 font-medium">
              ✅ Arquivo carregado: <span className="font-bold">{file.name}</span>
            </p>
          )}
        </div>

        {/* Indicadores */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-all">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mr-4">
                <span className="text-2xl">⚖️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Total Faturado</h2>
            </div>
            <p className="text-5xl font-black text-orange-600">{totalKg.toLocaleString()}</p>
            <p className="text-lg text-gray-600 font-medium">KG</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-emerald-500 hover:shadow-xl transition-all">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mr-4">
                <span className="text-2xl">💰</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Total em R$</h2>
            </div>
            <p className="text-5xl font-black text-emerald-600">
              R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-all">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mr-4">
                <span className="text-2xl">📊</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Materiais</h2>
            </div>
            <p className="text-5xl font-black text-blue-600">{materials.length}</p>
            <p className="text-lg text-gray-600 font-medium">Tipos</p>
          </div>
        </div>

        {/* Total por Material */}
        <div className="bg-white p-8 rounded-xl shadow-lg mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
            📈 Total por Material
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {materials.map((mat, idx) => (
              <div key={idx} className="p-6 bg-gradient-to-br rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 group">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl shadow-lg flex items-center justify-center text-2xl font-bold ${
                  mat.name === 'Cobre'
                    ? 'bg-orange-500 text-white'
                    : mat.name === 'Latão'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-400 text-white'
                }`}>
                  {mat.name.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center group-hover:text-orange-600 transition-colors">{mat.name}</h3>
                <p className="text-2xl font-black text-gray-800 mb-1 text-center">
                  {mat.kg.toLocaleString()} <span className="text-lg font-normal text-gray-600">KG</span>
                </p>
                <p className="text-xl font-bold text-emerald-600 text-center">
                  R$ {mat.valor.toLocaleString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
            📊 Gráfico de Barras Interativo - Valor por Material
          </h2>
          <div className="relative h-96 p-8 bg-gradient-to-b from-gray-50 to-white rounded-xl border-2 border-gray-200">
            <div className="flex items-end justify-around h-full gap-4">
              {materials.map((mat, idx) => {
                const barHeight = (mat.valor / maxValor) * 90; // 90% max height
                const colorClass = mat.name === 'Cobre' 
                  ? 'bg-orange-500 hover:bg-orange-600'
                  : mat.name === 'Latão' 
                  ? 'bg-yellow-500 hover:bg-yellow-600'
                  : 'bg-gray-400 hover:bg-gray-500';

                return (
                  <div key={idx} className="flex flex-col items-center group cursor-pointer flex-1 max-w-[80px] py-4">
                    <div
                      className={`w-16 rounded-b-xl shadow-lg transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-2xl ${colorClass}`}
                      style={{ height: `${barHeight}%` }}
                    />
                    <span className="mt-4 text-sm font-bold text-gray-800 uppercase tracking-wide group-hover:text-gray-900">
                      {mat.name}
                    </span>
                    {/* Tooltip */}
                    <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-10 shadow-2xl">
                      R$ {mat.valor.toLocaleString('pt-BR')} <br />
                      <span className="text-gray-300 text-xs">{mat.kg.toLocaleString()} KG</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
