import { UseFormReturn } from 'react-hook-form';
import { Link } from 'wouter';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { QuoteItem } from '@workspace/api-client-react';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CheckoutFormValues } from './schema';

interface InspirationStepProps {
  form: UseFormReturn<CheckoutFormValues>;
  items: QuoteItem[];
  onContinue: () => void;
}

/** Step 1: review shortlisted items and optionally add rough measurements. */
export function InspirationStep({ form, items, onContinue }: InspirationStepProps) {
  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
      <h1 className="text-4xl font-serif mb-4">Inspiration Summary</h1>
      <p className="text-foreground/70 font-light mb-10">Review your selected items and optionally provide rough measurements.</p>

      <div className="bg-white border border-border p-8 mb-8">
        <h3 className="font-medium mb-6 uppercase tracking-wider text-sm border-b border-border pb-4">Selected Items</h3>
        <ul className="space-y-4 mb-8">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between items-center text-lg">
              <span>{item.productName}</span>
              <span className="text-sm text-muted-foreground uppercase">{item.category}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-secondary/30 border border-border p-8 mb-10">
        <h3 className="font-medium mb-2 text-lg">Preliminary Window Measurements <span className="text-muted-foreground font-normal text-sm">(Optional)</span></h3>
        <p className="text-sm text-foreground/70 font-light mb-6">
          Windows come in all shapes and sizes. Don't worry about perfect accuracy here — our advisor will professionally measure every window from scratch during your visit.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="widthCm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rough Width (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g. 120"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dropCm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rough Drop (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g. 180"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
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
