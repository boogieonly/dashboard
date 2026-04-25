'use client';

import { useState, useEffect } from 'react';
import DailyForm from '../components/DailyForm';
import DailyTable from '../components/DailyTable';
import DailyCharts from '../components/DailyCharts';

type DailyData = {
  date: string;
  faturamentoAcumulado: number;
  atrasos: number;
  vendas: number;
  carteiraTotal: number;
  previsaoMesVigente: number;
  previsaoMesSeguinte: number;
};

export default function DiarioPage() {
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [formData, setFormData] = useState<DailyData>({
    date: '',
    faturamentoAcumulado: 0,
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

  const addData = (newData: DailyData) => {
    setDailyData((prev) => [...prev, newData]);
  };

  const updateData = (updatedData: DailyData) => {
    setDailyData((prev) =>
      prev.map((d) => (d.date === updatedData.date ? updatedData : d))
    );
  };

  const deleteData = (date: string) => {
    setDailyData((prev) => prev.filter((d) => d.date !== date));
    if (editingDate === date) {
      resetForm();
    }
  };

  const handleEdit = (date: string) => {
    const data = dailyData.find((d) => d.date === date);
    if (data) {
      setFormData(data);
      setEditingDate(date);
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      faturamentoAcumulado: 0,
      atrasos: 0,
      vendas: 0,
      carteiraTotal: 0,
      previsaoMesVigente: 0,
      previsaoMesSeguinte: 0,
    });
    setEditingDate(null);
  };

  const handleSubmit = (data: DailyData) => {
    if (editingDate) {
      updateData(data);
    } else {
      addData(data);
    }
    resetForm();
  };

  const sortedDailyData = [...dailyData].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const tableData = {
    data: sortedDailyData.map((d) => d.date),
    faturamento: sortedDailyData.map((d) => d.faturamentoAcumulado),
    atrasos: sortedDailyData.map((d) => d.atrasos),
    vendas: sortedDailyData.map((d) => d.vendas),
    carteiraTotal: sortedDailyData.map((d) => d.carteiraTotal),
    previsaoMesVigente: sortedDailyData.map((d) => d.previsaoMesVigente),
    previsaoMesSeguinte: sortedDailyData.map((d) => d.previsaoMesSeguinte),
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">
          Diário Financeiro
        </h1>
        <div className="space-y-8">
          {/* Form Section */}
          <section className="bg-white shadow-xl rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">
              Adicionar/Editar Dados Diários
            </h2>
            <DailyForm
              data={editingDate ? formData : undefined}
              onSubmit={handleSubmit}
              onReset={resetForm}
            />
          </section>

          {/* Table Section */}
          <section className="bg-white shadow-xl rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Tabela de Dados</h2>
            <DailyTable
              {...tableData}
              onEdit={handleEdit}
              onDelete={deleteData}
            />
          </section>

          {/* Charts Section */}
          <section className="bg-white shadow-xl rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Gráficos</h2>
            <DailyCharts {...tableData} />
          </section>
        </div>
      </div>
    </div>
  );
}
