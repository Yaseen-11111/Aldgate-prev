import { Filter } from 'lucide-react';

/** Shown when a category filter returns no products. */
export function EmptyCatalog() {
  return (
    <div className="py-32 text-center text-muted-foreground flex flex-col items-center">
      <Filter className="w-12 h-12 mb-4 opacity-20" />
      <h3 className="text-xl font-medium text-foreground mb-2">No products found</h3>
      <p>Try adjusting your category filter to see more options.</p>
    </div>
  );
}
