'use client';

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
  const [formData, setFormData] = useState<Partial<DailyEntry>>({});

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
    setEditingDate(null);
    setFormData({});
  };

  const handleSubmit = (data: DailyEntry) => {
    let newData = [...dailyData];
    if (editingDate) {
      newData = newData.map((d) => (d.date === editingDate ? data : d));
    } else {
      newData.push(data);
    }
    newData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setDailyData(newData);
    resetForm();
  };

  const deleteData = (date: string) => {
    setDailyData((prev) => {
      const newData = prev.filter((d) => d.date !== date);
      newData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return newData;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Diário Financeiro</h1>
          <p className="mt-4 text-xl text-gray-600">Registre e acompanhe seus dados diários</p>
        </div>
        <div className="space-y-8">
          <DailyForm
            data={editingDate ? formData : undefined}
            onSubmit={handleSubmit}
            onReset={resetForm}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DailyTable
              data={dailyData}
              onEdit={handleEdit}
              onDelete={deleteData}
            />
            <DailyCharts data={dailyData} />
          </div>
        </div>
      </div>
    </div>
  );
}
