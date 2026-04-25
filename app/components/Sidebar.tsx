'use client';

import { LayoutDashboard, BarChart3, Settings, LogOut, Home } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-6 fixed left-0 top-0 shadow-2xl">
      {/* Logo */}
      <div className="mb-8 pb-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Metalfama
        </h1>
        <p className="text-xs text-slate-400 mt-1">Dashboard Comercial</p>
      </div>

      {/* Menu */}
      <nav className="space-y-3">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-500 text-white transition">
          <Home size={20} />
          <span>Dashboard</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition">
          <BarChart3 size={20} />
          <span>Relatórios</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition">
          <LayoutDashboard size={20} />
          <span>Métricas</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition">
          <Settings size={20} />
          <span>Configurações</span>
        </Link>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-6 left-6 right-6">
        <button className="w-full flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition">
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
