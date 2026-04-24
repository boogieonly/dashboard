"use client";

import { ReactNode } from 'react';
import Link from 'next/link';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-gradient-radial from-slate-950 via-indigo-950/30 to-slate-950 min-h-screen antialiased font-sans">
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10 px-6 py-4 backdrop-brightness-110">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight hover:scale-105 transition-transform">
              Metalfama 🏭
            </Link>
            <div className="flex items-center space-x-8">
              <Link
                href="/"
                className="flex items-center space-x-2 text-lg font-medium text-white/80 hover:text-white hover:underline underline-offset-4 transition-all duration-200"
              >
                <span>🏠</span>
                <span>Início</span>
              </Link>
              <Link
                href="/diario"
                className="flex items-center space-x-2 text-lg font-medium text-white/80 hover:text-white hover:underline underline-offset-4 transition-all duration-200"
              >
                <span>📅</span>
                <span>Diário</span>
              </Link>
              <Link
                href="/mensal"
                className="flex items-center space-x-2 text-lg font-medium text-white/80 hover:text-white hover:underline underline-offset-4 transition-all duration-200"
              >
                <span>📊</span>
                <span>Mensal</span>
              </Link>
            </div>
          </div>
        </nav>
        <main className="pt-24">
          {children}
        </main>
      </body>
    </html>
  );
}
