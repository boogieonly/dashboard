'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body className="bg-gradient-to-br from-slate-900 via-purple-900/30 to-indigo-900 antialiased dark min-h-screen">
        {/* Fixed Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-gradient-to-r from-slate-800/95 via-indigo-900/90 to-purple-900/90 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/30">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent tracking-tight hover:scale-105 transition-transform">
              Metalfama
            </Link>
            {/* Desktop Nav Links */}
            <ul className="hidden md:flex items-center space-x-8 text-sm font-medium">
              <li>
                <Link
                  href="/"
                  className="text-white/80 hover:text-white transition-colors duration-200 hover:underline decoration-2 underline-offset-4"
                >
                  Visão Geral
                </Link>
              </li>
              <li>
                <Link
                  href="/mensal"
                  className="text-white/80 hover:text-white transition-colors duration-200 hover:underline decoration-2 underline-offset-4"
                >
                  Fechamento Mensal
                </Link>
              </li>
              <li>
                <Link
                  href="/diario"
                  className="text-white/80 hover:text-white transition-colors duration-200 hover:underline decoration-2 underline-offset-4"
                >
                  Fechamento Diário
                </Link>
              </li>
            </ul>
            {/* Mobile Hamburger */}
            <label
              htmlFor="sidebar-toggle"
              className="md:hidden flex flex-col justify-center p-1 space-y-1.5 w-8 h-8 cursor-pointer group"
            >
              <span className="block w-6 h-0.5 bg-white/80 rounded transition-all duration-200 group-hover:bg-white" />
              <span className="block w-6 h-0.5 bg-white/80 rounded transition-all duration-200 group-hover:bg-white" />
              <span className="block w-6 h-0.5 bg-white/80 rounded transition-all duration-200 group-hover:bg-white" />
            </label>
          </div>
        </nav>

        {/* Main Layout Container */}
        <div className="flex pt-16 min-h-[calc(100vh-4rem)]">
          {/* Toggle Input (hidden, for peer CSS) */}
          <input
            id="sidebar-toggle"
            type="checkbox"
            className="peer sr-only md:hidden"
          />

          {/* Sidebar */}
          <aside className="fixed md:static inset-y-16 left-0 z-40 w-72 h-[calc(100vh-4rem)] md:w-16 lg:w-64 flex-shrink-0 flex flex-col transform -translate-x-full md:translate-x-0 peer-checked:translate-x-0 transition-transform duration-300 ease-in-out bg-[#0f1419]/95 backdrop-blur-xl border-r border-white/10 md:border-r-white/20 shadow-2xl shadow-indigo-500/25 md:shadow-none hover:shadow-3xl hover:shadow-purple-500/30 md:hover:shadow-xl">
            <nav className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto">
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="group flex items-center px-3 py-2.5 rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-white/20 hover:shadow-2xl"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 md:w-6 lg:w-6 flex-shrink-0 text-indigo-400 group-hover:text-indigo-300"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                      />
                    </svg>
                    <span className="ml-4 truncate font-medium hidden lg:block">
                      Visão Geral
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/mensal"
                    className="group flex items-center px-3 py-2.5 rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-white/20 hover:shadow-2xl"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 md:w-6 lg:w-6 flex-shrink-0 text-purple-400 group-hover:text-purple-300"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 3v2.25A.75.75 0 017.5 6h18a.75.75 0 01.75.75v9a.75.75 0 01-.75.75h-18a.75.75 0 01-.75-.75V6a.75.75 0 01.75-.75zm0 9h18"
                      />
                    </svg>
                    <span className="ml-4 truncate font-medium hidden lg:block">
                      Fechamento Mensal
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/diario"
                    className="group flex items-center px-3 py-2.5 rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-white/20 hover:shadow-2xl"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 md:w-6 lg:w-6 flex-shrink-0 text-blue-400 group-hover:text-blue-300"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="ml-4 truncate font-medium hidden lg:block">
                      Fechamento Diário
                    </span>
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6 md:p-8 lg:p-12">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
