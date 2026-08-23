import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';

/** Closing call-to-action, sends visitors to the catalog. */
export function ProcessCta() {
  return (
    <div className="bg-secondary/40 border-t border-border">
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-20 text-center max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-serif mb-4">Ready to start?</h2>
        <p className="text-foreground/70 font-light mb-8">
          Browse the collection to build a shortlist, then book your free home appointment —
          we'll bring the samples and the tape measure.
        </p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-3 h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium tracking-wide"
        >
          Explore the Collection <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
