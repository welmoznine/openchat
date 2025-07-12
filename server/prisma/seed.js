import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient()

async function main() {
  await prisma.user.upsert({
    where: { email: 'testuser@example.com' },
    update: {}, // nothing to update if exists
    create: {
      username: 'testuser',
      email: 'testuser@example.com',
      passwordHash: await bcrypt.hash('testuserpass', 10)
    }
  });

  await prisma.user.upsert({
    where: { email: 'testuser2@example.com' },
    update: {},
    create: {
      username: 'testuser2',
      email: 'testuser2@example.com',
      passwordHash: await bcrypt.hash('testuser2pass', 10)
    }
  });
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })