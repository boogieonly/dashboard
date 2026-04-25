'use client'

import { useState, useEffect } from 'react';
import DailyForm from '../components/DailyForm';
import DailyTable from '../components/DailyTable';
import DailyCharts from '../components/DailyCharts';

interface DailyEntry {
  date: string;
  faturamento: number;
  atrasos: number;
  vendas: number;
  carteiraTotal: number;
  previsaoMesVigente: number;
  previsaoMesSeguinte: number;
}

export default function DiarioPage() {
  const [dailyData, setDailyData] = useState<DailyEntry[]>([]);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [formData, setFormData] = useState<DailyEntry>({
    date: '',
    faturamento: 0,
    atrasos: 0,
    vendas: 0,
    carteiraTotal: 0,
    previsaoMesVigente: 0,
    previsaoMesSeguinte: 0,
  });

  useEffect(() => {
    const saved = localStorage.getItem('dailyData');
    if (saved) {
      setDailyData(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyData', JSON.stringify(dailyData));
  }, [dailyData]);

  const handleEdit = (date: string) => {
    const entry = dailyData.find((d) => d.date === date);
    if (entry) {
      setFormData(entry);
      setEditingDate(date);
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      faturamento: 0,
      atrasos: 0,
      vendas: 0,
      carteiraTotal: 0,
      previsaoMesVigente: 0,
      previsaoMesSeguinte: 0,
    });
    setEditingDate(null);
  };

  const handleSubmit = (data: DailyEntry) => {
    if (editingDate) {
      setDailyData((prev) =>
        prev.map((d) => (d.date === editingDate ? data : d))
      );
    } else {
      setDailyData((prev) => [...prev, data]);
    }
    resetForm();
  };

  const deleteData = (date: string) => {
    setDailyData((prev) => prev.filter((d) => d.date !== date));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">
          Fechamento Diário
        </h1>
        <div className="space-y-8">
          <section className="bg-white shadow-xl rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Adicionar/Editar Dados</h2>
            <DailyForm
              data={editingDate ? formData : undefined}
              onSubmit={handleSubmit}
              onReset={resetForm}
            />
          </section>

          <section className="bg-white shadow-xl rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Tabela de Dados</h2>
            <DailyTable
              data={dailyData.map((d) => d.date)}
              faturamento={dailyData.map((d) => d.faturamento)}
              atrasos={dailyData.map((d) => d.atrasos)}
              vendas={dailyData.map((d) => d.vendas)}
              carteiraTotal={dailyData.map((d) => d.carteiraTotal)}
              previsaoMesVigente={dailyData.map((d) => d.previsaoMesVigente)}
              previsaoMesSeguinte={dailyData.map((d) => d.previsaoMesSeguinte)}
              onEdit={handleEdit}
              onDelete={deleteData}
            />
          </section>

          <section className="bg-white shadow-xl rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Gráficos</h2>
            <DailyCharts
              data={dailyData.map((d) => ({
                date: d.date,
                faturamento: d.faturamento,
                atrasos: d.atrasos,
                vendas: d.vendas,
                carteiraTotal: d.carteiraTotal,
                previsaoMesVigente: d.previsaoMesVigente,
                previsaoMesSeguinte: d.previsaoMesSeguinte,
              }))}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
