'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import FechamentoMensal from './componentes/FechamentoMensal';  // ← ESTA LINHA DEVE EXISTIR

// Interface para registro de vendas
interface SalesRecord {
  id: number;
  date: string; // formato YYYY-MM-DD
  product: string;
  category: string;
  quantity: number;
  price: number;
  total: number;
}

type ActiveTab = 'dashboard' | 'fechamento';

type Category = 'Eletrônicos' | 'Roupas' | 'Alimentos' | 'Livros';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const CATEGORIES: Category[] = ['Eletrônicos', 'Roupas', 'Alimentos', 'Livros'];

// Componente principal da página
export default function HomePage() {
  // Estado para controlar qual aba está ativa
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Estado para dados de vendas
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [filteredData, setFilteredData] = useState<SalesRecord[]>([]);

  // Estados para filtros
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Carrega dados mock iniciais
  useEffect(() => {
    const mockData: SalesRecord[] = [
      { id: 1, date: '2024-01-15', product: 'iPhone 15', category: 'Eletrônicos', quantity: 2, price: 5000, total: 10000 },
      { id: 2, date: '2024-01-16', product: 'Camiseta', category: 'Roupas', quantity: 5, price: 50, total: 250 },
      { id: 3, date: '2024-01-17', product: 'Arroz', category: 'Alimentos', quantity: 10, price: 10, total: 100 },
      { id: 4, date: '2024-01-18', product: 'Livro React', category: 'Livros', quantity: 3, price: 80, total: 240 },
      { id: 5, date: '2024-01-19', product: 'Samsung TV', category: 'Eletrônicos', quantity: 1, price: 3000, total: 3000 },
      // Mais dados para gráficos...
      { id: 6, date: '2024-01-20', product: 'Calça Jeans', category: 'Roupas', quantity: 4, price: 120, total: 480 },
      { id: 7, date: '2024-01-21', product: 'Macarrão', category: 'Alimentos', quantity: 8, price: 5, total: 40 },
      { id: 8, date: '2024-01-22', product: 'TypeScript Book', category: 'Livros', quantity: 2, price: 100, total: 200 },
      { id: 9, date: '2024-02-01', product: 'Laptop Dell', category: 'Eletrônicos', quantity: 1, price: 4000, total: 4000 },
      { id: 10, date: '2024-02-02', product: 'Vestido', category: 'Roupas', quantity: 3, price: 150, total: 450 },
    ];
    setSalesData(mockData);
  }, []);

  // Aplica filtros nos dados
  useEffect(() => {
    let data = salesData;
    if (startDate) {
      data = data.filter((d) => new Date(d.date) >= new Date(startDate));
    }
    if (endDate) {
      data = data.filter((d) => new Date(d.date) <= new Date(endDate));
    }
    if (categoryFilter) {
      data = data.filter((d) => d.category === categoryFilter);
    }
    setFilteredData(data);
  }, [salesData, startDate, endDate, categoryFilter]);

  // Calcula métricas
  const totalSales = filteredData.reduce((sum, sale) => sum + sale.total, 0);
  const today = new Date().toISOString().split('T')[0];
  const todaySales = filteredData.filter((d) => d.date === today).reduce((sum, sale) => sum + sale.total, 0);
  const avgSale = filteredData.length > 0 ? totalSales / filteredData.length : 0;

  // Dados para gráfico de linha (vendas por data)
  const chartData = Array.from(
    filteredData.reduce((acc: Map<string, number>, sale) => {
      const dateKey = sale.date;
      acc.set(dateKey, (acc.get(dateKey) || 0) + sale.total);
      return acc;
    }, new Map())
  )
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Dados para gráfico de pizza (por categoria)
  const categoryTotals: Record<string, number> = filteredData.reduce((acc, sale) => {
    acc[sale.category] = (acc[sale.category] || 0) + sale.total;
    return acc;
  }, {});
  const pieData = Object.entries(categoryTotals).map(([name, value], index) => ({
    name,
    value,
    fill: COLORS[index % COLORS.length],
  }));

  // Função para importar Excel
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt: ProgressEvent<FileReader>) => {
      const bstr = evt.target?.result as string;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Converte planilha para JSON */
      const importedData = XLSX.utils.sheet_to_json<SalesRecord>(ws);
      /* Adiciona IDs únicos */
      const dataWithIds = importedData.map((row: any, index: number) => ({
        ...row,
        id: salesData.length + index + 1,
        total: row.quantity * row.price, // Calcula total se não existir
      }));
      setSalesData((prev) => [...prev, ...dataWithIds]);
      /* Limpa input */
      e.target.value = '';
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 p-4 md:p-8 font-sans">
      {/* Header com botões de navegação */}
      <header className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent drop-shadow-lg">
            📊 Painel de Controle
          </h1>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-2 border-white/30 bg-white/20 backdrop-blur-lg text-white ${
                activeTab === 'dashboard'
                  ? 'bg-white/40 ring-4 ring-blue-300/50 shadow-3xl scale-105'
                  : 'hover:bg-white/30'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('fechamento')}
              className={`px-6 py-3 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-2 border-white/30 bg-white/20 backdrop-blur-lg text-white ${
                activeTab === 'fechamento'
                  ? 'bg-white/40 ring-4 ring-green-300/50 shadow-3xl scale-105'
                  : 'hover:bg-white/30'
              }`}
            >
              📅 Fechamento Mensal
            </button>
          </div>
        </div>
      </header>

      {activeTab === 'dashboard' ? (
        <div className="space-y-8 max-w-7xl mx-auto">
          {/* Cards de métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 text-center hover:scale-105 transition-all duration-300">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-white mb-2">Total de Vendas</h3>
              <p className="text-3xl font-black text-green-400 drop-shadow-lg">
                R$ {totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 text-center hover:scale-105 transition-all duration-300">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-white mb-2">Vendas Hoje</h3>
              <p className="text-3xl font-black text-blue-400 drop-shadow-lg">
                R$ {todaySales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 text-center hover:scale-105 transition-all duration-300">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-2">Ticket Médio</h3>
              <p className="text-3xl font-black text-purple-400 drop-shadow-lg">
                R$ {avgSale.toFixed(2).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 text-center hover:scale-105 transition-all duration-300">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-white mb-2">Itens Vendidos</h3>
              <p className="text-3xl font-black text-yellow-400 drop-shadow-lg">
                {filteredData.reduce((sum, s) => sum + s.quantity, 0)}
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              🔍 Filtros
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-white/90 mb-2 font-medium">Data Inicial</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-white/90 mb-2 font-medium">Data Final</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-white/90 mb-2 font-medium">Categoria</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition-all duration-300 appearance-none"
                >
                  <option value="">Todas Categorias</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 hover:scale-[1.02] transition-all duration-300">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                📈 Vendas ao Longo do Tempo
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="white" />
                  <YAxis stroke="white" />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#00C49F" strokeWidth={4} dot={{ fill: '#00C49F', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 hover:scale-[1.02] transition-all duration-300">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                🧀 Vendas por Categoria
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabela de Vendas */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
            <div className="p-8 pb-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                📋 Tabela de Vendas ({filteredData.length} registros)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm md:text-base">
                <thead>
                  <tr className="bg-white/20 backdrop-blur-sm">
                    <th className="px-6 py-4 text-left text-white font-bold">Data</th>
                    <th className="px-6 py-4 text-left text-white font-bold">Produto</th>
                    <th className="px-6 py-4 text-left text-white font-bold">Categoria</th>
                    <th className="px-6 py-4 text-left text-white font-bold">Qtd</th>
                    <th className="px-6 py-4 text-left text-white font-bold">Preço</th>
                    <th className="px-6 py-4 text-right text-white font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((sale) => (
                    <tr
                      key={sale.id}
                      className="border-b border-white/10 hover:bg-white/10 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 text-white/90">{sale.date}</td>
                      <td className="px-6 py-4 text-white/90 font-medium">{sale.product}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-white/20 rounded-full text-xs text-white font-semibold">
                          {sale.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/90 font-mono">{sale.quantity}</td>
                      <td className="px-6 py-4 text-white/90">R$ {sale.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-bold text-green-400 text-lg">
                        R$ {sale.total.toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Importar Excel */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-12 text-center hover:scale-105 transition-all duration-300">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-3 mx-auto">
              📥 Importar Dados do Excel
            </h3>
            <p className="text-white/80 mb-8 max-w-md mx-auto">
              Faça upload de um arquivo .xlsx com colunas: date, product, category, quantity, price
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="block w-full max-w-md mx-auto px-6 py-3 bg-white/20 backdrop-blur-lg border-2 border-dashed border-white/30 rounded-3xl text-white font-semibold cursor-pointer hover:border-white/50 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
            />
          </div>
        </div>
      ) : (
        /* Seção Fechamento Mensal */
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-12 hover:scale-[1.02] transition-all duration-300">
            {/* Componente FechamentoMensal importado */}
            <FechamentoMensal />
            {/* Botão Voltar específico para Fechamento */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className="mt-12 w-full md:w-auto px-12 py-4 mx-auto block bg-white/30 backdrop-blur-lg border-2 border-white/30 rounded-3xl font-bold text-xl text-white shadow-2xl hover:scale-105 hover:bg-white/50 hover:shadow-3xl transition-all duration-300 flex items-center gap-3 justify-center"
            >
              ⬅️ Voltar ao Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
