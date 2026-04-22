"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Package, DollarSign, TrendingUp, Upload, ChevronDown } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface Item {
  material: string;
  peso: number;
  valor: number;
}

const exampleData: Item[] = [
  { material: 'Aço Inox', peso: 150, valor: 22500 },
  { material: 'Cobre', peso: 80, valor: 48000 },
  { material: 'Latão', peso: 120, valor: 21600 },
];

const Page: React.FC = () => {
  const [data, setData] = useState<Item[]>(exampleData);
  const [expanded, setExpanded] = useState<string[]>(['Cobre']);

  const materials = useMemo(() => {
    const grouped: Record<string, { peso: number; valor: number }> = {};
    data.forEach((item) => {
      if (!grouped[item.material]) {
        grouped[item.material] = { peso: 0, valor: 0 };
      }
      grouped[item.material].peso += item.peso;
      grouped[item.material].valor += item.valor;
    });
    return Object.entries(grouped).map(([material, stats]) => ({
      material,
      ...stats,
    }));
  }, [data]);

  const totalPeso = useMemo(
    () => materials.reduce((sum, m) => sum + m.peso, 0),
    [materials]
  );
  const totalValor = useMemo(
    () => materials.reduce((sum, m) => sum + m.valor, 0),
    [materials]
  );
  const ticketMedio = useMemo(
    () => (totalPeso > 0 ? totalValor / totalPeso : 0),
    [totalPeso, totalValor]
  );

  const colorMap: Record<string, string> = {
    'Cobre': 'orange',
    'Latão': 'yellow',
    'Alumínio': 'blue',
    'Aço Inox': 'gray',
  };

  const toggleMaterial = useCallback((material: string) => {
    setExpanded((prev) => (prev.includes(material)
      ? prev.filter((m) => m !== material)
      : [...prev, material]));
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = (e.target as FileReader)?.result as ArrayBuffer;
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        const parsedData: Item[] = jsonData.map((row: any) => ({
          material: String(row.Material || ''),
          peso: parseFloat(String(row.Peso || 0)) || 0,
          valor: parseFloat(String(row.Valor || 0)) || 0,
        })).filter((item) => item.material && item.peso > 0 && item.valor > 0);
        setData(parsedData);
      };
      reader.readAsArrayBuffer(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg min-w-[200px]">
          <p className="font-bold text-slate-900 mb-2">{d.material}</p>
          <p className="text-sm">Peso: <span className="font-semibold">{d.peso.toLocaleString()} kg</span></p>
          <p className="text-sm">Valor: <span className="font-semibold text-green-600">{d.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-transparent mb-6 drop-shadow-2xl">
            Dashboard Executivo
          </h1>
          <p className="text-2xl text-slate-600 font-medium">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </header>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-10 hover:shadow-3xl transition-all duration-300">
            <Package className="w-20 h-20 text-blue-500 mx-auto mb-6 opacity-80" />
            <div className="text-4xl lg:text-5xl font-black text-slate-900 mb-3">
              {totalPeso.toLocaleString('pt-BR')}
            </div>
            <p className="text-xl text-slate-600 font-semibold">Peso Total (kg)</p>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-10 hover:shadow-3xl transition-all duration-300">
            <DollarSign className="w-20 h-20 text-emerald-500 mx-auto mb-6 opacity-80" />
            <div className="text-4xl lg:text-5xl font-black text-slate-900 mb-3">
              {totalValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xl text-slate-600 font-semibold">Valor Total</p>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-10 hover:shadow-3xl transition-all duration-300">
            <TrendingUp className="w-20 h-20 text-purple-500 mx-auto mb-6 opacity-80" />
            <div className="text-4xl lg:text-5xl font-black text-slate-900 mb-3">
              {ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/kg
            </div>
            <p className="text-xl text-slate-600 font-semibold">Ticket Médio</p>
          </div>
        </div>

        {/* Upload Section */}
        <section className="mb-20">
          <h2 className="text-4xl font-black text-slate-900 mb-10">Carregar Dados (Excel)</h2>
          <div
            {...getRootProps()}
            className={`relative bg-white rounded-3xl shadow-2xl border-4 border-dashed border-slate-300 p-16 text-center transition-all duration-500 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:shadow-3xl cursor-pointer flex flex-col items-center justify-center group ${
              isDragActive
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-3xl border-4'
                : ''
            }`}
          >
            <input {...getInputProps()} className="hidden" />
            <Upload className="w-24 h-24 text-slate-400 group-hover:text-blue-500 transition-colors mb-8 opacity-75 group-hover:opacity-100" />
            <h3 className="text-3xl font-black text-slate-900 mb-4 drop-shadow-sm">
              {isDragActive ? 'Solte o arquivo...' : 'Arraste seu arquivo Excel ou clique aqui'}
            </h3>
            <p className="text-xl text-slate-600 max-w-md mx-auto mb-8">
              Colunas esperadas: <strong>Material</strong>, <strong>Peso</strong> (kg), <strong>Valor</strong> (R$)
            </p>
            {data.length > 0 && (
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-emerald-100 text-emerald-800 px-6 py-3 rounded-2xl border border-emerald-200 font-semibold shadow-lg">
                ✅ {data.length} itens carregados ({materials.length} materiais únicos)
              </div>
            )}
          </div>
        </section>

        {/* Materials Accordions */}
        <section className="mb-20">
          <h2 className="text-4xl font-black text-slate-900 mb-12">Materiais</h2>
          <div className="space-y-8">
            {materials.map((m) => {
              const color = colorMap[m.material] || 'slate';
              const isOpen = expanded.includes(m.material);
              return (
                <div
                  key={m.material}
                  className="group relative bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden hover:shadow-3xl transition-all duration-500"
                >
                  {/* Colored Stripe */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-4 ${color}-500 shadow-lg z-10 transition-all duration-300 group-hover:w-5 opacity-90 group-hover:opacity-100`}
                    style={{ borderRadius: '1.5rem 0 0 1.5rem' }}
                  />
                  <div className="relative pl-16 p-10">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-3xl font-black text-slate-900 drop-shadow-sm">
                        {m.material}
                      </h3>
                      <button
                        onClick={() => toggleMaterial(m.material)}
                        className="p-4 rounded-3xl bg-white/80 backdrop-blur-sm hover:bg-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 flex items-center justify-center w-16 h-16 group-hover:scale-110"
                        aria-label={`Expandir ${m.material}`}
                      >
                        <ChevronDown
                          className={`w-8 h-8 text-slate-700 transition-transform duration-300 ${
                            isOpen ? 'rotate-180' : 'rotate-0'
                          }`}
                        />
                      </button>
                    </div>
                    {isOpen && (
                      <div className="mt-10 pt-8 border-t-2 border-slate-100 bg-gradient-to-r from-slate-50/50 to-white/50 backdrop-blur-sm rounded-3xl p-10 -mx-10 mb-4 shadow-inner">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-center">
                          <div>
                            <p className="text-2xl text-slate-600 font-semibold mb-6 tracking-wide">Peso Total</p>
                            <div className="text-5xl lg:text-6xl font-black text-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent drop-shadow-2xl">
                              {m.peso.toLocaleString('pt-BR')}
                            </div>
                            <p className="text-2xl text-slate-500 mt-4">kg</p>
                          </div>
                          <div>
                            <p className="text-2xl text-slate-600 font-semibold mb-6 tracking-wide">Valor Total</p>
                            <div className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent drop-shadow-2xl">
                              {m.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Interactive Chart */}
        <section>
          <h2 className="text-4xl font-black text-slate-900 mb-12">Distribuição de Peso por Material</h2>
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden hover:shadow-3xl transition-all duration-500">
            <div className="p-10 pb-8">
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={materials}>
                  <XAxis
                    dataKey="material"
                    angle={-45}
                    height={100}
                    tick={{ fontSize: 14, fontWeight: 600, fill: '#64748b' }}
                  />
                  <YAxis tick={{ fontSize: 14, fill: '#64748b' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="peso"
                    fill="#3b82f6"
                    name="Peso (kg)"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Page;
