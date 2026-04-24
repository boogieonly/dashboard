"use client";

import { ReactNode } from 'react';
import Link from 'next/link';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[radial-gradient(circle_at_50%_20%,indigo-900_0%,purple-900_40%,indigo-950_100%)] min-h-screen antialiased">
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/20 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
              <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                Metalfama 🏭
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <Link
                  href="/"
                  className="text-white/90 hover:text-indigo-300 font-medium transition-all duration-300 hover:scale-105"
                >
                  Visão Geral
                </Link>
                <Link
                  href="/diario"
                  className="text-white/90 hover:text-indigo-300 font-medium transition-all duration-300 hover:scale-105"
                >
                  Fechamento Diário
                </Link>
                <Link
                  href="/mensal"
                  className="text-white/90 hover:text-indigo-300 font-medium transition-all duration-300 hover:scale-105"
                >
                  Fechamento Mensal
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="pt-20 md:pt-24 px-4 sm:px-6 lg:px-8 pb-8">
          {children}
        </main>
      </body>
    </html>
  );
}
