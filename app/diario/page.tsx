'use client';

import { useState, useEffect } from 'react';

type Status = 'up' | 'down' | 'neutral';

interface DailyEntry {
  date: string;
  faturamento: number;
  atrasos: number;
  vendas: number;
  carteiraTotal: number;
  previsaoMesVigente: number;
  previsaoMesSeguinte: number;
}

const KPICard = ({ title, value, variation, status }: { title: string; value: number; variation: string; status: Status }) => (
  <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 text-white">
    <h3 className="text-lg font-semibold mb-4 opacity-90">{title}</h3>
    <p className="text-4xl md:text-5xl font-bold mb-6 leading-none">{value.toLocaleString('pt-BR')}</p>
    <div className="flex items-center">
      <span className={`text-2xl mr-2 ${status === 'up' ? 'text-emerald-300' : status === 'down' ? 'text-rose-300' : 'text-gray-300'} animate-pulse`}>
        {status === 'up' ? '▲' : status === 'down' ? '▼' : '→'}
      </span>
      <span className={`font-bold text-lg ${status === 'up' ? 'text-emerald-300' : status === 'down' ? 'text-rose-300' : 'text-gray-300'}`}>{variation}</span>
    </div>
  </div>
);

const DailyForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEditing
}: {
  formData: DailyEntry;
  setFormData: React.Dispatch<React.SetStateAction<DailyEntry>>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  isEditing: boolean;
}) => (
  <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-1">
      <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
      <input
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Faturamento</label>
      <input
        type="number"
        step="0.01"
        value={formData.faturamento}
        onChange={(e) => setFormData({ ...formData, faturamento: Number(e.target.value) })}
        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Atrasos</label>
      <input
        type="number"
        step="1"
        value={formData.atrasos}
        onChange={(e) => setFormData({ ...formData, atrasos: Number(e.target.value) })}
        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Vendas</label>
      <input
        type="number"
        step="0.01"
        value={formData.vendas}
        onChange={(e) => setFormData({ ...formData, vendas: Number(e.target.value) })}
        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Carteira Total</label>
      <input
        type="number"
        step="0.01"
        value={formData.carteiraTotal}
        onChange={(e) => setFormData({ ...formData, carteiraTotal: Number(e.target.value) })}
        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Previsão Mês Vigente</label>
      <input
        type="number"
        step="0.01"
        value={formData.previsaoMesVigente}
        onChange={(e) => setFormData({ ...formData, previsaoMesVigente: Number(e.target.value) })}
        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Previsão Mês Seguinte</label>
      <input
        type="number"
        step="0.01"
        value={formData.previsaoMesSeguinte}
        onChange={(e) => setFormData({ ...formData, previsaoMesSeguinte: Number(e.target.value) })}
        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      />
    </div>
    <div className="md:col-span-2 lg:col-span-3">
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
      >
        {isEditing ? 'Atualizar Dados' : 'Adicionar Dados'}
      </button>
    </div>
    {isEditing && (
      <div className="md:col-span-2 lg:col-span-3">
        <button
          type="button"
          onClick={onCancel}
          className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          Cancelar Edição
        </button>
      </div>
    )}
  </form>
);

