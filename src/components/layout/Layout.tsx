import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Search, Bell, FilePlus, User, Briefcase, FileText, Menu, Globe, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { QuoteModal } from '../quotes/QuoteModal';
import { useStore } from '../../store/useStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useCurrency } from '../../hooks/useCurrency';
import { cn } from '../../lib/utils';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { clients, projects, quotes, fetchSettings } = useStore();
  const { history, markAllAsRead, clearHistory } = useNotificationStore();
  const { 
    globalCurrency, 
    effectiveCurrency, 
    setViewCurrency, 
    isViewMode, 
    currencies 
  } = useCurrency();

  useEffect(() => {
    fetchSettings();
  }, []);

  const unreadCount = history.filter(n => !n.isRead).length;

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();
    
    return {
      clients: clients.filter(c => c.name.toLowerCase().includes(query)).slice(0, 3),
      projects: projects.filter(p => p.name.toLowerCase().includes(query)).slice(0, 3),
      quotes: quotes.filter(q => q.name.toLowerCase().includes(query)).slice(0, 3),
    };
  }, [searchQuery, clients, projects, quotes]);

  const navigate = (path: string) => {
    window.location.hash = path;
    setIsSearchOpen(false);
    setIsNotificationsOpen(false);
    setSearchQuery('');
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar - Mobile Overlay */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        <div className={`absolute left-0 top-0 bottom-0 w-[var(--sidebar-width)] transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar onNavigate={() => setIsMobileMenuOpen(false)} />
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      <main className="flex-1 lg:ml-[var(--sidebar-width)] flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-[var(--topbar-height)] bg-white border-b border-neutral-200 px-[var(--spacing-app-side)] flex items-center justify-between sticky top-0 z-20 gap-4 flex-shrink-0">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-neutral-500 hover:bg-neutral-100 rounded-md"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Currency Switcher (View Mode / Exchange Check) */}
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all",
              isViewMode 
                ? "bg-amber-50 border-amber-200 ring-2 ring-amber-500/20 shadow-sm" 
                : "bg-neutral-100 border-transparent hover:border-neutral-200"
            )}>
              <Globe className={cn("w-4 h-4", isViewMode ? "text-amber-600" : "text-neutral-500")} />
              <div className="flex flex-col -my-1">
                {isViewMode && (
                  <span className="text-[8px] font-black text-amber-600 uppercase leading-none mb-0.5 tracking-tighter">
                    Exchange Mode
                  </span>
                )}
                <select 
                  value={effectiveCurrency}
                  onChange={(e) => setViewCurrency(e.target.value as any)}
                  className={cn(
                    "bg-transparent text-sm font-bold outline-none cursor-pointer leading-none",
                    isViewMode ? "text-amber-900" : "text-neutral-700"
                  )}
                  title={isViewMode ? `Converting from ${globalCurrency} to ${effectiveCurrency}` : "Check exchange rate"}
                >
                  {currencies.map(c => (
                    <option key={c} value={c}>
                      {c} {c === globalCurrency ? '(Base)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              {isViewMode && (
                <button 
                  onClick={() => setViewCurrency(null)}
                  className="ml-1 p-0.5 hover:bg-amber-100 rounded-full text-amber-600 transition-colors"
                  title="Reset to base currency"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Search everything (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-100 border-transparent rounded-md text-sm focus:bg-white focus:border-primary-500 focus:ring-0 transition-all"
              />

              {/* Search Results Dropdown */}
              {isSearchOpen && searchQuery && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsSearchOpen(false)} />
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-lg shadow-xl z-20 overflow-hidden max-h-[80vh] overflow-y-auto">
                    {searchResults && (Object.values(searchResults).some(arr => arr.length > 0) ? (
                      <div className="p-2 space-y-4">
                        {searchResults.clients.length > 0 && (
                          <div>
                            <p className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Clients</p>
                            {searchResults.clients.map(c => (
                              <button key={c.id} onClick={() => navigate(`#clients/${c.id}`)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 rounded-md text-sm text-left">
                                <User className="w-4 h-4 text-neutral-400" />
                                <span className="font-medium">{c.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {searchResults.projects.length > 0 && (
                          <div>
                            <p className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Projects</p>
                            {searchResults.projects.map(p => (
                              <button key={p.id} onClick={() => navigate(`#projects/${p.id}`)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 rounded-md text-sm text-left">
                                <Briefcase className="w-4 h-4 text-neutral-400" />
                                <span className="font-medium">{p.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {searchResults.quotes.length > 0 && (
                          <div>
                            <p className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Quotes</p>
                            {searchResults.quotes.map(q => (
                              <button key={q.id} onClick={() => navigate(`#quotes`)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 rounded-md text-sm text-left">
                                <FileText className="w-4 h-4 text-neutral-400" />
                                <span className="font-medium">{q.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-neutral-500 text-sm">No results found for "{searchQuery}"</div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              intent="secondary" 
              size="sm" 
              className="gap-2"
              onClick={() => setIsQuoteModalOpen(true)}
            >
              <FilePlus className="w-4 h-4" />
              New Quote
            </Button>
            
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  if (!isNotificationsOpen) markAllAsRead();
                }}
                className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Popover */}
              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)} />
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-neutral-200 rounded-lg shadow-xl z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                      <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-tight">Notifications</h3>
                      <button onClick={clearHistory} className="text-[10px] font-bold text-neutral-400 hover:text-neutral-600 uppercase">Clear All</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto divide-y divide-neutral-100">
                      {history.length > 0 ? history.map(n => (
                        <div key={n.id} className={`p-4 flex gap-3 ${n.isRead ? 'opacity-60' : 'bg-primary-50/10'}`}>
                          <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                            n.type === 'success' ? 'bg-green-500' :
                            n.type === 'error' ? 'bg-red-500' :
                            n.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm text-neutral-900 leading-snug">{n.message}</p>
                            <p className="text-[10px] text-neutral-400 mt-1 font-medium">{new Date(n.createdAt).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      )) : (
                        <div className="p-8 text-center text-neutral-500 text-sm italic">No notifications yet</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto scroll-smooth">
          {children}
        </div>

        <QuoteModal 
          isOpen={isQuoteModalOpen} 
          onClose={() => setIsQuoteModalOpen(false)} 
        />
      </main>
    </div>
  );
};
