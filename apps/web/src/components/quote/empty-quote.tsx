import { Link } from 'wouter';
import { CalendarDays } from 'lucide-react';

/** Shown when the shortlist has no items yet. */
export function EmptyQuote() {
  return (
    <div className="container mx-auto px-4 py-24 md:py-32 flex flex-col items-center text-center max-w-2xl">
      <div className="w-24 h-24 bg-muted flex items-center justify-center rounded-full mb-8">
        <CalendarDays className="w-10 h-10 text-muted-foreground/50" />
      </div>
      <h1 className="text-4xl md:text-5xl font-serif mb-6">Your Consultation</h1>
      <p className="text-lg text-foreground/70 font-light mb-10">
        You can book a free consultation with or without a shortlist. Tell us what you need and we will guide you from there.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/checkout" className="inline-flex items-center justify-center h-14 px-8 text-primary-foreground bg-[#B46A3C] hover:bg-[#B87A3E] transition-colors tracking-wide font-medium">Book a Free Consultation</Link>
        <Link href="/catalog" className="inline-flex items-center justify-center h-14 px-8 border border-primary text-primary hover:bg-primary/5 transition-colors tracking-wide font-medium">Explore the Collection</Link>
      </div>
    </div>
  );
}
