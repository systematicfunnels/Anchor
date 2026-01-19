import React, { FC } from 'react'
import {
  LayoutDashboard,
  FileText,
  Code2,
  TestTube2,
  Rocket,
  ShieldCheck,
  Archive,
  Anchor,
  Activity,
  Layers,
  Box,
  GitBranch,
  ClipboardCheck,
  Search as SearchIcon,
  Terminal,
  Database,
  Globe,
  Settings,
  Lock,
  History
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const domains = [
  {
    name: 'Foundation',
    items: [
      { name: 'Project Identity', icon: LayoutDashboard },
      { name: 'Requirements', icon: FileText },
    ]
  },
  {
    name: 'Structure',
    items: [
      { name: 'Design', icon: Layers },
      { name: 'Development', icon: Code2 },
    ]
  },
  {
    name: 'Integration',
    items: [
      { name: 'API & Contracts', icon: Globe },
      { name: 'Testing & Validation', icon: TestTube2 },
    ]
  },
  {
    name: 'Lifecycle',
    items: [
      { name: 'Deployment', icon: Rocket },
      { name: 'Governance & Control', icon: ShieldCheck },
    ]
  },
  {
    name: 'Authority',
    items: [
      { name: 'Financial & Legal', icon: ClipboardCheck },
      { name: 'Historical Record', icon: History },
    ]
  }
]

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside className="w-sidebar h-screen bg-brand-primary border-r border-slate-800 flex flex-col shrink-0 overflow-hidden z-30">
      {/* Branding */}
      <div className="h-topbar flex items-center px-space-3 border-b border-slate-800/50">
        <div className="w-space-4 h-space-4 bg-brand-accent rounded-4 flex items-center justify-center shadow-lg shadow-brand-accent/20">
          <Anchor className="w-space-2 h-space-2 text-white" />
        </div>
        <span className="ml-space-2 text-sm font-bold text-white tracking-tight uppercase">Anchor</span>
      </div>

      {/* Domain Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar p-space-2 space-y-space-4" role="navigation" aria-label="Main Navigation">
        {domains.map((domain) => (
          <div key={domain.name} className="space-y-4">
            <h3 className="px-space-2 text-[12px] font-bold text-slate-500 uppercase tracking-widest">
              {domain.name}
            </h3>
            <div className="space-y-2">
              {domain.items.map((item) => (
                <button
                  key={item.name}
                  onClick={() => onSectionChange(item.name)}
                  aria-label={`Go to ${item.name} section`}
                  aria-current={activeSection === item.name ? 'page' : undefined}
                  className={`
                    w-full group flex items-center px-space-2 h-space-4 rounded-4 transition-all relative
                    ${activeSection === item.name 
                      ? 'bg-slate-800 text-white shadow-sm' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
                    focus:outline-none focus:ring-2 focus:ring-brand-accent/50
                  `}
                >
                  {activeSection === item.name && (
                    <div className="absolute left-0 w-2 h-space-2 bg-brand-accent rounded-r-full" />
                  )}
                  <item.icon className={`w-16 h-16 mr-space-2 shrink-0 transition-colors ${activeSection === item.name ? 'text-brand-accent' : 'group-hover:text-slate-300'}`} aria-hidden="true" />
                  <span className="text-xs font-medium truncate">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* System Status / Footer */}
      <div className="p-space-2 border-t border-slate-800/50 bg-slate-900/50">
        <div className="flex items-center p-space-2 rounded-4 bg-slate-800/30 border border-slate-800/50">
          <div className="w-8 h-8 rounded-full bg-semantic-success" />
          <div className="ml-space-2 min-w-0">
            <p className="text-[11px] font-bold text-slate-300 truncate">V.2.4.0 Stable</p>
            <p className="text-[11px] text-slate-400 truncate">Syncing Workspace...</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
