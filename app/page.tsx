"use client";

import { useState, useMemo, useRef } from 'react';
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
import { Upload, Scale, DollarSign, TrendingUp } from 'lucide-react';

interface Row {
  material: string;
  peso: number;
  valor: number;
}

const initialRows: Row[] = [
  { material: 'Aço Carbono', peso: 150.5, valor: 750.25 },
  { material: 'Aço Inox', peso: 80.2, valor: 1200.50 },
  { material: 'Alumínio', peso: 45.0, valor: 300.75 },
  { material: 'Cobre', peso: 20.1, valor: 950.00 },
];

export default function HomePage() {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const materials = useMemo(() => {
    const agg: Record<string, { peso: number; valor: number }> = {};
    for (const row of rows) {
      if (!agg[row.material]) {
        agg[row.material] = { peso: 0, valor: 0 };
      }
      agg[row.material].peso += row.peso;
      agg[row.material].valor += row.valor;
    }
    return Object.entries(agg).map(([name, stats]) => ({
      name,
      peso: stats.peso,
      valor: stats.valor,
    }));
  }, [rows]);

  const totalPeso = useMemo(
    () => rows.reduce((sum, r) => sum + r.peso, 0),
    [rows]
  );
  const totalValor = useMemo(
    () => rows.reduce((sum, r) => sum + r.valor, 0),
    [rows]
  );
  const ticketMedio =
    useMemo(
      () => (rows.length > 0 ? totalValor / rows.length : 0),
      [rows, totalValor]
    );

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt: ProgressEvent<FileReader>) => {
      const data = evt.target?.result as ArrayBuffer | null;
      if (!data) return;

      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet);

      const newRows: Row[] = jsonData
        .map((row: Record<string, any>) => ({
          material: String(row.Material || ''),
          peso: parseFloat(String(row['Peso (KG)'] || row.Peso || '0')),
          valor: parseFloat(String(row['Valor (R$)'] || row.Valor || '0')),
        }))
        .filter((row) => row.material.trim() && !isNaN(row.peso) && row.peso > 0);

      setRows(newRows);
      event.target.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-black bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 bg-clip-text text-transparent mb-16 text-center drop-shadow-lg">
          Metalfama Premium Dashboard
        </h1>

        <div className="mb-12 flex justify-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-12 py-6 rounded-3xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 font-bold text-xl"
          >
            <Upload className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
            Carregar Excel
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-white/50 hover:shadow-3xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mx-auto mb-6 shadow-lg">
              <Scale className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-4xl font-black text-gray-900 mb-2 text-center">
              {totalPeso.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} KG
            </h3>
            <p className="text-gray-600 font-semibold text-center text-lg">Total Peso</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-white/50 hover:shadow-3xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-2xl mx-auto mb-6 shadow-lg">
              <DollarSign className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-4xl font-black text-gray-900 mb-2 text-center">
              {totalValor.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </h3>
            <p className="text-gray-600 font-semibold text-center text-lg">Total Valor</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-white/50 hover:shadow-3xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-center w-20 h-20 bg-purple-100 rounded-2xl mx-auto mb-6 shadow-lg">
              <TrendingUp className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-4xl font-black text-gray-900 mb-2 text-center">
              {ticketMedio.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </h3>
            <p className="text-gray-600 font-semibold text-center text-lg">Ticket Médio</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 lg:p-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Gráfico por Material
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={materials}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  height={80}
                  textAnchor="end"
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="peso"
                  fill="#3b82f6"
                  name="Peso (KG)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="valor"
                  fill="#10b981"
                  name="Valor (R$)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 lg:p-10 overflow-hidden">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Listagem Detalhada
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-left font-bold text-gray-800 uppercase tracking-wider">
                      Material
                    </th>
                    <th className="px-6 py-4 text-right font-bold text-gray-800 uppercase tracking-wider">
                      Peso (KG)
                    </th>
                    <th className="px-6 py-4 text-right font-bold text-gray-800 uppercase tracking-wider">
                      Valor (R$)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {row.material}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-700 font-mono">
                        {row.peso.toLocaleString('pt-BR', {
                          maximumFractionDigits: 1,
                        })}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-700 font-mono">
                        {row.valor.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length === 0 && (
              <p className="text-center text-gray-500 mt-12 py-12 text-xl">
                Carregue um arquivo Excel para visualizar os dados.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
