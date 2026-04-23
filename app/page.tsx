"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type Material = {
  name: string;
  used: number;
  total: number;
  value: number;
};

type Kpi = {
  title: string;
  value: string;
  change?: number;
  tooltip: string;
};

const TooltipWrapper: React.FC<{ children: React.ReactNode; content: React.ReactNode }> = ({ children, content }) => (
  <div className="group relative">
    {children}
    <div className="absolute z-50 invisible group-hover:visible group-hover:opacity-100 opacity-0 transition-all duration-300 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 text-white text-sm px-4 py-3 rounded-2xl shadow-2xl -top-16 left-1/2 -translate-x-1/2 whitespace-normal max-w-xs text-left before:absolute before:w-0 before:h-0 before:left-1/2 before:-translate-x-1/2 before:top-full before:border-8 before:border-t-gray-900/95 before:border-l-transparent before:border-r-transparent">
      {content}
    </div>
  </div>
);

export default function Page() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [chartData, setChartData] = useState<Array<{ name: string; stock: number }>>([]);

  useEffect(() => {
    const mats: Material[] = [
      { name: 'Aço Carbono', used: 6000, total: 10000, value: 200000 },
      { name: 'Alumínio', used: 2000, total: 5000, value: 100000 },
      { name: 'Aço Inox', used: 2400, total: 3000, value: 150000 },
      { name: 'Cobre', used: 200, total: 1000, value: 50000 },
    ];
    setMaterials(mats);

    const totalValue = mats.reduce((sum, m) => sum + m.value, 0);
    const totalUsed = mats.reduce((sum, m) => sum + m.used, 0);
    const totalStock = mats.reduce((sum, m) => sum + m.total, 0);
    const usedPercent = totalStock > 0 ? Math.round((totalUsed / totalStock) * 100) : 0;

    const kps: Kpi[] = [
      { title: 'Valor Total Estoque', value: `R$ ${totalValue.toLocaleString()}`, tooltip: 'Valor total atual do estoque de materiais' },
      { title: 'Material Utilizado', value: `${usedPercent}%`, change: usedPercent, tooltip: 'Porcentagem total de material já utilizado' },
      { title: 'Eficiência', value: '92%', change: 92, tooltip: 'Taxa de eficiência da produção no mês' },
      { title: 'Pedidos Concluídos', value: '45/50', tooltip: 'Número de pedidos finalizados este mês' },
      { title: 'Desperdício', value: '3%', change: 3, tooltip: 'Percentual médio de desperdício de materiais' },
    ];
    setKpis(kps);

    const chData = [
      { name: 'Jan', stock: 4000 },
      { name: 'Fev', stock: 3000 },
      { name: 'Mar', stock: 5000 },
      { name: 'Abr', stock: 4500 },
      { name: 'Mai', stock: 3800 },
    ];
    setChartData(chData);
  }, []);

  const getPercent = (material: Material): number => {
    return material.total > 0 ? Math.round((material.used / material.total) * 100) : 0;
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt: ProgressEvent<FileReader>) => {
      const data = evt.target?.result as ArrayBuffer;
      if (!data) return;

      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

      const newMaterials: Material[] = json
        .map((row: any) => ({
          name: String(row.name || ''),
          used: parseFloat(String(row.used || 0)) || 0,
          total: parseFloat(String(row.total || 0)) || 0,
          value: parseFloat(String(row.value || 0)) || 0,
        }))
        .filter((m) => m.name.trim());

      setMaterials(newMaterials);

      const totalValue = newMaterials.reduce((sum, m) => sum + m.value, 0);
      const totalUsed = newMaterials.reduce((sum, m) => sum + m.used, 0);
      const totalStock = newMaterials.reduce((sum, m) => sum + m.total, 0);
      const usedPercent = totalStock > 0 ? Math.round((totalUsed / totalStock) * 100) : 0;

      const kps: Kpi[] = [
        { title: 'Valor Total Estoque', value: `R$ ${totalValue.toLocaleString()}`, tooltip: 'Valor total atual do estoque de materiais' },
        { title: 'Material Utilizado', value: `${usedPercent}%`, change: usedPercent, tooltip: 'Porcentagem total de material já utilizado' },
        { title: 'Eficiência', value: '92%', change: 92, tooltip: 'Taxa de eficiência da produção no mês' },
        { title: 'Pedidos Concluídos', value: '45/50', tooltip: 'Número de pedidos finalizados este mês' },
        { title: 'Desperdício', value: '3%', change: 3, tooltip: 'Percentual médio de desperdício de materiais' },
      ];
      setKpis(kps);

      setShowModal(false);
      e.target.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  const exportExcel = () => {
    const wsData = materials.map((m) => ({
      Material: m.name,
      'Usado (kg)': m.used,
      'Total (kg)': m.total,
      'Valor (R$)': `R$ ${m.value.toLocaleString()}`,
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Materiais');
    XLSX.writeFile(wb, 'metalfama_materiais.xlsx');
  };

  const exportPDF = async () => {
    const element = document.getElementById('dashboard-content') as HTMLElement;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#0f0f2a',
        scale: window.devicePixelRatio > 1 ? 2 : 1,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      while (heightLeft >= 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -heightLeft + imgHeight - pdfHeight, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      pdf.save('dashboard_metalfama.pdf');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900/30 to-slate-900 p-4 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-transparent drop-shadow-2xl mb-4">
            Dashboard Metalfama
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">Gestão avançada de estoque, produção e eficiência operacional.</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 lg:mb-20">
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 sm:px-8 sm:py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl text-white font-semibold text-base sm:text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl active:scale-[0.98]"
          >
            📁 Upload Excel
          </button>
          <button
            onClick={exportPDF}
            className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-400/30 hover:to-purple-400/30 backdrop-blur-xl border border-indigo-400/30 rounded-2xl text-white font-semibold text-base sm:text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl active:scale-[0.98]"
          >
            📄 Exportar PDF
          </button>
          <button
            onClick={exportExcel}
            className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-400/30 hover:to-green-400/30 backdrop-blur-xl border border-emerald-400/30 rounded-2xl text-white font-semibold text-base sm:text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl active:scale-[0.98]"
          >
            📊 Exportar Excel
          </button>
        </div>

        <div id="dashboard-content">
          {/* KPIs */}
          <section className="mb-16 lg:mb-24">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-8 text-center">KPIs Principais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
              {kpis.map((kpi, index) => (
                <TooltipWrapper key={index} content={kpi.tooltip}>
                  <div className="group bg-white/5 hover:bg-white/10 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 text-center shadow-2xl hover:shadow-3xl transition-all duration-300 h-[180px] sm:h-[200px] flex flex-col justify-center hover:-translate-y-1">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white/90 mb-3 truncate">
                      {kpi.title}
                    </h3>
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 drop-shadow-lg">
                      {kpi.value}
                    </div>
                    {kpi.change !== undefined && (
                      <div className="w-full bg-gray-700/50 backdrop-blur-sm rounded-full h-3 border border-gray-600/30 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full shadow-md transition-all duration-500"
                          style={{ width: `${kpi.change}%` }}
                        />
                      </div>
                    )}
                  </div>
                </TooltipWrapper>
              ))}
            </div>
          </section>

          {/* Materials */}
          <section className="mb-16 lg:mb-24">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-8 text-center">Materiais em Estoque</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {materials.map((material, index) => {
                const percent = getPercent(material);
                return (
                  <TooltipWrapper
                    key={index}
                    content={(
                      <div className="space-y-1">
                        <p><span className="font-semibold">Usado:</span> {material.used.toLocaleString()} kg</p>
                        <p><span className="font-semibold">Total:</span> {material.total.toLocaleString()} kg</p>
                        <p><span className="font-semibold">Valor:</span> R$ {material.value.toLocaleString()}</p>
                      </div>
                    )}
                  >
                    <div className="group bg-white/5 hover:bg-white/10 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 h-[260px] lg:h-[280px] flex flex-col justify-between hover:-translate-y-1">
                      <div>
                        <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 truncate">
                          {material.name}
                        </h3>
                        <div className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-6 drop-shadow-lg">
                          {percent}%
                        </div>
                      </div>
                      <div className="w-full bg-gray-700/50 backdrop-blur-sm rounded-full h-4 lg:h-5 border border-gray-600/50 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-4 lg:h-5 rounded-full shadow-lg transition-all duration-700 relative overflow-hidden"
                          style={{ width: `${percent}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-pulse" />
                        </div>
                      </div>
                      <div className="text-base lg:text-lg text-gray-300 mt-3 text-center font-semibold">
                        R$ {material.value.toLocaleString()}
                      </div>
                    </div>
                  </TooltipWrapper>
                );
              })}
            </div>
          </section>

          {/* Chart */}
          <section>
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-8 text-center">Evolução do Estoque Mensal</h2>
              <ResponsiveContainer width="100%" height={450}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="5 5" stroke="#374151" vertical={false} strokeOpacity={0.5} />
                  <XAxis dataKey="name" stroke="#9CA3AF" tickLine={false} axisLine={false} fontSize={14} tickMargin={12} />
                  <YAxis stroke="#9CA3AF" tickLine={false} axisLine={false} fontSize={14} tickMargin={12} />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="stock"
                    stroke="#A78BFA"
                    strokeWidth={4}
                    dot={{ fill: '#A78BFA', strokeWidth: 3, r: 6 }}
                    activeDot={{ r: 10, strokeWidth: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 lg:p-12 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-3xl hover:shadow-4xl transition-all duration-300 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-6 text-center">Upload Excel</h2>
            <p className="text-gray-300 mb-8 text-center text-sm lg:text-base leading-relaxed">
              Selecione um arquivo .xlsx com colunas: <code className="bg-gray-800 px-2 py-1 rounded text-indigo-300 font-mono text-xs">name</code>,{' '}
              <code className="bg-gray-800 px-2 py-1 rounded text-indigo-300 font-mono text-xs">used</code>,{' '}
              <code className="bg-gray-800 px-2 py-1 rounded text-indigo-300 font-mono text-xs">total</code>,{' '}
              <code className="bg-gray-800 px-2 py-1 rounded text-indigo-300 font-mono text-xs">value</code>
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleUpload}
              className="w-full p-4 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-indigo-500 file:to-purple-500 file:text-white file:font-semibold file:text-sm hover:file:from-indigo-400 hover:file:to-purple-400 file:transition-all file:shadow-lg backdrop-blur-sm transition-all duration-300 text-sm"
            />
            <button
              onClick={() => setShowModal(false)}
              className="mt-8 w-full py-4 bg-gray-700/50 hover:bg-gray-600/60 backdrop-blur-xl border border-gray-500/50 rounded-2xl text-white font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-[0.98]"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
