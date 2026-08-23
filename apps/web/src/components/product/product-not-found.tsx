import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';

/** Shown when a product id doesn't resolve to a real product. */
export function ProductNotFound() {
  return (
    <div className="container mx-auto px-4 py-32 text-center">
      <h1 className="text-3xl font-serif mb-4">Product Not Found</h1>
      <p className="text-muted-foreground mb-8">The item you're looking for doesn't exist or has been removed.</p>
      <Link href="/catalog" className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Collection
      </Link>
    </div>
  );
}
