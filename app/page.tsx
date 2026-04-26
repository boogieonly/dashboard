type Quote = {
  name: string;
  price: string;
  change: number;
};

type Period = {
  title: string;
  quotes: Quote[];
};

const dailyQuotes: Quote[] = [
  { name: 'Cobre', price: '$ 9.850,50', change: 2.1 },
  { name: 'Alumínio', price: '$ 2.620,75', change: -0.8 },
  { name: 'Níquel', price: '$ 17.450,20', change: 1.5 },
  { name: 'Zinco', price: '$ 2.950,10', change: 0.9 },
  { name: 'Chumbo', price: '$ 2.120,80', change: -1.2 },
  { name: 'Estanho', price: '$ 28.750,00', change: 3.4 },
  { name: 'Dólar Comercial', price: 'R$ 5,62', change: 0.4 },
];

const weeklyQuotes: Quote[] = [
  { name: 'Cobre', price: '$ 9.820,30', change: 1.9 },
  { name: 'Alumínio', price: '$ 2.610,45', change: -0.6 },
  { name: 'Níquel', price: '$ 17.380,90', change: 1.2 },
  { name: 'Zinco', price: '$ 2.940,25', change: 0.7 },
  { name: 'Chumbo', price: '$ 2.110,60', change: -1.0 },
  { name: 'Estanho', price: '$ 28.680,50', change: 3.1 },
  { name: 'Dólar Comercial', price: 'R$ 5,60', change: 0.2 },
];

const monthlyQuotes: Quote[] = [
  { name: 'Cobre', price: '$ 9.780,10', change: 1.5 },
  { name: 'Alumínio', price: '$ 2.590,20', change: -0.4 },
  { name: 'Níquel', price: '$ 17.320,00', change: 0.8 },
  { name: 'Zinco', price: '$ 2.920,80', change: 0.4 },
  { name: 'Chumbo', price: '$ 2.095,40', change: -0.7 },
  { name: 'Estanho', price: '$ 28.620,75', change: 2.8 },
  { name: 'Dólar Comercial', price: 'R$ 5,58', change: 0.1 },
];

const periods: Period[] = [
  { title: 'Fechamento Diário', quotes: dailyQuotes },
  { title: 'Média Semanal', quotes: weeklyQuotes },
  { title: 'Média Mensal', quotes: monthlyQuotes },
];

const LMEQuotes = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Cotações LME e Dólar
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Acompanhe as cotações atualizadas dos metais da LME e do Dólar Comercial.
          </p>
        </header>
        <div className="space-y-12">
          {periods.map((period, index) => (
            <div key={index} className="w-full">
              <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-3xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
                <div className="p-8 md:p-12 text-white">
                  <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 bg-white/20 px-8 py-4 rounded-2xl inline-block">
                    {period.title}
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm md:text-base">
                      <thead>
                        <tr className="border-b-2 border-white/30">
                          <th className="px-4 md:px-6 py-4 text-left font-bold uppercase tracking-wider bg-white/10 rounded-l-xl">Metal</th>
                          <th className="px-4 md:px-6 py-4 text-right font-bold uppercase tracking-wider bg-white/10">Preço</th>
                          <th className="px-4 md:px-6 py-4 text-right font-bold uppercase tracking-wider bg-white/10 rounded-r-xl">Variação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/20">
                        {period.quotes.map((quote, qIndex) => (
                          <tr key={qIndex} className="hover:bg-white/20 transition-colors">
                            <td className="px-4 md:px-6 py-5 font-semibold">{quote.name}</td>
                            <td className="px-4 md:px-6 py-5 text-right font-mono">{quote.price}</td>
                            <td className={`px-4 md:px-6 py-5 text-right font-semibold ${quote.change >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>
                              {quote.change >= 0 ? `+${quote.change.toFixed(1)}%` : `${quote.change.toFixed(1)}%`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LMEQuotes;
