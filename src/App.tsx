import { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { ToastContainer } from './components/ui/Toast';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { Quotes } from './pages/Quotes';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { ClientDetail } from './pages/ClientDetail';
import { Invoices } from './pages/Invoices';
import { Settings } from './pages/Settings';
import { UnitEconomics } from './pages/UnitEconomics';
import { Documents } from './pages/Documents';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#dashboard');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Dispatch save event
        window.dispatchEvent(new CustomEvent('app-save'));
      }
      
      // Ctrl/Cmd + K: Search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        searchInput?.focus();
      }

      // Ctrl/Cmd + N: New Item
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        // Depending on current path, trigger new item
        if (currentPath === '#quotes') window.dispatchEvent(new CustomEvent('app-new-quote'));
        if (currentPath === '#clients') window.dispatchEvent(new CustomEvent('app-new-client'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPath]);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash || '#dashboard');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderContent = () => {
    if (currentPath.startsWith('#projects/')) {
      return <ProjectDetail />;
    }
    
    if (currentPath.startsWith('#clients/')) {
      return <ClientDetail />;
    }

    switch (currentPath) {
      case '#dashboard':
        return <Dashboard />;
      case '#clients':
        return <Clients />;
      case '#quotes':
        return <Quotes />;
      case '#projects':
        return <Projects />;
      case '#invoices':
        return <Invoices />;
      case '#economics':
        return <UnitEconomics />;
      case '#documents':
        return <Documents />;
      case '#settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderContent()}
      <ToastContainer />
    </Layout>
  );
}

export default App;
