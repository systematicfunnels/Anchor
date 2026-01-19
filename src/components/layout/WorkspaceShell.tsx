import React, { FC, ReactNode } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

interface WorkspaceShellProps {
  children: ReactNode
  activeSection: string
  onSectionChange: (section: string) => void
}

export default function WorkspaceShell({ children, activeSection, onSectionChange }: WorkspaceShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-surface">
      <Sidebar activeSection={activeSection} onSectionChange={onSectionChange} />
      
      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        <TopBar activeSection={activeSection} />
        
        <main className="flex-1 overflow-y-auto p-space-4 custom-scrollbar">
          <div key={activeSection} className="max-w-enterprise mx-auto layout-grid animate-in fade-in duration-200 fill-mode-both">
            <div className="col-span-12">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
