import { Link } from 'wouter';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { QuoteItem } from '@workspace/api-client-react';

interface InspirationStepProps {
  items: QuoteItem[];
  onContinue: () => void;
}

/** Step 1: review shortlisted items; selecting them is entirely optional. */
export function InspirationStep({ items, onContinue }: InspirationStepProps) {
  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
      <h1 className="text-4xl font-serif mb-4">Inspiration Summary</h1>
      <p className="text-foreground/70 font-light mb-10">Add styles from the collection if you wish, or continue with a general enquiry.</p>

      <div className="bg-white border border-border p-8 mb-8">
        <h3 className="font-medium mb-6 uppercase tracking-wider text-sm border-b border-border pb-4">Selected Items</h3>
        {items.length > 0 ? <ul className="space-y-4 mb-8">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between items-center text-lg">
              <span>{item.productName}</span>
              <span className="text-sm text-muted-foreground uppercase">{item.category}</span>
            </li>
          ))}
        </ul> : <p className="text-foreground/70 mb-8">No items selected yet. That is completely fine—you can describe what you need in the next step.</p>}
      </div>

      <div className="flex justify-between items-center pt-6">
        <Link href="/quote" className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Quote
        </Link>
        <button
          type="button"
          onClick={onContinue}
          className="h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors tracking-wide font-medium flex items-center gap-2"
        >
          Continue to Booking <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
