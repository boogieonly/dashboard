"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Material = {
  name: string;
  weight: number;
  value: number;
  quantity: number;
};

const exampleData: Material[] = [
  { name: 'Aço Carbono', weight: 1500, value: 4500, quantity: 100 },
  { name: 'Alumínio', weight: 800, value: 3200, quantity: 200 },
  { name: 'Aço Inox', weight: 1200, value: 7200, quantity: 80 },
  { name: 'Cobre', weight: 300, value: 4500, quantity: 50 },
  { name: 'Latão', weight: 400, value: 2800, quantity: 60 },
];

const glassStyle = 'bg-gray-900/30 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]';

const KpiCard: React.FC<{ title: string; value: string }> = ({ title, value }) => (
  <div className={`${glassStyle} p-8 rounded-3xl text-center min-h-[120px] flex flex-col justify-center`}>
    <div className="text-3xl font-bold text-white mb-2">{value}</div>
    <div className="text-gray-400 text-sm uppercase tracking-wide font-medium">{title}</div>
  </div>
);

const MaterialCard: React.FC<{
  material: Material;
  totalWeight: number;
  onClick: () => void;
  onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave: () => void;
}> = ({ material, totalWeight, onClick, onMouseEnter, onMouseLeave }) => {
  const percent = totalWeight > 0 ? (material.weight / totalWeight) * 100 : 0;

  return (
    <div
      className={`${glassStyle} p-8 rounded-3xl cursor-pointer relative group min-h-[280px] flex flex-col justify-between`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div>
        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">{material.name}</h3>
        <div className="space-y-3 mb-6 text-lg">
          <div className="flex justify-between">
            <span className="text-gray-400">Peso:</span>
            <span className="font-bold text-white">{material.weight.toLocaleString()} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Valor:</span>
            <span className="font-bold text-white">R$ {material.value.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Qtd:</span>
            <span className="font-bold text-white">{material.quantity.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-3 text-gray-400">
          <span>% do Peso Total</span>
          <span className="font-bold text-white">{percent.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-800/50 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-4 rounded-full transition-all duration-500 shadow-inner"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const DetailModal: React.FC<{ material: Material; onClose: () => void }> = ({ material, onClose }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
    <div className={`${glassStyle} max-w-2xl w-full max-h-[90vh] overflow-y-auto p-10 rounded-3xl`}>
      <h3 className="text-4xl font-bold text-white mb-8">{material.name}</h3>
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div>
          <div className="space-y-4 text-2xl">
            <div><span className="text-gray-400">Peso:</span> <span className="text-white font-bold">{material.weight.toLocaleString()} kg</span></div>
            <div><span className="text-gray-400">Valor:</span> <span className="text-white font-bold">R$ {material.value.toLocaleString()}</span></div>
            <div><span className="text-gray-400">Quantidade:</span> <span className="text-white font-bold">{material.quantity.toLocaleString()}</span></div>
          </div>
        </div>
        <div className="bg-gray-800/30 p-6 rounded-2xl">
          <h4 className="text-xl font-bold text-white mb-4">Detalhes Adicionais</h4>
          <p className="text-gray-300">Material de alta qualidade utilizado na fabricação de estruturas metálicas.</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 py-4 rounded-2xl text-xl font-bold text-white transition-all shadow-lg"
      >
        Fechar
      </button>
    </div>
  </div>
);

export default function Home() {
  const [materials, setMaterials] = useState<Material[]>(exampleData);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [tooltip, setTooltip] = useState<{ material: Material; x: number; y: number } | null>(null);

  const totals = useMemo(() => {
    const totalWeight = materials.reduce((sum, m) => sum + m.weight, 0);
    const totalValue = materials.reduce((sum, m) => sum + m.value, 0);
    const totalQuantity = materials.reduce((sum, m) => sum + m.quantity, 0);
    const numMaterials = materials.length;
    const avgWeightPerMaterial = numMaterials > 0 ? totalWeight / numMaterials : 0;
    const avgValuePerItem = totalQuantity > 0 ? totalValue / totalQuantity : 0;
    return {
      totalWeight,
      totalValue,
      totalQuantity,
      avgWeightPerMaterial,
      avgValuePerItem,
      numMaterials,
    };
  }, [materials]);

  const chartData = useMemo(
    () => materials.map((m) => ({ name: m.name, weight: m.weight })),
    [materials]
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result as string;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const data = XLSX.utils.sheet_to_json<any[]>(ws);
      /* eslint-enable @typescript-eslint/no-explicit-any */

      const parsed: Material[] = data
        .map((row) => ({
          name: (row.Material || row['Nome do Material'] || '').toString(),
          weight: parseFloat((row.Peso || row['Peso (kg)'] || '0') as string) || 0,
          value: parseFloat((row.Valor || row['Valor (R$)'] || '0') as string) || 0,
          quantity: parseInt((row.Quantidade || row['Qtd'] || '0') as string, 10) || 0,
        }))
        .filter((m) => m.name && m.weight > 0);

      setMaterials(parsed);
      setShowUploadModal(false);
    };
    reader.readAsBinaryString(file);
  };

  const exportExcel = useCallback(() => {
    const wsData = materials.map((m) => ({
      Material: m.name,
      'Peso (kg)': m.weight,
      'Valor (R$)': m.value,
      Quantidade: m.quantity,
      '% Peso': `${((m.weight / totals.totalWeight) * 100).toFixed(1)}%`,
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);

    const summaryData = [
      { KPI: 'Peso Total', Valor: `${totals.totalWeight.toLocaleString()} kg` },
      { KPI: 'Valor Total', Valor: `R$ ${totals.totalValue.toLocaleString()}` },
      { KPI: 'Total de Itens', Valor: totals.totalQuantity.toLocaleString() },
      { KPI: 'Peso Médio por Material', Valor: `${totals.avgWeightPerMaterial.toFixed(0)} kg` },
      { KPI: 'Valor Médio por Item', Valor: `R$ ${totals.avgValuePerItem.toFixed(2)}` },
    ];
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Materiais');
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumo');

    XLSX.writeFile(
      wb,
      `relatorio-metalfama-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    setShowExportMenu(false);
  }, [materials, totals]);

  const exportPDF = useCallback(() => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Relatório Metalfama', 20, 20);
    doc.setFontSize(12);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 35);

    // KPIs
    let startY = 50;
    doc.text(`Peso Total: ${totals.totalWeight.toLocaleString()} kg`, 20, startY);
    startY += 10;
    doc.text(`Valor Total: R$ ${totals.totalValue.toLocaleString()}`, 20, startY);
    startY += 10;
    doc.text(`Total Itens: ${totals.totalQuantity.toLocaleString()}`, 20, startY);
    startY += 20;

    autoTable(doc, {
      startY,
      head: [['Material', 'Peso (kg)', 'Valor (R$)', 'Quantidade', '% Peso']],
      body: materials.map((m) => [
        m.name,
        m.weight.toLocaleString(),
        m.value.toLocaleString(),
        m.quantity.toLocaleString(),
        `${((m.weight / totals.totalWeight) * 100).toFixed(1)}%`,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 },
    });

    doc.save(`relatorio-metalfama-${new Date().toISOString().slice(0, 10)}.pdf`);
    setShowExportMenu(false);
  }, [materials, totals]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900/20 to-black p-8 font-sans">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-6">
        <h1 className={`${glassStyle} px-12 py-8 rounded-3xl text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-400 backdrop-blur-xl`}>
          Metalfama Dashboard
        </h1>
        <div className="flex gap-4 w-full lg:w-auto">
          <button
            onClick={() => setShowUploadModal(true)}
            className={`${glassStyle} px-8 py-4 rounded-2xl text-xl font-semibold text-white flex-1 lg:flex-none`}
          >
            📁 Upload Excel
          </button>
          <div className="relative flex-1 lg:flex-none">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className={`${glassStyle} px-8 py-4 rounded-2xl text-xl font-semibold text-white w-full lg:w-auto`}
            >
              📊 Exportar
            </button>
            {showExportMenu && (
              <div className={`${glassStyle} absolute right-0 mt-2 w-48 p-2 rounded-2xl shadow-3xl z-40`}>
                <button
                  onClick={exportPDF}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/20 transition-colors font-medium"
                >
                  📄 PDF
                </button>
                <button
                  onClick={exportExcel}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/20 transition-colors font-medium mt-1"
                >
                  📈 Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
        <KpiCard title="Peso Total" value={`${totals.totalWeight.toLocaleString()} kg`} />
        <KpiCard title="Valor Total" value={`R$ ${totals.totalValue.toLocaleString()}`} />
        <KpiCard title="Peso Médio / Material" value={`${totals.avgWeightPerMaterial.toFixed(0)} kg`} />
        <KpiCard title="Valor Médio / Item" value={`R$ ${totals.avgValuePerItem.toFixed(2)}`} />
        <KpiCard title="Total de Itens" value={totals.totalQuantity.toLocaleString()} />
      </div>

      {/* Materials Cards */}
      <section className="mb-16">
        <h2 className="text-4xl font-bold text-white mb-8 glass px-8 py-4 rounded-2xl w-fit backdrop-blur">Materiais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {materials.map((material, index) => (
            <MaterialCard
              key={index}
              material={material}
              totalWeight={totals.totalWeight}
              onClick={() => setSelectedMaterial(material)}
              onMouseEnter={(e) => setTooltip({ material, x: e.clientX, y: e.clientY })}
              onMouseLeave={() => setTooltip(null)}
            />
          ))}
        </div>
      </section>

      {/* Chart */}
      <section>
        <div className={`${glassStyle} p-12 rounded-4xl`}>
          <h2 className="text-4xl font-bold text-white mb-12 glass px-8 py-4 rounded-2xl w-fit backdrop-blur inline-block">
            Gráfico de Pesos
          </h2>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <RechartsTooltip />
              <Bar dataKey="weight" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Modals */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-8">
          <div className={`${glassStyle} max-w-md w-full p-10 rounded-3xl`}>
            <h3 className="text-3xl font-bold text-white mb-8">Upload Excel</h3>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="w-full p-4 bg-gray-800/50 border-2 border-dashed border-white/30 rounded-2xl text-lg text-white file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-lg file:font-semibold file:bg-gradient-to-r file:from-blue-500 file:to-indigo-600 file:text-white hover:file:brightness-110 transition-all cursor-pointer"
            />
            <button
              onClick={() => setShowUploadModal(false)}
              className="mt-8 w-full bg-gray-700/50 hover:bg-gray-600 py-4 rounded-2xl text-xl text-white font-semibold transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {selectedMaterial && (
        <DetailModal material={selectedMaterial} onClose={() => setSelectedMaterial(null)} />
      )}

      {/* Tooltip */}
      {tooltip && (
        <div
          className={`${glassStyle} p-4 rounded-2xl text-sm shadow-3xl z-[100] max-w-xs pointer-events-none whitespace-normal`}
          style={{
            position: 'fixed',
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y - 10}px`,
            transform: 'translateY(-100%)',
          }}
        >
          <div className="font-bold text-white text-lg mb-2">{tooltip.material.name}</div>
          <div>Peso: <span className="font-semibold text-blue-400">{tooltip.material.weight.toLocaleString()} kg</span></div>
          <div>Valor: <span className="font-semibold text-green-400">R$ {tooltip.material.value.toLocaleString()}</span></div>
          <div>Qtd: <span className="font-semibold text-purple-400">{tooltip.material.quantity.toLocaleString()}</span></div>
        </div>
      )}
    </div>
  );
}
