"use client";

import { ReactNode } from 'react';
import Link from 'next/link';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className="bg-gradient-radial from-slate-950 via-slate-900/50 to-indigo-950/20 min-h-screen antialiased overflow-x-hidden">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/40 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-[110px]">
              <Link
                href="/"
                className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight hover:scale-105 transition-transform duration-300"
              >
                Metalfama 🏭
              </Link>
              <ul className="flex items-center space-x-8">
                <li>
                  <Link
                    href="/"
                    className="group flex items-center gap-2 text-xl font-medium text-slate-300 hover:text-white hover:scale-105 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:bg-white/10 rounded-xl px-3 py-2 transition-all duration-300 ease-in-out"
                  >
                    🏠 Visão Geral
                  </Link>
                </li>
                <li>
                  <Link
                    href="/diario"
                    className="group flex items-center gap-2 text-xl font-medium text-slate-300 hover:text-white hover:scale-105 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:bg-white/10 rounded-xl px-3 py-2 transition-all duration-300 ease-in-out"
                  >
                    📅 Diário
                  </Link>
                </li>
                <li>
                  <Link
                    href="/mensal"
                    className="group flex items-center gap-2 text-xl font-medium text-slate-300 hover:text-white hover:scale-105 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:bg-white/10 rounded-xl px-3 py-2 transition-all duration-300 ease-in-out"
                  >
                    📊 Mensal
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <main className="pt-[110px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {children}
        </main>
      </body>
    </html>
  );
}
