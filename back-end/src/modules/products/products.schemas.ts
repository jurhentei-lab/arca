import { z } from 'zod';

const collectionTypeSchema = z.enum(['CURATED', 'MORE']);

export const productInputSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  category: z.string().trim().min(1),
  price: z.number().int().nonnegative(),
  variant: z.string().trim().min(1),
  badge: z.string().trim().min(1).optional(),
  featured: z.boolean().optional(),
  collectionType: collectionTypeSchema,
});

export const bulkProductsSchema = z.object({
  products: z.array(productInputSchema).min(1),
});

export type ProductInput = z.infer<typeof productInputSchema>;
export type BulkProductsInput = z.infer<typeof bulkProductsSchema>;
