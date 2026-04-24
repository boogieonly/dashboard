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
      <body className="bg-slate-950 min-h-screen overflow-x-hidden">
        {/* Subtle radial gradient background in indigo tones */}
        <div className="fixed inset-0 z-[-10] bg-[radial-gradient(circle_at_20%_80%,rgba(99,102,241,0.15),transparent_70%),radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.15),transparent_70%)]" />
        
        {/* Fixed Glassmorphism Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/50 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-2xl font-extrabold text-white hover:text-indigo-300 transition-colors">
                Metalfama 🏭
              </Link>
              <div className="flex items-center space-x-8">
                <Link
                  href="/"
                  className="text-white/90 hover:text-indigo-400 transition-colors flex items-center space-x-2 font-medium"
                >
                  <span>🏠</span>
                  <span>Visão Geral</span>
                </Link>
                <Link
                  href="/daily"
                  className="text-white/90 hover:text-indigo-400 transition-colors flex items-center space-x-2 font-medium"
                >
                  <span>📅</span>
                  <span>Diário</span>
                </Link>
                <Link
                  href="/monthly"
                  className="text-white/90 hover:text-indigo-400 transition-colors flex items-center space-x-2 font-medium"
                >
                  <span>📊</span>
                  <span>Mensal</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Main content with top padding */}
        <main className="pt-[100px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
