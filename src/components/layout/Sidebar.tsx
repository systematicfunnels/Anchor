import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Receipt, 
  Settings,
  Search,
  UserPlus,
  Files,
  BarChart3
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ClientModal } from '../clients/ClientModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '#dashboard' },
  { icon: Files, label: 'Quotes', href: '#quotes' },
  { icon: Briefcase, label: 'Projects', href: '#projects' },
  { icon: Receipt, label: 'Invoices', href: '#invoices' },
  { icon: Users, label: 'Clients', href: '#clients' },
  { icon: BarChart3, label: 'Unit Economics', href: '#economics' },
  { icon: Settings, label: 'Settings', href: '#settings' },
];

export const Sidebar = ({ onNavigate }: { onNavigate?: () => void }) => {
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#dashboard');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#dashboard';
      setCurrentHash(hash);
      if (onNavigate) onNavigate();
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [onNavigate]);

  return (
    <div className="w-[var(--sidebar-width)] bg-neutral-900 h-screen flex flex-col lg:fixed left-0 top-0 border-r border-neutral-800">
      <div className="p-6">
        <h1 className="text-white text-xl font-bold tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          Anchor
        </h1>
      </div>

      {/* Global Search */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search (Ctrl + K)"
            className="w-full bg-neutral-800 border-none rounded-md py-2 pl-9 pr-3 text-sm text-neutral-300 placeholder-neutral-600 outline-none focus:ring-1 focus:ring-neutral-700 transition-all"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <button 
          onClick={() => setIsClientModalOpen(true)}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-3 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          New Client
        </button>
      </div>

      <ClientModal 
        isOpen={isClientModalOpen} 
        onClose={() => setIsClientModalOpen(false)} 
      />
      
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentHash === item.href;
          return (
            <a
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all relative group",
                isActive 
                  ? "text-white bg-white/5 shadow-sm" 
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              )}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-4 bg-primary-500 rounded-r-full" />
              )}
              <item.icon className={cn(
                "w-4 h-4 transition-colors",
                isActive ? "text-primary-500" : "text-neutral-500 group-hover:text-neutral-300"
              )} />
              {item.label}
            </a>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-neutral-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-bold text-white">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">John Doe</p>
            <p className="text-xs text-neutral-500 truncate">Solo Workspace</p>
          </div>
        </div>
      </div>
    </div>
  );
};