const HistoricalTable = ({ data, onEdit, onDelete }: { data: DailyEntry[]; onEdit: (entry: DailyEntry) => void; onDelete: (date: string) => void }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
        <tr>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0">Data</th>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0">Faturamento</th>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0">Atrasos</th>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0">Vendas</th>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0">Carteira Total</th>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0">Previsão Mês Vigente</th>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0">Previsão Mês Seguinte</th>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0">Ações</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((entry) => (
          <tr key={entry.date} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {new Date(entry.date).toLocaleDateString('pt-BR')}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.faturamento.toLocaleString('pt-BR')}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.atrasos.toLocaleString('pt-BR')}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.vendas.toLocaleString('pt-BR')}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.carteiraTotal.toLocaleString('pt-BR')}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.previsaoMesVigente.toLocaleString('pt-BR')}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.previsaoMesSeguinte.toLocaleString('pt-BR')}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                onClick={() => onEdit(entry)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors mr-2"
              >
                Editar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Confirma a exclusão dos dados de ${new Date(entry.date).toLocaleDateString('pt-BR')}?`)) {
                    onDelete(entry.date);
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
              >
                Excluir
              </button>
            </td>
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td colSpan={8} className="px-6 py-12 text-center text-gray-500">Nenhum dado histórico nos últimos 7 dias.</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const MiniChart = ({ data, title, color }: { data: number[]; title: string; color: 'indigo' | 'emerald' | 'amber' | 'purple' | 'blue' | 'rose' }) => {
  if (data.length === 0) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">{title}</h3>
        <p className="text-gray-400 text-center">Sem dados</p>
      </div>
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max > min ? max - min : 1;
  const width = 240;
  const height = 60;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (height * (v - min) / range);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className={`p-6 bg-white rounded-xl shadow-lg text-${color}-600`}>
      <h3 className="text-sm font-medium mb-4">{title}</h3>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full h-16">
        <polyline
          points={points}
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle
          cx={width}
          cy={height - (height * (data[data.length - 1] - min) / range)}
          r="4"
          fill="currentColor"
        />
      </svg>
    </div>
  );
};

export default function DiarioPage() {
  const getToday = () => new Date().toISOString().split('T')[0];

  const [dailyData, setDailyData] = useState<DailyEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<DailyEntry>({
    date: getToday(),
    faturamento: 0,
    atrasos: 0,
    vendas: 0,
    carteiraTotal: 0,
    previsaoMesVigente: 0,
    previsaoMesSeguinte: 0,
  });

  const latest = dailyData[0];
  const previous = dailyData[1];

  const getVariation = (curr: number, prev?: number): string => {
    if (!prev || prev === 0) return 'N/A';
    const percent = ((curr - prev) / prev) * 100;
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`;
  };

  const getStatus = (curr: number, prev?: number): Status => {
    if (!prev) return 'neutral';
    return curr > prev ? 'up' : 'down';
  };

  const saveToStorage = () => {
    localStorage.setItem('dailyData', JSON.stringify(dailyData));
  };

  const resetForm = () => {
    setFormData({
      date: getToday(),
      faturamento: 0,
      atrasos: 0,
      vendas: 0,
      carteiraTotal: 0,
      previsaoMesVigente: 0,
      previsaoMesSeguinte: 0,
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const entry: DailyEntry = {
      date: formData.date || getToday(),
      faturamento: formData.faturamento,
      atrasos: formData.atrasos,
      vendas: formData.vendas,
      carteiraTotal: formData.carteiraTotal,
      previsaoMesVigente: formData.previsaoMesVigente,
      previsaoMesSeguinte: formData.previsaoMesSeguinte,
    };

    if (editingId) {
      setDailyData((prev) => prev.map((d) => (d.date === editingId ? entry : d)));
    } else {
      const filtered = dailyData.filter((d) => d.date !== entry.date);
      setDailyData([entry, ...filtered]);
    }
    saveToStorage();
    resetForm();
  };

  const handleEdit = (entry: DailyEntry) => {
    setFormData(entry);
    setEditingId(entry.date);
  };

  const handleDelete = (date: string) => {
    setDailyData((prev) => prev.filter((d) => d.date !== date));
    saveToStorage();
    if (editingId === date) {
      resetForm();
    }
  };

  useEffect(() => {
    const str = localStorage.getItem('dailyData');
    if (str) {
      try {
        const parsed: DailyEntry[] = JSON.parse(str);
        const sorted = parsed.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setDailyData(sorted);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
    }
  }, []);

  const last7 = dailyData.slice(0, 7);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* SEÇÃO 1 - Título + Descrição */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-8 drop-shadow-2xl">
            Diário Executivo
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-light">
            Monitore faturamento, vendas, carteira e previsões com KPIs em tempo real, formulário intuitivo, histórico dos últimos 7 dias e mini-gráficos para visão rápida.
          </p>
        </div>

        {/* SEÇÃO 2 - 6 KPICards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <KPICard
            title="Faturamento"
            value={latest?.faturamento ?? 0}
            variation={getVariation(latest?.faturamento ?? 0, previous?.faturamento)}
            status={getStatus(latest?.faturamento ?? 0, previous?.faturamento)}
          />
          <KPICard
            title="Atrasos"
            value={latest?.atrasos ?? 0}
            variation={getVariation(latest?.atrasos ?? 0, previous?.atrasos)}
            status={getStatus(latest?.atrasos ?? 0, previous?.atrasos)}
          />
          <KPICard
            title="Vendas"
            value={latest?.vendas ?? 0}
            variation={getVariation(latest?.vendas ?? 0, previous?.vendas)}
            status={getStatus(latest?.vendas ?? 0, previous?.vendas)}
          />
          <KPICard
            title="Carteira Total"
            value={latest?.carteiraTotal ?? 0}
            variation={getVariation(latest?.carteiraTotal ?? 0, previous?.carteiraTotal)}
            status={getStatus(latest?.carteiraTotal ?? 0, previous?.carteiraTotal)}
          />
          <KPICard
            title="Previsão Mês Vigente"
            value={latest?.previsaoMesVigente ?? 0}
            variation={getVariation(latest?.previsaoMesVigente ?? 0, previous?.previsaoMesVigente)}
            status={getStatus(latest?.previsaoMesVigente ?? 0, previous?.previsaoMesVigente)}
          />
          <KPICard
            title="Previsão Mês Seguinte"
            value={latest?.previsaoMesSeguinte ?? 0}
            variation={getVariation(latest?.previsaoMesSeguinte ?? 0, previous?.previsaoMesSeguinte)}
            status={getStatus(latest?.previsaoMesSeguinte ?? 0, previous?.previsaoMesSeguinte)}
          />
        </div>

        {/* SEÇÃO 3 - Formulário DailyForm */}
        <section className="bg-white/70 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border border-white/50 mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Gerenciar Dados Diários</h2>
          <DailyForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            isEditing={!!editingId}
          />
        </section>

        {/* SEÇÃO 4 - Tabela HistoricalTable últimos 7 dias */}
        <section className="bg-white/70 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border border-white/50 mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Histórico dos Últimos 7 Dias</h2>
          <HistoricalTable data={last7} onEdit={handleEdit} onDelete={handleDelete} />
        </section>

        {/* SEÇÃO 5 - Mini-gráficos simples */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <MiniChart data={last7.map((d) => d.faturamento)} title="Faturamento" color="indigo" />
          <MiniChart data={last7.map((d) => d.atrasos)} title="Atrasos" color="rose" />
          <MiniChart data={last7.map((d) => d.vendas)} title="Vendas" color="emerald" />
          <MiniChart data={last7.map((d) => d.carteiraTotal)} title="Carteira Total" color="purple" />
          <MiniChart data={last7.map((d) => d.previsaoMesVigente)} title="Previsão Mês Vigente" color="blue" />
          <MiniChart data={last7.map((d) => d.previsaoMesSeguinte)} title="Previsão Mês Seguinte" color="amber" />
        </div>
      </div>
    </div>
  );
}
