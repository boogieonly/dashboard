import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-inter'
});

interface NavbarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

function Navbar({ isMenuOpen, setIsMenuOpen }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-2xl transition-all duration-500 ease-in-out">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-28">
          {/* Logo */}
          <Link href="/" className="text-3xl font-black tracking-tight bg-gradient-to-r from-indigo-300 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg hover:scale-105 transition-transform duration-300">
            Metalfama
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center space-x-8">
            <li>
              <Link
                href="/"
                className="text-white/80 hover:text-white font-semibold text-lg transition-all duration-300 hover:underline decoration-2 underline-offset-4"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/fechamento"
                className="text-white/80 hover:text-white font-semibold text-lg transition-all duration-300 hover:underline decoration-2 underline-offset-4"
              >
                Fechamento
              </Link>
            </li>
          </ul>

          {/* Hamburger Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-1 flex flex-col justify-center items-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
            aria-label="Toggle menu"
          >
            {!isMenuOpen ? (
              <svg className="w-6 h-6 stroke-white transition-transform duration-300" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg className="w-6 h-6 stroke-white transition-transform duration-300 rotate-180" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isMenuOpen
              ? 'max-h-96 opacity-100 py-6 border-t border-white/20 bg-white/10 backdrop-blur-xl'
              : 'max-h-0 opacity-0 py-0'
          }`}
        >
          <ul className="flex flex-col space-y-4 px-4">
            <li>
              <Link
                href="/"
                className="block py-3 px-4 text-lg font-semibold text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/fechamento"
                className="block py-3 px-4 text-lg font-semibold text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Fechamento
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <html lang="pt-BR" className={inter.className}>
      <Head>
        <title>Metalfama</title>
        <meta name="description" content="Plataforma premium de trading e fechamento com design glassmorphism e experiências suaves." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="trading, fechamento, metalfama, premium, glassmorphism" />
        <meta name="author" content="Metalfama" />
        <meta name="theme-color" content="#9333ea" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      <body className="bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 min-h-screen overflow-x-hidden antialiased font-sans">
        <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        <main className="pt-28">
          {children}
        </main>
      </body>
    </html>
  );
}
