"use client";

import React, { useState, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

type SalesData = {
  Vendedor: string;
  Cliente: string;
  Produto: string;
  Região: string;
  Valor: number;
  Quantidade: number;
  Data: string;
  Estágio: string;
};

type Filters = {
  vendedor: string;
  cliente: string;
  produto: string;
  regiao: string;
  startDate: string;
  endDate: string;
};

const EXAMPLE_DATA: SalesData[] = [
  { Vendedor: "João Silva", Cliente: "Metalúrgica ABC", Produto: "Parafuso M8", Região: "SP", Valor: 2500, Quantidade: 50, Data: "2024-01-15", Estágio: "Fechado" },
  { Vendedor: "Maria Santos", Cliente: "Fábrica XYZ", Produto: "Chapa 2mm", Região: "RJ", Valor: 1800, Quantidade: 30, Data: "2024-01-16", Estágio: "Fechado" },
  { Vendedor: "Pedro Oliveira", Cliente: "Construtora DEF", Produto: "Tubo 1/2\"", Região: "MG", Valor: 3200, Quantidade: 80, Data: "2024-01-17", Estágio: "Negociação" },
  { Vendedor: "Ana Costa", Cliente: "Indústria GHI", Produto: "Arame Galv", Região: "BA", Valor: 1500, Quantidade: 100, Data: "2024-01-18", Estágio: "Fechado" },
  { Vendedor: "Carlos Lima", Cliente: "Oficina JKL", Produto: "Lâmina Serra", Região: "RS", Valor: 2200, Quantidade: 20, Data: "2024-01-19", Estágio: "Fechado" },
  { Vendedor: "Fernanda Souza", Cliente: "Metal MNO", Produto: "Porca M10", Região: "PR", Valor: 900, Quantidade: 90, Data: "2024-01-20", Estágio: "Prospecto" },
  { Vendedor: "Ricardo Mendes", Cliente: "Fabricação PQR", Produto: "Parafuso Madeira", Região: "SC", Valor: 2800, Quantidade: 60, Data: "2024-01-21", Estágio: "Fechado" },
  { Vendedor: "João Silva", Cliente: "Cliente A1", Produto: "Chapa 3mm", Região: "SP", Valor: 3500, Quantidade: 40, Data: "2024-02-01", Estágio: "Fechado" },
  { Vendedor: "Maria Santos", Cliente: "Cliente B2", Produto: "Tubo 3/4\"", Região: "RJ", Valor: 4100, Quantidade: 70, Data: "2024-02-02", Estágio: "Fechado" },
  { Vendedor: "Pedro Oliveira", Cliente: "Cliente C3", Produto: "Arame 18", Região: "MG", Valor: 1900, Quantidade: 110, Data: "2024-02-03", Estágio: "Negociação" },
  { Vendedor: "Ana Costa", Cliente: "Cliente D4", Produto: "Lâmina 2", Região: "BA", Valor: 2600, Quantidade: 25, Data: "2024-02-04", Estágio: "Fechado" },
  { Vendedor: "Carlos Lima", Cliente: "Cliente E5", Produto: "Porca M12", Região: "RS", Valor: 1400, Quantidade: 85, Data: "2024-02-05", Estágio: "Fechado" },
  { Vendedor: "Fernanda Souza", Cliente: "Cliente F6", Produto: "Parafuso Auto", Região: "PR", Valor: 3300, Quantidade: 55, Data: "2024-02-06", Estágio: "Fechado" },
  { Vendedor: "Ricardo Mendes", Cliente: "Cliente G7", Produto: "Chapa Perfurada", Região: "SC", Valor: 2100, Quantidade: 35, Data: "2024-02-07", Estágio: "Negociação" },
  { Vendedor: "João Silva", Cliente: "Cliente H8", Produto: "Tubo Aço", Região: "SP", Valor: 2900, Quantidade: 65, Data: "2024-02-08", Estágio: "Fechado" },
  { Vendedor: "Maria Santos", Cliente: "Cliente I9", Produto: "Arame Inox", Região: "RJ", Valor: 3700, Quantidade: 45, Data: "2024-02-09", Estágio: "Fechado" },
  { Vendedor: "Pedro Oliveira", Cliente: "Cliente J10", Produto: "Lâmina Circular", Região: "MG", Valor: 1600, Quantidade: 95, Data: "2024-02-10", Estágio: "Prospecto" },
  { Vendedor: "Ana Costa", Cliente: "Cliente K11", Produto: "Porca Alum", Região: "BA", Valor: 2400, Quantidade: 75, Data: "2024-02-11", Estágio: "Fechado" },
  { Vendedor: "Carlos Lima", Cliente: "Cliente L12", Produto: "Parafuso Hex", Região: "RS", Valor: 3100, Quantidade: 50, Data: "2024-02-12", Estágio: "Fechado" },
  { Vendedor: "Fernanda Souza", Cliente: "Cliente M13", Produto: "Chapa Galv", Região: "PR", Valor: 1200, Quantidade: 120, Data: "2024-02-13", Estágio: "Negociação" },
  { Vendedor: "Ricardo Mendes", Cliente: "Cliente N14", Produto: "Tubo Cobre", Região: "SC", Valor: 2700, Quantidade: 30, Data: "2024-02-14", Estágio: "Fechado" },
  { Vendedor: "João Silva", Cliente: "Cliente O15", Produto: "Arame Barb", Região: "SP", Valor: 4300, Quantidade: 80, Data: "2024-03-01", Estágio: "Fechado" },
  { Vendedor: "Maria Santos", Cliente: "Cliente P16", Produto: "Lâmina Fita", Região: "RJ", Valor: 2000, Quantidade: 40, Data: "2024-03-02", Estágio: "Fechado" },
  { Vendedor: "Pedro Oliveira", Cliente: "Cliente Q17", Produto: "Porca Asa", Região: "MG", Valor: 3800, Quantidade: 60, Data: "2024-03-03", Estágio: "Fechado" },
  { Vendedor: "Ana Costa", Cliente: "Cliente R18", Produto: "Parafuso T", Região: "BA", Valor: 1700, Quantidade: 100, Data: "2024-03-04", Estágio: "Fechado" },
];

export default function Page() {
  const [data, setData] = useState<SalesData[]>(EXAMPLE_DATA);
  const [filters, setFilters] = useState<Filters>({
    vendedor: '',
    cliente: '',
    produto: '',
    regiao: '',
    startDate: '',
    endDate: '',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');

  const updateFilter = useCallback((key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (filters.vendedor && row.Vendedor !== filters.vendedor) return false;
      if (filters.cliente && row.Cliente !== filters.cliente) return false;
      if (filters.produto && row.Produto !== filters.produto) return false;
      if (filters.regiao && row.Região !== filters.regiao) return false;
      const rowDate = new Date(row.Data);
      if (filters.startDate && rowDate < new Date(filters.startDate)) return false;
      if (filters.endDate && rowDate > new Date(filters.endDate)) return false;
      return true;
    });
  }, [data, filters]);

  const kpis = useMemo(() => {
    const totalValor = filteredData.reduce((sum, d) => sum + d.Valor, 0);
    const totalQuant = filteredData.reduce((sum, d) => sum + d.Quantidade, 0);
    const numClientes = new Set(filteredData.map((d) => d.Cliente)).size;
    return {
      totalVendas: filteredData.length,
      receitaTotal: totalValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      totalQuantidade: totalQuant.toLocaleString(),
      clientesUnicos: numClientes,
    };
  }, [filteredData]);

  const sellerData = useMemo(() => {
    const groups: Record<string, number> = {};
    filteredData.forEach((d) => {
      groups[d.Vendedor] = (groups[d.Vendedor] || 0) + d.Valor;
    });
    return Object.entries(groups)
      .map(([name, valor]) => ({ name, valor }))
      .sort((a, b) => b.valor - a.valor);
  }, [filteredData]);

  const topSellers = sellerData.slice(0, 3);

  const clientData = useMemo(() => {
    const groups: Record<string, number> = {};
    filteredData.forEach((d) => {
      groups[d.Cliente] = (groups[d.Cliente] || 0) + d.Valor;
    });
    return Object.entries(groups)
      .map(([name, valor]) => ({ name, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
  }, [filteredData]);

  const funilData = useMemo(() => {
    const groups: Record<string, number> = {};
    filteredData.forEach((d) => {
      groups[d.Estagio] = (groups[d.Estagio] || 0) + 1;
    });
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const uniqueVendedores = useMemo(
    () => Array.from(new Set(data.map((d) => d.Vendedor))).sort((a, b) => a.localeCompare(b)),
    [data]
  );
  const uniqueClientes = useMemo(
    () => Array.from(new Set(data.map((d) => d.Cliente))).sort((a, b) => a.localeCompare(b)),
    [data]
  );
  const uniqueProdutos = useMemo(
    () => Array.from(new Set(data.map((d) => d.Produto))).sort((a, b) => a.localeCompare(b)),
    [data]
  );
  const uniqueRegioes = useMemo(
    () => Array.from(new Set(data.map((d) => d.Região))).sort((a, b) => a.localeCompare(b)),
    [data]
  );

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

  const glassClass = "bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8";
  const glassInput =
    "bg-white/10 backdrop-blur border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 ring-blue-500/50 focus:border-blue-400/50 transition-all w-full text-sm";

  const handleProcessFile = async (file: File) => {
    try {
      if (!/\.xlsx?$/i.test(file.name)) {
        throw new Error('Apenas arquivos .xlsx ou .xls são aceitos.');
      }
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws) || [];
      if (json.length === 0) throw new Error('Planilha vazia.');
      const headers = Object.keys(json[0] || {});
      const required = ['Vendedor', 'Cliente', 'Produto', 'Região', 'Valor', 'Quantidade', 'Data', 'Estágio'];
      const missing = required.filter((h) => !headers.includes(h));
      if (missing.length) {
        throw new Error(`Colunas obrigatórias ausentes: ${missing.join(', ')}`);
      }
      const newData: SalesData[] = json
        .map((row) => {
          const vendedor = String(row.Vendedor || '').trim();
          const cliente = String(row.Cliente || '').trim();
          const produto = String(row.Produto || '').trim();
          const regiao = String(row.Região || '').trim();
          const valor = parseFloat(String(row.Valor || '0'));
          const quant = parseFloat(String(row.Quantidade || '0'));
          const dataStr = String(row.Data || '');
          const estagio = String(row.Estagio || '').trim();
          if (
            !vendedor ||
            !cliente ||
            !produto ||
            !regiao ||
            isNaN(valor) ||
            valor <= 0 ||
            isNaN(quant) ||
            quant <= 0 ||
            !dataStr ||
            isNaN(new Date(dataStr).getTime()) ||
            !estagio
          ) {
            return null;
          }
          return {
            Vendedor: vendedor,
            Cliente: cliente,
            Produto: produto,
            Região: regiao,
            Valor: valor,
            Quantidade: quant,
            Data: new Date(dataStr).toISOString().split('T')[0],
            Estágio: estagio,
          };
        })
        .filter((row): row is SalesData => row !== null);
      if (newData.length === 0) {
        throw new Error('Nenhum registro válido encontrado na planilha.');
      }
      setData(newData);
      setMessage(`✅ ${newData.length} registros importados com sucesso!`);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 5000);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Erro desconhecido ao processar arquivo.';
      setMessage(`❌ ${errMsg}`);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 5000);
    }
    setModalOpen(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900/20 to-slate-900 p-6 md:p-8 pb-24 text-white font-sans">
        {/* Header */}
        <header className="mb-12 flex flex-col lg:flex-row items-center justify-between gap-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-2xl leading-tight">
              Dashboard Metalfama
            </h1>
            <p className="text-xl text-white/60 mt-2">Análises Comerciais Premium</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="group relative bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 whitespace-nowrap text-lg"
          >
            <span>📥 Importar Planilha</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-300 scale-105 -z-10" />
          </button>
        </header>

        {/* Message */}
        {showMessage && (
          <div
            className={`fixed top-24 right-8 w-80 p-6 rounded-3xl shadow-3xl z-[100] backdrop-blur-xl border text-white font-semibold transition-all duration-500 ease-out ${
              message.startsWith('✅')
                ? 'bg-emerald-500/95 border-emerald-400/50'
                : 'bg-red-500/95 border-red-400/50'
            } transform translate-x-0 opacity-100`}
          >
            {message}
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-16">
          <div>
            <label className="block text-sm font-semibold mb-2 text-white/80">Vendedor</label>
            <select
              value={filters.vendedor}
              onChange={(e) => updateFilter('vendedor', e.target.value)}
              className={glassInput}
            >
              <option value="">Todos Vendedores</option>
              {uniqueVendedores.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-white/80">Cliente</label>
            <select
              value={filters.cliente}
              onChange={(e) => updateFilter('cliente', e.target.value)}
              className={glassInput}
            >
              <option value="">Todos Clientes</option>
              {uniqueClientes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-white/80">Produto</label>
            <select
              value={filters.produto}
              onChange={(e) => updateFilter('produto', e.target.value)}
              className={glassInput}
            >
              <option value="">Todos Produtos</option>
              {uniqueProdutos.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-white/80">Região</label>
            <select
              value={filters.regiao}
              onChange={(e) => updateFilter('regiao', e.target.value)}
              className={glassInput}
            >
              <option value="">Todas Regiões</option>
              {uniqueRegioes.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-white/80">Período</label>
            <div className="flex gap-3">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => updateFilter('startDate', e.target.value)}
                className={`${glassInput} flex-1 py-2`}
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => updateFilter('endDate', e.target.value)}
                className={`${glassInput} flex-1 py-2`}
              />
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <div className={`${glassClass} h-36 md:h-48 flex flex-col items-center justify-center text-center rounded-3xl hover:shadow-3xl transition-all hover:-translate-y-2`}>
            <div className="text-5xl mb-4">📊</div>
            <div className="text-3xl lg:text-4xl font-black text-white mb-1">{kpis.totalVendas}</div>
            <div className="text-white/60 text-sm lg:text-base">Total Vendas</div>
          </div>
          <div className={`${glassClass} h-36 md:h-48 flex flex-col items-center justify-center text-center rounded-3xl hover:shadow-3xl transition-all hover:-translate-y-2`}>
            <div className="text-5xl mb-4">💰</div>
            <div className="text-3xl lg:text-4xl font-black text-white mb-1">{kpis.receitaTotal}</div>
            <div className="text-white/60 text-sm lg:text-base">Receita Total</div>
          </div>
          <div className={`${glassClass} h-36 md:h-48 flex flex-col items-center justify-center text-center rounded-3xl hover:shadow-3xl transition-all hover:-translate-y-2`}>
            <div className="text-5xl mb-4">🛒</div>
            <div className="text-3xl lg:text-4xl font-black text-white mb-1">{kpis.totalQuantidade}</div>
            <div className="text-white/60 text-sm lg:text-base">Total Itens</div>
          </div>
          <div className={`${glassClass} h-36 md:h-48 flex flex-col items-center justify-center text-center rounded-3xl hover:shadow-3xl transition-all hover:-translate-y-2`}>
            <div className="text-5xl mb-4">👥</div>
            <div className="text-3xl lg:text-4xl font-black text-white mb-1">{kpis.clientesUnicos}</div>
            <div className="text-white/60 text-sm lg:text-base">Clientes Únicos</div>
          </div>
        </div>

        {/* Vendedores Performance */}
        <section className={`${glassClass} mb-20 rounded-3xl shadow-3xl hover:shadow-4xl transition-all hover:-translate-y-2`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-12 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent text-center drop-shadow-2xl">
            Performance de Vendedores
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="h-80 lg:h-96 bg-white/5 rounded-2xl p-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sellerData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="white/10" vertical={false} />
                  <XAxis dataKey="name" stroke="white/70" angle={-45} height={80} tick={{ fontSize: 12 }} />
                  <YAxis stroke="white/70" tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'Receita']} />
                  <Bar dataKey="valor" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 lg:min-h-[400px] flex flex-col justify-center">
              <h3 className="text-3xl font-bold text-center text-white mb-8 tracking-tight">🏆 Top 3 Vendedores</h3>
              {topSellers.length > 0 ? (
                topSellers.map((seller, i) => (
                  <div
                    key={seller.name}
                    className="flex items-center gap-6 p-8 rounded-2xl bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-2 border-yellow-400/30 backdrop-blur-sm hover:shadow-3xl hover:scale-[1.02] transition-all duration-300"
                  >
                    <span className="text-4xl drop-shadow-lg">{['🥇', '🥈', '🥉'][i]}</span>
                    <div>
                      <p className="font-black text-2xl text-white mb-1">{seller.name}</p>
                      <p className="text-xl text-yellow-300 font-bold">
                        {seller.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-white/50 text-xl py-12">Sem dados de vendedores</p>
              )}
            </div>
          </div>
        </section>

        {/* Clientes & Funil */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          <section className={`${glassClass} rounded-3xl shadow-3xl hover:shadow-4xl transition-all hover:-translate-y-2`}>
            <h3 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent text-center drop-shadow-xl">
              Top Clientes
            </h3>
            <div className="h-96 bg-white/5 rounded-2xl p-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clientData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="white/10" vertical={false} />
                  <XAxis dataKey="name" stroke="white/70" angle={-45} height={80} tick={{ fontSize: 12 }} />
                  <YAxis stroke="white/70" tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'Receita']} />
                  <Bar dataKey="valor" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className={`${glassClass} rounded-3xl shadow-3xl hover:shadow-4xl transition-all hover:-translate-y-2`}>
            <h3 className="text-4xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent text-center drop-shadow-xl">
              Funil de Vendas
            </h3>
            <div className="h-96 bg-white/5 rounded-2xl p-6 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={funilData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {funilData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Table */}
        <section className={`${glassClass} rounded-3xl shadow-3xl overflow-hidden hover:shadow-4xl transition-all hover:-translate-y-2`}>
          <div className="p-8 pb-6 border-b border-white/10">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2 drop-shadow-2xl">
              Tabela de Vendas
            </h2>
            <p className="text-white/60 text-lg">{filteredData.length} registros filtrados</p>
          </div>
          <div className="overflow-x-auto">
            {filteredData.length === 0 ? (
              <div className="text-center py-24 text-white/40">
                <div className="text-6xl mb-6 mx-auto">📊</div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Nenhum registro encontrado</h3>
                <p className="text-lg md:text-xl">Ajuste os filtros ou importe uma planilha para visualizar os dados.</p>
              </div>
            ) : (
              <table className="w-full divide-y divide-white/5">
                <thead>
                  <tr>
                    <th className="px-6 py-5 text-left text-xs font-bold text-white/90 uppercase tracking-wider bg-white/5 backdrop-blur-sm sticky top-0 z-10 border-b border-white/10">
                      Vendedor
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-white/90 uppercase tracking-wider bg-white/5 backdrop-blur-sm sticky top-0 z-10 border-b border-white/10">
                      Cliente
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-white/90 uppercase tracking-wider bg-white/5 backdrop-blur-sm sticky top-0 z-10 border-b border-white/10">
                      Produto
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-white/90 uppercase tracking-wider bg-white/5 backdrop-blur-sm sticky top-0 z-10 border-b border-white/10">
                      Região
                    </th>
                    <th className="px-6 py-5 text-right text-xs font-bold text-white/90 uppercase tracking-wider bg-white/5 backdrop-blur-sm sticky top-0 z-10 border-b border-white/10">
                      Valor
                    </th>
                    <th className="px-6 py-5 text-right text-xs font-bold text-white/90 uppercase tracking-wider bg-white/5 backdrop-blur-sm sticky top-0 z-10 border-b border-white/10">
                      Qtd
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-white/90 uppercase tracking-wider bg-white/5 backdrop-blur-sm sticky top-0 z-10 border-b border-white/10">
                      Data
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-white/90 uppercase tracking-wider bg-white/5 backdrop-blur-sm sticky top-0 z-10 border-b border-white/10">
                      Estágio
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredData.map((row, i) => (
                    <tr
                      key={`${row.Vendedor}-${row.Cliente}-${row.Data}-${i}`}
                      className="hover:bg-white/10 transition-all duration-200 even:bg-white/5"
                    >
                      <td className="px-6 py-5 font-medium text-white/90 whitespace-nowrap">
                        {row.Vendedor}
                      </td>
                      <td className="px-6 py-5 text-white/80 whitespace-nowrap">
                        {row.Cliente}
                      </td>
                      <td className="px-6 py-5 text-white/80 whitespace-nowrap">
                        {row.Produto}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold border border-blue-400/30">
                          {row.Região}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-mono font-bold text-green-400 text-lg whitespace-nowrap">
                        {row.Valor.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-5 text-right text-white/70 font-mono whitespace-nowrap">
                        {row.Quantidade.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-5 text-white/70 whitespace-nowrap">
                        {new Date(row.Data).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                            row.Estagio === 'Fechado'
                              ? 'bg-green-500/20 text-green-400 border-green-400/30'
                              : row.Estagio === 'Negociação'
                              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30'
                              : 'bg-gray-500/20 text-gray-400 border-gray-400/30'
                          }`}
                        >
                          {row.Estagio}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      {/* Import Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50"
          onClick={() => setModalOpen(false)}
        >
          <div
            className={`${glassClass} max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl shadow-3xl p-12 hover:shadow-4xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent text-center drop-shadow-2xl">
              📥 Importar Planilha Excel
            </h2>
            <p className="text-white/60 text-center mb-12 text-lg">Arraste o arquivo ou clique para selecionar (.xlsx / .xls)</p>
            <label
              htmlFor="file-upload"
              className="block w-full h-52 border-2 border-dashed border-white/30 rounded-3xl flex flex-col items-center justify-center hover:border-blue-400/50 hover:bg-white/5 transition-all duration-300 cursor-pointer group relative overflow-hidden"
              onDragOver={(e) => {
                e.preventDefault();
                (e.currentTarget as HTMLLabelElement).classList.add('border-blue-400', 'bg-blue-500/10');
              }}
              onDragLeave={(e) => {
                (e.currentTarget as HTMLLabelElement).classList.remove('border-blue-400', 'bg-blue-500/10');
              }}
              onDrop={(e) => {
                e.preventDefault();
                (e.currentTarget as HTMLLabelElement).classList.remove('border-blue-400', 'bg-blue-500/10');
                const file = e.dataTransfer.files[0];
                if (file) handleProcessFile(file);
              }}
            >
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">📄</div>
              <p className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">Solte o arquivo aqui</p>
              <p className="text-white/70 mb-6 text-lg">ou clique para selecionar</p>
              <p className="text-xs text-white/50 px-8 text-center max-w-md">
                Colunas requeridas: <strong>Vendedor, Cliente, Produto, Região, Valor, Quantidade, Data, Estágio</strong>
              </p>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 rounded-3xl" />
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleProcessFile(file);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
