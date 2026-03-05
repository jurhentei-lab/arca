import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../../config/db.js';
import { requireAuth, signToken } from '../../middleware/auth.js';
import { loginSchema, signUpSchema } from './auth.schemas.js';

export const authRouter = Router();
const ADMIN_EMAIL = 'jurhee@gmail.com';
const ADMIN_CODE = '99246065';

function isAdminCredentials(email: string, password: string) {
  return email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_CODE;
}

authRouter.post('/signup', async (req, res) => {
  const input = signUpSchema.parse(req.body);
  const email = input.email.trim().toLowerCase();

  if (email === ADMIN_EMAIL && input.password !== ADMIN_CODE) {
    return res.status(403).json({ message: 'Invalid admin code' });
  }

  if (isAdminCredentials(email, input.password)) {
    const passwordHash = await bcrypt.hash(ADMIN_CODE, 10);

    const user = await db.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: {
        name: input.name || 'Admin',
        role: 'ADMIN',
        passwordHash,
      },
      create: {
        name: input.name || 'Admin',
        email: ADMIN_EMAIL,
        passwordHash,
        role: 'ADMIN',
      },
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await db.user.create({
    data: {
      name: input.name,
      email,
      passwordHash,
    },
  });

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  return res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

authRouter.post('/login', async (req, res) => {
  const input = loginSchema.parse(req.body);
  const email = input.email.trim().toLowerCase();

  if (email === ADMIN_EMAIL) {
    if (!isAdminCredentials(email, input.password)) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const passwordHash = await bcrypt.hash(ADMIN_CODE, 10);
    const user = await db.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: {
        role: 'ADMIN',
        passwordHash,
      },
      create: {
        name: 'Admin',
        email: ADMIN_EMAIL,
        passwordHash,
        role: 'ADMIN',
      },
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await db.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});
