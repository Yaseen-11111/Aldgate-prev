import { Link } from 'wouter';
import { Plus, Check } from 'lucide-react';
import { Product } from '@workspace/api-client-react';

interface ProductCardProps {
  product: Product;
  isInQuote: boolean;
  onAddToQuote: (product: Product) => void;
  animationDelayMs?: number;
}

/** A single catalog grid item: photo, name, materials, and an add-to-quote toggle. */
export function ProductCard({ product, isInQuote, onAddToQuote, animationDelayMs = 0 }: ProductCardProps) {
  return (
    <div
      className="group flex flex-col animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${animationDelayMs}ms`, animationFillMode: 'both' }}
    >
      <Link href={`/catalog/${product.id}`} className="relative aspect-[4/5] mb-4 overflow-hidden bg-muted block">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80`; // graceful fallback if our generated ones aren't available via URL
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </Link>

      <div className="flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/catalog/${product.id}`} className="hover:text-accent transition-colors">
            <h3 className="text-lg font-medium">{product.name}</h3>
          </Link>
          <span className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
            {product.category}
          </span>
        </div>
        <p className="text-sm text-foreground/60 font-light mb-6 flex-grow line-clamp-2">
          {product.materials}
        </p>

        <button
          onClick={(e) => {
            e.preventDefault();
            if (!isInQuote) onAddToQuote(product);
          }}
          className={`flex items-center justify-center gap-2 w-full py-3 text-sm font-medium transition-all ${
            isInQuote
              ? 'bg-secondary text-secondary-foreground border border-transparent'
              : 'border border-border hover:border-primary hover:bg-primary/5'
          }`}
        >
          {isInQuote ? (
            <>
              <Check className="w-4 h-4" /> Added to Quote
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" /> Add to Quote Request
            </>
          )}
        </button>
      </div>
    </div>
  );
}
