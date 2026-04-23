import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Registro {
  data: string;
  faturado: number;
  atraso: number;
  vendido: number;
  carteiraTotal: number;
  previsaoMesAtual: number;
  previsaoProxMes: number;
}

const FechamentoMensal: React.FC = () => {
  // Estados para registros e formulário
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [form, setForm] = useState<Registro>({
    data: '',
    faturado: 0,
    atraso: 0,
    vendido: 0,
    carteiraTotal: 0,
    previsaoMesAtual: 0,
    previsaoProxMes: 0,
  });
  const [errors, setErrors] = useState<string[]>([]);

  // Refs para canvases dos gráficos
  const chartRef1 = useRef<HTMLCanvasElement>(null);
  const chartRef2 = useRef<HTMLCanvasElement>(null);

  // Carrega dados do localStorage ao montar o componente
  useEffect(() => {
    const saved = localStorage.getItem('fechamentoMensal');
    if (saved) {
      const parsed: Registro[] = JSON.parse(saved);
      setRegistros(parsed);
    }

    // Define data de hoje se for dia útil e não duplicada
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    if (isDiaUtil(todayStr) && !isDuplicate(todayStr)) {
      setForm(prev => ({ ...prev, data: todayStr }));
    }
  }, []);

  // Salva no localStorage e redesenha gráficos sempre que registros mudarem
  useEffect(() => {
    localStorage.setItem('fechamentoMensal', JSON.stringify(registros));
    drawCharts();
  }, [registros]);

  // Função para verificar se é dia útil (segunda a sexta)
  const isDiaUtil = (dataStr: string): boolean => {
    const date = new Date(dataStr + 'T00:00:00');
    const dia = date.getDay();
    return dia >= 1 && dia <= 5;
  };

  // Verifica se data já existe nos registros
  const isDuplicate = (dataStr: string): boolean => {
    return registros.some(r => r.data === dataStr);
  };

  // Manipula mudanças nos inputs do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof Registro;
    const value = e.target.value;
    if (name === 'data') {
      setForm(prev => ({ ...prev, data: value }));
    } else {
      setForm(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    }
  };

  // Valida o formulário
  const validateForm = (): string[] => {
    const errs: string[] = [];
    if (!form.data) {
      errs.push('Data é obrigatória');
      return errs;
    }
    if (!isDiaUtil(form.data)) {
      errs.push('Apenas dias úteis (segunda a sexta)');
    }
    if (isDuplicate(form.data)) {
      errs.push('Registro para esta data já existe');
    }
    const fields: (keyof Registro)[] = ['faturado', 'atraso', 'vendido', 'carteiraTotal', 'previsaoMesAtual', 'previsaoProxMes'];
    fields.forEach((field) => {
      if (form[field] < 0) {
        errs.push(`Campo ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} deve ser maior ou igual a 0`);
      }
    });
    return errs;
  };

  // Manipula envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateForm();
    setErrors(errs);
    if (errs.length === 0) {
      const newReg: Registro = { ...form };
      setRegistros(prev => [...prev, newReg].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()));

      // Calcula próxima data útil
      let nextDate = new Date(form.data + 'T00:00:00');
      nextDate.setDate(nextDate.getDate() + 1);
      let nextStr = nextDate.toISOString().split('T')[0];
      while (!isDiaUtil(nextStr)) {
        nextDate.setDate(nextDate.getDate() + 1);
        nextStr = nextDate.toISOString().split('T')[0];
      }
      setForm({
        data: nextStr,
        faturado: 0,
        atraso: 0,
        vendido: 0,
        carteiraTotal: 0,
        previsaoMesAtual: 0,
        previsaoProxMes: 0,
      });
      setErrors([]);
    }
  };

  // Limpa todos os registros com confirmação
  const handleClear = () => {
    if (confirm('Tem certeza que deseja limpar todos os registros? Esta ação não pode ser desfeita.')) {
      setRegistros([]);
    }
  };

  // Calcula totais dos indicadores
  const calcularTotais = (): Omit<Registro, 'data'> => {
    return {
      faturado: registros.reduce((sum, r) => sum + r.faturado, 0),
      atraso: registros.reduce((sum, r) => sum + r.atraso, 0),
      vendido: registros.reduce((sum, r) => sum + r.vendido, 0),
      carteiraTotal: registros.reduce((sum, r) => sum + r.carteiraTotal, 0),
      previsaoMesAtual: registros.reduce((sum, r) => sum + r.previsaoMesAtual, 0),
      previsaoProxMes: registros.reduce((sum, r) => sum + r.previsaoProxMes, 0),
    };
  };

  const totais = calcularTotais();

  // Desenha os gráficos usando Canvas
  const drawCharts = useCallback(() => {
    // Ordena registros por data ascendente para gráficos
    const sorted = [...registros].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

    // Gráfico 1: Evolução Faturado vs Vendido (linhas)
    const canvas1 = chartRef1.current;
    if (canvas1 && sorted.length > 0) {
      const ctx = canvas1.getContext('2d')!;
      const rect = canvas1.getBoundingClientRect();
      canvas1.width = rect.width;
      canvas1.height = 200;
      const w = canvas1.width;
      const h = canvas1.height;
      ctx.clearRect(0, 0, w, h);

      // Fundo glass
      const gradBg = ctx.createLinearGradient(0, 0, 0, h);
      gradBg.addColorStop(0, 'rgba(255,255,255,0.1)');
      gradBg.addColorStop(1, 'rgba(255,255,255,0.02)');
      ctx.fillStyle = gradBg;
      ctx.fillRect(0, 0, w, h);

      if (sorted.length > 1) {
        const maxY = Math.max(...sorted.map(r => Math.max(r.faturado, r.vendido))) * 1.1 || 1;
        const stepX = w / (sorted.length - 1);

        // Linha Faturado (azul)
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = '#3B82F6';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        sorted.forEach((r, i) => {
          const x = i * stepX;
          const y = h - (r.faturado / maxY * (h - 40)) - 20;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Linha Vendido (verde)
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        sorted.forEach((r, i) => {
          const x = i * stepX;
          const y = h - (r.vendido / maxY * (h - 40)) - 20;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Labels de datas no eixo X
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = 'bold 12px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        sorted.forEach((r, i) => {
          const x = i * stepX;
          ctx.fillText(r.data.slice(5,10), x, h - 5);
        });
      }
    }

    // Gráfico 2: Atraso por Dia (barras)
    const canvas2 = chartRef2.current;
    if (canvas2 && sorted.length > 0) {
      const ctx = canvas2.getContext('2d')!;
      const rect = canvas2.getBoundingClientRect();
      canvas2.width = rect.width;
      canvas2.height = 200;
      const w = canvas2.width;
      const h = canvas2.height;
      ctx.clearRect(0, 0, w, h);

      // Fundo glass
      const gradBg = ctx.createLinearGradient(0, 0, 0, h);
      gradBg.addColorStop(0, 'rgba(255,255,255,0.1)');
      gradBg.addColorStop(1, 'rgba(255,255,255,0.02)');
      ctx.fillStyle = gradBg;
      ctx.fillRect(0, 0, w, h);

      const maxY = Math.max(...sorted.map(r => r.atraso)) * 1.1 || 1;
      const stepX = w / sorted.length;
      sorted.forEach((r, i) => {
        const x = i * stepX;
        const barWidth = stepX * 0.7;
        const barHeight = (r.atraso / maxY) * (h - 40);
        const barGrad = ctx.createLinearGradient(0, h - 20 - barHeight, 0, h - 20);
        barGrad.addColorStop(0, '#EF4444');
        barGrad.addColorStop(1, '#DC2626');
        ctx.shadowColor = '#EF4444';
        ctx.shadowBlur = 8;
        ctx.fillStyle = barGrad;
        ctx.fillRect(x + stepX * 0.15, h - 20 - barHeight, barWidth, barHeight);
        ctx.shadowBlur = 0;

        // Valor no topo da barra
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = 'bold 11px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(r.atraso.toFixed(0), x + stepX / 2, h - 25 - barHeight);
      });

      // Labels de datas
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = 'bold 12px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      sorted.forEach((r, i) => {
        const x = i * stepX;
        ctx.fillText(r.data.slice(5,10), x + stepX / 2, h - 5);
      });
    }
  }, [registros]);

  // Observador de redimensionamento para gráficos responsivos
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      drawCharts();
    });
    if (chartRef1.current) resizeObserver.observe(chartRef1.current);
    if (chartRef2.current) resizeObserver.observe(chartRef2.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, [drawCharts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900/50 to-pink-900/50 p-4 md:p-6 lg:p-8 backdrop-blur-sm">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-2xl mb-4">
          💰 Fechamento Mensal 📊
        </h1>
        <p className="text-xl text-white/80 font-light max-w-2xl mx-auto">
          Registre os indicadores diários e acompanhe a evolução com gráficos interativos.
        </p>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Formulário de Registro */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center justify-center gap-3">
            💼 Registrar Hoje
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="md:col-span-3">
              <label className="block text-white/90 font-semibold mb-3 text-lg flex items-center gap-2">
                📅 Data
              </label>
              <input
                name="data"
                type="date"
                value={form.data}
                onChange={handleInputChange}
                className="w-full p-4 bg-white/20 border-2 border-white/30 rounded-2xl text-white text-lg font-medium placeholder-gray-300 focus:outline-none focus:border-blue-400/80 focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 hover:bg-white/30 hover:border-white/50"
                required
              />
            </div>
            <div>
              <label className="block text-white/90 font-semibold mb-3 flex items-center gap-2">
                💰 Faturado
              </label>
              <input
                name="faturado"
                type="number"
                min="0"
                step="0.01"
                value={form.faturado}
                onChange={handleInputChange}
                className="w-full p-4 bg-white/20 border-2 border-white/30 rounded-2xl text-white text-lg font-medium focus:outline-none focus:border-green-400/80 focus:ring-4 focus:ring-green-500/30 transition-all duration-300 hover:bg-white/30 hover:border-white/50"
              />
            </div>
            <div>
              <label className="block text-white/90 font-semibold mb-3 flex items-center gap-2">
                ⏰ Atraso
              </label>
              <input
                name="atraso"
                type="number"
                min="0"
                step="0.01"
                value={form.atraso}
                onChange={handleInputChange}
                className="w-full p-4 bg-white/20 border-2 border-white/30 rounded-2xl text-white text-lg font-medium focus:outline-none focus:border-orange-400/80 focus:ring-4 focus:ring-orange-500/30 transition-all duration-300 hover:bg-white/30 hover:border-white/50"
              />
            </div>
            <div>
              <label className="block text-white/90 font-semibold mb-3 flex items-center gap-2">
                🛒 Vendido
              </label>
              <input
                name="vendido"
                type="number"
                min="0"
                step="0.01"
                value={form.vendido}
                onChange={handleInputChange}
                className="w-full p-4 bg-white/20 border-2 border-white/30 rounded-2xl text-white text-lg font-medium focus:outline-none focus:border-emerald-400/80 focus:ring-4 focus:ring-emerald-500/30 transition-all duration-300 hover:bg-white/30 hover:border-white/50"
              />
            </div>
            <div>
              <label className="block text-white/90 font-semibold mb-3 flex items-center gap-2">
                💼 Carteira Total
              </label>
              <input
                name="carteiraTotal"
                type="number"
                min="0"
                step="0.01"
                value={form.carteiraTotal}
                onChange={handleInputChange}
                className="w-full p-4 bg-white/20 border-2 border-white/30 rounded-2xl text-white text-lg font-medium focus:outline-none focus:border-purple-400/80 focus:ring-4 focus:ring-purple-500/30 transition-all duration-300 hover:bg-white/30 hover:border-white/50"
              />
            </div>
            <div>
              <label className="block text-white/90 font-semibold mb-3 flex items-center gap-2">
                🔮 Previsão Mês Atual
              </label>
              <input
                name="previsaoMesAtual"
                type="number"
                min="0"
                step="0.01"
                value={form.previsaoMesAtual}
                onChange={handleInputChange}
                className="w-full p-4 bg-white/20 border-2 border-white/30 rounded-2xl text-white text-lg font-medium focus:outline-none focus:border-indigo-400/80 focus:ring-4 focus:ring-indigo-500/30 transition-all duration-300 hover:bg-white/30 hover:border-white/50"
              />
            </div>
            <div>
              <label className="block text-white/90 font-semibold mb-3 flex items-center gap-2">
                📈 Previsão Próximo Mês
              </label>
              <input
                name="previsaoProxMes"
                type="number"
                min="0"
                step="0.01"
                value={form.previsaoProxMes}
                onChange={handleInputChange}
                className="w-full p-4 bg-white/20 border-2 border-white/30 rounded-2xl text-white text-lg font-medium focus:outline-none focus:border-pink-400/80 focus:ring-4 focus:ring-pink-500/30 transition-all duration-300 hover:bg-white/30 hover:border-white/50"
              />
            </div>
            <button
              type="submit"
              className="md:col-span-3 bg-gradient-to-r from-emerald-500 via-green-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white py-5 px-8 rounded-3xl font-black text-xl shadow-2xl hover:shadow-3xl hover:scale-105 active:scale-95 transition-all duration-300 mt-2 lg:mt-0"
            >
              ➕ Registrar Indicadores
            </button>
          </form>

          {/* Erros de validação */}
          {errors.length > 0 && (
            <div className="mt-6 p-5 bg-red-500/20 border-2 border-red-400/50 rounded-2xl backdrop-blur-sm">
              <ul className="list-disc pl-6 space-y-1 text-red-200 font-medium">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Cards de Totais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="group bg-gradient-to-br from-blue-500/30 to-indigo-600/30 backdrop-blur-xl border border-white/30 rounded-3xl p-6 md:p-8 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 cursor-pointer hover:border-white/50">
            <div className="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform">💰</div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Faturado</h3>
            <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent drop-shadow-lg">
              {totais.faturado.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="group bg-gradient-to-br from-orange-500/30 to-red-600/30 backdrop-blur-xl border border-white/30 rounded-3xl p-6 md:p-8 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 cursor-pointer hover:border-white/50">
            <div className="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform">⏰</div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Atraso</h3>
            <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-300 to-red-300 bg-clip-text text-transparent drop-shadow-lg">
              {totais.atraso.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="group bg-gradient-to-br from-emerald-500/30 to-green-600/30 backdrop-blur-xl border border-white/30 rounded-3xl p-6 md:p-8 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 cursor-pointer hover:border-white/50">
            <div className="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform">🛒</div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Vendido</h3>
            <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent drop-shadow-lg">
              {totais.vendido.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="group bg-gradient-to-br from-purple-500/30 to-violet-600/30 backdrop-blur-xl border border-white/30 rounded-3xl p-6 md:p-8 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 cursor-pointer hover:border-white/50">
            <div className="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform">💼</div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Carteira Total</h3>
            <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-300 to-violet-300 bg-clip-text text-transparent drop-shadow-lg">
              {totais.carteiraTotal.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="group bg-gradient-to-br from-indigo-500/30 to-blue-600/30 backdrop-blur-xl border border-white/30 rounded-3xl p-6 md:p-8 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 cursor-pointer hover:border-white/50">
            <div className="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform">🔮</div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Previsão Mês Atual</h3>
            <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-300 to-blue-300 bg-clip-text text-transparent drop-shadow-lg">
              {totais.previsaoMesAtual.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="group bg-gradient-to-br from-pink-500/30 to-rose-600/30 backdrop-blur-xl border border-white/30 rounded-3xl p-6 md:p-8 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 cursor-pointer hover:border-white/50">
            <div className="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform">📈</div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Previsão Próximo Mês</h3>
            <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-pink-300 to-rose-300 bg-clip-text text-transparent drop-shadow-lg">
              {totais.previsaoProxMes.toLocaleString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Seção de Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center justify-center gap-3">
              📊 Evolução Faturado vs Vendido
            </h3>
            <canvas
              ref={chartRef1}
              className="w-full h-48 md:h-56 rounded-2xl border border-white/20 bg-gradient-to-b from-transparent via-white/5 to-black/20 shadow-inner"
            />
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center justify-center gap-3">
              📈 Atraso por Dia
            </h3>
            <canvas
              ref={chartRef2}
              className="w-full h-48 md:h-56 rounded-2xl border border-white/20 bg-gradient-to-b from-transparent via-white/5 to-black/20 shadow-inner"
            />
          </div>
        </div>

        {/* Tabela de Histórico */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              📋 Histórico de Registros
            </h3>
            <button
              onClick={handleClear}
              className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white px-6 py-3 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 whitespace-nowrap"
              disabled={registros.length === 0}
            >
              🚫 Limpar Todos
            </button>
          </div>

          {registros.length === 0 ? (
            <div className="text-center py-12 text-white/70">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-xl md:text-2xl font-light">Nenhum registro ainda. Registre o primeiro indicador!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm md:text-base text-white/90">
                <thead>
                  <tr className="border-b-2 border-white/20 bg-white/10 backdrop-blur-sm sticky top-0">
                    <th className="p-4 md:p-6 text-left font-black rounded-tl-xl">📅 Data</th>
                    <th className="p-4 md:p-6 text-left font-black">💰 Faturado</th>
                    <th className="p-4 md:p-6 text-left font-black">⏰ Atraso</th>
                    <th className="p-4 md:p-6 text-left font-black">🛒 Vendido</th>
                    <th className="p-4 md:p-6 text-left font-black">💼 Carteira</th>
                    <th className="p-4 md:p-6 text-left font-black">🔮 Prev. Atual</th>
                    <th className="p-4 md:p-6 text-left font-black rounded-tr-xl">📈 Prev. Próx.</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.map((r, i) => (
                    <tr key={r.data} className="hover:bg-white/20 transition-all duration-200 border-b border-white/10 last:border-b-0">
                      <td className="p-4 md:p-6 font-mono font-bold text-blue-300">{r.data}</td>
                      <td className="p-4 md:p-6 font-mono text-cyan-300">{r.faturado.toLocaleString('pt-BR')}</td>
                      <td className="p-4 md:p-6 font-mono text-orange-300">{r.atraso.toLocaleString('pt-BR')}</td>
                      <td className="p-4 md:p-6 font-mono text-emerald-300">{r.vendido.toLocaleString('pt-BR')}</td>
                      <td className="p-4 md:p-6 font-mono text-purple-300">{r.carteiraTotal.toLocaleString('pt-BR')}</td>
                      <td className="p-4 md:p-6 font-mono text-indigo-300">{r.previsaoMesAtual.toLocaleString('pt-BR')}</td>
                      <td className="p-4 md:p-6 font-mono text-pink-300">{r.previsaoProxMes.toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FechamentoMensal;
