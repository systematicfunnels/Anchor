import React from 'react';
import { 
  History, 
  Link as LinkIcon, 
  CheckCircle2, 
  ShieldCheck, 
  Info,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface EvidencePanelProps {
  activeSection: string;
}

export default function EvidencePanel({ activeSection }: EvidencePanelProps) {
  const { user } = useAuth();

  return (
    <aside className="w-evidence h-full border-l border-neutral-border bg-white flex flex-col shrink-0 overflow-hidden">
      {/* Panel Header */}
      <div className="h-header flex items-center px-space-2 border-b border-neutral-border bg-slate-50/50">
        <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-space-1">
          <Info className="w-space-2 h-space-2" />
          Evidence & Context
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-space-2 space-y-space-3">
        {/* Linked Items Section */}
        <section className="space-y-space-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-space-1">
              <LinkIcon className="w-space-2 h-space-2 text-brand-accent" />
              Linked Objects
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-bold">4</span>
          </div>
          <div className="space-y-space-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group p-space-1 rounded-4 border border-transparent hover:border-slate-200 hover:bg-slate-50 cursor-pointer transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-brand-accent">REQ-00{i}</span>
                  <span className="text-[9px] text-slate-400">v1.2</span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  System must support high-concurrency for {activeSection} operations.
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Governance & Approvals */}
        <section className="space-y-space-2">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-space-1">
            <CheckCircle2 className="w-space-2 h-space-2 text-emerald-500" />
            Governance Status
          </h3>
          <div className="p-space-2 rounded-4 bg-emerald-50/50 border border-emerald-100 space-y-space-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-emerald-700 font-medium">Approval State</span>
              <span className="text-emerald-600 font-bold uppercase tracking-tighter">Verified</span>
            </div>
            <div className="w-full bg-emerald-200/50 h-space-0.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-full" />
            </div>
          </div>
        </section>

        {/* Audit History */}
        <section className="space-y-space-2">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-space-1">
            <History className="w-space-2 h-space-2 text-slate-400" />
            Recent History
          </h3>
          <div className="space-y-space-2 relative before:absolute before:left-[7.5px] before:top-space-1 before:bottom-space-1 before:w-[1px] before:bg-slate-100">
            {[1, 2].map((i) => (
              <div key={i} className="relative pl-6">
                <div className="absolute left-0 top-space-0.5 w-space-2 h-space-2 rounded-full border-2 border-white bg-slate-200 z-10" />
                <div className="text-[11px]">
                  <p className="text-slate-900 font-medium">Metadata Updated</p>
                  <p className="text-slate-500 mt-0.5">Hemant Chaudhary • 2h ago</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Panel Footer */}
      <div className="p-space-2 bg-slate-50/50 border-t border-neutral-border">
        <button className="w-full py-space-1 px-space-2 bg-white border border-slate-200 rounded-4 text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-space-1 shadow-sm">
          View Full Traceability
          <ChevronRight className="w-space-1 h-space-1" />
        </button>
      </div>
    </aside>
  );
}
