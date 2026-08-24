import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Maximize2, Play, X } from 'lucide-react';
import { getGallery, type GalleryItem, type GalleryMedia } from '@/lib/gallery-api';

type SelectedMedia = { item: GalleryItem; index: number };

export default function Gallery() {
  const { data: gallery = [], isLoading } = useQuery({ queryKey: ['gallery'], queryFn: getGallery });
  const [selected, setSelected] = useState<SelectedMedia | null>(null);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
      if (!selected || selected.item.media.length < 2) return;
      if (event.key === 'ArrowLeft') setSelected((current) => current && ({ ...current, index: (current.index - 1 + current.item.media.length) % current.item.media.length }));
      if (event.key === 'ArrowRight') setSelected((current) => current && ({ ...current, index: (current.index + 1) % current.item.media.length }));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selected]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="mb-12 md:mb-16 border-b border-border pb-8">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-accent mb-3">Recent projects</p>
        <h1 className="text-4xl md:text-6xl font-serif mb-4">Our Work</h1>
        <p className="text-foreground/70 font-light max-w-xl">A selection of blinds and shutters we have fitted in homes across the area.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="aspect-[4/3] bg-muted animate-pulse" />)}</div>
      ) : gallery.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {gallery.map((item) => <GalleryCard key={item.id} item={item} onOpen={(index) => setSelected({ item, index })} />)}
        </div>
      ) : <div className="py-20 border border-dashed border-border text-center text-muted-foreground">Our gallery is being updated. Please check back soon.</div>}

      {selected && <Lightbox selected={selected} onClose={() => setSelected(null)} onIndexChange={(index) => setSelected((current) => current && ({ ...current, index }))} />}
    </div>
  );
}

function GalleryCard({ item, onOpen }: { item: GalleryItem; onOpen: (index: number) => void }) {
  const [index, setIndex] = useState(0);
  const media = item.media[index] ?? item.media[0];
  if (!media) return null;
  const move = (direction: number) => setIndex((current) => (current + direction + item.media.length) % item.media.length);

  return (
    <div role="button" tabIndex={0} onClick={() => onOpen(index)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen(index); } }} className="group relative aspect-[4/3] overflow-hidden bg-muted text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      <MediaPreview media={media} alt={item.description || 'Completed Pure Shade Blinds project'} className="transition-transform duration-500 group-hover:scale-[1.03]" />
      <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
      {item.media.length > 1 && <>
        <button type="button" onClick={(event) => { event.stopPropagation(); move(-1); }} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white flex items-center justify-center" aria-label="Previous image or video"><ChevronLeft className="w-4 h-4" /></button>
        <button type="button" onClick={(event) => { event.stopPropagation(); move(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white flex items-center justify-center" aria-label="Next image or video"><ChevronRight className="w-4 h-4" /></button>
        <span className="absolute left-1/2 -translate-x-1/2 bottom-3 bg-black/65 text-white text-xs px-2.5 py-1">{index + 1} / {item.media.length}</span>
      </>}
      {media.type === 'video' && <span className="absolute left-3 bottom-3 w-9 h-9 bg-white/90 flex items-center justify-center"><Play className="w-4 h-4 fill-current" /></span>}
      <span className="absolute right-4 top-4 w-9 h-9 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Maximize2 className="w-4 h-4" /></span>
    </div>
  );
}

function Lightbox({ selected, onClose, onIndexChange }: { selected: SelectedMedia; onClose: () => void; onIndexChange: (index: number) => void }) {
  const { item, index } = selected;
  const media = item.media[index];
  const move = (direction: number) => onIndexChange((index + direction + item.media.length) % item.media.length);

  return (
    <div className="fixed inset-0 z-[70] p-4 sm:p-8 bg-black/70 backdrop-blur-sm flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Gallery media viewer">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close media viewer" onClick={onClose} />
      <div className="relative z-10 max-w-6xl max-h-full bg-background shadow-2xl flex flex-col md:flex-row overflow-auto">
        <div className="relative bg-black flex items-center justify-center min-w-0">
          <MediaPreview media={media} alt={item.description || 'Completed Pure Shade Blinds project'} className="max-h-[75vh] md:max-h-[82vh] w-auto max-w-full object-contain" controls />
          {item.media.length > 1 && <>
            <button type="button" onClick={() => move(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white flex items-center justify-center" aria-label="Previous image or video"><ChevronLeft className="w-5 h-5" /></button>
            <button type="button" onClick={() => move(1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white flex items-center justify-center" aria-label="Next image or video"><ChevronRight className="w-5 h-5" /></button>
            <span className="absolute left-1/2 -translate-x-1/2 bottom-3 bg-black/65 text-white text-xs px-2.5 py-1">{index + 1} / {item.media.length}</span>
          </>}
        </div>
        {item.description.trim() && <div className="md:w-72 p-6 md:p-8 shrink-0 self-stretch flex items-center"><p className="text-foreground/75 font-light leading-relaxed">{item.description}</p></div>}
        <button type="button" onClick={onClose} className="absolute top-3 right-3 w-10 h-10 bg-background/90 hover:bg-background flex items-center justify-center transition-colors" aria-label="Close media viewer"><X className="w-5 h-5" /></button>
      </div>
    </div>
  );
}

function MediaPreview({ media, alt, className, controls = false }: { media: GalleryMedia; alt: string; className?: string; controls?: boolean }) {
  return media.type === 'video'
    ? <video src={media.src} aria-label={alt} className={`w-full h-full object-cover ${className ?? ''}`} controls={controls} playsInline preload="metadata" />
    : <img src={media.src} alt={alt} className={`w-full h-full object-cover ${className ?? ''}`} />;
}
