import { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Maximize2, Play, X } from 'lucide-react';
import { getGallery, type GalleryItem, type GalleryMedia } from '@/lib/gallery-api';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { EditableText } from '@/components/inline-editor';
import { InlineRecordEditor } from '@/components/inline-record-editor';

type SelectedMedia = { item: GalleryItem; index: number; label: string };

export default function Gallery() {
  const { data: gallery = [], isLoading } = useQuery({ queryKey: ['gallery'], queryFn: getGallery });
  const [selected, setSelected] = useState<SelectedMedia | null>(null);
  const { data: settings } = useSiteSettings();

  const opener = useRef<HTMLButtonElement>(null);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="mb-12 md:mb-16 border-b border-border pb-8">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-accent mb-3">Recent projects</p>
        <h1 className="text-4xl md:text-6xl font-serif mb-4"><EditableText field="galleryHeading" label="gallery heading" value={settings.galleryHeading} /></h1>
        <p className="text-foreground/70 font-light max-w-xl"><EditableText field="galleryDescription" label="gallery introduction" value={settings.galleryDescription} multiline /></p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="aspect-[4/3] bg-muted animate-pulse" />)}</div>
      ) : gallery.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {gallery.map((item, position) => {
            const label = item.description.trim() || `Project ${position + 1}`;
            return <GalleryCard key={item.id} item={item} label={label} onOpen={(index, button) => {
              opener.current = button;
              setSelected({ item, index, label });
            }} />;
          })}
        </div>
      ) : <div className="py-20 border border-dashed border-border text-center text-muted-foreground">Our gallery is being updated. Please check back soon.</div>}

      {selected && <Lightbox selected={selected} onClose={() => setSelected(null)} restoreFocus={() => opener.current?.focus()} onIndexChange={(index) => setSelected((current) => current && ({ ...current, index }))} />}
    </div>
  );
}

function GalleryCard({ item, label, onOpen }: { item: GalleryItem; label: string; onOpen: (index: number, button: HTMLButtonElement) => void }) {
  const [index, setIndex] = useState(0);
  const media = item.media[index] ?? item.media[0];
  if (!media) return null;
  const move = (direction: number) => setIndex((current) => (current + direction + item.media.length) % item.media.length);

  return (
    <div className="group relative aspect-[4/3] overflow-hidden bg-muted">
      <button type="button" aria-label={`Open gallery project: ${label}`} onClick={event => onOpen(index, event.currentTarget)} className="absolute inset-0 z-[1] w-full cursor-pointer focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary" />
      <MediaPreview media={media} alt={label} className="transition-transform duration-500 group-hover:scale-[1.03]" />
      <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
      {item.media.length > 1 && <>
        <button type="button" onClick={() => move(-1)} className="absolute z-10 left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white flex items-center justify-center" aria-label="Previous image or video"><ChevronLeft className="w-4 h-4" /></button>
        <button type="button" onClick={() => move(1)} className="absolute z-10 right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white flex items-center justify-center" aria-label="Next image or video"><ChevronRight className="w-4 h-4" /></button>
        <span className="absolute left-1/2 -translate-x-1/2 bottom-3 bg-black/65 text-white text-xs px-2.5 py-1">{index + 1} / {item.media.length}</span>
      </>}
      {media.type === 'video' && <span className="absolute left-3 bottom-3 w-9 h-9 bg-white/90 flex items-center justify-center"><Play className="w-4 h-4 fill-current" /></span>}
      <span className="absolute right-4 top-4 w-9 h-9 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Maximize2 className="w-4 h-4" /></span>
      <span className="absolute bottom-3 left-3 z-10"><InlineRecordEditor label="gallery caption" endpoint={`/api/gallery/${item.id}`} fields={[{ key: 'description', label: 'Description', value: item.description, multiline: true, allowEmpty: true }]} /></span>
    </div>
  );
}

function Lightbox({ selected, onClose, restoreFocus, onIndexChange }: { selected: SelectedMedia; onClose: () => void; restoreFocus: () => void; onIndexChange: (index: number) => void }) {
  const { item, index, label } = selected;
  const media = item.media[index];
  const move = (direction: number) => onIndexChange((index + direction + item.media.length) % item.media.length);

  return (
    <Dialog.Root open onOpenChange={open => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          onCloseAutoFocus={event => { event.preventDefault(); restoreFocus(); }}
          onKeyDown={event => {
            if (item.media.length < 2 || event.target instanceof HTMLVideoElement) return;
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
              event.preventDefault();
              move(event.key === 'ArrowLeft' ? -1 : 1);
            }
          }}
          className="fixed left-1/2 top-1/2 z-[71] flex max-h-[90dvh] w-max max-w-[min(72rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-auto bg-background shadow-2xl md:flex-row"
        >
        <Dialog.Title className="sr-only">{label}</Dialog.Title>
        <Dialog.Close aria-label="Close media viewer" className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center bg-background/90 hover:bg-background"><X className="h-5 w-5" /></Dialog.Close>
        <div className="relative bg-black flex items-center justify-center min-w-0">
          <MediaPreview media={media} alt={label} className="max-h-[75vh] md:max-h-[82vh] w-auto max-w-full object-contain" controls />
          {item.media.length > 1 && <>
            <button type="button" onClick={() => move(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white flex items-center justify-center" aria-label="Previous image or video"><ChevronLeft className="w-5 h-5" /></button>
            <button type="button" onClick={() => move(1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white flex items-center justify-center" aria-label="Next image or video"><ChevronRight className="w-5 h-5" /></button>
            <span className="absolute left-1/2 -translate-x-1/2 bottom-3 bg-black/65 text-white text-xs px-2.5 py-1">{index + 1} / {item.media.length}</span>
          </>}
        </div>
        {item.description.trim() && <div className="md:w-72 p-6 md:p-8 shrink-0 self-stretch flex items-center"><p className="text-foreground/75 font-light leading-relaxed">{item.description}</p></div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function MediaPreview({ media, alt, className, controls = false }: { media: GalleryMedia; alt: string; className?: string; controls?: boolean }) {
  return media.type === 'video'
    ? <video src={media.src} aria-label={alt} className={`w-full h-full object-cover ${className ?? ''}`} controls={controls} playsInline preload="metadata" />
    : <img src={media.src} alt={alt} loading={controls ? "eager" : "lazy"} decoding="async" className={`w-full h-full object-cover ${className ?? ''}`} />;
}
