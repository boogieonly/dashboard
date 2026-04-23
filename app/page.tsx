'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

type DataRow = {
  data: string;
  regiao: string;
  produto: string;
  vendedor: string;
  material: string;
  peso: number;
  valor: number;
};

type Filtros = {
  fromDate: string;
  toDate: string;
  regiao: string;
  produto: string;
  vendedor: string;
  material: string;
};

type TopMaterial = {
  material: string;
  peso: number;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#912EFF'];

const GlassPane: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '' }) => (
  <div className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/20 ${className}`}>
    {children}
  </div>
);

const Page: React.FC = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [regioes, setRegioes] = useState<string[]>([]);
  const [produtos, setProdutos] = useState<string[]>([]);
  const [vendedores, setVendedores] = useState<string[]>([]);
  const [materiais, setMateriais] = useState<string[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({
    fromDate: '',
    toDate: '',
    regiao: '',
    produto: '',
    vendedor: '',
    material: '',
  });

  // Carregar dados do localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('dadosDashboard');
    if (savedData) {
      const parsedData = JSON.parse(savedData) as DataRow[];
      setData(parsedData);
    }

    const savedFiltros = localStorage.getItem('filtrosDashboard');
    if (savedFiltros) {
      setFiltros(JSON.parse(savedFiltros) as Filtros);
    }
  }, []);

  // Salvar filtros no localStorage
  useEffect(() => {
    localStorage.setItem('filtrosDashboard', JSON.stringify(filtros));
  }, [filtros]);

  // Extrair opções únicas dos filtros
  useEffect(() => {
    if (data.length === 0) return;
    setRegioes([...new Set(data.map((d) => d.regiao))].sort());
    setProdutos([...new Set(data.map((d) => d.produto))].sort());
    setVendedores([...new Set(data.map((d) => d.vendedor))].sort());
    setMateriais([...new Set(data.map((d) => d.material))].sort());
  }, [data]);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<DataRow>(worksheet);

    setData(jsonData as DataRow[]);
    localStorage.setItem('dadosDashboard', JSON.stringify(jsonData));
  }, []);

  const limparFiltros = () => {
    setFiltros({
      fromDate: '',
      toDate: '',
      regiao: '',
      produto: '',
      vendedor: '',
      material: '',
    });
  };

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const rowDate = new Date(row.data);
      if (filtros.fromDate && rowDate < new Date(filtros.fromDate)) return false;
      if (filtros.toDate && rowDate > new Date(filtros.toDate)) return false;
      if (filtros.regiao && row.regiao !== filtros.regiao) return false;
      if (filtros.produto && row.produto !== filtros.produto) return false;
      if (filtros.vendedor && row.vendedor !== filtros.vendedor) return false;
      if (filtros.material && row.material !== filtros.material) return false;
      return true;
    });
  }, [data, filtros]);

  const pesoTotal = useMemo(
    () => filteredData.reduce((sum, row) => sum + row.peso, 0),
    [filteredData]
  );

  const valorTotal = useMemo(
    () => filteredData.reduce((sum, row) => sum + row.valor, 0),
    [filteredData]
  );

  const topMateriais = useMemo((): TopMaterial[] => {
    const map: Record<string, number> = {};
    filteredData.forEach((row) => {
      map[row.material] = (map[row.material] || 0) + row.peso;
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([material, peso]) => ({ material, peso }));
  }, [filteredData]);

  const barData = useMemo(
    () =>
      regioes.map((regiao) => ({
        regiao,
        volume: filteredData
          .filter((row) => row.regiao === regiao)
          .reduce((sum, row) => sum + row.peso, 0),
      })),
    [filteredData, regioes]
  );

  const getMesKey = (dataStr: string): string => new Date(dataStr).toISOString().slice(0, 7);

  const lineData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach((row) => {
      const mes = getMesKey(row.data);
      map[mes] = (map[mes] || 0) + row.valor;
    });
    return Object.keys(map)
      .sort()
      .map((mes) => ({ mes, faturamento: map[mes] }));
  }, [filteredData]);

  const pieData = useMemo(
    () =>
      regioes
        .map((regiao) => ({
          name: regiao,
          value: filteredData
            .filter((row) => row.regiao === regiao)
            .reduce((sum, row) => sum + row.peso, 0),
        }))
        .filter((d) => d.value > 0),
    [filteredData, regioes]
  );

  if (data.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex flex-col items-center justify-center p-8">
        <GlassPane className="text-center max-w-md">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">Dashboard Premium</h1>
          <p className="text-white/80 mb-8 text-lg">Faça upload do arquivo Excel para visualizar o dashboard.</p>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFile}
            className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-8 py-4 text-white text-lg font-medium w-full cursor-pointer file:mr-6 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-white/30 file:backdrop-blur-sm file:text-white file:font-semibold file:transition-all hover:file:bg-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
          />
        </GlassPane>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-900 via-purple-900/50 to-pink-800/80 overflow-hidden">
      <header className="text-center mb-12">
        <GlassPane className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-4">
            Dashboard Premium
          </h1>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFile}
            className="mx-auto bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-6 py-3 text-white font-medium w-full max-w-md cursor-pointer file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-white/30 file:backdrop-blur-sm file:text-white/90 hover:file:bg-white/40 file:transition-all focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
          />
        </GlassPane>
      </header>

      {/* Filtros */}
      <section className="max-w-7xl mx-auto mb-12">
        <GlassPane>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 p-4">
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">Período Inicial</label>
              <input
                type="date"
                value={filtros.fromDate}
                onChange={(e) => setFiltros({ ...filtros, fromDate: e.target.value })}
                className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 w-full transition-all"
              />
            </div>
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">Período Final</label>
              <input
                type="date"
                value={filtros.toDate}
                onChange={(e) => setFiltros({ ...filtros, toDate: e.target.value })}
                className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 w-full transition-all"
              />
            </div>
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">Região</label>
              <select
                value={filtros.regiao}
                onChange={(e) => setFiltros({ ...filtros, regiao: e.target.value })}
                className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white w-full focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
              >
                <option value="">Todas</option>
                {regioes.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">Produto</label>
              <select
                value={filtros.produto}
                onChange={(e) => setFiltros({ ...filtros, produto: e.target.value })}
                className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white w-full focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
              >
                <option value="">Todos</option>
                {produtos.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">Vendedor</label>
              <select
                value={filtros.vendedor}
                onChange={(e) => setFiltros({ ...filtros, vendedor: e.target.value })}
                className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white w-full focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
              >
                <option value="">Todos</option>
                {vendedores.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <label className="block text-white/90 text-sm font-medium mb-2">Material</label>
              <select
                value={filtros.material}
                onChange={(e) => setFiltros({ ...filtros, material: e.target.value })}
                className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white w-full focus:outline-none focus:ring-2 focus:ring-white/40 transition-all flex-1"
              >
                <option value="">Todos</option>
                {materiais.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <button
                onClick={limparFiltros}
                className="bg-white/30 hover:bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl px-6 py-3 text-white font-semibold transition-all hover:shadow-lg ml-2 whitespace-nowrap"
              >
                Limpar
              </button>
            </div>
          </div>
        </GlassPane>
      </section>

      <div className="max-w-7xl mx-auto space-y-8 lg:space-y-12">
        {/* KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <GlassPane>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Peso Total</h2>
            <div className="text-4xl md:text-6xl lg:text-7xl font-black text-green-400">
              {pesoTotal.toLocaleString('pt-BR')}
            </div>
            <p className="text-white/70 mt-2 text-lg">kg</p>
          </GlassPane>
          <GlassPane>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Valor Total</h2>
            <div className="text-4xl md:text-6xl lg:text-7xl font-black text-blue-400">
              R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </GlassPane>
        </section>

        {/* Cards Materiais */}
        <section>
          <GlassPane>
            <h2 className="text-3xl font-bold text-white mb-8">Top 5 Materiais (Peso)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {topMateriais.map(({ material, peso }, index) => (
                <div key={material} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 text-center hover:scale-105 transition-all hover:shadow-2xl hover:shadow-blue-500/25">
                  <h3 className="text-xl font-semibold text-white mb-2 truncate">{material}</h3>
                  <div className="text-2xl md:text-3xl font-black text-green-400">
                    {peso.toLocaleString('pt-BR')}
                  </div>
                  <p className="text-white/70 text-sm">kg</p>
                </div>
              ))}
            </div>
          </GlassPane>
        </section>

        {/* Gráficos */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <GlassPane>
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Volume por Região (BarChart)</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="white/10" />
                <XAxis dataKey="regiao" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Legend />
                <Bar dataKey="volume" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </GlassPane>
          <GlassPane>
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Evolução do Faturamento (LineChart)</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="white/10" />
                <XAxis dataKey="mes" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="faturamento" stroke="#8884d8" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </GlassPane>
        </section>

        <section>
          <GlassPane>
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Distribuição de Fluxo por Região (PieChart)</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <ResponsiveContainer width="100%" maxWidth={500} height={400}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-white text-lg md:text-xl">
                <p>Total Fluxo: <span className="font-bold text-green-400">{pesoTotal.toLocaleString('pt-BR')} kg</span></p>
              </div>
            </div>
          </GlassPane>
        </section>

        {/* Tabela */}
        <section>
          <GlassPane>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Dados Filtrados ({filteredData.length})</h2>
            </div>
            {filteredData.length === 0 ? (
              <p className="text-center text-white/70 text-xl py-12">Nenhum dado encontrado com os filtros aplicados.</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-sm md:text-base">
                  <thead>
                    <tr className="bg-white/5 backdrop-blur-sm border-b border-white/20">
                      <th className="px-4 py-4 text-left font-semibold text-white">Data</th>
                      <th className="px-4 py-4 text-left font-semibold text-white hidden md:table-cell">Região</th>
                      <th className="px-4 py-4 text-left font-semibold text-white hidden lg:table-cell">Produto</th>
                      <th className="px-4 py-4 text-left font-semibold text-white hidden xl:table-cell">Vendedor</th>
                      <th className="px-4 py-4 text-left font-semibold text-white">Material</th>
                      <th className="px-4 py-4 text-right font-semibold text-white">Peso</th>
                      <th className="px-4 py-4 text-right font-semibold text-white hidden md:table-cell">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.slice(0, 50).map((row, index) => (  // Limite para performance
                      <tr key={`${row.data}-${row.vendedor}-${index}`} className="border-b border-white/10 hover:bg-white/10 transition-all">
                        <td className="px-4 py-4 text-white/90 font-medium">{row.data}</td>
                        <td className="px-4 py-4 text-white/80 hidden md:table-cell">{row.regiao}</td>
                        <td className="px-4 py-4 text-white/80 hidden lg:table-cell truncate max-w-[120px]">{row.produto}</td>
                        <td className="px-4 py-4 text-white/80 hidden xl:table-cell truncate max-w-[100px]">{row.vendedor}</td>
                        <td className="px-4 py-4 text-white/90 truncate max-w-[150px]">{row.material}</td>
                        <td className="px-4 py-4 text-right text-green-400 font-semibold">
                          {row.peso.toLocaleString('pt-BR')}
                        </td>
                        <td className="px-4 py-4 text-right text-blue-400 font-semibold hidden md:table-cell">
                          R$ {row.valor.toLocaleString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassPane>
        </section>

        {/* Fechamento Mensal */}
        <section>
          <FechamentoMensal />
        </section>
      </div>
    </div>
  );
};

const FechamentoMensal: React.FC = () => (
  <GlassPane className="text-center">
    <h2 className="text-4xl font-bold text-white mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
      Fechamento Mensal
    </h2>
    <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
      Resumo consolidado do período. Todos os KPIs e análises estão atualizados com os dados filtrados.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      <div className="bg-white/20 p-6 rounded-2xl">
        <p className="text-white/70">Registros Totais</p>
        <p className="text-3xl font-bold text-white">{data.length}</p>
      </div>
      <div className="bg-white/20 p-6 rounded-2xl">
        <p className="text-white/70">Média Peso</p>
        <p className="text-3xl font-bold text-green-400">
          {(pesoTotal / filteredData.length || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
        </p>
      </div>
      <div className="bg-white/20 p-6 rounded-2xl">
        <p className="text-white/70">Média Valor</p>
        <p className="text-3xl font-bold text-blue-400">
          R$ {(valorTotal / filteredData.length || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  </GlassPane>
);

export default Page;
