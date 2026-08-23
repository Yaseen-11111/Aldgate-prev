import { UseFormReturn } from 'react-hook-form';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckoutFormValues } from './schema';

interface BookingStepProps {
  form: UseFormReturn<CheckoutFormValues>;
  onBack: () => void;
  isSubmitting: boolean;
}

/** Step 2: contact details and preferred appointment window. */
export function BookingStep({ form, onBack, isSubmitting }: BookingStepProps) {
  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
      <h1 className="text-4xl font-serif mb-4">Booking &amp; Details</h1>
      <p className="text-foreground/70 font-light mb-10">Where should we send our advisor?</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-10 bg-white border border-border p-8">
        <div className="md:col-span-2 border-b border-border pb-4 mb-2">
          <h3 className="font-medium uppercase tracking-wider text-sm">Contact Information</h3>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl><Input type="tel" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Email Address</FormLabel>
              <FormControl><Input type="email" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="md:col-span-2 border-b border-border pb-4 mb-2 mt-4">
          <h3 className="font-medium uppercase tracking-wider text-sm">Appointment Details</h3>
        </div>

        <FormField
          control={form.control}
          name="postcode"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Postcode</FormLabel>
              <FormControl><Input {...field} placeholder="e.g. SW1A 1AA" /></FormControl>
              <FormDescription>Required to assign the correct local advisor.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preferredDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Date</FormLabel>
              <FormControl><Input type="date" min={new Date().toISOString().split('T')[0]} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preferredTimeWindow"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Time Window</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a time" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Morning (9am - 12pm)">Morning (9am - 12pm)</SelectItem>
                  <SelectItem value="Afternoon (12pm - 4pm)">Afternoon (12pm - 4pm)</SelectItem>
                  <SelectItem value="Evening (4pm - 7pm)">Evening (4pm - 7pm)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex justify-between items-center pt-6">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors tracking-wide font-medium flex items-center gap-3 disabled:opacity-70"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Confirm Appointment
        </button>
      </div>
    </div>
  );
}
