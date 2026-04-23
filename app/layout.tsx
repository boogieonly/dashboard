"use client"

import { Inter } from 'next/font/google'
import Link from 'next/link'
import { useState, type ReactNode } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <html lang="pt-BR" className={inter.className}>
      <body className="bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 min-h-screen antialiased">
        <nav className="fixed top-0 left-0 right-0 z-50 h-24 backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-2xl">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent hover:scale-105 transition-all duration-200"
            >
              Metalfama 🏭
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className="text-lg font-medium text-white/90 hover:text-white transition-colors duration-200 flex items-center space-x-2 group"
              >
                🏠 <span>Visão Geral</span>
              </Link>
              <Link
                href="/daily"
                className="text-lg font-medium text-white/90 hover:text-white transition-colors duration-200 flex items-center space-x-2 group"
              >
                📅 <span>Fechamento Diário</span>
              </Link>
              <Link
                href="/monthly"
                className="text-lg font-medium text-white/90 hover:text-white transition-colors duration-200 flex items-center space-x-2 group"
              >
                📊 <span>Fechamento Mensal</span>
              </Link>
            </div>
            <button
              className="md:hidden text-white/90 p-2 rounded-lg backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-all duration-200"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
          {isOpen && (
            <div className="md:hidden absolute top-24 left-0 right-0 backdrop-blur-xl bg-white/10 border-b border-white/20 py-6 shadow-2xl">
              <div className="mx-auto px-4 max-w-7xl flex flex-col space-y-4">
                <Link
                  href="/"
                  className="text-xl font-medium text-white/90 hover:text-white transition-colors duration-200 flex items-center space-x-3 py-3 px-2 rounded-lg hover:bg-white/10"
                  onClick={() => setIsOpen(false)}
                >
                  🏠 Visão Geral
                </Link>
                <Link
                  href="/daily"
                  className="text-xl font-medium text-white/90 hover:text-white transition-colors duration-200 flex items-center space-x-3 py-3 px-2 rounded-lg hover:bg-white/10"
                  onClick={() => setIsOpen(false)}
                >
                  📅 Fechamento Diário
                </Link>
                <Link
                  href="/monthly"
                  className="text-xl font-medium text-white/90 hover:text-white transition-colors duration-200 flex items-center space-x-3 py-3 px-2 rounded-lg hover:bg-white/10"
                  onClick={() => setIsOpen(false)}
                >
                  📊 Fechamento Mensal
                </Link>
              </div>
            </div>
          )}
        </nav>
        <main className="pt-24 pb-12">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
