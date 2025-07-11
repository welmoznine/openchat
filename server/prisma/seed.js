import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.create({
    data: {
      username: 'testuser1',
      email: 'testuser1@example.com',
      passwordHash: 'hashed-password'
    },
    data: {
      username: 'testuser2',
      email: 'testuser2@example.com',
      passwordHash: 'hashed-password'
    },
  })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })