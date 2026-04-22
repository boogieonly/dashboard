import { useState } from 'react';
import { BarChart3, Scale, DollarSign, TrendingUp, Upload } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface MaterialData {
  material: string;
  peso: number;
  valor: number;
}

const sampleData: MaterialData[] = [
  { material: 'Cobre', peso: 1500.5, valor: 25000.00 },
  { material: 'Latão', peso: 800.0, valor: 12000.00 },
  { material: 'Alumínio', peso: 2000.0, valor: 8000.00 },
];

interface CardProps {
  title: string;
  value: string;
  color: 'orange' | 'green' | 'blue';
  Icon: React.ElementType;
}

function IndicatorCard({ title, value, color, Icon }: CardProps) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300">
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${color}-400 to-${color}-500 flex items-center justify-center mb-6 shadow-lg`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function UploadArea({ onUpload }: { onUpload: (files: FileList) => void }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onUpload(files);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
        dragActive
          ? 'border-blue-500 bg-blue-50 shadow-xl'
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="hidden"
        accept=".xlsx,.xls"
        onChange={handleChange}
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Upload className="mx-auto w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Arraste seu arquivo Excel ou clique aqui</h3>
        <p className="text-gray-500">Suporte para .xlsx e .xls</p>
      </label>
    </div>
  );
}

function Chart({ data }: { data: MaterialData[] }) {
  return (
    <div className="bg-white shadow-xl rounded-xl p-6">
      <h3 className="text-xl font-semibold mb-6">Faturamento por Material</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="material" />
          <YAxis />
          <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Faturamento']} />
          <Bar dataKey="valor" fill="#3B82F6" name="Faturamento (R$)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DetailsTable({ data }: { data: MaterialData[] }) {
  return (
    <div className="bg-white shadow-xl rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Detalhes por Material</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Material</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">Peso (KG)</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">Valor (R$)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.material}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {item.peso.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                  {item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

export default function Dashboard() {
  const [data, setData] = useState(sampleData);

  const totalKG = data.reduce((sum, d) => sum + d.peso, 0);
  const totalValor = data.reduce((sum, d) => sum + d.valor, 0);
  const ticketMedio = totalKG > 0 ? totalValor / totalKG : 0;

  const totalKGStr = totalKG.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }) + ' KG';

  const totalValorStr = totalValor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const ticketMedioStr =
    ticketMedio.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }) + ' / KG';

  const handleUpload = (files: FileList) => {
    const file = files[0];
    if (file) {
      console.log('Arquivo Excel carregado:', file.name);
      // TODO: Implementar parsing com biblioteca 'xlsx'
      // Por enquanto, recarrega dados de exemplo
      setData(sampleData);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <BarChart3 className="w-16 h-16 text-blue-600" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent drop-shadow-lg">
              Dashboard de Faturamento | Metalfama
            </h1>
          </div>
        </header>

        {/* Indicadores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <IndicatorCard
            title="Total em KG"
            value={totalKGStr}
            color="orange"
            Icon={Scale}
          />
          <IndicatorCard
            title="Total em R$"
            value={totalValorStr}
            color="green"
            Icon={DollarSign}
          />
          <IndicatorCard
            title="Ticket Médio"
            value={ticketMedioStr}
            color="blue"
            Icon={TrendingUp}
          />
        </div>

        {/* Upload e Gráfico */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <UploadArea onUpload={handleUpload} />
          <Chart data={data} />
        </div>

        {/* Tabela */}
        <DetailsTable data={data} />
      </div>
    </main>
  );
}
