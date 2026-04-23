'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Home, Calendar, BarChart3, Settings, User } from 'lucide-react';

interface Sale {
  id: string;
  date: string;
  material: string;
  qty: number;
  weight: number;
  value: number;
  region: string;
  seller: string;
}

type FormDataType = {
  material: string;
  qty: number;
  weight: number;
  value: number;
  region: string;
  seller: string;
};

type ErrorsType = Partial<Record<keyof FormDataType, string>>;

const materials = ['Aço Inox', 'Cobre', 'Latão', 'Alumínio', 'Ligas Especiais'];
const regions = ['São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Bahia', 'Outros'];
const sellers = ['João Silva', 'Maria Oliveira', 'Pedro Santos', 'Ana Costa', 'Carlos Mendes'];

export default function DiarioPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<FormDataType>({
    material: '',
    qty: 0,
    weight: 0,
    value: 0,
    region: '',
    seller: '',
  });
  const [errors, setErrors] = useState<ErrorsType>({});

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage) || 1;
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Load data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('dailySales');
    if (stored) {
      const parsed: Sale[] = JSON.parse(stored);
      setSales(parsed);
    }
    console.log('Data loaded from localStorage');
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('dailySales', JSON.stringify(sales));
    console.log('Data saved to localStorage', sales.length, 'entries');
  }, [sales]);

  // Filter last 30 days for table
  useEffect(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const last30 = sales
      .filter((s) => new Date(s.date) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setFilteredSales(last30);
  }, [sales]);

  // Log state changes
  useEffect(() => {
    console.log('State updated:', { sales: sales.length, filteredSales: filteredSales.length, selectedDate, currentPage });
  }, [sales, filteredSales, selectedDate, currentPage]);

  const getDaySales = (date: string): Sale[] => {
    return sales.filter((s) => s.date === date);
  };

  const daySales = getDaySales(selectedDate);

  const calculateKPIs = (daySales: Sale[]) => {
    const totalQty = daySales.reduce((sum, s) => sum + s.qty, 0);
    const totalWeight = daySales.reduce((sum, s) => sum + s.weight, 0);
    const totalValue = daySales.reduce((sum, s) => sum + s.value, 0);
    const count = daySales.length;
    const avgTicket = count > 0 ? totalValue / count : 0;
    const maxSale = Math.max(...daySales.map((s) => s.value), 0);
    return { totalQty, totalWeight, totalValue, avgTicket, maxSale, count };
  };

  const kpis = calculateKPIs(daySales);

  const getLast7DaysChartData = (): { date: string; qty: number; value: number }[] => {
    const today = new Date();
    const data: { date: string; qty: number; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayS = sales.filter((s) => s.date === dateStr);
      const totalQty = dayS.reduce((sum, s) => sum + s.qty, 0);
      const totalValue = dayS.reduce((sum, s) => sum + s.value, 0);
      data.push({ date: dateStr, qty: totalQty, value: totalValue });
    }
    return data;
  };

  const chartData = getLast7DaysChartData();

  const getTop5Materials = (daySales: Sale[]): { material: string; value: number }[] => {
    const matMap: Record<string, number> = {};
    daySales.forEach((s) => {
      matMap[s.material] = (matMap[s.material] || 0) + s.value;
    });
    return Object.entries(matMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([material, value]) => ({ material, value }));
  };

  const top5Materials = getTop5Materials(daySales);

  const handleInputChange = (field: keyof FormDataType, value: string | number) => {
    setFormData({ ...formData, [field]: typeof value === 'number' ? value : value });
    // Clear error
    if (errors[field as keyof FormDataType]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: ErrorsType = {};
    if (!formData.material) newErrors.material = 'Obrigatório';
    if (formData.qty <= 0 || isNaN(formData.qty)) newErrors.qty = 'Número positivo';
    if (formData.weight <= 0 || isNaN(formData.weight)) newErrors.weight = 'Número positivo';
    if (formData.value <= 0 || isNaN(formData.value)) newErrors.value = 'Número positivo';
    if (!formData.region) newErrors.region = 'Obrigatório';
    if (!formData.seller) newErrors.seller = 'Obrigatório';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newSale: Sale = {
      id: crypto.randomUUID(),
      date: selectedDate,
      material: formData.material,
      qty: formData.qty,
      weight: formData.weight,
      value: formData.value,
      region: formData.region,
      seller: formData.seller,
    };

    setSales([...sales, newSale]);
    setFormData({ material: '', qty: 0, weight: 0, value: 0, region: '', seller: '' });
    setErrors({});
    console.log('New sale added:', newSale);
  };

  const handleDelete = (id: string) => {
    if (confirm('Confirma exclusão desta venda?')) {
      setSales(sales.filter((s) => s.id !== id));
      console.log('Sale deleted:', id);
    }
  };

  const exportCSV = () => {
    const headers = ['Data', 'Material', 'Quantidade', 'Peso', 'Valor', 'Região', 'Vendedor'];
    const csvContent = [
      headers.map((h) => `"${h}"`).join(','),
      ...daySales.map((s) => [
        s.date,
        s.material,
        s.qty,
        s.weight,
        s.value,
        s.region,
        s.seller,
      ].map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vendas_diarias_${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const glassClasses = 'backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 rounded-3xl p-6 md:p-8';
  const gradientText = 'bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent font-bold drop-shadow-lg';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-x-hidden">
      {/* Sidebar */}
      <aside className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-16 md:w-[250px] lg:w-[280px] bg-white/10 backdrop-blur-xl border-r border-white/20 transition-all duration-500 z-50">
        <nav className="p-6 space-y-4">
          <button className="flex items-center gap-3 w-full p-3 rounded-2xl text-blue-400 hover:text-blue-200 hover:bg-blue-500/20 border border-blue-500/20 transition-all duration-300 group">
            <Home size={24} />
            <span className="hidden md:block whitespace-nowrap font-medium">Home</span>
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 shadow-lg transition-all duration-300 group">
            <Calendar size={24} />
            <span className="hidden md:block whitespace-nowrap font-bold">Diário</span>
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-2xl text-pink-400 hover:text-pink-200 hover:bg-pink-500/20 border border-pink-500/20 transition-all duration-300 group">
            <BarChart3 size={24} />
            <span className="hidden md:block whitespace-nowrap">Relatórios</span>
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-2xl text-green-400 hover:text-green-200 hover:bg-green-500/20 border border-green-500/20 transition-all duration-300 group">
            <Settings size={24} />
            <span className="hidden md:block whitespace-nowrap">Configurações</span>
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-2xl text-amber-400 hover:text-amber-200 hover:bg-amber-500/20 border border-amber-500/20 transition-all duration-300 group">
            <User size={24} />
            <span className="hidden md:block whitespace-nowrap">Perfil</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pt-20 pl-16 md:pl-[250px] lg:pl-[280px] pb-12 px-6 md:px-8 lg:px-12">
        {/* Header */}
        <header className="mb-12">
          <h1 className={`${gradientText} text-4xl md:text-5xl mb-6 drop-shadow-2xl`}>Fechamento Diário</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
            <label className="text-white/80 font-medium">Data:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`${glassClasses.replace('p-6', 'p-3')} w-full sm:w-auto`}
            />
            <button
              type="button"
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
            >
              Hoje
            </button>
          </div>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 mb-12">
          <div className={glassClasses + ' text-center group'}>
            <div className="text-3xl md:text-4xl font-black mb-2 text-cyan-400 drop-shadow-lg">{kpis.totalQty.toLocaleString()}</div>
            <div className="text-white/80 text-sm md:text-base font-medium">Quantidade</div>
          </div>
          <div className={glassClasses + ' text-center group'}>
            <div className="text-3xl md:text-4xl font-black mb-2 text-emerald-400 drop-shadow-lg">{kpis.totalWeight.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg</div>
            <div className="text-white/80 text-sm md:text-base font-medium">Peso Total</div>
          </div>
          <div className={glassClasses + ' text-center group'}>
            <div className="text-3xl md:text-4xl font-black mb-2 text-yellow-400 drop-shadow-lg">R$ {kpis.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div className="text-white/80 text-sm md:text-base font-medium">Valor Total</div>
          </div>
          <div className={glassClasses + ' text-center group'}>
            <div className="text-3xl md:text-4xl font-black mb-2 text-purple-400 drop-shadow-lg">R$ {kpis.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div className="text-white/80 text-sm md:text-base font-medium">Ticket Médio</div>
          </div>
          <div className={glassClasses + ' text-center group'}>
            <div className="text-3xl md:text-4xl font-black mb-2 text-pink-400 drop-shadow-lg">R$ {kpis.maxSale.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div className="text-white/80 text-sm md:text-base font-medium">Maior Venda</div>
          </div>
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-12">
          <div className={glassClasses}>
            <h3 className={`${gradientText} text-2xl mb-6 text-center`}>Últimos 7 Dias (Quantidade vs Valor)</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="5 5" stroke="hsl(220 30% 15%)" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(210 20% 70%)" />
                <YAxis stroke="hsl(210 20% 70%)" />
                <Tooltip />
                <Line type="monotone" dataKey="qty" stroke="#3B82F6" strokeWidth={3} name="Quantidade" dot={false} />
                <Line type="monotone" dataKey="value" stroke="#EC4899" strokeWidth={3} name="Valor" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className={glassClasses}>
            <h3 className={`${gradientText} text-2xl mb-6 text-center`}>Top 5 Materiais Hoje</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={top5Materials}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 30% 15%)" />
                <XAxis dataKey="material" stroke="hsl(210 20% 70%)" />
                <YAxis stroke="hsl(210 20% 70%)" />
                <Tooltip />
                <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Form */}
        <section className={`${glassClasses} mb-12`}>
          <h3 className={`${gradientText} text-3xl mb-8 text-center`}>Adicionar Nova Venda</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-white/80 mb-2 font-medium">Material *</label>
              <select
                value={formData.material}
                onChange={(e) => handleInputChange('material', e.target.value)}
                className={`${glassClasses.replace('shadow-2xl', 'shadow-lg').replace('p-6', 'p-4')} w-full`}
              >
                <option value="">Selecione um material</option>
                {materials.map((mat) => (
                  <option key={mat} value={mat}>
                    {mat}
                  </option>
                ))}
              </select>
              {errors.material && <p className="text-red-400 text-sm mt-1 ml-1">{errors.material}</p>}
            </div>
            <div>
              <label className="block text-white/80 mb-2 font-medium">Quantidade *</label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.qty}
                onChange={(e) => handleInputChange('qty', parseFloat(e.target.value) || 0)}
                className={`${glassClasses.replace('shadow-2xl', 'shadow-lg').replace('p-6', 'p-4')} w-full`}
              />
              {errors.qty && <p className="text-red-400 text-sm mt-1 ml-1">{errors.qty}</p>}
            </div>
            <div>
              <label className="block text-white/80 mb-2 font-medium">Peso (kg) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                className={`${glassClasses.replace('shadow-2xl', 'shadow-lg').replace('p-6', 'p-4')} w-full`}
              />
              {errors.weight && <p className="text-red-400 text-sm mt-1 ml-1">{errors.weight}</p>}
            </div>
            <div>
              <label className="block text-white/80 mb-2 font-medium">Valor (R$) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.value}
                onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
                className={`${glassClasses.replace('shadow-2xl', 'shadow-lg').replace('p-6', 'p-4')} w-full`}
              />
              {errors.value && <p className="text-red-400 text-sm mt-1 ml-1">{errors.value}</p>}
            </div>
            <div>
              <label className="block text-white/80 mb-2 font-medium">Região *</label>
              <select
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
                className={`${glassClasses.replace('shadow-2xl', 'shadow-lg').replace('p-6', 'p-4')} w-full`}
              >
                <option value="">Selecione uma região</option>
                {regions.map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
              {errors.region && <p className="text-red-400 text-sm mt-1 ml-1">{errors.region}</p>}
            </div>
            <div>
              <label className="block text-white/80 mb-2 font-medium">Vendedor *</label>
              <select
                value={formData.seller}
                onChange={(e) => handleInputChange('seller', e.target.value)}
                className={`${glassClasses.replace('shadow-2xl', 'shadow-lg').replace('p-6', 'p-4')} w-full`}
              >
                <option value="">Selecione um vendedor</option>
                {sellers.map((seller) => (
                  <option key={seller} value={seller}>
                    {seller}
                  </option>
                ))}
              </select>
              {errors.seller && <p className="text-red-400 text-sm mt-1 ml-1">{errors.seller}</p>}
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <button
                type="submit"
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-[1.05] transition-all duration-300"
              >
                Adicionar Venda
              </button>
            </div>
          </form>
        </section>

        {/* Historical Table */}
        <section className={glassClasses}>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <h3 className={`${gradientText} text-3xl`}>Histórico - Últimos 30 Dias ({filteredSales.length} registros)</h3>
            <button
              onClick={exportCSV}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300"
              disabled={daySales.length === 0}
            >
              Exportar CSV (Hoje)
            </button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm md:text-base">
              <thead>
                <tr className="bg-white/5 backdrop-blur-sm border-b border-white/20">
                  <th className="p-4 text-left font-bold text-white/90">Data</th>
                  <th className="p-4 text-left font-bold text-white/90">Material</th>
                  <th className="p-4 text-left font-bold text-white/90">Qtd</th>
                  <th className="p-4 text-left font-bold text-white/90">Peso</th>
                  <th className="p-4 text-left font-bold text-white/90">Valor</th>
                  <th className="p-4 text-left font-bold text-white/90">Região</th>
                  <th className="p-4 text-left font-bold text-white/90">Vendedor</th>
                  <th className="p-4 text-left font-bold text-white/90">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-white/10 transition-all duration-200 border-b border-white/10 last:border-b-0">
                    <td className="p-4 font-medium text-white/90">{sale.date}</td>
                    <td className="p-4 text-white/80">{sale.material}</td>
                    <td className="p-4 text-white/80">{sale.qty.toLocaleString()}</td>
                    <td className="p-4 text-white/80">{sale.weight.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kg</td>
                    <td className="p-4 font-bold text-emerald-400">R$ {sale.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-4 text-white/80">{sale.region}</td>
                    <td className="p-4 text-white/80">{sale.seller}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDelete(sale.id)}
                        className="text-red-400 hover:text-red-300 font-medium px-3 py-1 rounded-lg hover:bg-red-500/20 transition-all duration-200"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedSales.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-white/60 italic">Nenhum registro nos últimos 30 dias</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8 p-4 bg-white/5 rounded-2xl backdrop-blur-sm">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-medium disabled:shadow-none shadow-md hover:shadow-lg"
              >
                Anterior
              </button>
              <span className="text-white/80 font-bold text-lg">Página {currentPage} de {totalPages}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-medium disabled:shadow-none shadow-md hover:shadow-lg"
              >
                Próxima
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
