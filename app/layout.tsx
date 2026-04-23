"use client";

import { GeistSans } from 'geist/font/sans';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${GeistSans.variable} font-sans`}>
      <body className="h-screen flex flex-col bg-gradient-radial from-slate-950 via-indigo-950/10 via-purple-950/10 to-slate-950 overflow-hidden antialiased">
        <nav className="flex items-center justify-between px-8 py-6 bg-slate-900/50 backdrop-blur-md border-b border-slate-800/50 sticky top-0 z-50 shrink-0">
          <h1 className="text-white font-black text-3xl tracking-tight">Metalfama 🏭</h1>
          <ul className="flex items-center space-x-8 list-none m-0 p-0">
            <li>
              <a
                href="/"
                className="group flex items-center gap-2 text-slate-200 font-medium text-lg hover:scale-105 hover:text-white transition-all duration-200 ease-in-out"
              >
                <span className="text-xl transition-transform group-hover:scale-110">🏠</span>
                <span>Visão Geral</span>
              </a>
            </li>
            <li>
              <a
                href="/diario"
                className="group flex items-center gap-2 text-slate-200 font-medium text-lg hover:scale-105 hover:text-white transition-all duration-200 ease-in-out"
              >
                <span className="text-xl transition-transform group-hover:scale-110">📅</span>
                <span>Diário</span>
              </a>
            </li>
            <li>
              <a
                href="/mensal"
                className="group flex items-center gap-2 text-slate-200 font-medium text-lg hover:scale-105 hover:text-white transition-all duration-200 ease-in-out"
              >
                <span className="text-xl transition-transform group-hover:scale-110">📊</span>
                <span>Mensal</span>
              </a>
            </li>
          </ul>
        </nav>
        <main className="flex-1 p-8 pt-24 overflow-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
