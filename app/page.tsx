"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Scale, DollarSign, TrendingUp, ChevronDown } from 'lucide-react';
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

type Row = {
  Material: string;
  Peso: number;
  Valor: number;
};

type Totals = {
  peso: number;
  valor: number;
  ticket: number;
};

type ProcessedData = {
  groups: Record<string, Row[]>;
  totals: Totals;
  chartData: Array<{ name: string; peso: number; valor: number }>;
};

const exampleData: any[] = [
  { Material: 'Cobre', Peso: 150.5, Valor: 75250 },
  { Material: 'Cobre', Peso: 200, Valor: 100000 },
  { Material: 'Latão', Peso: 80.2, Valor: 32080 },
  { Material: 'Alumínio', Peso: 300, Valor: 45000 },
  { Material: 'Inox', Peso: 50, Valor: 12500 },
];

export default function Dashboard() {
  const [rawData, setRawData] = useState<any[]>([]);
  const [openMaterials, setOpenMaterials] = useState<Set<string>>(new Set(['Cobre']));

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const processed: ProcessedData = useMemo(() => {
    const groups: Record<string, Row[]> = {};
    let totalPeso = 0;
    let totalValor = 0;

    rawData.forEach((row: any) => {
      const mat = row.Material?.toString() || '';
      const peso = parseFloat(row.Peso as string) || 0;
      const valor = parseFloat(row.Valor as string) || 0;

      if (mat) {
        if (!groups[mat]) groups[mat] = [];
        groups[mat].push({ Material: mat, Peso: peso, Valor: valor });
        totalPeso += peso;
        totalValor += valor;
      }
    });

    const ticketMedio = totalPeso > 0 ? totalValor / totalPeso : 0;

    const totals: Totals = { peso: totalPeso, valor: totalValor, ticket: ticketMedio };

    const chartData = Object.entries(groups).map(([name, items]) => ({
      name,
      peso: items.reduce((sum, r) => sum + r.Peso, 0),
      valor: items.reduce((sum, r) => sum + r.Valor, 0),
    }));

    return { groups, totals, chartData };
  }, [rawData]);

  const toggleMaterial = useCallback((mat: string) => {
    const newSet = new Set(openMaterials);
    if (newSet.has(mat)) {
      newSet.delete(mat);
    } else {
      newSet.add(mat);
    }
    setOpenMaterials(newSet);
  }, [openMaterials]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result as string;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const json = XLSX.utils.sheet_to_json(ws);
      setRawData(json as any[]);
    };
    reader.readAsBinaryString(file);
  };

  useEffect(() => {
    setRawData(exampleData);
  }, []);

  const materialColors: Record<string, string> = {
    Cobre: 'bg-orange-500',
    Latão: 'bg-yellow-500',
    Alumínio: 'bg-gray-400',
    Inox: 'bg-blue-500',
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-4">
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900">
            Metalfama | Inteligência de Vendas
          </h1>
          <p className="text-xl text-slate-500">{today}</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 text-center">
            <Scale className="h-20 w-20 text-emerald-500 mx-auto mb-6 opacity-75" />
            <div className="text-4xl font-black text-slate-900 mb-2">
              {processed.totals.peso.toFixed(2)}
            </div>
            <div className="text-xl font-semibold text-slate-600">Peso Total KG</div>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 text-center">
            <DollarSign className="h-20 w-20 text-amber-500 mx-auto mb-6 opacity-75" />
            <div className="text-4xl font-black text-slate-900 mb-2">
              {formatCurrency(processed.totals.valor)}
            </div>
            <div className="text-xl font-semibold text-slate-600">Valor Total R$</div>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 text-center">
            <TrendingUp className="h-20 w-20 text-blue-500 mx-auto mb-6 opacity-75" />
            <div className="text-4xl font-black text-slate-900 mb-2">
              {formatCurrency(processed.totals.ticket)} / kg
            </div>
            <div className="text-xl font-semibold text-slate-600">Ticket Médio R$/kg</div>
          </div>
        </div>

        {/* Upload */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-12 text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Upload de Arquivo Excel</h2>
          <p className="text-lg text-slate-500 mb-8 max-w-md mx-auto">
            Arraste ou selecione um arquivo .xlsx com colunas 'Material', 'Peso' e 'Valor'
          </p>
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFile}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-3xl file:border-0 file:text-sm file:font-bold file:bg-gradient-to-r file:from-blue-500 file:to-blue-600 file:text-white hover:file:from-blue-600 hover:file:to-blue-700 mx-auto cursor-pointer transition-all"
          />
        </div>

        {/* Materiais Accordions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {Object.entries(processed.groups).map(([mat, group]) => {
            const isOpen = openMaterials.has(mat);
            const groupPeso = group.reduce((sum, r) => sum + r.Peso, 0);
            const groupValor = group.reduce((sum, r) => sum + r.Valor, 0);
            const groupTicket = groupPeso > 0 ? groupValor / groupPeso : 0;
            const colorClass = materialColors[mat as keyof typeof materialColors] || 'bg-gray-500';

            return (
              <div key={mat} className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200">
                <div className={`absolute inset-y-0 left-0 w-3 ${colorClass} transition-all duration-300`} />
                <div className="relative p-8">
                  <div className="flex justify-between items-center mb-6 cursor-pointer" onClick={() => toggleMaterial(mat)}>
                    <h3 className="text-2xl font-bold text-slate-900 pr-4">{mat}</h3>
                    <ChevronDown
                      className={`h-6 w-6 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                  {isOpen && (
                    <div>
                      <div className="grid grid-cols-3 gap-4 mb-8 text-center p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-3xl">
                        <div>
                          <div className="text-2xl font-black text-slate-900">{groupPeso.toFixed(2)}</div>
                          <div className="text-sm text-slate-500 uppercase tracking-wide">KG</div>
                        </div>
                        <div>
                          <div className="text-2xl font-black text-slate-900">{formatCurrency(groupValor)}</div>
                          <div className="text-sm text-slate-500 uppercase tracking-wide">Valor</div>
                        </div>
                        <div>
                          <div className="text-2xl font-black text-slate-900">{formatCurrency(groupTicket)} / kg</div>
                          <div className="text-sm text-slate-500 uppercase tracking-wide">Ticket</div>
                        </div>
                      </div>
                      <ul className="space-y-3">
                        {group.map((row, i) => (
                          <li
                            key={i}
                            className="flex justify-between items-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-100 hover:shadow-md transition-all"
                          >
                            <span className="font-medium text-slate-700">Peso: {row.Peso.toFixed(2)} kg</span>
                            <span className="font-bold text-slate-900">{formatCurrency(row.Valor)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Gráfico de Materiais</h2>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={processed.chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={14} fontWeight={600} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="peso" fill="#3b82f6" name="Peso (kg)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="valor" fill="#10b981" name="Valor (R$)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
