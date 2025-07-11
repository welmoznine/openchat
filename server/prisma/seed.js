import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.upsert({
    where: { email: 'testuser@example.com' },
    update: {}, // nothing to update if exists
    create: {
      username: 'testuser',
      email: 'testuser@example.com',
      passwordHash: 'hashed-password'
    }
  });

  await prisma.user.upsert({
    where: { email: 'testuser2@example.com' },
    update: {},
    create: {
      username: 'testuser2',
      email: 'testuser2@example.com',
      passwordHash: 'hashed-password'
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