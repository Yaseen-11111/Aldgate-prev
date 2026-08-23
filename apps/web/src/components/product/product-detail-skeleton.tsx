import { Skeleton } from '@/components/ui/skeleton';

/** Placeholder layout shown while a product is loading. */
export function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
        <Skeleton className="w-full aspect-[3/4] md:aspect-square rounded-none" />
        <div className="space-y-6 mt-8 md:mt-16">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <div className="pt-8 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
