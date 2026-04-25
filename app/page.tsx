'use client';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import KPICard from './components/KPICard';
import MaterialCard from './components/MaterialCard';
import FilterSection from './components/FilterSection';
import BarChartComponent from './components/BarChartComponent';
import PieChartComponent from './components/PieChartComponent';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 lg:p-12 overflow-auto">
          {/* Title Section */}
          <section className="mb-16 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl animate-pulse [text-shadow:0_0_1rem_rgba(168,85,247,0.5)]">
              Premium Dashboard
            </h1>
            <p className="mt-4 text-xl text-slate-400 drop-shadow-lg">Advanced analytics and insights</p>
          </section>

          {/* KPI Cards */}
          <section className="mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard 
                title="Total Products" 
                value="1,234" 
                emoji="📦" 
                gradient="from-blue-500 to-indigo-600" 
              />
              <KPICard 
                title="Revenue" 
                value="$45,678" 
                emoji="💰" 
                gradient="from-emerald-500 to-teal-600" 
              />
              <KPICard 
                title="Orders" 
                value="567" 
                emoji="📊" 
                gradient="from-purple-500 to-pink-600" 
              />
              <KPICard 
                title="Growth" 
                value="+12%" 
                emoji="📈" 
                gradient="from-orange-500 to-red-600" 
              />
            </div>
          </section>

          {/* Filter Section */}
          <section className="mb-16">
            <FilterSection />
          </section>

          {/* Charts Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="group bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:scale-105 hover:shadow-2xl hover:shadow-[0_0_2rem_rgba(99,102,241,0.4)] transition-all duration-500 hover:-translate-y-2">
              <h2 className="text-2xl lg:text-3xl font-bold mb-8 text-indigo-300 drop-shadow-xl group-hover:text-indigo-200 transition-colors">Sales Overview</h2>
              <div className="h-80 lg:h-96">
                <BarChartComponent />
              </div>
            </div>
            <div className="group bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:scale-105 hover:shadow-2xl hover:shadow-[0_0_2rem_rgba(168,85,247,0.4)] transition-all duration-500 hover:-translate-y-2">
              <h2 className="text-2xl lg:text-3xl font-bold mb-8 text-purple-300 drop-shadow-xl group-hover:text-purple-200 transition-colors">Category Distribution</h2>
              <div className="h-80 lg:h-96">
                <PieChartComponent />
              </div>
            </div>
          </section>

          {/* Materials Section */}
          <section>
            <MaterialCard />
          </section>
        </main>
      </div>
    </div>
  );
}
