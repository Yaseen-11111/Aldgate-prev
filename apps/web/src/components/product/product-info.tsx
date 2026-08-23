import { Link } from 'wouter';
import { Plus, Check, Info } from 'lucide-react';
import { Product } from '@workspace/api-client-react';

interface ProductInfoProps {
  product: Product;
  isInQuote: boolean;
  onAddToQuote: () => void;
}

/** Product name, description, specs, and the add-to-quote action. */
export function ProductInfo({ product, isInQuote, onAddToQuote }: ProductInfoProps) {
  return (
    <div className="flex flex-col pt-4 md:pt-12">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm uppercase tracking-widest text-muted-foreground">
          {product.category}
        </span>
      </div>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-8 leading-tight">
        {product.name}
      </h1>

      <div className="prose prose-neutral dark:prose-invert font-light leading-relaxed mb-10 text-foreground/80">
        <p>{product.description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12 py-8 border-y border-border">
        <div>
          <h3 className="text-sm font-medium tracking-wide uppercase mb-3">Materials</h3>
          <p className="text-sm text-foreground/70 font-light">{product.materials}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium tracking-wide uppercase mb-3">Fabric Options</h3>
          <ul className="text-sm text-foreground/70 font-light space-y-1">
            {product.fabricOptions?.map((opt, i) => (
              <li key={i}>{opt}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-secondary/50 p-6 mb-8 flex gap-4 items-start border border-border/50">
        <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium mb-1">Pricing &amp; Sizing</h4>
          <p className="text-sm text-foreground/70 font-light">
            Prices vary based on exact measurements and final fabric choice. Add to your quote request to discuss options during a free home consultation.
          </p>
        </div>
      </div>

      <button
        onClick={onAddToQuote}
        className={`w-full py-4 px-8 flex items-center justify-center gap-3 font-medium transition-all text-lg ${
          isInQuote
            ? 'bg-secondary text-secondary-foreground border border-transparent cursor-default'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
      >
        {isInQuote ? (
          <>
            <Check className="w-5 h-5" /> Added to Consultation Request
          </>
        ) : (
          <>
            <Plus className="w-5 h-5" /> Add to Quote Request
          </>
        )}
      </button>

      {isInQuote && (
        <Link href="/quote" className="text-center mt-4 text-sm font-medium text-accent hover:underline">
          View your selection →
        </Link>
      )}
    </div>
  );
}
