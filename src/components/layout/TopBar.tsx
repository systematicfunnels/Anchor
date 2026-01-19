import React, { FC, useEffect, useRef } from 'react'
import { Bell, User, ChevronRight, Search as SearchIcon } from 'lucide-react'

interface TopBarProps {
  activeSection: string
}

export default function TopBar({ activeSection }: TopBarProps) {
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchButtonRef.current?.focus();
        console.log('Search focused');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="h-topbar bg-white border-b border-neutral-border flex items-center justify-between px-space-3 sticky top-0 z-40 backdrop-blur-md bg-white/80">
      <div className="flex items-center gap-space-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-space-1 text-xs font-bold text-slate-500 uppercase tracking-widest">
          <span>Project Alpha</span>
          <ChevronRight className="w-10 h-10" aria-hidden="true" />
          <span className="text-brand-accent">{activeSection}</span>
        </nav>
      </div>

      <div className="flex items-center gap-space-2">
        {/* Search Trigger */}
        <button 
          ref={searchButtonRef}
          aria-label="Search project artifacts"
          className="flex items-center gap-space-1 px-space-2 h-space-4 bg-slate-50 border border-neutral-border rounded-4 text-slate-500 text-xs hover:bg-slate-100 transition-all focus:ring-2 focus:ring-brand-accent focus:outline-none"
        >
          <SearchIcon className="w-14 h-14" aria-hidden="true" />
          <span>Search...</span>
          <kbd className="ml-space-2 px-6 py-1 bg-white border border-neutral-border rounded text-[10px] font-bold" aria-hidden="true">Ctrl K</kbd>
        </button>

        <div className="h-space-3 w-px bg-neutral-border mx-space-1" />

        <div className="flex items-center gap-space-2">
          <button 
            aria-label="Notifications"
            className="w-space-4 h-space-4 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-4 transition-all relative"
          >
            <Bell className="w-18 h-18" aria-hidden="true" />
            <span className="absolute top-8 right-8 w-6 h-6 bg-semantic-error rounded-full border-2 border-white" />
          </button>
          
          <button 
            aria-label="User profile"
            className="flex items-center gap-space-1 p-4 hover:bg-slate-50 rounded-4 transition-all border border-transparent hover:border-neutral-border shadow-sm group"
          >
            <div className="w-space-3 h-space-3 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden border border-slate-300">
              <User className="w-14 h-14 text-slate-500 group-hover:scale-110 transition-transform" aria-hidden="true" />
            </div>
            <span className="text-xs font-bold text-slate-700 ml-space-1">Hemant</span>
          </button>
        </div>
      </div>
    </header>
  );
}
