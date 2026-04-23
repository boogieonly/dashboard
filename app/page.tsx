'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';

type DashboardRow = {
  Produto: string;
  Total: number;
  Data: string;
  Regiao: string;
  Vendedor: string;
  Material: string;
};

const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.341 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5a3 3 0 01-3-3m-3 3H6.75"
    />
  </svg>
);

const CubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M8.25 14.25l3.375 3.375L15 14.25m4.75 0L16.5 7.875M16 13.375l2.375-2.75"
    />
  </svg>
);

const DollarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v12m-3-2l3-3m0 0l3 3M9 18h6"
    />
  </svg>
);

const TargetIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v-.003a9.359 9.359 0 013.614-7.566m-7.228 0c-.868 1.45-1.32 3.191-1.32 5.019v-.003c0 1.113.285 2.16.786 3.07m0 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM15 7.434a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
    />
  </svg>
);

export default function Dashboard() {
  const [data, setData] = useState<DashboardRow[]>([]);
  const [filteredData, setFilteredData] = useState<DashboardRow[]>([]);
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [filterRegiao, setFilterRegiao] = useState('');
  const [filterProduto, setFilterProduto] = useState('');
  const [filterVendedor, setFilterVendedor] = useState('');
  const [filterMaterial, setFilterMaterial] = useState('');
  const [activeTab, setActiveTab] = useState<'Cobre' | 'Latão' | 'Alumínio' | 'Inox' | 'Outros'>('Cobre');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uniqueRegioes = useMemo(
    () => Array.from(new Set(data.map((r) => r.Regiao))).filter(Boolean).sort(),
    [data]
  );
  const uniqueProdutos = useMemo(
    () => Array.from(new Set(data.map((r) => r.Produto))).filter(Boolean).sort(),
    [data]
  );
  const uniqueVendedores = useMemo(
    () => Array.from(new Set(data.map((r) => r.Vendedor))).filter(Boolean).sort(),
    [data]
  );
  const uniqueMateriais = useMemo(
    () => Array.from(new Set(data.map((r) => r.Material))).filter(Boolean).sort(),
    [data]
  );

  const computedFilteredData = useMemo(() => {
    return data.filter((row) => {
      const rowDate = new Date(row.Data);
      if (isNaN(rowDate.getTime())) return false;

      if (filterStart && rowDate < new Date(filterStart)) return false;
      if (filterEnd && rowDate > new Date(filterEnd)) return false;
      if (filterRegiao && row.Regiao !== filterRegiao) return false;
      if (filterProduto && row.Produto !== filterProduto) return false;
      if (filterVendedor && row.Vendedor !== filterVendedor) return false;
      if (filterMaterial && row.Material !== filterMaterial) return false;

      return true;
    });
  }, [data, filterStart, filterEnd, filterRegiao, filterProduto, filterVendedor, filterMaterial]);

  const totalVolume = useMemo(
    () => computedFilteredData.reduce((acc, row) => acc + row.Total, 0),
    [computedFilteredData]
  );

  const volumeTotal = totalVolume.toLocaleString('pt-BR') + ' kg';
  const valorTotal = (totalVolume * 4.5).toLocaleString('pt-BR') + ' R$';
  const meta = 100000;
  const atinguimento = Math.min(100, (totalVolume / meta) * 100).toFixed(1) + '%';
  const oportunidades = new Set(computedFilteredData.map((row) => row.Vendedor)).size.toString();

  useEffect(() => {
    const saved = localStorage.getItem('dashboardData');
    if (saved) {
      try {
        setData(JSON.parse(saved) as DashboardRow[]);
      } catch {
        localStorage.removeItem('dashboardData');
      }
    }
  }, []);

  useEffect(() => {
    setFilteredData(computedFilteredData);
  }, [computedFilteredData]);

  const handleFile = async (file: File) => {
    setSelectedFile(file);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        alert('Arquivo Excel está vazio.');
        return;
      }

      const headers = Object.keys(jsonData[0]);
      const requiredCols = ['Produto', 'Total', 'Data', 'Região', 'Vendedor', 'Material'];
      const missingCols = requiredCols.filter((col) => !headers.includes(col));

      if (missingCols.length > 0) {
        alert(`Colunas obrigatórias ausentes: ${missingCols.join(', ')}`);
        return;
      }

      const rows: DashboardRow[] = jsonData
        .map((row: any) => ({
          Produto: String(row.Produto || ''),
          Total: Number(row.Total || 0),
          Data: String(row.Data || ''),
          Regiao: String(row.Região || ''),
          Vendedor: String(row.Vendedor || ''),
          Material: String(row.Material || ''),
        }))
        .filter((row) => !isNaN(row.Total) && row.Total > 0 && row.Data);

      setData(rows);
      localStorage.setItem('dashboardData', JSON.stringify(rows));
    } catch (error) {
      alert(`Erro ao processar o arquivo: ${(error as Error).message}`);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls'))) {
      handleFile(file);
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    e.target.value = '';
  };

  const exportFilteredData = () => {
    if (computedFilteredData.length === 0) return;

    const headers = ['Produto', 'Total', 'Data', 'Região', 'Vendedor', 'Material'];
    const csvContent = [
      headers.join(','),
      ...computedFilteredData.map((row) =>
        headers.map((header) => JSON.stringify((row as any)[header]).replace(/,/g, ';')).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dados_filtrados_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-indigo-900 p-6 md:p-12 flex flex-col gap-12">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 backdrop-blur-xl rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl border border-white/20">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-blue-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent mb-6 drop-shadow-2xl">
            Dashboard Comercial
          </h1>
          <p className="text-xl md:text-2xl opacity-90 font-medium">
            Métricas de Volume, Valor e Performance
          </p>
        </div>

        {/* Upload Section */}
        <section className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 text-center transition-all duration-300 hover:border-white/40 hover:shadow-2xl">
          <div
            className={`relative w-full h-48 md:h-56 border-2 border-dashed border-white/30 rounded-2xl flex flex-col items-center justify-center p-8 transition-all duration-300 cursor-pointer group ${
              isDragOver
                ? 'bg-white/20 border-white/50 scale-[1.02] shadow-2xl'
                : 'hover:border-white/50 hover:bg-white/10'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadIcon className="w-20 h-20 md:w-24 md:h-24 text-gray-300 group-hover:text-white mb-6 transition-colors duration-300" />
            <p className="text-lg md:text-xl text-gray-200 font-medium mb-2">
              Carregue um arquivo Excel para visualizar as métricas
            </p>
            <p className="text-sm text-gray-400 mb-8">ou</p>
            <button
              onClick={handleChooseFile}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-8 py-3 md:px-10 md:py-4 rounded-2xl border border-white/30 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
            >
              Escolher arquivo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            {selectedFile && (
              <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-sm rounded-2xl border-2 border-green-400/50">
                <p className="text-green-300 font-semibold text-lg">✅ {selectedFile.name} carregado com sucesso!</p>
              </div>
            )}
          </div>
        </section>

        {data.length > 0 && (
          <>
            {/* Filters */}
            <section className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                <input
                  type="date"
                  value={filterStart}
                  onChange={(e) => setFilterStart(e.target.value)}
                  className="bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:border-white/50 focus:ring-2 focus:ring-white/40 transition-all duration-300"
                />
                <input
                  type="date"
                  value={filterEnd}
                  onChange={(e) => setFilterEnd(e.target.value)}
                  className="bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:border-white/50 focus:ring-2 focus:ring-white/40 transition-all duration-300"
                />
                <select
                  value={filterRegiao}
                  onChange={(e) => setFilterRegiao(e.target.value)}
                  className="bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/50 focus:ring-2 focus:ring-white/40 transition-all duration-300 appearance-none"
                >
                  <option value="">Todas Regiões</option>
                  {uniqueRegioes.map((regiao) => (
                    <option key={regiao} value={regiao}>
                      {regiao}
                    </option>
                  ))}
                </select>
                <select
                  value={filterProduto}
                  onChange={(e) => setFilterProduto(e.target.value)}
                  className="bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/50 focus:ring-2 focus:ring-white/40 transition-all duration-300 appearance-none"
                >
                  <option value="">Todos Produtos</option>
                  {uniqueProdutos.map((produto) => (
                    <option key={produto} value={produto}>
                      {produto}
                    </option>
                  ))}
                </select>
                <select
                  value={filterVendedor}
                  onChange={(e) => setFilterVendedor(e.target.value)}
                  className="bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/50 focus:ring-2 focus:ring-white/40 transition-all duration-300 appearance-none"
                >
                  <option value="">Todos Vendedores</option>
                  {uniqueVendedores.map((vendedor) => (
                    <option key={vendedor} value={vendedor}>
                      {vendedor}
                    </option>
                  ))}
                </select>
                <select
                  value={filterMaterial}
                  onChange={(e) => setFilterMaterial(e.target.value)}
                  className="bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/50 focus:ring-2 focus:ring-white/40 transition-all duration-300 appearance-none"
                >
                  <option value="">Todos Materiais</option>
                  {uniqueMateriais.map((material) => (
                    <option key={material} value={material}>
                      {material}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={exportFilteredData}
                className="ml-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2"
              >
                Exportar Dados Filtrados ({computedFilteredData.length})
              </button>
            </section>

            {/* KPI Cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              <div className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 text-center hover:bg-white/20 hover:scale-[1.05] hover:shadow-2xl hover:border-white/40 transition-all duration-300 cursor-default">
                <CubeIcon className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 text-cyan-400 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2 drop-shadow-lg">
                  {volumeTotal}
                </h3>
                <p className="text-gray-300 uppercase tracking-wider font-medium text-sm md:text-base">
                  Volume Total (kg)
                </p>
              </div>
              <div className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 text-center hover:bg-white/20 hover:scale-[1.05] hover:shadow-2xl hover:border-white/40 transition-all duration-300 cursor-default">
                <DollarIcon className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 text-emerald-400 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2 drop-shadow-lg">
                  {valorTotal}
                </h3>
                <p className="text-gray-300 uppercase tracking-wider font-medium text-sm md:text-base">
                  Valor Total (R$)
                </p>
              </div>
              <div className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 text-center hover:bg-white/20 hover:scale-[1.05] hover:shadow-2xl hover:border-white/40 transition-all duration-300 cursor-default">
                <TargetIcon className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 text-orange-400 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2 drop-shadow-lg">
                  {atingimento}
                </h3>
                <p className="text-gray-300 uppercase tracking-wider font-medium text-sm md:text-base">
                  Atingimento de Meta %
                </p>
              </div>
              <div className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 text-center hover:bg-white/20 hover:scale-[1.05] hover:shadow-2xl hover:border-white/40 transition-all duration-300 cursor-default">
                <UsersIcon className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 text-purple-400 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2 drop-shadow-lg">
                  {oportunidades}
                </h3>
                <p className="text-gray-300 uppercase tracking-wider font-medium text-sm md:text-base">
                  Oportunidades
                </p>
              </div>
            </section>

            {/* Tabs */}
            <section className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 md:p-8">
              <div className="bg-white/10 rounded-2xl p-1 mb-8 flex shadow-lg">
                {(['Cobre', 'Latão', 'Alumínio', 'Inox', 'Outros'] as const).map((tab) => (
                  <button
                    key={tab}
                    className={`flex-1 py-4 px-4 md:px-6 rounded-xl font-bold text-sm md:text-base transition-all duration-300 ${
                      activeTab === tab
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl scale-[1.02]'
                        : 'text-gray-300 hover:text-white hover:bg-white/20 hover:scale-[1.01]'
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="min-h-64 bg-white/5 rounded-2xl border border-white/10 p-12 md:p-16 text-center flex items-center justify-center text-gray-400 font-medium text-lg md:text-xl">
                Estrutura das abas por material pronta. Adicione conteúdo aqui.
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

