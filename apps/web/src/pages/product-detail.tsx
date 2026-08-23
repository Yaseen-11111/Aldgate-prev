import { useGetProduct } from '@workspace/api-client-react';
import { useParams, Link } from 'wouter';
import { useQuoteStore } from '@/store';
import { ArrowLeft } from 'lucide-react';
import { ImageGallery } from '@/components/product/image-gallery';
import { ProductInfo } from '@/components/product/product-info';
import { ProductDetailSkeleton } from '@/components/product/product-detail-skeleton';
import { ProductNotFound } from '@/components/product/product-not-found';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || '0', 10);

  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId, queryKey: ['product', productId] },
  });

  const { items, addItem } = useQuoteStore();
  const isInQuote = product ? items.some((item) => item.productId === product.id) : false;

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return <ProductNotFound />;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <Link href="/catalog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 md:mb-12 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Collection
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
        <ImageGallery images={product.images} alt={product.name} />
        <ProductInfo
          product={product}
          isInQuote={isInQuote}
          onAddToQuote={() => {
            if (!isInQuote) {
              addItem({
                productId: product.id,
                productName: product.name,
                category: product.category,
              });
            }
          }}
        />
      </div>
    </div>
  );
}
