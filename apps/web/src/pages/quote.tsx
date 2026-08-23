import { useQuoteStore } from '@/store';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { useListProducts } from '@workspace/api-client-react';
import { EmptyQuote } from '@/components/quote/empty-quote';
import { QuoteItemRow } from '@/components/quote/quote-item-row';

export default function Quote() {
  const { items, removeItem } = useQuoteStore();
  const { data: allProducts } = useListProducts();

  // Enhance quote items with images if available
  const itemsWithImages = items.map((item) => {
    const product = allProducts?.find((p) => p.id === item.productId);
    return {
      ...item,
      imageUrl: product?.images?.[0],
    };
  });

  if (items.length === 0) {
    return <EmptyQuote />;
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
      <div className="mb-12 md:mb-16">
        <h1 className="text-4xl md:text-6xl font-serif mb-4">Your Consultation</h1>
        <p className="text-lg text-foreground/70 font-light">
          Review the styles you've selected for your home visit. An advisor will bring samples of these exact items.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Items List */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <div className="bg-secondary/30 border border-border p-6 flex justify-between items-center mb-2">
            <span className="font-medium tracking-wide uppercase text-sm">
              Items Selected for Consultation: {items.length}
            </span>
          </div>

          <div className="divide-y divide-border border-b border-border">
            {itemsWithImages.map((item) => (
              <QuoteItemRow key={item.productId} item={item} onRemove={removeItem} />
            ))}
          </div>
        </div>

        {/* Action Card */}
        <div className="w-full lg:w-1/3 sticky top-28 bg-white border border-border p-8 shadow-sm">
          <h3 className="text-2xl font-serif mb-4">Ready to proceed?</h3>
          <p className="text-sm text-foreground/70 font-light mb-8 leading-relaxed">
            Take the next step by booking your free home appointment. Our expert will arrive with samples, take exact measurements, and provide a no-obligation quote.
          </p>

          <Link href="/checkout" className="w-full h-14 bg-primary text-primary-foreground flex items-center justify-center gap-3 font-medium hover:bg-primary/90 transition-colors mb-4">
            Book Free Home Appointment <ArrowRight className="w-4 h-4" />
          </Link>

          <Link href="/catalog" className="w-full h-12 border border-border text-foreground flex items-center justify-center font-medium hover:border-primary/30 transition-colors">
            Continue Browsing
          </Link>
        </div>
      </div>
    </div>
  );
}
