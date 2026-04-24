"use client";

import { Inter } from 'next/font/google';
import Link from 'next/link';
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className={inter.className}>
      <body className="bg-slate-950 font-sans antialiased overflow-x-hidden">
        {/* Static mesh gradient bubbles for background depth */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-indigo-400/10 via-purple-500/15 to-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-gradient-to-tr from-purple-500/20 to-indigo-600/25 rounded-full blur-2xl opacity-80" />
          <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-gradient-to-r from-indigo-500/15 to-purple-400/20 rounded-full blur-xl" />
          <div className="absolute bottom-1/2 right-1/3 w-64 h-64 bg-gradient-to-bl from-violet-600/25 to-indigo-400/10 rounded-full blur-2xl" />
        </div>

        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 h-20 bg-slate-900/40 backdrop-blur-xl border-b border-white/10 z-50 flex items-center justify-between px-8">
          <Link
            href="/"
            className="text-white text-2xl font-black drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.8)] transition-all duration-300"
          >
            Metalfama 🏭
          </Link>
          <ul className="flex items-center space-x-8">
            <li>
              <Link
                href="/"
                className="text-white text-lg font-medium transition-all duration-300 hover:text-blue-300 hover:drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]"
              >
                🏠 Início
              </Link>
            </li>
            <li>
              <Link
                href="/diario"
                className="text-white text-lg font-medium transition-all duration-300 hover:text-blue-300 hover:drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]"
              >
                📅 Diário
              </Link>
            </li>
            <li>
              <Link
                href="/mensal"
                className="text-white text-lg font-medium transition-all duration-300 hover:text-blue-300 hover:drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]"
              >
                📊 Mensal
              </Link>
            </li>
          </ul>
        </nav>

        <main className="pt-20 min-h-screen relative z-10 p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
