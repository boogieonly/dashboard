'use client';

import 'framer-motion';
import { motion } from 'framer-motion';
import React from 'react';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import KPICard from '@/components/KPICard';
import MaterialCard from '@/components/MaterialCard';
import FilterSection from '@/components/FilterSection';
import BarChartComponent from '@/components/BarChartComponent';
import PieChartComponent from '@/components/PieChartComponent';

type KPIData = {
  title: string;
  value: string;
  emoji: string;
  color: string;
};

type MaterialData = {
  name: string;
  stock: number;
  total: number;
  emoji: string;
};

const kpis: KPIData[] = [
  {
    title: 'Total Products',
    value: '1,234',
    emoji: '📦',
    color: 'from-indigo-500 to-blue-600',
  },
  {
    title: 'Revenue',
    value: '$56,789',
    emoji: '💰',
    color: 'from-amber-500 to-yellow-600',
  },
  {
    title: 'Orders',
    value: '456',
    emoji: '📊',
    color: 'from-purple-500 to-violet-600',
  },
  {
    title: 'Growth',
    value: '+12%',
    emoji: '📈',
    color: 'from-rose-500 to-pink-600',
  },
];

const materials: MaterialData[] = [
  { name: 'Steel', stock: 85, total: 100, emoji: '🔩' },
  { name: 'Aluminum', stock: 62, total: 100, emoji: '⚙️' },
  { name: 'Copper', stock: 40, total: 100, emoji: '🛠️' },
  { name: 'Plastic', stock: 92, total: 100, emoji: '🔧' },
  { name: 'Rubber', stock: 23, total: 100, emoji: '🧰' },
  { name: 'Glass', stock: 77, total: 100, emoji: '🪛' },
];

const glassClass =
  'relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-[0_20px_40px_rgba(147,51,234,0.3)] hover:border-purple-400/50 transition-all duration-700 hover:-translate-y-3 hover:scale-[1.02] overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/20 before:to-rose-500/20 before:blur-xl before:-z-10';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900/80 to-slate-950 overflow-hidden">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 md:p-12 overflow-auto scrollbar-thin scrollbar-thumb-purple-600/50 scrollbar-track-slate-900/50">
          {/* KPI Cards Section */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-12 drop-shadow-2xl">
              Dashboard Premium
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpis.map((kpi, index) => (
                <motion.div
                  key={kpi.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <KPICard
                    title={kpi.title}
                    value={kpi.value}
                    emoji={kpi.emoji}
                    color={kpi.color}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Filter and Charts */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <FilterSection />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className={glassClass}
              >
                <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-lg">Sales Bar Chart</h2>
                <BarChartComponent />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className={glassClass}
              >
                <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-lg">Inventory Pie Chart</h2>
                <PieChartComponent />
              </motion.div>
            </div>
          </motion.section>

          {/* Materials Cards */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent mb-8 drop-shadow-2xl">
              Materials Stock
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map((material, index) => (
                <motion.div
                  key={material.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="group"
                >
                  <MaterialCard
                    name={material.name}
                    stock={material.stock}
                    total={material.total}
                    emoji={material.emoji}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        </main>
      </div>
    </div>
  );
}
