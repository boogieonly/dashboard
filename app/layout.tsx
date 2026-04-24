'use client';

import { Inter } from 'next/font/google';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="pt-BR" className={inter.className}>
      <body className="bg-slate-950 min-h-screen overflow-x-hidden antialiased">
        {/* Mesh Gradient Bubbles Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[10%] left-[10%] w-80 h-80 bg-gradient-to-br from-violet-500/25 via-indigo-400/20 to-cyan-400/25 rounded-full blur-3xl animate-[pulse_12s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
          <div className="absolute top-[20%] right-[15%] w-72 h-72 bg-gradient-to-br from-pink-500/20 via-purple-400/25 to-blue-400/20 rounded-full blur-3xl animate-[pulse_16s_cubic-bezier(0.4,0,0.6,1)_infinite] [animation-delay:4s]" />
          <div className="absolute bottom-[25%] left-[60%] w-96 h-96 bg-gradient-to-br from-emerald-500/15 via-teal-400/25 to-sky-400/20 rounded-full blur-3xl animate-[pulse_14s_cubic-bezier(0.4,0,0.6,1)_infinite] [animation-delay:8s]" />
          <div className="absolute top-[70%] right-[25%] w-64 h-64 bg-gradient-to-br from-orange-500/20 via-rose-400/25 to-fuchsia-400/20 rounded-full blur-3xl animate-[pulse_10s_cubic-bezier(0.4,0,0.6,1)_infinite] [animation-delay:2s]" />
          <div className="absolute bottom-[40%] left-[20%] w-56 h-56 bg-gradient-to-br from-amber-400/25 via-yellow-400/15 to-lime-400/20 rounded-full blur-2xl animate-[pulse_18s_cubic-bezier(0.4,0,0.6,1)_infinite] [animation-delay:6s]" />
        </div>

        {/* Premium Glassmorphism Navbar */}
        <nav className="fixed top-0 left-0 right-0 h-28 z-50 backdrop-blur-3xl bg-white/5 border-b border-white/10 shadow-2xl">
          <div className="h-full max-w-7xl mx-auto px-8 flex items-center justify-center space-x-16">
            <Link
              href="/"
              className={`group relative text-xl font-medium transition-all duration-300 text-white/90 hover:text-white hover:scale-105 ${
                pathname === '/' ? 'text-white scale-105' : ''
              }`}
            >
              <span className="relative z-10">Visão Geral</span>
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full transition-all duration-300 group-hover:w-full ${
                pathname === '/' ? '!w-full' : ''
              }`} />
            </Link>
            <Link
              href="/diario"
              className={`group relative text-xl font-medium transition-all duration-300 text-white/90 hover:text-white hover:scale-105 ${
                pathname === '/diario' ? 'text-white scale-105' : ''
              }`}
            >
              <span className="relative z-10">Diário</span>
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full transition-all duration-300 group-hover:w-full ${
                pathname === '/diario' ? '!w-full' : ''
              }`} />
            </Link>
            <Link
              href="/mensal"
              className={`group relative text-xl font-medium transition-all duration-300 text-white/90 hover:text-white hover:scale-105 ${
                pathname === '/mensal' ? 'text-white scale-105' : ''
              }`}
            >
              <span className="relative z-10">Mensal</span>
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full transition-all duration-300 group-hover:w-full ${
                pathname === '/mensal' ? '!w-full' : ''
              }`} />
            </Link>
          </div>
        </nav>

        <main className="pt-28 relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
