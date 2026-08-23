import { useState } from 'react';
import { useQuoteStore } from '@/store';
import { useCreateQuoteRequest } from '@workspace/api-client-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { checkoutFormSchema, checkoutFormDefaults, type CheckoutFormValues } from './schema';
import { StepProgress } from './step-progress';
import { InspirationStep } from './inspiration-step';
import { BookingStep } from './booking-step';
import { Confirmation } from './confirmation';
import { EmptyShortlist } from './empty-shortlist';

/** Two-step checkout flow: review shortlist, then book a free home appointment. */
export default function Checkout() {
  const { items, clear } = useQuoteStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const createRequest = useCreateQuoteRequest();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: checkoutFormDefaults,
  });

  const onSubmit = (data: CheckoutFormValues) => {
    createRequest.mutate({
      data: {
        items,
        name: data.name,
        phone: data.phone,
        email: data.email,
        postcode: data.postcode,
        preferredDate: data.preferredDate,
        preferredTimeWindow: data.preferredTimeWindow,
        widthCm: isNaN(data.widthCm as number) ? null : data.widthCm,
        dropCm: isNaN(data.dropCm as number) ? null : data.dropCm,
      },
    }, {
      onSuccess: () => {
        setStep(3);
        clear();
      },
    });
  };

  if (items.length === 0 && step !== 3) {
    return <EmptyShortlist />;
  }

  if (step === 3) {
    return <Confirmation />;
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl min-h-[80vh]">
      <StepProgress step={step === 2 ? 2 : 1} onSelectStep={setStep} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {step === 1 && (
            <InspirationStep form={form} items={items} onContinue={() => setStep(2)} />
          )}
          {step === 2 && (
            <BookingStep form={form} onBack={() => setStep(1)} isSubmitting={createRequest.isPending} />
          )}
        </form>
      </Form>
    </div>
  );
}
