'use client';

import Sidebar from './components/Sidebar';
import Header from './components/Header';

export default function Home() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="pt-24 pb-8 px-8 bg-gradient-to-b from-slate-950 to-slate-900 min-h-screen">
          <h1 className="text-4xl font-bold text-white mb-8">Bem-vindo ao Dashboard</h1>
          <p className="text-slate-300 text-lg">Estrutura pronta para adicionar seus componentes!</p>
        </main>
      </div>
    </div>
  );
}
