import type { Metadata } from 'next'
import { ReactNode } from 'react'

import './globals.css'
import Header from './components/Header'
import Sidebar from './components/Sidebar'

export const metadata: Metadata = {
  title: 'My App',
  description: 'A Next.js app with Header and Sidebar layout',
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen antialiased">
        <Header />
        <Sidebar />
        <main className="ml-64 pt-20 p-6">
          {children}
        </main>
      </body>
    </html>
  )
}
