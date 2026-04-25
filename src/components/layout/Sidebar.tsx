import React from 'react';

type MenuItem = {
  label: string;
  icon: React.ReactNode;
};

type SidebarProps = {
  items: MenuItem[];
};

const Sidebar: React.FC<SidebarProps> = ({ items }) => {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 px-6 py-8 bg-gradient-to-b from-blue-500/20 via-purple-500/20 to-indigo-600/30 backdrop-blur-xl border-r border-white/20 shadow-2xl">
      {/* Logo */}
      <div className="mb-12 flex items-center justify-center border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black bg-gradient-to-r from-blue-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-lg">
          DashPro
        </h1>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {items.map((item, index) => (
          <div
            key={index}
            className="group flex items-center gap-4 p-4 rounded-2xl text-white/90 font-medium cursor-pointer transition-all duration-300 hover:bg-white/20 hover:backdrop-blur-sm hover:shadow-lg hover:scale-[1.02] hover:text-white active:scale-[0.98]"
          >
            <div className="w-7 h-7 flex-shrink-0 opacity-90 group-hover:opacity-100">
              {item.icon}
            </div>
            <span className="tracking-wide">{item.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
