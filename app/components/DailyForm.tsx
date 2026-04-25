'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';

type NumberField = 'faturamento' | 'atrasos' | 'vendas' | 'carteiraTotal' | 'previsaoMesVigente' | 'previsaoMesSeguinte';

interface DailyData {
  date: string;
  faturamento: number;
  atrasos: number;
  vendas: number;
  carteiraTotal: number;
  previsaoMesVigente: number;
  previsaoMesSeguinte: number;
}

interface Props {
  data?: DailyData;
  onSubmit: (data: DailyData) => void;
  onReset: () => void;
}

const DailyForm: React.FC<Props> = ({ data, onSubmit, onReset }) => {
  const initialData: DailyData = {
    date: '',
    faturamento: 0,
    atrasos: 0,
    vendas: 0,
    carteiraTotal: 0,
    previsaoMesVigente: 0,
    previsaoMesSeguinte: 0,
  };

  const [formData, setFormData] = useState<DailyData>(initialData);
  const [errors, setErrors] = useState<{ [K in keyof DailyData]?: string }>({});

  const isEditing = !!data;

  useEffect(() => {
    if (data) {
      setFormData(data);
      setErrors({});
    }
  }, [data]);

  const numberFields: NumberField[] = [
    'faturamento',
    'atrasos',
    'vendas',
    'carteiraTotal',
    'previsaoMesVigente',
    'previsaoMesSeguinte',
  ];

  const fields = [
    { key: 'date' as keyof DailyData, label: 'Data', type: 'date' as const },
    { key: 'faturamento' as keyof DailyData, label: 'Faturamento', type: 'number' as const },
    { key: 'atrasos' as keyof DailyData, label: 'Atrasos', type: 'number' as const },
    { key: 'vendas' as keyof DailyData, label: 'Vendas', type: 'number' as const },
    { key: 'carteiraTotal' as keyof DailyData, label: 'Carteira Total', type: 'number' as const },
    { key: 'previsaoMesVigente' as keyof DailyData, label: 'Previsão Mês Vigente', type: 'number' as const },
    { key: 'previsaoMesSeguinte' as keyof DailyData, label: 'Previsão Mês Seguinte', type: 'number' as const },
  ];

  const validate = (): boolean => {
    const newErrors: { [K in keyof DailyData]?: string } = {};

    if (!formData.date.trim()) {
      newErrors.date = 'Data é obrigatória';
    }

    numberFields.forEach((field) => {
      if (formData[field] < 0) {
        newErrors[field] = 'Deve ser maior ou igual a 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange =
    (key: keyof DailyData) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = key === 'date' ? e.target.value : (Number(e.target.value) || 0);
      setFormData((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
      if (!isEditing) {
        setFormData(initialData);
      }
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setErrors({});
    onReset();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {fields.map(({ key, label, type }) => (
          <div key={key as string} className="flex flex-col">
            <label
              htmlFor={key as string}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {label}
            </label>
            <input
              id={key as string}
              type={type}
              min={type === 'number' ? '0' : undefined}
              value={formData[key]}
              onChange={handleChange(key)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            />
            {errors[key] && (
              <p className="mt-1 text-sm text-red-500 font-medium">{errors[key]}</p>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 px-6 py-3 rounded-md text-white font-medium transition duration-200 shadow-sm"
        >
          {isEditing ? 'Atualizar' : 'Submeter'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="flex-1 bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 px-6 py-3 rounded-md text-white font-medium transition duration-200 shadow-sm"
        >
          {isEditing ? 'Cancelar' : 'Limpar'}
        </button>
      </div>
    </form>
  );
};

export default DailyForm;
