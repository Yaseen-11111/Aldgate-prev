import { useState, type FormEvent } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { Pencil, X } from 'lucide-react';
import { useInlineEditEnabled } from '@/components/inline-editor';
import { defaultSiteSettings } from '@/hooks/use-site-settings';
import { useToast } from '@/hooks/use-toast';

type Field = { key: string; label: string; value: string; multiline?: boolean; allowEmpty?: boolean; image?: boolean };

export function InlineRecordEditor({ label, endpoint, fields }: { label: string; endpoint: string; fields: Field[] }) {
  const enabled = useInlineEditEnabled();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  if (!enabled) return null;

  const changedFields = fields.filter(field => draft[field.key]?.trim() !== field.value);
  const invalidDraft = fields.some(field => !field.allowEmpty && !draft[field.key]?.trim());

  const begin = () => { setDraft(Object.fromEntries(fields.map(field => [field.key, field.value]))); setOpen(true); };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    const changed = Object.fromEntries(fields.filter(field => draft[field.key]?.trim() !== field.value).map(field => [field.key, draft[field.key]?.trim()]));
    if (!Object.keys(changed).length || changedFields.some(field => !field.image && draft[field.key].length > 2000) || invalidDraft) return;
    setSaving(true);
    try {
      const response = await fetch(endpoint, { method: 'PATCH', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify(changed) });
      if (!response.ok) throw new Error((await response.json().catch(() => null) as { error?: string } | null)?.error || 'Could not save changes.');
      if (endpoint === '/api/admin/site-settings') {
        queryClient.setQueryData(['site-settings'], { ...defaultSiteSettings, ...await response.json() });
      } else if (endpoint.startsWith('/api/products/')) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['/api/products'] }),
          queryClient.invalidateQueries({ queryKey: ['product'] }),
        ]);
      } else {
        await queryClient.invalidateQueries({ queryKey: ['gallery'] });
      }
      setOpen(false);
      toast({ title: `${label} updated` });
    } catch (error) {
      toast({ title: 'Could not save changes', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const uploadImage = async (key: string, file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 25 * 1024 * 1024) { toast({ title: 'Choose a JPG, PNG, WebP or GIF smaller than 25 MB', variant: 'destructive' }); return; }
    setUploading(true);
    try {
      const form = new FormData(); form.append('file', file);
      const response = await fetch('/api/admin/gallery-media', { method: 'POST', body: form, credentials: 'same-origin' });
      if (!response.ok) throw new Error('Could not upload image.');
      const media = await response.json() as { src: string };
      setDraft(current => ({ ...current, [key]: media.src }));
    } catch (error) { toast({ title: error instanceof Error ? error.message : 'Upload failed', variant: 'destructive' }); }
    finally { setUploading(false); }
  };

  return <>
    <button type="button" onClick={event => { event.stopPropagation(); begin(); }} aria-label={`Edit ${label}`} className="ml-2 inline-flex h-8 w-8 align-middle items-center justify-center rounded-full bg-[#B46A3C] text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Pencil className="h-4 w-4" /></button>
    <Dialog.Root open={open} onOpenChange={value => { if (!saving) setOpen(value); }}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-[80] bg-black/50" /><Dialog.Content className="fixed left-1/2 top-1/2 z-[81] w-[min(560px,calc(100vw-2rem))] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-border bg-background p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-4"><Dialog.Title className="font-serif text-2xl">Edit {label}</Dialog.Title><Dialog.Close aria-label="Close editor" className="p-1"><X className="h-5 w-5" /></Dialog.Close></div>
      <Dialog.Description className="mt-2 text-sm text-muted-foreground">Changes appear on the website as soon as you save.</Dialog.Description>
      <form onSubmit={save} className="mt-5 space-y-4">{fields.map(field => <label key={field.key} className="block text-sm font-medium">{field.label}{field.image ? <><img src={draft[field.key]} alt="Category preview" className="mt-2 h-40 w-full object-cover" /><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={event => { const file = event.target.files?.[0]; if (file) void uploadImage(field.key, file); event.target.value = ''; }} className="mt-3 block w-full text-sm" /><span className="mt-1 block text-xs text-muted-foreground">{uploading ? 'Uploading…' : 'Choose a replacement image, then save.'}</span></> : field.multiline ? <textarea value={draft[field.key] ?? ''} onChange={event => setDraft(current => ({ ...current, [field.key]: event.target.value }))} rows={5} maxLength={2000} className="mt-2 w-full border border-input bg-background p-3 font-normal" /> : <input value={draft[field.key] ?? ''} onChange={event => setDraft(current => ({ ...current, [field.key]: event.target.value }))} maxLength={2000} className="mt-2 h-11 w-full border border-input bg-background px-3 font-normal" />}</label>)}<div className="flex justify-end gap-3"><Dialog.Close type="button" className="border border-border px-4 py-2 text-sm">Cancel</Dialog.Close><button type="submit" disabled={saving || uploading || !changedFields.length || invalidDraft} className="bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">{saving ? 'Savingâ€¦' : 'Save changes'}</button></div></form>
    </Dialog.Content></Dialog.Portal></Dialog.Root>
  </>;
}
