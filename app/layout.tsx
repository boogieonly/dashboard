'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  disabled?: boolean;
};

const DashboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const TrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

const ClipboardListIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
    />
  </svg>
);

const FolderIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H9l-2-2H5a2 2 0 00-2 2z"
    />
  </svg>
);

const CogIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const navItems: NavItem[] = [
  {
    label: 'Visão Geral',
    href: '/',
    icon: <DashboardIcon className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />,
  },
  {
    label: 'Fechamento Mensal',
    href: '/mensal',
    icon: <TrendingUpIcon className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors" />,
  },
  {
    label: 'Fechamento Diário',
    href: '/diario',
    icon: <ClipboardListIcon className="w-6 h-6 text-pink-400 group-hover:text-pink-300 transition-colors" />,
  },
  {
    label: 'Relatórios',
    href: '/relatorios',
    icon: <FolderIcon className="w-6 h-6 text-yellow-400 group-hover:text-yellow-300 transition-colors" />,
    disabled: true,
  },
  {
    label: 'Configurações',
    href: '/config',
    icon: <CogIcon className="w-6 h-6 text-gray-400 transition-colors" />,
    disabled: true,
  },
];

const navbarItems: NavItem[] = navItems.slice(0, 3);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const newIsTablet = width >= 768 && width < 1024;
      setIsTablet(newIsTablet);
      if (newIsTablet) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeMobileMenu]);

  const sidebarTranslateClass = isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full';
  const mdTranslateClass = 'md:translate-x-0';
  const sidebarWidthClass = isTablet && isCollapsed ? 'md:w-[100px]' : 'md:w-[280px] lg:w-[280px]';
  const sidebarClasses = `
    fixed left-0 top-0 h-screen w-[280px] p-6 z-50 overflow-y-auto shadow-2xl border-r border-white/10
    bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#312e81] backdrop-blur-xl
    transition-all duration-300 ease-in-out
    ${sidebarTranslateClass} ${mdTranslateClass} ${sidebarWidthClass}
    md:top-[70px] md:h-[calc(100vh-70px)] md:z-40 md:shadow-2xl md:border-r
  `;

  const mainMlClass = isTablet && isCollapsed ? 'md:ml-[100px]' : 'md:ml-[280px] lg:ml-[280px]';
  const mainClasses = `
    transition-all duration-300 p-4 sm:p-6 lg:p-8 min-h-screen
    ml-0 ${mainMlClass} mt-[70px]
    bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.1)_0%,transparent_50%)]
    bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81]
  `;

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 w-full h-[70px] z-50 flex items-center justify-between px-4 md:px-8
        bg-gradient-to-r from-[#0f172a] to-[#1e1b4b] backdrop-blur-xl shadow-lg border-b border-white/10">
        <Link href="/" className="flex items-center space-x-2 group">
          <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent select-none">
            Metalfama
          </span>
        </Link>

        <div className="hidden md:flex items-center mx-auto space-x-12">
          {navbarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative pb-2 text-lg font-medium text-white/70 hover:text-white transition-all duration-300
                after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px]
                after:bg-gradient-to-r after:from-blue-400 after:to-purple-400
                hover:after:w-full after:transition-all after:duration-300"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <button
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 ml-auto rounded-lg hover:bg-white/20 transition-all flex items-center justify-center"
          aria-label="Toggle mobile menu"
        >
          <svg
            className="w-6 h-6 text-white/70"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </nav>

      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={sidebarClasses} role="complementary">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent truncate">
            Metalfama
          </h1>
          {isTablet && (
            <button
              onClick={toggleCollapse}
              className="p-2 rounded-xl hover:bg-white/20 transition-all flex items-center justify-center w-10 h-10 ml-auto"
              aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            >
              <svg
                className={`w-5 h-5 text-white/70 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        <nav className="space-y-2" role="navigation" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isDisabled = item.disabled;
            const itemClass = `group flex items-center p-3 rounded-xl transition-all duration-300 hover:bg-white/10 hover:scale-[1.05]
              ${isActive ? 'bg-white/20 border-l-4 border-blue-400 pl-4 -ml-[4px]' : ''}
              ${isDisabled ? 'opacity-50 cursor-not-allowed hover:!bg-transparent hover:!scale-100' : ''}`;

            return (
              <div key={item.href} className={itemClass} role={!isDisabled ? 'button' : undefined} tabIndex={!isDisabled ? 0 : -1}>
                {!isDisabled ? (
                  <Link
                    href={item.href}
                    className="flex items-center space-x-3 w-full py-2"
                    onClick={closeMobileMenu}
                  >
                    {item.icon}
                    <span className={`text-sm font-medium text-white/90 transition-opacity ${isCollapsed ? 'hidden' : 'block'}`}>
                      {item.label}
                    </span>
                  </Link>
                ) : (
                  <div className="flex items-center space-x-3 w-full py-2 pointer-events-none">
                    {item.icon}
                    <span className={`text-sm font-medium text-white/90 transition-opacity ${isCollapsed ? 'hidden' : 'block'}`}>
                      {item.label}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={mainClasses}>
        {children}
      </main>
    </>
  );
}
