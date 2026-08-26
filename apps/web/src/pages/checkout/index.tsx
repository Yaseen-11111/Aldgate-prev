import { useState } from 'react';
import { useQuoteStore } from '@/store';
import { useCreateQuoteRequest } from '@workspace/api-client-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { checkoutFormSchema, checkoutFormDefaults, type CheckoutFormValues } from './schema';
import { BookingStep } from './booking-step';
import { Confirmation } from './confirmation';

/** Two-step checkout flow: review shortlist, then book a free home appointment. */
export default function Checkout() {
  const { items, clear } = useQuoteStore();
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const createRequest = useCreateQuoteRequest();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: checkoutFormDefaults,
  });

  const onSubmit = (data: CheckoutFormValues) => {
    setSubmissionError(null);
    createRequest.mutate({
      data: {
        items,
        name: data.name,
        phone: data.phone,
        email: data.email,
        postcode: data.postcode,
        preferredDate: data.preferredDate,
        preferredTimeWindow: data.preferredTimeWindow,
        turnstileToken: data.turnstileToken,
        customerMessage: data.customerMessage || undefined,
      },
    }, {
      onSuccess: () => {
        clear();
        setIsConfirmed(true);
      },
      onError: (error) => {
        setSubmissionError(error instanceof Error ? error.message : 'Unable to confirm your appointment. Please try again.');
      },
    });
  };

  if (isConfirmed) return <Confirmation />;

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl min-h-[80vh]">

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <BookingStep form={form} isSubmitting={createRequest.isPending} />
          {submissionError && <p className="text-sm text-destructive text-right">{submissionError}</p>}
        </form>
      </Form>
    </div>
  );
}
