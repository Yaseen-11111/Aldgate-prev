import { Link } from 'wouter';
import { Trash2 } from 'lucide-react';
import { QuoteItem } from '@workspace/api-client-react';

interface QuoteItemRowProps {
  item: QuoteItem & { imageUrl?: string };
  onRemove: (productId: number) => void;
}

/** A single shortlisted item row on the quote review page. */
export function QuoteItemRow({ item, onRemove }: QuoteItemRowProps) {
  return (
    <div className="py-6 flex gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <Link href={`/catalog/${item.productId}`} className="shrink-0 w-24 h-32 bg-muted relative group">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.productName} className="absolute inset-0 w-full h-full object-cover transition-opacity group-hover:opacity-80" />
        ) : (
          <div className="w-full h-full bg-secondary/50" />
        )}
      </Link>

      <div className="flex-grow flex flex-col justify-between py-1">
        <div>
          <div className="flex justify-between items-start gap-4">
            <Link href={`/catalog/${item.productId}`} className="hover:text-accent transition-colors">
              <h3 className="text-xl font-medium mb-1">{item.productName}</h3>
            </Link>
            <button
              onClick={() => onRemove(item.productId)}
              className="text-muted-foreground hover:text-destructive p-2 -m-2 transition-colors"
              aria-label="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm uppercase tracking-wider text-muted-foreground">
            {item.category}
          </span>
        </div>

        <div className="text-sm font-light text-foreground/60 italic">
          Exact price determined post-measurement
        </div>
      </div>
    </div>
  );
}
