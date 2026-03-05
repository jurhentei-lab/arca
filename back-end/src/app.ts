import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { productsRouter } from './modules/products/products.routes.js';
import { ordersRouter } from './modules/orders/orders.routes.js';
import { errorHandler } from './middleware/error-handler.js';

export const app = express();

const explicitOrigins = env.CLIENT_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set<string>([
  ...explicitOrigins,
  ...(env.VERCEL_URL ? [`https://${env.VERCEL_URL}`] : []),
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      if (origin.endsWith('.vercel.app')) return callback(null, true);
      return callback(new Error('CORS blocked'));
    },
    credentials: false,
  })
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);

app.use(errorHandler);
