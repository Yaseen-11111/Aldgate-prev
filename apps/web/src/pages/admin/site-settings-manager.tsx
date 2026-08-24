import { useEffect, useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { defaultSiteSettings, type SiteSettings, useSiteSettings } from '@/hooks/use-site-settings';

const fields: Array<{ key: keyof SiteSettings; label: string; multiline?: boolean; hint?: string }> = [
  { key: 'phoneDisplay', label: 'Phone number shown on the website' },
  { key: 'whatsAppNumber', label: 'WhatsApp number (international digits only)', hint: 'Example: 447545953546' },
  { key: 'instagramUrl', label: 'Instagram link', hint: 'Leave blank to hide it.' },
  { key: 'facebookUrl', label: 'Facebook link', hint: 'Leave blank to hide it.' },
  { key: 'heroTitle', label: 'Homepage hero heading', multiline: true },
  { key: 'heroDescription', label: 'Homepage hero text', multiline: true },
  { key: 'heroPrimaryLabel', label: 'Homepage collection button label' },
  { key: 'heroBookingLabel', label: 'Homepage booking button label' },
  { key: 'processHeading', label: 'Homepage process heading' },
  { key: 'processDescription', label: 'Homepage process text', multiline: true },
  { key: 'collectionHeading', label: 'Collection page heading' },
  { key: 'collectionDescription', label: 'Collection page introduction', multiline: true },
  { key: 'galleryHeading', label: 'Gallery page heading' },
  { key: 'galleryDescription', label: 'Gallery page introduction', multiline: true },
  { key: 'processPageHeading', label: 'Our Process page heading' },
  { key: 'processPageDescription', label: 'Our Process page introduction', multiline: true },
  { key: 'footerDescription', label: 'Footer description', multiline: true },
];

export function SiteSettingsManager() {
  const queryClient = useQueryClient();
  const { data: remoteSettings } = useSiteSettings();
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => setSettings(remoteSettings), [remoteSettings]);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error((await response.json().catch(() => null) as { error?: string } | null)?.error ?? 'Could not save settings.');
      const saved = { ...defaultSiteSettings, ...await response.json() } as SiteSettings;
      setSettings(saved);
      queryClient.setQueryData(['site-settings'], saved);
      setMessage('Website settings saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-3xl font-serif mb-2">Website content</h2>
        <p className="text-foreground/70 font-light">Update the public contact details, social links, and the main headings and copy without editing code.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-border bg-white p-5 md:p-8">
        {fields.map(({ key, label, multiline, hint }) => (
          <label key={key} className={`block ${multiline ? 'md:col-span-2' : ''}`}>
            <span className="block text-sm font-medium mb-2">{label}</span>
            {multiline ? (
              <textarea value={settings[key]} onChange={(event) => setSettings((current) => ({ ...current, [key]: event.target.value }))} rows={4} maxLength={2000} className="w-full border border-input bg-background px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring" />
            ) : (
              <input value={settings[key]} onChange={(event) => setSettings((current) => ({ ...current, [key]: event.target.value }))} maxLength={2000} className="h-10 w-full border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            )}
            {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
          </label>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <button type="submit" disabled={saving} className="inline-flex h-12 items-center justify-center gap-2 bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"><Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save website settings'}</button>
        {message && <p className="text-sm text-muted-foreground" role="status">{message}</p>}
      </div>
    </form>
  );
}
