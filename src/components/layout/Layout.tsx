import React from 'react';
import { Sidebar } from './Sidebar';
import { Search, Bell, Plus } from 'lucide-react';
import { Button } from '../ui/Button';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-neutral-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Search everything (⌘K)"
                className="w-full pl-10 pr-4 py-2 bg-neutral-100 border-transparent rounded-md text-sm focus:bg-white focus:border-primary-500 focus:ring-0 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button intent="secondary" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Quick Action
            </Button>
            <button className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>
        
        {/* Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
