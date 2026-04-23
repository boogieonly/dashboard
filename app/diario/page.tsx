'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

type DailyRecord = {
  data: string;
  ligacoes: number;
  orcamentos: number;
  negocios: number;
  valor: number;
  observacoes: string;
  dataHora: string;
};

type FormDataType = {
  ligacoes: number;
  orcamentos: number;
  negocios: number;
  valor: number;
  observacoes: string;
};

type Last7Data = {
  date: string;
  ligacoes: number;
  valor: number;
};

export default function DiarioPage() {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [formData, setFormData] = useState<FormDataType>({
    ligacoes: 0,
    orcamentos: 0,
    negocios: 0,
    valor: 0,
    observacoes: '',
  });
  const [currentPage, setCurrentPage] = useState<number>(1);

  const glassInput = "w-full px-5 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/50 focus:border-transparent shadow-2xl hover:shadow-3xl transition-all duration-300 text-lg font-mono tracking-wide";
  const glassButton = "px-6 py-3 bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl text-gray-100 hover:bg-white/30 hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold shadow-xl";

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatTaxa = (negocios: number, ligacoes: number): string =>
    ligacoes > 0 ? ((negocios / ligacoes) * 100).toFixed(1) + '%' : '0%';

  const taxa = formatTaxa(formData.negocios, formData.ligacoes);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setCurrentDate(today);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dailyRecords');
      if (stored) {
        setRecords(JSON.parse(stored));
      }
    }
  }, []);

  useEffect(() => {
    const rec = records.find((r) => r.data === currentDate);
    const defaults = { ligacoes: 0, orcamentos: 0, negocios: 0, valor: 0, observacoes: '' };
    setFormData(rec ? {
      ligacoes: rec.ligacoes,
      orcamentos: rec.orcamentos,
      negocios: rec.negocios,
      valor: rec.valor,
      observacoes: rec.observacoes,
    } : defaults);
  }, [currentDate, records]);

  const last7Data = useMemo((): Last7Data[] => {
    const data: Last7Data[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const rec = records.find((r) => r.data === dateStr);
      data.push({
        date: dateStr,
        ligacoes: rec?.ligacoes || 0,
        valor: rec?.valor || 0,
      });
    }
    return data;
  }, [records]);

  const maxLigacoes = Math.max(...last7Data.map((d) => d.ligacoes), 1);
  const maxValor = Math.max(...last7Data.map((d) => d.valor), 1);

  const linePoints = last7Data
    .map((d, i) => {
      const x = (i / 6) * 95 + 7.5;
      const scaleY = (d.ligacoes / maxLigacoes) * 45;
      const y = 55 - scaleY;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const recentRecords = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return records
      .filter((r) => new Date(r.data) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [records]);

  const totalPages = Math.ceil(recentRecords.length / 10);
  const paginatedRecords = recentRecords.slice((currentPage - 1) * 10, currentPage * 10);

  const handleSave = () => {
    if (formData.ligacoes < 0 || formData.orcamentos < 0 || formData.negocios < 0 || formData.valor < 0) {
      alert('Os valores não podem ser negativos!');
      return;
    }
    const newRecord: DailyRecord = {
      data: currentDate,
      ligacoes: formData.ligacoes,
      orcamentos: formData.orcamentos,
      negocios: formData.negocios,
      valor: formData.valor,
      observacoes: formData.observacoes,
      dataHora: new Date().toISOString(),
    };
    const existingIdx = records.findIndex((r) => r.data === currentDate);
    let newRecords: DailyRecord[];
    if (existingIdx >= 0) {
      newRecords = [...records];
      newRecords[existingIdx] = newRecord;
    } else {
      newRecords = [...records, newRecord];
    }
    setRecords(newRecords);
    localStorage.setItem('dailyRecords', JSON.stringify(newRecords));
  };

  const handleDelete = (date: string) => {
    if (!confirm(`Deseja realmente deletar o registro de ${date}?`)) return;
    const newRecords = records.filter((r) => r.data !== date);
    setRecords(newRecords);
    localStorage.setItem('dailyRecords', JSON.stringify(newRecords));
    if (date === currentDate) {
      setFormData({ ligacoes: 0, orcamentos: 0, negocios: 0, valor: 0, observacoes: '' });
    }
    if (paginatedRecords.length <= 1 && currentPage > 1) {
      setCurrentPage(1);
    }
  };

  const exportToExcel = () => {
    const csvHeader = 'Data,Ligações,Orçamentos,Negócios,Valor,Taxa de Conversão,Observações\n';
    const csvRows = records
      .map((r) => {
        const taxaVal = formatTaxa(r.negocios, r.ligacoes).replace('%', '').replace(',', '.');
        return `${r.data},${r.ligacoes},${r.orcamentos},${r.negocios},${r.valor},${taxaVal},${r.observacoes.replace(/,/g, ';')}`;
      })
      .join('\n');
    const csvContent = csvHeader + csvRows;
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fechamento-diario-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/30 to-purple-900/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-500 bg-clip-text text-transparent text-5xl md:text-7xl font-black drop-shadow-2xl mb-6 animate-pulse">
            📋 Fechamento Diário
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 font-light max-w-3xl mx-auto leading-relaxed">
            Registre suas atividades diárias e acompanhe o progresso
          </p>
        </div>

        {/* Date Selector */}
        <div className="max-w-md mx-auto mb-16">
          <label className="block text-center text-2xl font-bold text-gray-100 mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
            📅 Selecione a Data
          </label>
          <input
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className={`${glassInput} text-2xl text-center py-6 px-8 rounded-3xl shadow-3xl border-2 border-white/30 hover:border-cyan-400/50 focus:border-emerald-400/50`}
          />
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-20">
          <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-blue-400/30 shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 hover:scale-105 transition-all duration-300 text-center">
            <div className="text-6xl md:text-8xl mb-6 drop-shadow-2xl">📞</div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-100 mb-4">Ligações Realizadas</h3>
            <div className="text-5xl md:text-7xl font-black bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent drop-shadow-2xl">
              {formData.ligacoes}
            </div>
          </div>
          <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-purple-400/30 shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-105 transition-all duration-300 text-center">
            <div className="text-6xl md:text-8xl mb-6 drop-shadow-2xl">📧</div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-100 mb-4">Orçamentos Enviados</h3>
            <div className="text-5xl md:text-7xl font-black bg-gradient-to-r from-purple-300 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl">
              {formData.orcamentos}
            </div>
          </div>
          <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-emerald-400/30 shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 hover:scale-105 transition-all duration-300 text-center">
            <div className="text-6xl md:text-8xl mb-6 drop-shadow-2xl">✅</div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-100 mb-4">Negócios Fechados</h3>
            <div className="text-5xl md:text-7xl font-black bg-gradient-to-r from-emerald-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-2xl">
              {formData.negocios}
            </div>
          </div>
          <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-amber-400/30 shadow-2xl shadow-amber-500/40 hover:shadow-amber-500/60 hover:scale-105 transition-all duration-300 text-center">
            <div className="text-6xl md:text-8xl mb-6 drop-shadow-2xl">💵</div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-100 mb-4">Valor Fechado</h3>
            <div className="text-5xl md:text-7xl font-black bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent drop-shadow-2xl">
              {formatCurrency(formData.valor)}
            </div>
          </div>
          <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-pink-400/30 shadow-2xl shadow-pink-500/40 hover:shadow-pink-500/60 hover:scale-105 transition-all duration-300 text-center">
            <div className="text-6xl md:text-8xl mb-6 drop-shadow-2xl">📊</div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-100 mb-4">Taxa de Conversão</h3>
            <div className="text-5xl md:text-7xl font-black bg-gradient-to-r from-pink-300 to-rose-400 bg-clip-text text-transparent drop-shadow-2xl">
              {taxa}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-3xl border border-white/20 shadow-3xl rounded-4xl p-8 md:p-12 mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-12 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-2xl">
            ✏️ Registro Diário
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block mb-3 text-lg font-semibold text-gray-200">
                Ligações Realizadas <span className="text-red-400 text-lg">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.ligacoes}
                onChange={(e) => setFormData({ ...formData, ligacoes: parseInt(e.target.value) || 0 })}
                className={glassInput}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block mb-3 text-lg font-semibold text-gray-200">
                Orçamentos Enviados <span className="text-red-400 text-lg">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.orcamentos}
                onChange={(e) => setFormData({ ...formData, orcamentos: parseInt(e.target.value) || 0 })}
                className={glassInput}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block mb-3 text-lg font-semibold text-gray-200">
                Negócios Fechados <span className="text-red-400 text-lg">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.negocios}
                onChange={(e) => setFormData({ ...formData, negocios: parseInt(e.target.value) || 0 })}
                className={glassInput}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block mb-3 text-lg font-semibold text-gray-200">
                Valor Fechado <span className="text-red-400 text-lg">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })}
                className={glassInput}
                placeholder="0.00"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-3 text-lg font-semibold text-gray-200">Observações</label>
              <textarea
                rows={5}
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                className={`${glassInput} resize-vertical min-h-[120px] text-base`}
                placeholder="Notas adicionais..."
              />
            </div>
          </div>
          <div className="flex justify-center mt-12">
            <button
              type="button"
              onClick={handleSave}
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 text-white font-black py-6 px-12 rounded-3xl shadow-2xl hover:shadow-emerald-500/60 hover:scale-110 transition-all duration-300 text-2xl shadow-emerald-500/50"
            >
              💾 Salvar Registro
            </button>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {/* Line Chart */}
          <div className="bg-white/10 backdrop-blur-3xl border border-white/20 shadow-3xl rounded-4xl p-8 md:p-12 overflow-hidden">
            <h3 className="text-3xl md:text-4xl font-black text-center mb-10 bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-500 bg-clip-text text-transparent drop-shadow-2xl">
              📈 Evolução de Ligações (Últimos 7 dias)
            </h3>
            <svg viewBox="0 0 100 60" className="w-full h-72 md:h-80 mx-auto">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              <polyline
                points={linePoints}
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {last7Data.map((d, i) => (
                <text
                  key={i}
                  x={((i / 6) * 95 + 7.5).toFixed(1)}
                  y="57"
                  textAnchor="middle"
                  fontSize="3.5"
                  fill="#9ca3af"
                  transform={`rotate(-45 ${((i / 6) * 95 + 7.5).toFixed(1)} 57)`}
                >
                  {d.date.slice(5, 10)}
                </text>
              ))}
              <text x="5" y="53" fontSize="4" fill="#9ca3af">0</text>
              <text x="5" y="12" fontSize="4" fill="#60a5fa">{maxLigacoes}</text>
            </svg>
          </div>

          {/* Bar Chart */}
          <div className="bg-white/10 backdrop-blur-3xl border border-white/20 shadow-3xl rounded-4xl p-8 md:p-12 overflow-hidden">
            <h3 className="text-3xl md:text-4xl font-black text-center mb-10 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent drop-shadow-2xl">
              💰 Valor Fechado (Últimos 7 dias)
            </h3>
            <svg viewBox="0 0 100 60" className="w-full h-72 md:h-80 mx-auto">
              <defs>
                <linearGradient id="barGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#ca8a04" />
                </linearGradient>
              </defs>
              {last7Data.map((d, i) => {
                const x = (i / 6) * 95 + 2.5;
                const barWidth = 95 / 7 - 0.5;
                const height = Math.max((d.valor / maxValor) * 45, 2);
                return (
                  <g key={i} transform={`translate(0,0)`}>
                    <rect
                      x={x.toFixed(1)}
                      y={(60 - height).toFixed(1)}
                      width={barWidth.toFixed(1)}
                      height={height.toFixed(1)}
                      rx="3"
                      fill="url(#barGrad)"
                    />
                    <text
                      x={x + barWidth / 2}
                      y="59"
                      textAnchor="middle"
                      fontSize="3.5"
                      fill="#9ca3af"
                      transform={`rotate(-45 ${x + barWidth / 2} 59)`}
                    >
                      {d.date.slice(5, 10)}
                    </text>
                  </g>
                );
              })}
              <text x="5" y="53" fontSize="4" fill="#9ca3af">R$0</text>
              <text x="5" y="12" fontSize="4" fill="#f59e0b">R${maxValor.toLocaleString()}</text>
            </svg>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 shadow-3xl rounded-4xl overflow-hidden mb-20">
          <div className="p-8 border-b border-white/10 bg-white/5 backdrop-blur-xl">
            <h3 className="text-4xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-2xl">
              📊 Histórico dos Últimos 30 Dias
            </h3>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full divide-y divide-white/5">
              <thead className="sticky top-0 bg-white/20 backdrop-blur-xl z-10">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Data</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Ligações</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Orçamentos</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Negócios</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Valor</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Taxa Conv.</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Observações</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-white/5">
                {paginatedRecords.map((r) => (
                  <tr
                    key={r.data}
                    className="hover:bg-white/20 transition-all duration-300 cursor-pointer"
                    onClick={(e) => {
                      if ((e.target as Element).tagName !== 'BUTTON') {
                        setCurrentDate(r.data);
                      }
                    }}
                  >
                    <td className="px-6 py-6 font-bold text-gray-100 text-lg">{r.data}</td>
                    <td className="px-6 py-6 text-gray-200 font-mono">{r.ligacoes}</td>
                    <td className="px-6 py-6 text-gray-200 font-mono">{r.orcamentos}</td>
                    <td className="px-6 py-6 font-bold text-emerald-400 text-lg font-mono">{r.negocios}</td>
                    <td className="px-6 py-6 font-mono text-amber-400">{formatCurrency(r.valor)}</td>
                    <td className="px-6 py-6 font-mono text-pink-400 text-lg">{formatTaxa(r.negocios, r.ligacoes)}</td>
                    <td className="px-6 py-6 max-w-xs truncate text-gray-300" title={r.observacoes || 'Sem observações'}>
                      {r.observacoes || '-'}
                    </td>
                    <td className="px-6 py-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(r.data);
                        }}
                        className="bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-300 hover:text-red-200 px-5 py-2 rounded-2xl font-bold transition-all duration-300 hover:scale-105 shadow-lg shadow-red-500/30"
                      >
                        🗑️ Deletar
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedRecords.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400 text-xl">
                      Nenhum registro nos últimos 30 dias.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="bg-white/10 backdrop-blur-xl border-t border-white/10 p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                <div className="text-gray-300 font-mono">
                  Mostrando {(currentPage - 1) * 10 + 1} a {Math.min(currentPage * 10, recentRecords.length)} de{' '}
                  {recentRecords.length} registros
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`${glassButton} ${currentPage === 1 ? 'opacity-50 cursor-not-allowed shadow-none hover:scale-100' : ''}`}
                  >
                    ← Anterior
                  </button>
                  <span className="px-6 py-3 bg-white/20 backdrop-blur border border-white/20 rounded-2xl font-bold text-gray-100 font-mono">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`${glassButton} ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed shadow-none hover:scale-100' : ''}`}
                  >
                    Próxima →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col lg:flex-row gap-8 justify-center lg:justify-between items-center pt-16 border-t-4 border-white/10 pb-12">
          <Link
            href="/"
            className={`${glassButton} text-xl md:text-2xl px-8 md:px-12 py-5 md:py-6 rounded-3xl shadow-2xl hover:shadow-3xl border-2 border-white/30 font-bold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30`}
          >
            ← Voltar para Visão Geral
          </Link>
          <button
            onClick={exportToExcel}
            className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 hover:from-green-600 hover:via-emerald-600 hover:to-teal-700 text-white font-black py-5 px-12 rounded-3xl shadow-2xl hover:shadow-green-500/60 hover:scale-110 transition-all duration-300 text-xl shadow-green-500/50 border border-green-400/30"
          >
            📥 Exportar Histórico (Excel)
          </button>
        </div>
      </div>
    </div>
  );
}
