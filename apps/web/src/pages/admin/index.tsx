import { useEffect, useState } from 'react';
import { ExternalLink, LockKeyhole, LogOut } from 'lucide-react';
import { DashboardStats } from './dashboard-stats';
import { ProductManager } from './product-manager';
import { QuoteRequestsList } from './quote-requests-list';
import { GalleryManager } from './gallery-manager';
import { AppointmentsCalendar } from './appointments-calendar';
import { ActivityLog } from './activity-log';

type AdminView = 'dashboard' | 'gallery' | 'requests' | 'calendar' | 'activity';

const adminHost = 'admin.pureshadeblinds.co.uk';

/**
 * The portal is intentionally served from the Cloudflare Access-protected admin hostname.
 * Access authenticates staff with an email one-time code; this app never handles passwords.
 */
export default function AdminPortal() {
  const [email, setEmail] = useState<string | null>(null);
  const [identityError, setIdentityError] = useState<string | null>(null);
  const [view, setView] = useState<AdminView>('dashboard');
  const isAdminHost = window.location.hostname === adminHost;

  useEffect(() => {
    if (!isAdminHost) return;
    void fetch('/api/admin/me', { credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) {
          const responseBody = await response.json().catch(() => null) as { error?: unknown } | null;
          const message = typeof responseBody?.error === 'string'
            ? responseBody.error
            : 'Your Cloudflare Access session could not be verified.';
          throw new Error(message);
        }
        return response.json() as Promise<{ email: string }>;
      })
      .then((identity) => setEmail(identity.email))
      .catch((error: unknown) => setIdentityError(error instanceof Error ? error.message : 'Your Cloudflare Access session could not be verified.'));
  }, [isAdminHost]);

  const handleLogout = () => {
    // Clear the Access application session without navigating to its managed
    // logout screen, then return the user to the public website.
    void fetch('/cdn-cgi/access/logout', { credentials: 'same-origin' })
      .catch(() => undefined)
      .finally(() => window.location.assign('https://pureshadeblinds.co.uk/'));
  };

  if (!isAdminHost) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-lg border border-border bg-white p-8 text-center shadow-sm">
          <LockKeyhole className="w-8 h-8 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-serif mb-3">Secure admin portal</h1>
          <p className="text-muted-foreground mb-6">Admin access uses a verified, one-time code from Cloudflare Access. Passwords are not stored by this website.</p>
          <a href={`https://${adminHost}/admin`} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 font-medium hover:bg-primary/90">
            Continue to secure sign-in <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  if (identityError) {
    return <div className="container mx-auto px-4 py-20 text-center text-destructive">{identityError}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-border pb-6 gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-2">Admin Portal</h1>
          <p className="text-foreground/70 font-light">Manage catalog, gallery, and quote requests.</p>
        </div>
          <div className="flex items-center gap-4">
          {email && <span className="hidden lg:block text-xs text-muted-foreground">Signed in as {email}</span>}
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
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Calendar
            </button>
            <button
              onClick={() => setView('activity')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${view === 'activity' ? 'bg-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Activity
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
      ) : view === 'calendar' ? (
        <AppointmentsCalendar />
      ) : view === 'activity' ? (
        <ActivityLog />
      ) : (
        <QuoteRequestsList />
      )}
    </div>
  );
}
