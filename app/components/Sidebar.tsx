'use client'

import Link from 'next/link'

import { usePathname } from 'next/navigation'

type NavItem = {

  href: string

  label: string

  icon: string

}

const Sidebar = () => {

  const pathname = usePathname()

  const navItems: NavItem[] = [

    { href: '/', label: 'Página Inicial', icon: '🏠' },

    { href: '/diario', label: 'Fechamento Diário', icon: '📅' },

    { href: '/mensal', label: 'Fechamento Mensal', icon: '📊' },

    { href: '/visao-geral', label: 'Visão Geral', icon: '👁️' },

  ]

  const bottomItems: NavItem[] = [

    { href: '/configuracoes', label: 'Configurações', icon: '⚙️' },

    { href: '/suporte', label: 'Suporte', icon: '📞' },

  ]

  const isActive = (href: string): boolean => pathname === href

  return (

    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 hidden md:flex flex-col shadow-2xl">

      <nav className="flex-1 flex flex-col p-8 pt-20 space-y-4">

        {navItems.map((item) => (

          <Link

            key={item.href}

            href={item.href}

            className={`flex items-center p-4 rounded-xl transition-all duration-300 group ${

              isActive(item.href)

                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl'

                : 'text-slate-300 hover:bg-slate-700 hover:text-white hover:shadow-md'

            }`}

          >

            <span className="mr-4 text-2xl flex-shrink-0">{item.icon}</span>

            <span className="font-medium text-sm">{item.label}</span>

          </Link>

        ))}

      </nav>

      <div className="p-8 pb-12 space-y-4 border-t border-slate-700/50">

        {bottomItems.map((item) => (

          <Link

            key={item.href}

            href={item.href}

            className={`flex items-center p-4 rounded-xl transition-all duration-300 ${

              isActive(item.href)

                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl'

                : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200 hover:shadow-md'

            }`}

          >

            <span className="mr-4 text-2xl flex-shrink-0">{item.icon}</span>

            <span className="font-medium text-sm">{item.label}</span>

          </Link>

        ))}

      </div>

    </aside>

  )

}

export default Sidebar
