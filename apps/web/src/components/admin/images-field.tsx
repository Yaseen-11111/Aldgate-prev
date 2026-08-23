import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ImageOff, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ImagesFieldProps {
  value: string[];
  onChange: (images: string[]) => void;
}

/**
 * Drag-and-drop image list editor. Admins add image URLs and reorder them
 * by dragging; the first image is always used as the product's primary/cover photo.
 */
export function ImagesField({ value, onChange }: ImagesFieldProps) {
  const [draft, setDraft] = useState('');
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const addImage = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...value, trimmed]);
    setDraft('');
  };

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateImage = (index: number, url: string) => {
    onChange(value.map((img, i) => (i === index ? url : img)));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = Number(active.id);
    const newIndex = Number(over.id);
    onChange(arrayMove(value, oldIndex, newIndex));
  };

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={value.map((_, i) => String(i))}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {value.map((img, index) => (
                <SortableImageRow
                  key={`${index}-${img}`}
                  id={String(index)}
                  index={index}
                  url={img}
                  isPrimary={index === 0}
                  onChangeUrl={(url) => updateImage(index, url)}
                  onRemove={() => removeImage(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="https://... (paste an image URL)"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addImage();
            }
          }}
        />
        <button
          type="button"
          onClick={addImage}
          className="shrink-0 h-10 px-4 border border-border hover:border-primary hover:bg-primary/5 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
      {value.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Add at least one image. Drag to reorder — the top image is used as the cover photo.
        </p>
      )}
    </div>
  );
}

function SortableImageRow({
  id,
  url,
  isPrimary,
  onChangeUrl,
  onRemove,
}: {
  id: string;
  index: number;
  url: string;
  isPrimary: boolean;
  onChangeUrl: (url: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 bg-muted/30 border border-border p-2 ${isDragging ? 'opacity-60 z-10 relative' : ''}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <div className="w-10 h-10 bg-muted shrink-0 overflow-hidden border border-border/50">
        {url ? (
          <img
            src={url}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.visibility = 'hidden';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="w-4 h-4 text-muted-foreground/40" />
          </div>
        )}
      </div>

      <Input
        value={url}
        onChange={(e) => onChangeUrl(e.target.value)}
        placeholder="https://..."
        className="h-9 bg-white"
      />

      {isPrimary && (
        <span className="shrink-0 text-[10px] uppercase tracking-wider font-medium px-2 py-1 bg-primary/10 text-primary whitespace-nowrap">
          Cover
        </span>
      )}

      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 p-2 text-muted-foreground hover:text-destructive transition-colors"
        aria-label="Remove image"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
