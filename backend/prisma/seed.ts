import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed vehicle counter
  await prisma.vehicleCounter.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, count: 10000 },
  });

  // Seed default admin
  const passwordHash = await bcrypt.hash('Admin@123', 12);
  await prisma.admin.upsert({
    where: { email: 'admin@qrmanager.com' },
    update: {},
    create: {
      email: 'admin@qrmanager.com',
      passwordHash,
      name: 'Admin',
      role: 'admin',
    },
  });

  console.log('✅ Database seeded successfully');
  console.log('   Admin email:    admin@qrmanager.com');
  console.log('   Admin password: Admin@123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
