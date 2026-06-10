/**
 * seed.js — plain JavaScript, no TypeScript compiler needed.
 * Run with:  node prisma/seed.js
 * Or via:    npm run db:seed
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Seed the vehicle ID counter (starts at 10000 → first vehicle is VH10001)
  await prisma.vehicleCounter.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, count: 10000 },
  });
  console.log('✅ Vehicle counter initialised');

  // Seed default admin
  const passwordHash = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@qrmanager.com' },
    update: {},
    create: {
      email: 'admin@qrmanager.com',
      passwordHash,
      name: 'Admin',
      role: 'admin',
    },
  });

  console.log('✅ Admin seeded:', admin.email);
  console.log('   Password: Admin@123');
  console.log('   ⚠️  Change this password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
