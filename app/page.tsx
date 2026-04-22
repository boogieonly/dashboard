"use client";

import { useState, useEffect } from 'react';
import { Scale, DollarSign, TrendingUp, ChevronDown } from 'lucide-react';
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

type MaterialData = {
  name: string;
  peso: number;
  custo: number;
  lucro: number;
};

const sampleData: MaterialData[] = [
  { name: 'Cobre', peso: 150, custo: 12750, lucro: 3520 },
  { name: 'Latão', peso: 200, custo: 13000, lucro: 2850 },
  { name: 'Alumínio', peso: 300, custo: 13725, lucro: 2210 },
  { name: 'Inox', peso: 120, custo: 11436, lucro: 4890 },
];

export default function Page() {
  const [data, setData] = useState<MaterialData[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Lógica de leitura de Excel (exemplo com fetch de arquivo público):
  // Para uso real, instale 'xlsx' e descomente/adapte:
  // import * as XLSX from 'xlsx';
  // useEffect(() => {
  //   fetch('/data.xlsx')
  //     .then((r) => r.arrayBuffer())
  //     .then((buffer) => {
  //       const wb = XLSX.read(buffer, { type: 'array' });
  //       const ws = wb.Sheets[wb.SheetNames[0]];
  //       const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws) as MaterialData[];
  //       setData(json);
  //     })
  //     .catch((err) => console.error('Erro ao ler Excel:', err));
  // }, []);

  useEffect(() => {
    // Usando dados de exemplo simulando leitura de Excel
    setData(sampleData);
  }, []);

  const colors: Record<string, string> = {
    Cobre: 'bg-orange-500',
    Latão: 'bg-yellow-500',
    Alumínio: 'bg-slate-400',
    Inox: 'bg-blue-600',
  };

  const totalPeso = data.reduce((sum, d) => sum + d.peso, 0);
  const totalCusto = data.reduce((sum, d) => sum + d.custo, 0);
  const totalLucro = data.reduce((sum, d) => sum + d.lucro, 0);

  const toggle = (name: string) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <main className="min-h-screen bg-slate-50 py-24 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="max-w-7xl mx-auto">
        {/* Indicadores de Topo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden p-8 text-center">
            <Scale className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Peso Total</h3>
            <p className="text-4xl font-black text-slate-900">{totalPeso} kg</p>
          </div>
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden p-8 text-center">
            <DollarSign className="mx-auto h-12 w-12 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Custo Total</h3>
            <p className="text-4xl font-black text-slate-900">R$ {totalCusto.toLocaleString('pt-BR')}</p>
          </div>
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden p-8 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Lucro Projetado</h3>
            <p className="text-4xl font-black text-emerald-600">R$ {totalLucro.toLocaleString('pt-BR')}</p>
          </div>
        </div>

        {/* Cards de Materiais com Accordions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {data.map((item) => (
            <div key={item.name} className="bg-white shadow-xl rounded-2xl overflow-hidden">
              <div
                className={`h-20 flex items-center justify-between px-8 cursor-pointer transition-all hover:shadow-2xl ${colors[item.name]} text-white`}
                onClick={() => toggle(item.name)}
              >
                <h2 className="text-2xl font-bold tracking-tight">{item.name}</h2>
                <ChevronDown className={`h-6 w-6 transition-transform duration-200 ${expanded[item.name] ? 'rotate-180' : ''}`} />
              </div>
              <div className={`p-8 bg-slate-50 ${expanded[item.name] ? 'block' : 'hidden'} transition-all duration-300`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Peso</p>
                    <p className="text-3xl font-black text-slate-900 mt-1">{item.peso} kg</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Custo</p>
                    <p className="text-3xl font-black text-slate-900 mt-1">R$ {item.custo.toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Lucro</p>
                    <p className="text-3xl font-black text-emerald-600 mt-1">R$ {item.lucro.toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Gráfico */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden p-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center tracking-tight">Análise de Lucro por Material</h2>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={14} fontWeight="600" />
              <YAxis fontSize={14} />
              <Tooltip />
              <Legend />
              <Bar dataKey="peso" fill="#ef4444" name="Peso (kg)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="custo" fill="#3b82f6" name="Custo (R$)" stackId="a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="lucro" fill="#10b981" name="Lucro (R$)" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  );
}
