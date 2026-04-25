'use client'

import React from 'react';

const VisaoGeral: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Visão Geral</h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Dashboard executivo com visão geral das métricas principais da empresa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total de Vendas */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Total de Vendas</h3>
              <span className="text-green-500 text-sm font-medium">↑ 12%</span>
            </div>
            <p className="text-4xl md:text-5xl font-bold text-gray-900">R$ 150.000</p>
          </div>

          {/* Ticket Médio */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Ticket Médio</h3>
              <span className="text-green-500 text-sm font-medium">↑ 8%</span>
            </div>
            <p className="text-4xl md:text-5xl font-bold text-gray-900">R$ 250,00</p>
          </div>

          {/* Clientes Ativos */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Clientes Ativos</h3>
              <span className="text-blue-500 text-sm font-medium">+ 45</span>
            </div>
            <p className="text-4xl md:text-5xl font-bold text-gray-900">600</p>
          </div>

          {/* Taxa de Crescimento */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Taxa de Crescimento</h3>
              <span className="text-green-500 text-sm font-medium">Mês/Mês</span>
            </div>
            <p className="text-4xl md:text-5xl font-bold text-green-600">+15%</p>
          </div>
        </div>

        {/* Simple text-based visualization placeholder */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Resumo de Vendas (Últimos 7 Dias)</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Segunda</span>
                <span className="font-semibold">R$ 25k</span>
              </div>
              <div className="flex justify-between">
                <span>Terça</span>
                <span className="font-semibold">R$ 28k</span>
              </div>
              <div className="flex justify-between">
                <span>Quarta</span>
                <span className="font-semibold">R$ 22k</span>
              </div>
              <div className="flex justify-between">
                <span>Quinta</span>
                <span className="font-semibold">R$ 30k</span>
              </div>
              <div className="flex justify-between">
                <span>Sexta</span>
                <span className="font-semibold">R$ 35k</span>
              </div>
              <div className="flex justify-between">
                <span>Sábado</span>
                <span className="font-semibold">R$ 20k</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Domingo</span>
                <span className="font-bold text-lg">R$ 10k</span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-2xl text-white shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Próximos Objetivos</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                Alcançar R$ 200k em vendas
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                700 clientes ativos
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                Ticket médio R$ 300
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisaoGeral;
