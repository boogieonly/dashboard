"use client";

import { useState, useCallback } from 'react';
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
} from 'recharts';

type Material = {
  material: string;
  peso: number;
  valor: number;
};

const parseExcel = (file: File): Promise<Material[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

      if (json.length < 2) {
        reject(new Error('No data in sheet'));
        return;
      }

      const headers = json[0] as string[];
      const matIdx = headers.findIndex((h) => h?.toString().toLowerCase().includes('material'));
      const pesoIdx = headers.findIndex((h) => h?.toString().toLowerCase().includes('peso'));
      const valIdx = headers.findIndex((h) => h?.toString().toLowerCase().includes('valor'));

      if (matIdx === -1 || pesoIdx === -1 || valIdx === -1) {
        reject(new Error('Required columns not found: Material, Peso, Valor'));
        return;
      }

      const materials: Material[] = [];
      for (let i = 1; i < json.length; i++) {
        const row = json[i];
        const material = row[matIdx]?.toString() || '';
        const peso = parseFloat(row[pesoIdx]?.toString() || '0');
        const valor = parseFloat(row[valIdx]?.toString() || '0');
        if (material && !isNaN(peso) && !isNaN(valor)) {
          materials.push({ material, peso, valor });
        }
      }
      resolve(materials);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

type KpiCardProps = {
  title: string;
  value: string;
  unit: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
};

const KpiCard = ({ title, value, unit, icon, color }: KpiCardProps) => {
  const gradients = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="group relative bg-white rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 overflow-hidden">
      <div
        className={`absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b ${
          gradients[color]
        } transform -skew-x-12 group-hover:scale-110 transition-transform duration-300`}
      />
      <div className="relative z-10 ml-2">
        <div className="text-3xl mb-2 opacity-75">{icon}</div>
        <div className="text-4xl font-bold text-gray-900 mb-1 leading-tight">
          {value}
        </div>
        <div className="text-lg text-gray-600 capitalize">{title} {unit}</div>
      </div>
    </div>
  );
};

type AccordionProps = {
  id: string;
  title: string;
  children: React.ReactNode;
  open: boolean;
  onToggle: (id: string) => void;
};

const Accordion = ({ id, title, children, open, onToggle }: AccordionProps) => {
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      <div
        className="flex items-center justify-between p-6 cursor-pointer bg-gradient-to-r from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-indigo-100 transition-colors duration-200"
        onClick={() => onToggle(id)}
      >
        <span className="text-xl font-semibold text-gray-900 flex-1">{title}</span>
        <span
          className={`transition-transform duration-200 text-2xl ${
            open ? 'rotate-180' : 'rotate-0'
          }`}
        >
          ▼
        </span>
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-6 bg-white border-t border-gray-100 text-gray-800">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [materials, setMaterials] = useState<Material[]>([
    { material: 'Aço Carbono', peso: 150, valor: 750 },
    { material: 'Alumínio 6061', peso: 75, valor: 450 },
    { material: 'Cobre Eletrolítico', peso: 25, valor: 1250 },
    { material: 'Ferro Fundido', peso: 200, valor: 600 },
    { material: 'Plástico ABS', peso: 40, valor: 120 },
    { material: 'Vidro Temperado', peso: 15, valor: 300 },
  ]);
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const data = await parseExcel(file);
      setMaterials(data);
    } catch (error) {
      alert(`Erro ao ler arquivo: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const totalPeso = materials.reduce((sum, m) => sum + m.peso, 0);
  const totalValor = materials.reduce((sum, m) => sum + m.valor, 0);
  const qtd = materials.length;
  const avgValorPorPeso = totalPeso > 0 ? (totalValor / totalPeso).toFixed(2) : '0.00';

  const chartData = materials.map((m) => ({
    name: m.material,
    peso: m.peso,
    valor: m.valor,
  }));

  const toggleAccordion = (id: string) => {
    const newSet = new Set(openAccordions);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setOpenAccordions(newSet);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Dashboard Materiais
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Analise seus materiais com KPIs, gráficos interativos e detalhes expansíveis.
          </p>
        </div>

        <div className="mb-12 flex flex-col sm:flex-row gap-4 items-center justify-center">
          <label className="flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-white border-2 border-dashed border-gray-300 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:bg-indigo-50 hover:border-indigo-300">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={loading}
              className="hidden"
            />
            <span className="font-semibold text-gray-700 flex items-center gap-2">
              📁 {loading ? 'Carregando...' : 'Carregar Planilha Excel'}
            </span>
          </label>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <KpiCard
            title="Total Peso"
            value={totalPeso.toLocaleString('pt-BR')}
            unit="kg"
            icon="⚖️"
            color="blue"
          />
          <KpiCard
            title="Total Valor"
            value={totalValor.toLocaleString('pt-BR')}
            unit="R$"
            icon="💰"
            color="green"
          />
          <KpiCard
            title="Qtd Materiais"
            value={qtd.toString()}
            unit=""
            icon="📦"
            color="purple"
          />
          <KpiCard
            title="Valor / Peso"
            value={avgValorPorPeso}
            unit="R$/kg"
            icon="📊"
            color="orange"
          />
        </div>

        {/* Gráfico */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-16 border border-white/50">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Gráfico Interativo de Peso e Valor
          </h2>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" angle={-45} height={80} textAnchor="end" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="peso" fill="#3b82f6" name="Peso (kg)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="valor" fill="#10b981" name="Valor (R$)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Accordions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Detalhes dos Materiais
          </h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 -mr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {materials.map((m, i) => (
              <Accordion
                key={i}
                id={`mat-${i}`}
                title={m.material}
                open={openAccordions.has(`mat-${i}`)}
                onToggle={toggleAccordion}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-lg">
                  <div>
                    <span className="font-bold text-blue-600">Peso:</span>{' '}
                    <span className="text-2xl font-bold">{m.peso.toLocaleString('pt-BR')} kg</span>
                  </div>
                  <div>
                    <span className="font-bold text-green-600">Valor:</span>{' '}
                    <span className="text-2xl font-bold">R$ {m.valor.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="md:text-right">
                    <span className="font-bold text-orange-600">Valor/Peso:</span>{' '}
                    <span className="text-xl font-bold">
                      R$ {(m.valor / m.peso).toFixed(2)} / kg
                    </span>
                  </div>
                </div>
              </Accordion>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
