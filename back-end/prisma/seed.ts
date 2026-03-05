import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  const passwordHash = await bcrypt.hash('Admin@12345', 10);

  await prisma.user.upsert({
    where: { email: 'admin@arca.com' },
    update: {},
    create: {
      name: 'ARCA Admin',
      email: 'admin@arca.com',
      passwordHash,
      role: 'ADMIN',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
