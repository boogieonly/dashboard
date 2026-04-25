'use client'

import React, { useState, useEffect } from 'react';
import { DailyForm, DailyTable, DailyCharts } from '../components/';

interface DailyEntry {
  date: string;
  faturamento: number;
  atrasos: number;
  vendas: number;
  carteiraTotal: number;
  previsaoMesVigente: number;
  previsaoMesSeguinte: number;
}

const Diario = () => {
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
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dailyData');
      if (saved) {
        setDailyData(JSON.parse(saved));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dailyData', JSON.stringify(dailyData));
    }
  }, [dailyData]);

  const sortData = (data: DailyEntry[]): DailyEntry[] =>
    [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'date' ? value : Number(value) || 0,
    }));
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

  const handleEdit = (date: string) => {
    const entry = dailyData.find((d) => d.date === date);
    if (entry) {
      setFormData(entry);
      setEditingDate(date);
    }
  };

  const addData = () => {
    if (!formData.date.trim()) return;
    const newEntry: DailyEntry = { ...formData };
    setDailyData((prev) => sortData([...prev, newEntry]));
    resetForm();
  };

  const updateData = () => {
    if (!editingDate || !formData.date.trim()) return;
    const updatedEntry: DailyEntry = { ...formData };
    setDailyData((prev) =>
      sortData(prev.map((d) => (d.date === editingDate ? updatedEntry : d)))
    );
    resetForm();
  };

  const deleteData = (dateToDelete: string) => {
    setDailyData((prev) => sortData(prev.filter((d) => d.date !== dateToDelete)));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingDate) {
      updateData();
    } else {
      addData();
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
        Fechamento Diário
      </h1>
      <DailyForm
        formData={formData}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        onReset={resetForm}
        editingDate={editingDate}
      />
      <DailyTable
        data={dailyData}
        onEdit={handleEdit}
        onDelete={deleteData}
      />
      <DailyCharts data={dailyData} />
    </div>
  );
};

export default Diario;
