"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt" className={inter.className}>
      <body className="bg-slate-950 min-h-screen overflow-x-hidden antialiased">
        {/* Background Mesh Gradient with Indigo/Purple Bubbles */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(500px_circle_at_20vw_80vh,rgba(168,85,247,0.3)_0%,transparent_50%),radial-gradient(400px_circle_at_80vw_20vh,rgba(99,102,241,0.4)_0%,transparent_50%),radial-gradient(300px_circle_at_40vw_40vh,rgba(139,92,246,0.3)_0%,transparent_50%),radial-gradient(600px_circle_at_60vw_70vh,rgba(147,51,234,0.2)_0%,transparent_50%),radial-gradient(350px_circle_at_10vw_50vh,rgba(192,132,252,0.3)_0%,transparent_50%),#0f172a]" />
        </div>

        {/* Glassmorphism Navbar */}
        <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-900/40 backdrop-blur-3xl border-b border-white/10 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <div className="flex items-center justify-center h-full space-x-8">
              <Link
                href="/"
                className="text-sm font-medium text-white/80 hover:text-white transition-colors duration-200"
              >
                Visão Geral
              </Link>
              <Link
                href="/diario"
                className="text-sm font-medium text-white/80 hover:text-white transition-colors duration-200"
              >
                Diário
              </Link>
              <Link
                href="/mensal"
                className="text-sm font-medium text-white/80 hover:text-white transition-colors duration-200"
              >
                Mensal
              </Link>
            </div>
          </div>
        </nav>

        <main className="pt-16 relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
