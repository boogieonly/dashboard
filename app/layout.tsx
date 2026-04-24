"use client";

import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} font-sans`}>
      <body className="h-screen flex flex-col bg-slate-950 overflow-hidden antialiased">
        {/* Subtle radial gradient for depth */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_70%_at_50%_50%,rgba(255,255,255,0.06)_0%,transparent_50%)]" />
        
        {/* Fixed Navbar with Glassmorphism */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/60 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-black text-white tracking-tight">Metalfama 🏭</h1>
              </div>
              
              {/* Navigation Links */}
              <div className="flex items-center space-x-8">
                <Link
                  href="/"
                  className="text-white/80 hover:text-white font-medium transition-colors duration-200 flex items-center gap-1 text-sm"
                >
                  🏠 Início
                </Link>
                <Link
                  href="/diario"
                  className="text-white/80 hover:text-white font-medium transition-colors duration-200 flex items-center gap-1 text-sm"
                >
                  📅 Diário
                </Link>
                <Link
                  href="/mensal"
                  className="text-white/80 hover:text-white font-medium transition-colors duration-200 flex items-center gap-1 text-sm"
                >
                  📊 Mensal
                </Link>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Scrollable Main Content */}
        <main className="flex-1 pt-16 overflow-auto relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
