'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <html lang="pt-BR" className={inter.className}>
      <body className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 antialiased">
        <nav className="fixed top-0 left-0 right-0 h-20 z-[50] backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-2xl px-4 lg:px-8 flex items-center justify-between">
          <Link
            href="/"
            className="text-3xl font-black bg-gradient-to-r from-[#10b981] via-[#3b82f6] to-[#a855f7] bg-clip-text text-transparent hover:scale-105 transition-all duration-300"
          >
            Metalfama
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-lg font-semibold text-white/90 hover:text-white/100 transition-colors duration-300 flex items-center gap-2"
            >
              📊 Visão Geral
            </Link>
            <Link
              href="/mensal"
              className="text-lg font-semibold text-white/90 hover:text-white/100 transition-colors duration-300 flex items-center gap-2"
            >
              📅 Fechamento Mensal
            </Link>
            <Link
              href="/diario"
              className="text-lg font-semibold text-white/90 hover:text-white/100 transition-colors duration-300 flex items-center gap-2"
            >
              📋 Fechamento Diário
            </Link>
          </div>

          <button
            className="md:hidden flex flex-col justify-center gap-1 p-2 rounded-lg backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all duration-300"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`block w-6 h-0.5 bg-white/90 rounded transition-all duration-300 ${
                isOpen
                  ? 'rotate-45 translate-y-2'
                  : '-translate-y-0.5'
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-white/90 rounded transition-all duration-300 ${
                isOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-white/90 rounded transition-all duration-300 ${
                isOpen
                  ? '-rotate-45 -translate-y-2'
                  : 'translate-y-0.5'
              }`}
            />
          </button>
        </nav>

        {isOpen && (
          <div className="md:hidden fixed top-20 left-0 right-0 z-[40] backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-2xl py-8 flex flex-col items-center space-y-6">
            <Link
              href="/"
              className="text-xl font-semibold text-white/90 hover:text-white/100 transition-all duration-300 flex items-center gap-3 px-6 py-3 rounded-xl hover:bg-white/10"
              onClick={() => setIsOpen(false)}
            >
              📊 Visão Geral
            </Link>
            <Link
              href="/mensal"
              className="text-xl font-semibold text-white/90 hover:text-white/100 transition-all duration-300 flex items-center gap-3 px-6 py-3 rounded-xl hover:bg-white/10"
              onClick={() => setIsOpen(false)}
            >
              📅 Fechamento Mensal
            </Link>
            <Link
              href="/diario"
              className="text-xl font-semibold text-white/90 hover:text-white/100 transition-all duration-300 flex items-center gap-3 px-6 py-3 rounded-xl hover:bg-white/10"
              onClick={() => setIsOpen(false)}
            >
              📋 Fechamento Diário
            </Link>
          </div>
        )}

        <main className="pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}
