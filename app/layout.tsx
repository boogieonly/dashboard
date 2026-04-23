'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type RootLayoutProps = {
  children: React.ReactNode;
};

const navLinks = [
  { href: '/', label: 'Dashboard 📊' },
  { href: '/fechamento', label: 'Fechamento Mensal 💰' },
];

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <html lang="pt-BR">
      <body className="bg-gradient-to-br from-gray-900 via-blue-900/30 to-purple-900/30 min-h-screen antialiased">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-600/20 backdrop-blur-xl border-b border-white/20 shadow-2xl drop-shadow-2xl">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link
                href="/"
                className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent hover:scale-105 hover:rotate-1 transition-all duration-300 ease-in-out flex items-center gap-2"
              >
                Metalfama 🏭
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-2 lg:space-x-8">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ease-in-out flex items-center gap-2 ${
                      pathname === href
                        ? 'bg-white/30 backdrop-blur-sm shadow-lg scale-105 border border-white/30'
                        : 'hover:bg-white/20 hover:scale-105 hover:shadow-lg hover:border-white/30 border border-transparent'
                    }`}
                  >
                    <span>{label}</span>
                  </Link>
                ))}
              </div>

              {/* Hamburger Button */}
              <button
                onClick={toggleMenu}
                className="md:hidden p-2 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-110"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                  />
                </svg>
              </button>
            </div>

            {/* Mobile Menu */}
            <div
              className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-indigo-600/30 backdrop-blur-xl border-b border-white/20 pt-4 pb-6 shadow-2xl">
                <div className="flex flex-col space-y-4 px-4">
                  {navLinks.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-6 py-3 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center gap-3 ${
                        pathname === href
                          ? 'bg-white/40 backdrop-blur-sm shadow-xl scale-105 border-2 border-white/40'
                          : 'hover:bg-white/30 hover:scale-105 hover:shadow-xl hover:border-white/30 border border-transparent'
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="pt-16 lg:pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}
