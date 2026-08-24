import { z } from 'zod';

export const checkoutFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(5, 'Valid phone number is required'),
  email: z.string().email('Valid email is required'),
  postcode: z.string().min(3, 'Postcode is required'),
  preferredDate: z.string().min(1, 'Please select a preferred date'),
  preferredTimeWindow: z.string().min(1, 'Please select a time window'),
  turnstileToken: z.string().min(1, 'Please complete the security check'),
  customerMessage: z.string().max(2000, 'Message must be 2,000 characters or fewer'),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export const checkoutFormDefaults: CheckoutFormValues = {
  name: '',
  phone: '',
  email: '',
  postcode: '',
  preferredDate: '',
  preferredTimeWindow: '',
  turnstileToken: '',
  customerMessage: '',
};
