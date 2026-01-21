import React from 'react';
import { 
  Terminal, 
  Wifi, 
  ShieldCheck, 
  Database,
  RefreshCw,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SystemFooter() {
  const { user } = useAuth();

  return (
    <footer className="h-footer bg-brand-primary border-t border-slate-800 flex items-center justify-between px-space-2 shrink-0 z-40">
      {/* Left Section: Context & Status */}
      <div className="flex items-center gap-space-2 h-full">
        <div className="flex items-center gap-space-1 px-space-1 bg-slate-800/50 h-full border-x border-slate-800/30">
          <Terminal className="w-space-1 h-space-1 text-brand-accent" />
          <span className="text-[10px] font-mono text-slate-300 font-medium">anchor-cli: 2.4.0-stable</span>
        </div>
        
        <div className="flex items-center gap-space-1">
          <div className="w-space-0.75 h-space-0.75 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
          <span className="text-[10px] text-slate-400 font-medium">Syncing Workspace...</span>
        </div>

        <div className="flex items-center gap-space-1 ml-space-1">
          <Database className="w-space-1 h-space-1 text-slate-500" />
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-tight">Encrypted: AES-256</span>
        </div>
      </div>

      {/* Right Section: User & Environment */}
      <div className="flex items-center gap-space-2 h-full">
        <div className="flex items-center gap-space-1">
          <Zap className="w-space-1 h-space-1 text-amber-500" />
          <span className="text-[10px] text-slate-400 font-medium">Latency: 12ms</span>
        </div>

        <div className="flex items-center gap-space-1 px-space-2 bg-brand-accent/10 h-full border-x border-brand-accent/20">
          <ShieldCheck className="w-space-1 h-space-1 text-brand-accent" />
          <span className="text-[10px] font-bold text-brand-accent uppercase tracking-tighter">Role: {user.role}</span>
        </div>

        <div className="flex items-center gap-space-1 h-full px-space-1 hover:bg-slate-800 cursor-pointer transition-colors group">
          <Wifi className="w-space-1 h-space-1 text-emerald-500 group-hover:text-emerald-400" />
          <span className="text-[10px] text-slate-400 font-medium group-hover:text-slate-200">Production</span>
        </div>
      </div>
    </footer>
  );
}
