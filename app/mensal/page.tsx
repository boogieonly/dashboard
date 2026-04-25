'use client';

export default function MensalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Fechamento Mensal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Visão geral do fechamento financeiro mensal. Acompanhe metas, receitas, despesas e lucros de forma simples e intuitiva.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Janeiro */}
          <div className="bg-white shadow-xl rounded-2xl p-8 hover:shadow-2xl transition-shadow duration-300 border border-gray-100">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Janeiro</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Receita:</span>
                <span className="font-bold text-green-600">R$ 15.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Despesas:</span>
                <span className="font-bold text-red-600">R$ 10.000</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-600 font-medium">Lucro:</span>
                <span className="text-2xl font-bold text-blue-600">R$ 5.000</span>
              </div>
            </div>
          </div>

          {/* Card 2: Fevereiro */}
          <div className="bg-white shadow-xl rounded-2xl p-8 hover:shadow-2xl transition-shadow duration-300 border border-gray-100">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Fevereiro</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Receita:</span>
                <span className="font-bold text-green-600">R$ 18.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Despesas:</span>
                <span className="font-bold text-red-600">R$ 12.000</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-600 font-medium">Lucro:</span>
                <span className="text-2xl font-bold text-blue-600">R$ 6.000</span>
              </div>
            </div>
          </div>

          {/* Card 3: Meta vs Realizado */}
          <div className="bg-white shadow-xl rounded-2xl p-8 hover:shadow-2xl transition-shadow duration-300 border border-gray-100 lg:col-span-1">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Meta Mensal vs Realizado</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                <span className="text-lg font-medium text-gray-700">Meta:</span>
                <span className="text-2xl font-bold text-yellow-600">R$ 20.000</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <span className="text-lg font-medium text-gray-700">Realizado:</span>
                <span className="text-2xl font-bold text-green-600">R$ 22.500</span>
              </div>
              <div className="text-center pt-4">
                <span className="text-3xl font-bold text-emerald-600">+12.5%</span>
                <p className="text-sm text-gray-500 mt-1">Acima da meta</p>
              </div>
            </div>
          </div>

          {/* Card 4: Projeção Março */}
          <div className="bg-white shadow-xl rounded-2xl p-8 hover:shadow-2xl transition-shadow duration-300 border border-gray-100 md:col-span-2 lg:col-span-3">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Projeção para Março</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="p-8 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl text-center border border-purple-100">
                <div className="text-4xl font-bold text-purple-600 mb-2">R$ 25.000</div>
                <div className="text-lg text-purple-700 font-medium">Receita Projetada</div>
              </div>
              <div className="p-8 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl text-center border border-indigo-100">
                <div className="text-4xl font-bold text-indigo-600 mb-2">R$ 16.000</div>
                <div className="text-lg text-indigo-700 font-medium">Despesas Projetadas</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 bg-emerald-50 p-6 rounded-2xl">
                Lucro Projetado: <span className="text-4xl">R$ 9.000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
