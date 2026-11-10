import { createContext, useContext, useState, type FormEvent, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Dialog from '@radix-ui/react-dialog';
import { Check, Pencil, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { defaultSiteSettings, type SiteSettings } from '@/hooks/use-site-settings';
import { useToast } from '@/hooks/use-toast';

type EditRequest = { key: keyof SiteSettings; label: string; value: string; multiline: boolean };
type EditorContextValue = { enabled: boolean; open: (request: EditRequest) => void };
const EditorContext = createContext<EditorContextValue>({ enabled: false, open: () => undefined });
const localPreview = import.meta.env.DEV && import.meta.env.MODE === 'preview-local' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
const canCheckAdmin = window.location.hostname === 'admin.pureshadeblinds.co.uk' || localPreview;

export function InlineEditorProvider({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [enabled, setEnabled] = useState(false);
  const [request, setRequest] = useState<EditRequest | null>(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: identity } = useQuery({
    queryKey: ['admin-identity'],
    queryFn: async () => {
      const response = await fetch('/api/admin/me', { credentials: 'same-origin' });
      return response.ok ? response.json() as Promise<{ email: string }> : null;
    },
    enabled: canCheckAdmin,
    staleTime: 30_000,
    retry: false,
  });
  const isAdmin = !!identity;
  const isStorefront = location !== '/admin';

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!request || !draft.trim() || draft.length > 2000) return;
    setSaving(true);
    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'PATCH', credentials: 'same-origin', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ [request.key]: draft.trim() }),
      });
      if (!response.ok) throw new Error((await response.json().catch(() => null) as { error?: string } | null)?.error || 'Could not save this text.');
      const saved = { ...defaultSiteSettings, ...await response.json() } as SiteSettings;
      queryClient.setQueryData(['site-settings'], saved);
      setRequest(null);
      toast({ title: 'Website text updated' });
    } catch (error) {
      toast({ title: 'Could not save text', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return <EditorContext.Provider value={{ enabled: isAdmin && enabled && isStorefront, open: (next) => { setRequest(next); setDraft(next.value); } }}>
    {children}
    {isAdmin && isStorefront && <button type="button" onClick={() => setEnabled(current => !current)} aria-pressed={enabled} className="fixed bottom-5 left-5 z-[60] inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={enabled ? 'Finish editing this page' : 'Edit this page'}>
      {enabled ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}{enabled ? 'Finish editing' : 'Edit this page'}
    </button>}
    <Dialog.Root open={!!request} onOpenChange={open => { if (!open && !saving) setRequest(null); }}>
      <Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-[80] bg-black/50" /><Dialog.Content className="fixed left-1/2 top-1/2 z-[81] w-[min(520px,calc(100vw-2rem))] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-border bg-background p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4"><Dialog.Title className="font-serif text-2xl">Edit {request?.label}</Dialog.Title><Dialog.Close aria-label="Close editor" className="p-1"><X className="h-5 w-5" /></Dialog.Close></div>
        <Dialog.Description className="mt-2 text-sm text-muted-foreground">Changes appear on the website as soon as you save.</Dialog.Description>
        <form onSubmit={save} className="mt-5 space-y-4"><label className="block text-sm font-medium">{request?.label}{request?.multiline ? <textarea autoFocus value={draft} onChange={event => setDraft(event.target.value)} maxLength={2000} rows={6} className="mt-2 w-full border border-input bg-background p-3 font-normal" /> : <input autoFocus value={draft} onChange={event => setDraft(event.target.value)} maxLength={2000} className="mt-2 h-11 w-full border border-input bg-background px-3 font-normal" />}</label><div className="flex justify-end gap-3"><Dialog.Close type="button" className="border border-border px-4 py-2 text-sm">Cancel</Dialog.Close><button type="submit" disabled={saving || !draft.trim() || draft.trim() === request?.value} className="bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">{saving ? 'Saving…' : 'Save change'}</button></div></form>
      </Dialog.Content></Dialog.Portal>
    </Dialog.Root>
  </EditorContext.Provider>;
}

export function EditableText({ field, label, value, multiline = false }: { field: keyof SiteSettings; label: string; value: string; multiline?: boolean }) {
  const enabled = useInlineEditEnabled();
  return <span className={`relative inline-block align-baseline ${enabled ? 'max-w-[calc(100%-2.5rem)]' : 'max-w-full'}`}><span>{value}</span><InlineEditButton field={field} label={label} value={value} multiline={multiline} positioned /></span>;
}

export function useInlineEditEnabled() { return useContext(EditorContext).enabled; }

export function InlineEditButton({ field, label, value, multiline = false, positioned = false }: { field: keyof SiteSettings; label: string; value: string; multiline?: boolean; positioned?: boolean }) {
  const editor = useContext(EditorContext);
  if (!editor.enabled) return null;
  return <button type="button" onClick={() => editor.open({ key: field, label, value, multiline })} aria-label={`Edit ${label}`} className={`${positioned ? 'absolute left-full top-1/2 -translate-y-1/2' : 'align-middle'} ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#B46A3C] text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}><Pencil className="h-3.5 w-3.5" /></button>;
}
