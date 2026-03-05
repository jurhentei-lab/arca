import { z } from 'zod';

export const createOrderSchema = z.object({
  customerName: z.string().trim().optional(),
  note: z.string().trim().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
