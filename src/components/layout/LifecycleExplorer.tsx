import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Code2,
  TestTube2,
  Rocket,
  ShieldCheck,
  Anchor,
  Layers,
  ClipboardCheck,
  Lock,
  History,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LifecycleExplorerProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
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
];

export default function LifecycleExplorer({ activeSection, onSectionChange }: LifecycleExplorerProps) {
  const { getAccessLevel } = useAuth();
  const [expandedDomains, setExpandedDomains] = React.useState<string[]>(['Foundation', 'Structure', 'Integration', 'Lifecycle', 'Authority']);

  const toggleDomain = (name: string) => {
    setExpandedDomains(prev => 
      prev.includes(name) ? prev.filter(d => d !== name) : [...prev, name]
    );
  };

  const filteredDomains = domains.map(domain => ({
    ...domain,
    items: domain.items.filter(item => getAccessLevel(item.name) !== 'NO_ACCESS')
  })).filter(domain => domain.items.length > 0);

  return (
    <aside className="w-sidebar h-full bg-brand-primary border-r border-slate-800 flex flex-col shrink-0 overflow-hidden z-30">
      {/* Branding / Project Header */}
      <div className="h-header flex items-center px-space-2 border-b border-slate-800/50 bg-slate-900/20">
        <div className="flex items-center gap-space-1">
          <div className="w-space-2 h-space-2 bg-brand-accent rounded-4 flex items-center justify-center shadow-lg shadow-brand-accent/20">
            <Anchor className="w-space-1 h-space-1 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-white tracking-tight uppercase leading-none">Project Alpha</span>
            <span className="text-[9px] text-slate-500 font-medium uppercase mt-0.5">Workspace</span>
          </div>
        </div>
      </div>

      {/* Explorer Header */}
      <div className="px-space-2 py-space-1 flex items-center justify-between">
        <div className="flex items-center gap-space-1 text-slate-400">
          <FolderOpen className="w-space-2 h-space-2" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Explorer</span>
        </div>
      </div>

      {/* Lifecycle Explorer Content */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar" role="navigation" aria-label="Lifecycle Explorer">
        {filteredDomains.map((domain) => (
          <div key={domain.name} className="mb-1">
            <button
              onClick={() => toggleDomain(domain.name)}
              className="w-full flex items-center px-space-1 py-space-1 hover:bg-slate-800/30 group transition-colors"
            >
              {expandedDomains.includes(domain.name) ? (
                <ChevronDown className="w-space-2 h-space-2 text-slate-600 mr-space-1" />
              ) : (
                <ChevronRight className="w-space-2 h-space-2 text-slate-600 mr-space-1" />
              )}
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide group-hover:text-slate-400">
                {domain.name}
              </span>
            </button>
            
            {expandedDomains.includes(domain.name) && (
              <div className="mt-0.5">
                {domain.items.map((item) => {
                  const accessLevel = getAccessLevel(item.name);
                  const isActive = activeSection === item.name;
                  const hasNoAccess = accessLevel === 'NO_ACCESS';
                  
                  return (
                    <button
                      key={item.name}
                      onClick={() => !hasNoAccess && onSectionChange(item.name)}
                      disabled={hasNoAccess}
                      className={`
                        w-full group flex items-center pl-space-3 pr-space-2 py-space-1 transition-all relative
                        ${isActive 
                          ? 'bg-slate-800/80 text-white' 
                          : hasNoAccess 
                            ? 'opacity-30 grayscale cursor-not-allowed'
                            : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}
                      `}
                    >
                      {isActive && (
                        <div className="absolute left-0 w-space-1 h-space-2 bg-brand-accent rounded-r-full" />
                      )}
                      <item.icon className={`w-space-2 h-space-2 mr-space-1 shrink-0 transition-colors ${isActive ? 'text-brand-accent' : 'text-slate-600 group-hover:text-slate-400'}`} />
                      <span className="text-[11px] font-medium truncate">{item.name}</span>
                      {accessLevel === 'READ_ONLY' && (
                        <Lock className="w-space-1 h-space-1 ml-auto text-slate-700 group-hover:text-slate-600" />
                      )}
                      {hasNoAccess && (
                        <div className="ml-auto w-space-1 h-space-1 bg-slate-700 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
