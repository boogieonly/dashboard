'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

type Category = 'Aço Inox' | 'Cobre' | 'Latão' | 'Alumínio' | 'Ligas Especiais';

interface Sale {
  id: string;
  date: string;
  category: Category;
  peso: number;
  valor: number;
}

const categories: Category[] = ['Aço Inox', 'Cobre', 'Latão', 'Alumínio', 'Ligas Especiais'];

export default function HomePage() {
  const [data, setData] = useState<Sale[]>([]);
  const [filteredData, setFilteredData] = useState<Sale[]>([]);
  const [activeTab, setActiveTab] = useState<Category>('Aço Inox');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState({ date: '', category: 'Aço Inox' as Category, peso: 0, valor: 0 });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('salesData');
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (error) {
        console.error('Failed to load data from localStorage:', error);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('salesData', JSON.stringify(data));
  }, [data]);

  // Filter data
  useEffect(() => {
    let filtered = data.filter((item) => item.category === activeTab);

    if (searchTerm.trim()) {
      filtered = filtered.filter((item) =>
        item.date.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFrom) {
      filtered = filtered.filter((item) => item.date >= dateFrom);
    }

    if (dateTo) {
      filtered = filtered.filter((item) => item.date <= dateTo);
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [data, activeTab, searchTerm, dateFrom, dateTo]);

  // Reset page on tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Handle prevFilteredLength for potential animations/notifications
  const filteredLength = useMemo(() => filteredData.length, [filteredData]);
  const prevFilteredLengthRef = useRef(0);
  useEffect(() => {
    prevFilteredLengthRef.current = filteredLength;
  }, [filteredLength]);

  // Pagination
  const totalPages = useMemo(
    () => Math.ceil(filteredData.length / itemsPerPage),
    [filteredData.length]
  );

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  // KPIs
  const totalPeso = useMemo(
    () => filteredData.reduce((sum, item) => sum + item.peso, 0),
    [filteredData]
  );
  const totalValor = useMemo(
    () => filteredData.reduce((sum, item) => sum + item.valor, 0),
    [filteredData]
  );
  const totalPedidos = filteredData.length;
  const ticketMedio = useMemo(
    () => (totalPedidos > 0 ? totalValor / totalPedidos : 0),
    [totalValor, totalPedidos]
  );

  // Chart data
  const chartData = useMemo(() => {
    const monthly: Record<string, { month: string; peso: number; valor: number }> = {};
    filteredData.forEach((item) => {
      const monthKey = item.date.slice(0, 7);
      if (!monthly[monthKey]) {
        monthly[monthKey] = { month: monthKey, peso: 0, valor: 0 };
      }
      monthly[monthKey]!.peso += item.peso;
      monthly[monthKey]!.valor += item.valor;
    });
    return Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredData]);

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const buffer = e.target?.result as ArrayBuffer;
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet);

      const newSales: Sale[] = jsonData.map((row: any, index: number) => ({
        id: `excel_${Date.now()}_${index}`,
        date: String(row.date || ''),
        category: (row.category as Category) || 'Aço Inox',
        peso: Number(row.peso) || 0,
        valor: Number(row.valor) || 0,
      })).filter(
        (sale) =>
          categories.includes(sale.category) &&
          sale.date &&
          sale.peso > 0 &&
          sale.valor > 0
      );

      setData((prevData) => [...prevData, ...newSales]);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
      e.target.value = '';
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
        processFile(file);
      }
    },
    [processFile]
  );

  const openAddModal = () => {
    setFormData({ date: '', category: activeTab, peso: 0, valor: 0 });
    setEditingSale(null);
    setShowAddModal(true);
  };

  const openEditModal = (sale: Sale) => {
    setFormData({ date: sale.date, category: sale.category, peso: sale.peso, valor: sale.valor });
    setEditingSale(sale);
    setShowEditModal(true);
  };

  const saveSale = () => {
    if (!formData.date || formData.peso <= 0 || formData.valor <= 0) {
      alert('Por favor, preencha todos os campos corretamente.');
      return;
    }

    if (editingSale) {
      setData((prev) =>
        prev.map((item) => (item.id === editingSale.id ? { ...formData, id: item.id } : item))
      );
      setShowEditModal(false);
    } else {
      const newSale: Sale = {
        id: crypto.randomUUID(),
        ...formData,
      };
      setData((prev) => [...prev, newSale]);
      setShowAddModal(false);
    }
    setFormData({ date: '', category: activeTab, peso: 0, valor: 0 });
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      setData((prev) => prev.filter((item) => item.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const glassStyle = 'bg-white/10 backdrop-blur-2xl border border-white/20 shadow-3xl rounded-3xl p-8 md:p-12';
  const cardStyle = 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 text-white';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className={glassStyle}>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
            Gestão de Vendas - Metais
          </h1>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            {/* Upload */}
            <div
              className={`flex-1 max-w-md cursor-pointer transition-all duration-300 ${
                isDragging
                  ? 'scale-105 ring-4 ring-blue-400/50'
                  : 'hover:scale-102'
              }`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className={`${cardStyle} text-center py-12`}>
                <div className="text-4xl mb-4">📁</div>
                <p className="text-lg mb-2">Arraste Excel ou clique</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-xl transition-all"
                >
                  Selecionar Arquivo
                </button>
              </div>
            </div>
            {/* Add Button */}
            <button
              onClick={openAddModal}
              className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl transition-all hover:shadow-3xl"
            >
              + Novo Pedido
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className={cardStyle}>
            <h3 className="text-sm opacity-80">Peso Total</h3>
            <p className="text-3xl font-bold">{totalPeso.toLocaleString()} kg</p>
          </div>
          <div className={cardStyle}>
            <h3 className="text-sm opacity-80">Valor Total</h3>
            <p className="text-3xl font-bold">R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className={cardStyle}>
            <h3 className="text-sm opacity-80">Pedidos</h3>
            <p className="text-3xl font-bold">{totalPedidos}</p>
          </div>
          <div className={cardStyle}>
            <h3 className="text-sm opacity-80">Ticket Médio</h3>
            <p className="text-3xl font-bold">R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className={glassStyle + ' p-6'}>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
                  activeTab === cat
                    ? 'bg-white/30 shadow-2xl scale-105'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="mb-8">
            <button
              onClick={() => setFiltersVisible(!filtersVisible)}
              className="flex items-center gap-2 mb-4 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-all"
            >
              <span>🔍 Filtros</span>
              <span>{filtersVisible ? '−' : '+'}</span>
            </button>
            {filtersVisible && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-white/5 rounded-2xl">
                <input
                  type="text"
                  placeholder="Buscar por data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/20 border border-white/30 px-4 py-2 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-white/20 border border-white/30 px-4 py-2 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-white/20 border border-white/30 px-4 py-2 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            )}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className={`${cardStyle} h-96 p-4`}>
              <h3 className="text-xl font-bold mb-4">Evolução de Valor (Linha)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="white/20" />
                  <XAxis dataKey="month" stroke="white" />
                  <YAxis stroke="white" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="valor" stroke="#8884d8" name="Valor" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className={`${cardStyle} h-96 p-4`}>
              <h3 className="text-xl font-bold mb-4">Peso Mensal (Barra)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="white/20" />
                  <XAxis dataKey="month" stroke="white" />
                  <YAxis stroke="white" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="peso" fill="#82ca9d" name="Peso" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className={cardStyle}>
            {filteredData.length === 0 ? (
              <p className="text-center py-12 text-lg opacity-80">Nenhum dado encontrado.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="p-4">Data</th>
                        <th className="p-4">Peso (kg)</th>
                        <th className="p-4">Valor (R$)</th>
                        <th className="p-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((sale) => (
                        <tr key={sale.id} className="border-b border-white/10 hover:bg-white/10 transition-all">
                          <td className="p-4 font-mono">{sale.date}</td>
                          <td className="p-4">{sale.peso.toLocaleString()}</td>
                          <td className="p-4">R$ {sale.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="p-4">
                            <button
                              onClick={() => openEditModal(sale)}
                              className="bg-blue-500 hover:bg-blue-600 px-4 py-1 rounded-lg mr-2 text-sm transition-all"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(sale.id)}
                              className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded-lg text-sm transition-all"
                            >
                              Deletar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 disabled:opacity-50 transition-all"
                    >
                      Anterior
                    </button>
                    <span className="px-4 py-2">
                      {currentPage} de {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 disabled:opacity-50 transition-all"
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Add/Edit Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`${glassStyle} max-w-md w-full max-h-[90vh] overflow-y-auto`}>
              <h2 className="text-2xl font-bold mb-6 text-center">
                {editingSale ? 'Editar Pedido' : 'Novo Pedido'}
              </h2>
              <div className="space-y-4">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-white/20 border border-white/30 px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                  className="w-full bg-white/20 border border-white/30 px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={!!editingSale && editingSale.category !== formData.category} // optional
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Peso (kg)"
                  value={formData.peso}
                  onChange={(e) => setFormData({ ...formData, peso: Number(e.target.value) })}
                  className="w-full bg-white/20 border border-white/30 px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  min="0"
                  step="0.01"
                />
                <input
                  type="number"
                  placeholder="Valor (R$)"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
                  className="w-full bg-white/20 border border-white/30 px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex gap-4 mt-8 justify-end">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setEditingSale(null);
                    setFormData({ date: '', category: activeTab, peso: 0, valor: 0 });
                  }}
                  className="px-8 py-3 bg-white/20 hover:bg-white/30 rounded-2xl transition-all flex-1 md:flex-none"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveSale}
                  className="px-8 py-3 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 rounded-2xl font-bold shadow-2xl transition-all flex-1 md:flex-none"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`${glassStyle} max-w-sm text-center`}>
              <div className="text-6xl mb-4">❓</div>
              <h3 className="text-2xl font-bold mb-4">Confirmar exclusão?</h3>
              <p className="opacity-80 mb-8">Esta ação não pode ser desfeita.</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-8 py-3 bg-white/20 hover:bg-white/30 rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-8 py-3 bg-red-500 hover:bg-red-600 rounded-2xl font-bold transition-all"
                >
                  Deletar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
