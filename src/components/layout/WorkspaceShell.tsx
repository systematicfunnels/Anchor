import React, { FC, ReactNode } from 'react'
import LifecycleExplorer from './LifecycleExplorer'
import TopBar from './TopBar'
import EvidencePanel from './EvidencePanel'
import SystemFooter from './SystemFooter'

interface WorkspaceShellProps {
  children: ReactNode
  activeSection: string
  onSectionChange: (section: string) => void
}

export default function WorkspaceShell({ children, activeSection, onSectionChange }: WorkspaceShellProps) {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-neutral-surface font-sans">
      {/* Main Workspace Area */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        {/* Left: Lifecycle Explorer (Context Selection) */}
        <LifecycleExplorer activeSection={activeSection} onSectionChange={onSectionChange} />
        
        {/* Center + Top: Primary Content Area */}
        <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden bg-white">
          <TopBar activeSection={activeSection} />
          
          <main className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Context Header (Optional but good for IDE feel) */}
            <div className="h-space-4 border-b border-neutral-border bg-slate-50/30 flex items-center px-space-3 gap-space-1">
              <span className="text-[10px] text-slate-400 font-medium">Workspace</span>
              <span className="text-slate-300">/</span>
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">{activeSection}</span>
            </div>

            <div key={activeSection} className="p-space-3 animate-in fade-in slide-in-from-bottom-1 duration-300 fill-mode-both">
              <div className="max-w-enterprise mx-auto">
                {children}
              </div>
            </div>
          </main>
        </div>

        {/* Right: Evidence & Context Panel (Supporting Truth) */}
        <EvidencePanel activeSection={activeSection} />
      </div>

      {/* Global Status Footer */}
      <SystemFooter />
    </div>
  );
}
