import { Router } from 'express';
import { db } from '../../config/db.js';
import { requireAuth } from '../../middleware/auth.js';
import { bulkProductsSchema } from './products.schemas.js';
import { mapProductsForFront } from './products.mapper.js';

export const productsRouter = Router();

productsRouter.get('/', async (_req, res) => {
  const products = await db.product.findMany({ orderBy: [{ createdAt: 'asc' }] });
  return res.json(mapProductsForFront(products));
});

productsRouter.put('/bulk', requireAuth, async (req, res) => {
  const input = bulkProductsSchema.parse(req.body);

  const ids = input.products.map((p) => p.id);

  await db.$transaction(async (tx) => {
    for (const product of input.products) {
      await tx.product.upsert({
        where: { id: product.id },
        update: {
          name: product.name,
          category: product.category,
          price: product.price,
          variant: product.variant,
          badge: product.badge,
          featured: product.featured ?? false,
          collectionType: product.collectionType,
        },
        create: {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          variant: product.variant,
          badge: product.badge,
          featured: product.featured ?? false,
          collectionType: product.collectionType,
        },
      });
    }

    await tx.product.deleteMany({
      where: {
        id: {
          notIn: ids,
        },
      },
    });
  });

  const products = await db.product.findMany({ orderBy: [{ createdAt: 'asc' }] });
  return res.json(mapProductsForFront(products));
});
