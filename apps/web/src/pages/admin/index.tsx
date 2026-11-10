import { useEffect, useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ExternalLink, LockKeyhole, LogOut } from 'lucide-react';
import { DashboardStats } from './dashboard-stats';
import { ProductManager } from './product-manager';
import { QuoteRequestsList } from './quote-requests-list';
import { GalleryManager } from './gallery-manager';
import { AppointmentsCalendar } from './appointments-calendar';
import { ActivityLog } from './activity-log';
import { SiteSettingsManager } from './site-settings-manager';

type AdminView = 'dashboard' | 'gallery' | 'requests' | 'calendar' | 'activity' | 'site';

const adminHost = 'admin.pureshadeblinds.co.uk';
const localPreview = import.meta.env.DEV && import.meta.env.MODE === 'preview-local' && ['localhost', '127.0.0.1'].includes(window.location.hostname);

/**
 * The portal is intentionally served from the Cloudflare Access-protected admin hostname.
 * Access authenticates staff with an email one-time code; this app never handles passwords.
 */
export default function AdminPortal() {
  const [email, setEmail] = useState<string | null>(null);
  const [identityError, setIdentityError] = useState<string | null>(null);
  const [view, setView] = useState<AdminView>('dashboard');
  const [loadingIdentity, setLoadingIdentity] = useState(true);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState<{ refreshedAt: string | null; importedAt: string | null; requests: number } | null>(null);
  const queryClient = useQueryClient();
  const isAdminHost = window.location.hostname === adminHost || localPreview;

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
      .catch((error: unknown) => { if (!localPreview) setIdentityError(error instanceof Error ? error.message : 'Your Cloudflare Access session could not be verified.'); })
      .finally(() => setLoadingIdentity(false));
  }, [isAdminHost]);

  useEffect(() => {
    if (localPreview && email) void fetch('/api/local/status').then(r => r.json()).then(setLocalStatus);
  }, [email]);

  const localLogin = async (event: FormEvent) => {
    event.preventDefault(); setIdentityError(null);
    const response = await fetch('/api/local/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username, password }) });
    if (!response.ok) { setIdentityError('Invalid local username or password.'); return; }
    setEmail('admin (local preview)'); setPassword(''); void queryClient.invalidateQueries({ queryKey: ['admin-identity'] });
  };

  const refreshPublic = async () => {
    setLocalMessage('Refreshing live public content…');
    try { const response = await fetch('/api/local/refresh-public', { method: 'POST' }); if (!response.ok) throw new Error((await response.json()).error); const result = await response.json(); setLocalMessage(`Copied ${result.products} products and ${result.gallery} gallery cards.`); setLocalStatus(current => current ? { ...current, refreshedAt: result.refreshedAt } : current); await queryClient.invalidateQueries(); }
    catch (error) { setLocalMessage(error instanceof Error ? error.message : 'Refresh failed.'); }
  };

  const importConsultations = async (file: File) => {
    setLocalMessage('Importing consultation copy…');
    try { const response = await fetch('/api/local/import-consultations', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ csv: await file.text() }) }); if (!response.ok) throw new Error((await response.json()).error); const result = await response.json(); setLocalMessage(`Imported ${result.requests} consultations into local preview.`); setLocalStatus(current => current ? { ...current, importedAt: result.importedAt, requests: result.requests } : current); await queryClient.invalidateQueries(); }
    catch (error) { setLocalMessage(error instanceof Error ? error.message : 'Import failed.'); }
  };

  const handleLogout = () => {
    if (localPreview) { setEmail(null); queryClient.setQueryData(['admin-identity'], null); void fetch('/api/local/logout', { method: 'POST' }).finally(() => queryClient.setQueryData(['admin-identity'], null)); return; }
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

  if (identityError && !localPreview) {
    return <div className="container mx-auto px-4 py-20 text-center text-destructive">{identityError}</div>;
  }

  if (loadingIdentity) return <div className="container mx-auto px-4 py-20">Checking admin access…</div>;

  if (localPreview && !email) return <form onSubmit={localLogin} className="mx-auto my-16 max-w-sm space-y-4 border border-border bg-white p-8"><h1 className="text-3xl font-serif">Local preview sign-in</h1><p className="text-sm text-muted-foreground">This preview is isolated from the live admin site.</p><label className="block text-sm">Username<input className="mt-1 h-11 w-full border border-input px-3" value={username} onChange={event => setUsername(event.target.value)} autoComplete="username" /></label><label className="block text-sm">Password<input className="mt-1 h-11 w-full border border-input px-3" type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" /></label><button type="submit" className="h-11 w-full bg-primary text-primary-foreground">Sign in</button>{identityError && <p role="alert" className="text-sm text-destructive">{identityError}</p>}</form>;

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      {localPreview && <div className="mb-8 space-y-3 border border-accent bg-secondary p-5"><p className="font-medium">Local preview · edits stay on this computer</p><p className="text-sm text-muted-foreground">Public copy: {localStatus?.refreshedAt ? new Date(localStatus.refreshedAt).toLocaleString() : 'not copied yet'}. Consultations: {localStatus?.importedAt ? `${localStatus.requests} imported ${new Date(localStatus.importedAt).toLocaleString()}` : 'import consultations.csv from the live admin Consultations tab'}.</p><div className="flex flex-wrap items-center gap-3"><button type="button" onClick={() => void refreshPublic()} className="border border-border bg-white px-4 py-2 text-sm">Refresh live public content</button><label className="cursor-pointer border border-border bg-white px-4 py-2 text-sm">Import consultations.csv<input type="file" accept=".csv,text/csv" className="sr-only" onChange={event => { const file = event.target.files?.[0]; if (file) void importConsultations(file); event.target.value = ''; }} /></label><a href="https://admin.pureshadeblinds.co.uk/admin" target="_blank" rel="noopener noreferrer" className="text-sm underline">Open live admin to export CSV</a></div>{localMessage && <p role="status" className="text-sm">{localMessage}</p>}</div>}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-border pb-6 gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-2">Admin Portal</h1>
          <p className="text-foreground/70 font-light">Manage catalog, gallery, and quote requests.</p>
          <a href="/" className="mt-3 inline-flex items-center gap-2 text-sm underline underline-offset-4">Open website to edit on the page <ExternalLink className="h-4 w-4" /></a>
        </div>
          <div className="flex w-full md:w-auto flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          {email && <span className="hidden lg:block text-xs text-muted-foreground">Signed in as {email}</span>}
          <div className="flex max-w-full overflow-x-auto p-1 bg-muted">
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
            <button
              onClick={() => setView('site')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${view === 'site' ? 'bg-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Website
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
      ) : view === 'site' ? (
        <SiteSettingsManager />
      ) : (
        <QuoteRequestsList />
      )}
    </div>
  );
}
