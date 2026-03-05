import { Router } from 'express';
import { db } from '../../config/db.js';
import { requireAdmin, requireAuth } from '../../middleware/auth.js';
import { createOrderSchema } from './orders.schemas.js';

export const ordersRouter = Router();

ordersRouter.get('/', requireAuth, requireAdmin, async (_req, res) => {
  const orders = await db.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return res.json({
    orders: orders.map((order) => ({
      id: order.id,
      customerName: order.customerName,
      note: order.note,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      })),
    })),
  });
});

ordersRouter.post('/', requireAuth, requireAdmin, async (req, res) => {
  const input = createOrderSchema.parse(req.body);

  const order = await db.order.create({
    data: {
      customerName: input.customerName,
      note: input.note,
      items: {
        create: input.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return res.status(201).json({
    order: {
      id: order.id,
      customerName: order.customerName,
      note: order.note,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      })),
    },
  });
});

ordersRouter.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const existing = await db.order.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: 'Order not found' });
  }

  await db.order.delete({ where: { id } });
  return res.status(204).send();
});
