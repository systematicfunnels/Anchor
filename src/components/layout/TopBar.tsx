import React, { FC, useEffect, useRef } from 'react'
import { Bell, User, ChevronRight, Search as SearchIcon } from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import { UserRole } from '../../types/auth'

interface TopBarProps {
  activeSection: string
}

const ROLES: UserRole[] = [
  'Executive', 'Project Manager', 'Architect', 'Developer', 
  'QA / Tester', 'DevOps / Ops', 'Security / Compliance', 
  'Finance', 'Legal', 'Auditor', 'Viewer'
];

export default function TopBar({ activeSection }: TopBarProps) {
  const { user, setRole } = useAuth();
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = React.useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setIsRoleMenuOpen(false);
      }
    };

    if (isRoleMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRoleMenuOpen]);

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
        <nav aria-label="Breadcrumb" className="flex items-center gap-space-1 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          <span className="hover:text-slate-900 cursor-pointer transition-colors">Project Alpha</span>
          <ChevronRight className="w-space-2 h-space-2 opacity-30" aria-hidden="true" />
          <div className="flex items-center gap-space-1 px-space-1 py-0.5 bg-brand-accent/5 text-brand-accent rounded border border-brand-accent/10">
            <span>{activeSection}</span>
          </div>
        </nav>
      </div>

      <div className="flex items-center gap-space-2">
        {/* Search Trigger */}
        <button 
          ref={searchButtonRef}
          aria-label="Search project artifacts"
          className="flex items-center gap-space-1 px-space-2 h-space-4 bg-slate-50 border border-neutral-border rounded-4 text-slate-500 text-[11px] hover:bg-slate-100 transition-all focus:ring-2 focus:ring-brand-accent/20 focus:outline-none w-search group"
        >
          <SearchIcon className="w-space-2 h-space-2 group-hover:text-brand-accent transition-colors" aria-hidden="true" />
          <span className="flex-1 text-left">Artifact Search...</span>
          <kbd className="px-1.5 py-0.5 bg-white border border-neutral-border rounded text-[9px] font-bold opacity-60" aria-hidden="true">Ctrl K</kbd>
        </button>

        <div className="h-space-2 w-px bg-neutral-border" />

        <div className="flex items-center gap-space-2">
          <button 
            aria-label="Notifications"
            className="w-space-4 h-space-4 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-4 transition-all relative"
          >
            <Bell className="w-space-2 h-space-2" aria-hidden="true" />
            <span className="absolute top-space-1 right-space-1 w-space-0.75 h-space-0.75 bg-rose-500 rounded-full border border-white" />
          </button>
          
          <div className="relative" ref={roleMenuRef}>
            <button 
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              aria-label="User profile"
              aria-haspopup="true"
              aria-expanded={isRoleMenuOpen}
              className="flex items-center gap-space-1 p-space-0.75 pr-space-1 hover:bg-slate-50 rounded-4 transition-all border border-transparent hover:border-neutral-border group"
            >
              <div className="w-space-3 h-space-3 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden border border-slate-300">
                <User className="w-space-2 h-space-2 text-slate-500 group-hover:scale-110 transition-transform" aria-hidden="true" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[11px] font-bold text-slate-700 leading-none">{user.name}</span>
                <span className="text-[9px] font-bold text-brand-accent uppercase tracking-tighter mt-0.5">{user.role}</span>
              </div>
              <ChevronRight className={`w-space-1 h-space-1 text-slate-400 transition-transform ml-1 ${isRoleMenuOpen ? 'rotate-90' : ''}`} />
            </button>

            {isRoleMenuOpen && (
              <div 
                className="absolute right-0 mt-space-4 w-role-menu bg-white border border-neutral-border rounded-4 shadow-xl z-50 py-space-2 animate-in fade-in zoom-in-95 duration-200"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
              >
                <div className="px-space-6 py-space-2 border-b border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Switch Role</span>
                </div>
                <div className="max-h-[256px] overflow-y-auto custom-scrollbar" role="none">
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      role="menuitem"
                      onClick={() => {
                        setRole(role);
                        setIsRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-space-6 py-space-2 text-xs font-medium transition-colors hover:bg-slate-50 ${user.role === role ? 'text-brand-accent bg-blue-50/50' : 'text-slate-600'}`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
