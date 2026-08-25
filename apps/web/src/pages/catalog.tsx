import { useListProducts, ProductCategory, Product } from '@workspace/api-client-react';
import { useSearch } from 'wouter';
import { useQuoteStore } from '@/store';
import { CategoryFilter } from '@/components/catalog/category-filter';
import { ProductCard } from '@/components/catalog/product-card';
import { CatalogGridSkeleton } from '@/components/catalog/catalog-grid-skeleton';
import { EmptyCatalog } from '@/components/catalog/empty-catalog';
import { useSiteSettings } from '@/hooks/use-site-settings';

export default function Catalog() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const categoryParam = (searchParams.get('category') ?? undefined) as ProductCategory | undefined;

  const { data: products, isLoading } = useListProducts(
      categoryParam ? { category: categoryParam } : undefined,
  );
  const { items, addItem } = useQuoteStore();
  const { data: settings } = useSiteSettings();

  const handleAddToQuote = (product: Product) => {
    addItem({
      productId: product.id,
      productName: product.name,
      category: product.category,
    });
  };

  return (
      <div className="py-12 md:py-20 container mx-auto px-4 md:px-6 min-h-screen flex flex-col justify-between">
        <div>
          {/* Header Section with reserved heights & fallback defaults */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 border-b border-border pb-8 min-h-[140px]">
            <div>
              <h1 className="text-4xl md:text-6xl font-serif mb-4 min-h-[1.2em]">
                {settings?.collectionHeading || 'Our Collection'}
              </h1>
              <p className="text-foreground/70 font-light max-w-xl min-h-[1.5em]">
                {settings?.collectionDescription || 'Explore our bespoke architectural window treatments, custom-measured for your space.'}
              </p>
            </div>

            <CategoryFilter activeCategory={categoryParam} />
          </div>

          {/* Content Area with fixed grid layout */}
          {isLoading ? (
              <CatalogGridSkeleton />
          ) : products?.length === 0 ? (
              <EmptyCatalog />
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12 min-h-[600px]">
                {products?.map((product, index) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        isInQuote={items.some((item) => item.productId === product.id)}
                        onAddToQuote={handleAddToQuote}
                        animationDelayMs={index * 50}
                    />
                ))}
              </div>
          )}
        </div>
      </div>
  );
}