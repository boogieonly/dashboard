"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  Scale,
  DollarSign,
  TrendingUp,
  Upload,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
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
  material: string;
  peso: number;
  valor: number;
};

type MaterialGroup = Record<string, Item[]>;

const Page = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [openMaterials, setOpenMaterials] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const exampleData: Item[] = [
    { material: 'Cobre', peso: 12.5, valor: 187.50 },
    { material: 'Cobre', peso: 8.3, valor: 124.50 },
    { material: 'Cobre', peso: 15.0, valor: 225.00 },
    { material: 'Latão', peso: 7.2, valor: 108.00 },
    { material: 'Latão', peso: 9.8, valor: 147.00 },
    { material: 'Latão', peso: 6.5, valor: 97.50 },
    { material: 'Alumínio', peso: 20.1, valor: 120.60 },
    { material: 'Alumínio', peso: 18.4, valor: 110.40 },
    { material: 'Alumínio', peso: 22.7, valor: 136.20 },
    { material: 'Inox', peso: 11.2, valor: 224.00 },
    { material: 'Inox', peso: 14.6, valor: 292.00 },
    { material: 'Inox', peso: 9.9, valor: 198.00 },
  ];

  useEffect(() => {
    if (items.length === 0) {
      setItems(exampleData);
    }
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data || typeof ArrayBuffer === 'undefined') return;

      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

      const newItems: Item[] = json
        .map((row) => ({
          material: row.Material?.toString()?.trim() || '',
          peso: parseFloat(row.Peso?.toString() || '0'),
          valor: parseFloat(row.Valor?.toString() || '0'),
        }))
        .filter((item) => item.material && item.peso > 0 && item.valor >= 0);

      setItems(newItems);
      setLoading(false);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const materialGroups = useMemo((): MaterialGroup => {
    const groups: MaterialGroup = {};
    items.forEach((item) => {
      const mat = item.material.trim();
      if (!groups[mat]) groups[mat] = [];
      groups[mat].push(item);
    });
    return groups;
  }, [items]);

  const totalPeso = useMemo(
    () => items.reduce((sum, i) => sum + i.peso, 0),
    [items]
  );
  const totalValor = useMemo(
    () => items.reduce((sum, i) => sum + i.valor, 0),
    [items]
  );
  const totalItems = items.length;
  const ticketMedio = totalItems > 0 ? totalValor / totalItems : 0;

  const colorMap: Record<string, string> = {
    Cobre: 'border-orange-500',
    'Latão': 'border-yellow-500',
    Alumínio: 'border-gray-400',
    Inox: 'border-blue-600',
  };

  const toggleMaterial = (material: string) => {
    setOpenMaterials((prev) => 
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material]
    );
  };

  const chartData = useMemo(() =>
    Object.entries(materialGroups).map(([material, group]) => ({
      name: material,
      peso: group.reduce((sum, i) => sum + i.peso, 0),
      valor: group.reduce((sum, i) => sum + i.valor, 0),
    })),
    [materialGroups]
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent drop-shadow-lg">
            Metalfama | Inteligência de Vendas
          </h1>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md border-l-4 border-orange-500 p-8 flex items-center space-x-6">
            <Scale className="h-12 w-12 text-orange-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Peso Total</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {totalPeso.toLocaleString('pt-BR')} kg
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md border-l-4 border-yellow-500 p-8 flex items-center space-x-6">
            <DollarSign className="h-12 w-12 text-yellow-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Valor Total</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md border-l-4 border-blue-600 p-8 flex items-center space-x-6">
            <TrendingUp className="h-12 w-12 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Ticket Médio</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Upload */}
        <div className="bg-white rounded-xl shadow-md border-l-4 border-indigo-500 p-8 mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <Upload className="h-6 w-6 text-indigo-500 flex-shrink-0" />
            <h2 className="text-2xl font-bold text-gray-900">Upload de Excel (.xlsx)</h2>
          </div>
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileUpload}
            disabled={loading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
          />
          {loading && (
            <p className="mt-3 text-sm text-indigo-600 animate-pulse">Processando arquivo...</p>
          )}
        </div>

        {/* Materials Accordions */}
        <div className="space-y-4 mb-12">
          {Object.entries(materialGroups).map(([material, groupItems]) => {
            const groupPeso = groupItems.reduce((sum, i) => sum + i.peso, 0);
            const groupValor = groupItems.reduce((sum, i) => sum + i.valor, 0);
            const groupCount = groupItems.length;
            const borderColor = colorMap[material] || 'border-gray-200';
            const isOpen = openMaterials.includes(material);

            return (
              <div key={material} className={`bg-white rounded-xl shadow-md ${borderColor} overflow-hidden`}>
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-all duration-200 flex justify-between items-center"
                  onClick={() => toggleMaterial(material)}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <h3 className="text-xl font-bold text-gray-900 capitalize flex-1 min-w-0 pr-4">
                      {material}
                    </h3>
                    <p className="text-sm text-gray-500 hidden md:block">{groupCount} itens</p>
                  </div>
                  <div className="flex items-center space-x-8 text-right flex-shrink-0">
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Peso</p>
                      <p className="text-lg font-bold text-gray-900">{groupPeso.toLocaleString('pt-BR')} kg</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Valor</p>
                      <p className="text-lg font-bold text-gray-900">
                        R$ {groupValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="ml-4">
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
                {isOpen && (
                  <div className="border-t border-gray-100">
                    <div className="overflow-x-auto">
                      <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Item</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">Peso (kg)</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">Valor (R$)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {groupItems.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {material} #{idx + 1}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {item.peso.toLocaleString('pt-BR')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                                R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-xl shadow-md border-l-4 border-emerald-500 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gráfico de Distribuição por Material</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'peso') {
                      return [`${value.toLocaleString('pt-BR')} kg`, 'Peso'];
                    }
                    return [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor'];
                  }}
                />
                <Legend />
                <Bar dataKey="peso" fill="#f97316" name="Peso (kg)" />
                <Bar dataKey="valor" fill="#eab308" name="Valor (R$)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
