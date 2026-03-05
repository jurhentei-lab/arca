import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  VERCEL_URL: z.string().optional(),
  NODE_ENV: z.string().optional(),
});

export const env = envSchema.parse(process.env);
