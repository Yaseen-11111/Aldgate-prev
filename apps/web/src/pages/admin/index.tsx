import { useState, useEffect } from 'react';
import { setAuthTokenGetter } from '@workspace/api-client-react';
import { LogOut } from 'lucide-react';
import { LoginForm } from './login-form';
import { DashboardStats } from './dashboard-stats';
import { ProductManager } from './product-manager';
import { QuoteRequestsList } from './quote-requests-list';
import { GalleryManager } from './gallery-manager';

type AdminView = 'dashboard' | 'gallery' | 'requests';

/** Admin portal entry point: gates access behind a login form, then hosts the catalog and consultations views. */
export default function AdminPortal() {
  const [token, setToken] = useState<string | null>(sessionStorage.getItem('adminToken'));
  const [view, setView] = useState<AdminView>('dashboard');

  useEffect(() => {
    setAuthTokenGetter(token ? () => token : null);
  }, [token]);

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    setToken(null);
  };

  if (!token) {
    return <LoginForm onLoggedIn={setToken} />;
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-border pb-6 gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-2">Admin Portal</h1>
          <p className="text-foreground/70 font-light">Manage catalog, gallery, and quote requests.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex p-1 bg-muted">
            <button
              onClick={() => setView('dashboard')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${view === 'dashboard' ? 'bg-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Catalog
            </button>
            <button
              onClick={() => setView('requests')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${view === 'requests' ? 'bg-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Consultations
            </button>
            <button
              onClick={() => setView('gallery')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${view === 'gallery' ? 'bg-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Gallery
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors ml-4"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {view === 'dashboard' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <DashboardStats />
          </div>
          <div className="lg:col-span-2">
            <ProductManager />
          </div>
        </div>
      ) : view === 'gallery' ? (
        <GalleryManager />
      ) : (
        <QuoteRequestsList />
      )}
    </div>
  );
}
