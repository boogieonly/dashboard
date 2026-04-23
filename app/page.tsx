'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

// Interface para os dados dos gráficos e tabela
interface ChartData {
  name: string;
  vendas: number;
  meta: number;
  producao: number;
}

// Dados mockados para demonstração (podem ser substituídos por fetch de API)
const mockData: ChartData[] = [
  { name: 'Jan', vendas: 400, meta: 500, producao: 450 },
  { name: 'Fev', vendas: 300, meta: 450, producao: 420 },
  { name: 'Mar', vendas: 500, meta: 550, producao: 480 },
  { name: 'Abr', vendas: 450, meta: 500, producao: 460 },
  { name: 'Mai', vendas: 350, meta: 400, producao: 380 },
  { name: 'Jun', vendas: 600, meta: 650, producao: 620 },
];

const DashboardMetalfama: React.FC = () => {
  // Estados para filtros expansíveis
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [categoria, setCategoria] = useState('');

  // Dados filtrados (otimizado com useMemo - aqui simplificado com mock)
  const filteredData = useMemo(() => {
    return mockData.filter(item => {
      // Lógica de filtro por data e categoria (exemplo simplificado)
      return true; // Aplicar filtros reais conforme necessidade
    });
  }, [dateFrom, dateTo, categoria]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Seção de Filtros Expansíveis */}
      <section className="bg-white rounded-lg shadow">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center justify-between w-full p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg"
        >
          <h2 className="text-2xl font-bold">Filtros Avançados</h2>
          <span className="text-2xl">{filtersOpen ? '−' : '+'}</span>
        </button>
        {filtersOpen && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Data Inicial</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Data Final</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Categoria</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                <option value="vendas">Vendas</option>
                <option value="producao">Produção</option>
              </select>
            </div>
          </div>
        )}
      </section>

      {/* Seção de Gráficos Compactos (coluna única, 100% largura) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Vendas Mensais (coluna única) */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Vendas Mensais</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="vendas" fill="#8884d8" name="Vendas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico 2: Cumprimento de Meta (coluna única para atual) */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Meta vs Realizado (Atual)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={filteredData.slice(-1)}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="vendas" fill="#82ca9d" name="Realizado" />
              <Bar dataKey="meta" fill="#ffc658" name="Meta" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico 3: Produção (coluna única) */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Produção Mensal</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="producao" fill="#ff7300" name="Produção" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Seção de Tabela de Dados */}
      <section className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800">Tabela de Dados Detalhados</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mês</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Vendas</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Meta</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Produção</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{item.vendas.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{item.meta.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{item.producao.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DashboardMetalfama;
