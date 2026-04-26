'use client';

interface Commodity {
  name: string;
  price: string;
  day: number;
  week: number;
  month: number;
}

const commodities: Commodity[] = [
  { name: 'Cobre', price: '$4.52', day: 0.5, week: -1.2, month: 3.4 },
  { name: 'Zinco', price: '$2.34', day: -0.3, week: 0.8, month: -2.1 },
  { name: 'Alumínio', price: '$2.10', day: 1.2, week: 2.5, month: 5.6 },
  { name: 'Níquel', price: '$17.89', day: -2.1, week: -0.5, month: 1.0 },
  { name: 'Dólar', price: 'R$5.67', day: 0.1, week: -0.4, month: 2.3 },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
            Dashboard Commodities
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Monitoramento em tempo real dos preços de commodities e dólar.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {commodities.map((item, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 h-[320px] flex flex-col items-center justify-between gap-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <h3 className="text-2xl font-bold text-gray-900 text-center flex-1 flex items-center">
                {item.name}
              </h3>
              <div className="text-4xl md:text-5xl font-black text-gray-900 text-center flex-1 flex items-center justify-center">
                {item.price}
              </div>
              <div className="w-full pt-4 border-t border-gray-200 text-center space-y-2">
                <div className={`text-lg font-semibold ${item.day >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  % Dia: {item.day >= 0 ? '+' : ''}{Math.abs(item.day).toFixed(2)}%
                </div>
                <div className={`text-lg font-semibold ${item.week >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  % Sem: {item.week >= 0 ? '+' : ''}{Math.abs(item.week).toFixed(2)}%
                </div>
                <div className={`text-lg font-semibold ${item.month >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  % Mês: {item.month >= 0 ? '+' : ''}{Math.abs(item.month).toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Analytical Table */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Tabela Analítica</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-xl">
            <table className="min-w-full divide-y divide-gray-200 bg-white">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Cobre</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Zinco</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Alumínio</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Níquel</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Dólar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2024-10-01</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">$4.52</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">$2.34</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">$2.10</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">$17.89</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">R$5.67</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2024-09-30</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">$4.50</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">$2.35</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">$2.08</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">$18.10</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">R$5.66</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2024-09-29</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">$4.48</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">$2.33</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">$2.09</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">$17.95</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">R$5.68</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2024-09-28</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">$4.55</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">$2.36</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">$2.11</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">$18.00</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">R$5.65</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
