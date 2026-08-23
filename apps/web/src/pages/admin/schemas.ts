import { z } from 'zod';
import { ProductCategory, QuoteRequestStatus } from '@workspace/api-client-react';

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.nativeEnum(ProductCategory),
  materials: z.string().min(1, 'Materials are required'),
  fabricOptions: z.string().min(1, 'At least one fabric option required (comma separated)'),
  description: z.string(),
  images: z.array(z.string().min(1)).min(1, 'Add at least one image'),
});
export type ProductFormValues = z.infer<typeof productSchema>;

export const requestEditSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().min(1, 'Email is required'),
  postcode: z.string().min(1, 'Postcode is required'),
  preferredDate: z.string().min(1, 'Date is required'),
  preferredTimeWindow: z.string().min(1, 'Time window is required'),
  status: z.nativeEnum(QuoteRequestStatus),
});
export type RequestEditFormValues = z.infer<typeof requestEditSchema>;
