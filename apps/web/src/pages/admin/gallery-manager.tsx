import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronLeft, ChevronRight, GripVertical, Play, Plus, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createGalleryItem, deleteGalleryItem, getGallery, reorderGalleryItems, updateGalleryItem, uploadGalleryMedia, type GalleryItem } from '@/lib/gallery-api';
import { MediaDropzone } from './media-dropzone.tsx';

const galleryKey = ['gallery'];

export function GalleryManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const { data: items = [], isLoading } = useQuery({ queryKey: galleryKey, queryFn: getGallery });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const refresh = () => queryClient.invalidateQueries({ queryKey: galleryKey });

  const handleUploadNewCards = async (files: File[]) => {
    setIsUploading(true);
    try {
      for (const file of files) {
        await createGalleryItem({ media: [await uploadGalleryMedia(file)], description: '' });
      }
      await refresh();
      toast({ title: `${files.length} gallery card${files.length === 1 ? '' : 's'} added` });
    } catch (error) {
      toast({ title: 'Upload failed', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const ordered = arrayMove(items, items.findIndex((item) => item.id === active.id), items.findIndex((item) => item.id === over.id));
    queryClient.setQueryData(galleryKey, ordered);
    try {
      await reorderGalleryItems(ordered.map((item) => item.id));
    } catch (error) {
      await refresh();
      toast({ title: 'Could not reorder gallery', description: error instanceof Error ? error.message : undefined, variant: 'destructive' });
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Remove this entire gallery card and all its media?')) return;
    try {
      await deleteGalleryItem(id);
      await refresh();
      toast({ title: 'Gallery card removed' });
    } catch (error) {
      toast({ title: 'Could not remove card', description: error instanceof Error ? error.message : undefined, variant: 'destructive' });
    }
  };

  return (
      <div className="space-y-8">
        <MediaDropzone
            onFilesSelected={handleUploadNewCards}
            isUploading={isUploading}
            title="Add gallery cards"
            description="Drop images or videos here. Use “Add media” on a card to group several files into one carousel."
        />

        <div>
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-2xl font-serif">Gallery order</h2>
              <p className="text-sm text-muted-foreground mt-1">Drag cards to reorder them. Each card can contain a carousel of images or videos.</p>
            </div>
            {items.length > 0 && <span className="text-sm text-muted-foreground">{items.length} card{items.length === 1 ? '' : 's'}</span>}
          </div>
          {isLoading ? (
              <div className="h-40 bg-muted animate-pulse" />
          ) : items.length > 0 ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => { void handleDragEnd(event); }}>
                <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {items.map((item) => (
                        <GalleryEditorCard
                            key={item.id}
                            item={item}
                            onDelete={remove}
                            onSave={async (data) => {
                              await updateGalleryItem(item.id, data);
                              await refresh();
                            }}
                        />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
          ) : (
              <div className="border border-border bg-white p-10 text-center text-muted-foreground">No gallery cards yet.</div>
          )}
        </div>
      </div>
  );
}

function GalleryEditorCard({
                             item,
                             onDelete,
                             onSave,
                           }: {
  item: GalleryItem;
  onDelete: (id: number) => Promise<void>;
  onSave: (data: Partial<Pick<GalleryItem, 'media' | 'description'>>) => Promise<void>;
}) {
  const { toast } = useToast();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const inputRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState(item.description);
  const [activeIndex, setActiveIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDescription(item.description), [item.description]);
  const media = item.media[activeIndex] ?? item.media[0];
  const style = { transform: CSS.Transform.toString(transform), transition };

  const save = async (data: Partial<Pick<GalleryItem, 'media' | 'description'>>) => {
    setSaving(true);
    try {
      await onSave(data);
    } catch (error) {
      toast({ title: 'Could not save gallery card', description: error instanceof Error ? error.message : undefined, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const addMedia = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'));
    if (files.length === 0) return;
    if (files.some((f) => f.size > 25 * 1024 * 1024)) {
      toast({ title: 'File too large', description: 'Please choose files smaller than 25 MB.', variant: 'destructive' });
      return;
    }
    await save({ media: [...item.media, ...(await Promise.all(files.map(uploadGalleryMedia)))] });
  };

  const removeActiveMedia = async () => {
    if (item.media.length < 2 || !confirm('Remove this item from the carousel?')) return;
    const next = item.media.filter((_, index) => index !== activeIndex);
    setActiveIndex(Math.max(0, activeIndex - 1));
    await save({ media: next });
  };

  return (
      <div ref={setNodeRef} style={style} className={`border border-border bg-white ${isDragging ? 'opacity-60 relative z-10' : ''}`}>
        <div className="aspect-[16/9] bg-muted relative">
          {media?.type === 'video' ? (
              <video src={media.src} className="w-full h-full object-cover" muted playsInline preload="metadata" />
          ) : (
              <img src={media?.src} alt="Gallery upload" className="w-full h-full object-cover" />
          )}
          <button type="button" {...attributes} {...listeners} className="absolute top-3 left-3 w-9 h-9 bg-white/95 hover:bg-white flex items-center justify-center cursor-grab active:cursor-grabbing touch-none" aria-label="Drag to reorder">
            <GripVertical className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => { void onDelete(item.id); }} className="absolute top-3 right-3 w-9 h-9 bg-white/95 hover:text-destructive hover:bg-white flex items-center justify-center" aria-label="Delete gallery card">
            <Trash2 className="w-4 h-4" />
          </button>
          {media?.type === 'video' && (
              <span className="absolute bottom-3 left-3 w-9 h-9 bg-white/90 flex items-center justify-center">
            <Play className="w-4 h-4 fill-current" />
          </span>
          )}
          {item.media.length > 1 && (
              <>
                <button type="button" onClick={() => setActiveIndex((index) => (index - 1 + item.media.length) % item.media.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 flex items-center justify-center" aria-label="Previous media">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => setActiveIndex((index) => (index + 1) % item.media.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 flex items-center justify-center" aria-label="Next media">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="absolute bottom-3 right-3 bg-black/65 text-white text-xs px-2 py-1">
              {activeIndex + 1} / {item.media.length}
            </span>
              </>
          )}
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {item.media.length} media item{item.media.length === 1 ? '' : 's'}
            </p>
            <input
                ref={inputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(event) => {
                  if (event.target.files) void addMedia(event.target.files);
                  event.target.value = '';
                }}
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => inputRef.current?.click()} disabled={saving} className="h-9 px-3 text-sm border border-border hover:bg-muted inline-flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                Add media
              </button>
              {item.media.length > 1 && (
                  <button type="button" onClick={() => { void removeActiveMedia(); }} disabled={saving} className="h-9 px-3 text-sm text-destructive border border-border hover:bg-destructive/5">
                    Remove item
                  </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-2 uppercase tracking-wide text-muted-foreground">
              Description <span className="normal-case tracking-normal">(optional)</span>
            </label>
            <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                onBlur={() => {
                  if (description !== item.description) void save({ description });
                }}
                placeholder="Add text to show beside this carousel…"
                rows={3}
                className="resize-none text-sm"
            />
            {saving && <p className="text-xs text-muted-foreground mt-2">Saving…</p>}
          </div>
        </div>
      </div>
  );
}