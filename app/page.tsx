"use client";

import { useCallback, useState } from 'react';

export default function Home() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const fileInputId = 'excel-upload';

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]?.name.endsWith('.xlsx')) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]?.name.endsWith('.xlsx')) {
      setFile(e.target.files[0]);
    }
  };

  const glassClass = 'bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl';
  const inputClass = 'flex-1 min-w-[140px] bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm transition-all';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900/50 to-indigo-900 overflow-x-hidden">
      {/* Banner Superior */}
      <div className="text-center py-16 px-8">
        <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-6 drop-shadow-2xl">
          Dashboard Comercial
        </h1>
        <p className="text-xl md:text-2xl text-white/80 font-medium max-w-2xl mx-auto">
          Análise completa de vendas, performance e oportunidades de negócio.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-12 pb-16">
        {/* Seção de Upload */}
        <div className="max-w-4xl mx-auto">
          <div className={glassClass}>
            <div
              className={`border-4 border-dashed rounded-2xl p-16 text-center transition-all duration-300 cursor-pointer ${
                dragActive
                  ? 'border-blue-400 bg-blue-500/20 scale-[1.02]'
                  : 'border-white/30 hover:border-white/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                id={fileInputId}
                type="file"
                accept=".xlsx"
                onChange={handleChange}
                className="hidden"
              />
              <label htmlFor={fileInputId} className="block">
                <div className="text-6xl mb-6">📊</div>
                <p className="text-2xl font-semibold text-white mb-2">
                  Arraste seu arquivo Excel aqui
                </p>
                <p className="text-lg text-white/70 mb-4">ou clique para selecionar workbook_v1.xlsx</p>
                {file && (
                  <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4 mt-6">
                    <p className="font-medium text-green-300">✅ Arquivo carregado:</p>
                    <p className="text-green-200">{file.name}</p>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Filtros</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <input placeholder="Período" className={inputClass} />
            <input placeholder="Região" className={inputClass} />
            <input placeholder="Produto" className={inputClass} />
            <input placeholder="Vendedor" className={inputClass} />
            <input placeholder="Material" className={inputClass} />
          </div>
        </div>

        {/* KPIs */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Indicadores Principais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`${glassClass} text-center hover:scale-[1.02] transition-transform`}>
              <div className="text-4xl font-black text-blue-400 mb-2">12.345</div>
              <div className="text-white/90 font-semibold text-lg">Volume Total (kg)</div>
            </div>
            <div className={`${glassClass} text-center hover:scale-[1.02] transition-transform`}>
              <div className="text-4xl font-black text-green-400 mb-2">R$ 1.234.567</div>
              <div className="text-white/90 font-semibold text-lg">Valor Total (R$)</div>
            </div>
            <div className={`${glassClass} text-center hover:scale-[1.02] transition-transform`}>
              <div className="text-4xl font-black text-yellow-400 mb-2">112%</div>
              <div className="text-white/90 font-semibold text-lg">Atingimento de Meta</div>
            </div>
            <div className={`${glassClass} text-center hover:scale-[1.02] transition-transform`}>
              <div className="text-4xl font-black text-purple-400 mb-2">47</div>
              <div className="text-white/90 font-semibold text-lg">Oportunidades</div>
            </div>
          </div>
        </div>

        {/* Seção Materiais */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Materiais</h2>
          <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
            <div className={`${glassClass} min-w-[220px] flex-shrink-0 hover:scale-[1.05] transition-all snap-center text-center p-6`}>
              <div className="text-4xl mb-4">🟤</div>
              <h3 className="text-xl font-bold text-white mb-2">Cobre</h3>
              <p className="text-white/70">Volume: 5.678 kg</p>
            </div>
            <div className={`${glassClass} min-w-[220px] flex-shrink-0 hover:scale-[1.05] transition-all snap-center text-center p-6`}>
              <div className="text-4xl mb-4">🟡</div>
              <h3 className="text-xl font-bold text-white mb-2">Latão</h3>
              <p className="text-white/70">Volume: 3.245 kg</p>
            </div>
            <div className={`${glassClass} min-w-[220px] flex-shrink-0 hover:scale-[1.05] transition-all snap-center text-center p-6`}>
              <div className="text-4xl mb-4">⚪</div>
              <h3 className="text-xl font-bold text-white mb-2">Alumínio</h3>
              <p className="text-white/70">Volume: 8.912 kg</p>
            </div>
            <div className={`${glassClass} min-w-[220px] flex-shrink-0 hover:scale-[1.05] transition-all snap-center text-center p-6`}>
              <div className="text-4xl mb-4">🔩</div>
              <h3 className="text-xl font-bold text-white mb-2">Inox</h3>
              <p className="text-white/70">Volume: 2.134 kg</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
