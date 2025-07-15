import { PrismaClient } from '@prisma/client'

let prisma

export function getTestDb() {
  if (!prisma) {
    prisma = new PrismaClient()
  }
  return prisma
}


export async function clearDatabase() {
  const db = getTestDb()
  
  // Clear tables in correct order to handle foreign key constraints
  // Delete child tables first, then parent tables
  await db.userDMRead.deleteMany()
  await db.userChannelRead.deleteMany()
  await db.message.deleteMany()
  await db.directMessage.deleteMany()
  await db.channelMember.deleteMany()
  await db.channel.deleteMany()
  await db.user.deleteMany()
}

export async function createTestUser(username, email, options = {}) {
  const db = getTestDb()
  return await db.user.create({
    data: {
      username,
      email,
      passwordHash: 'hash123',
      ...options
    }
  })
}

export async function createTestUsers(usernames) {
  const db = getTestDb()
  const users = []
  for (const username of usernames) {
    const user = await db.user.create({
      data: {
        username,
        email: `${username}@example.com`,
        passwordHash: 'hash123'
      }
    })
    users.push(user)
  }
  return users
}

export async function createTestChannel(name) {
  const db = getTestDb()
  return await db.channel.create({
    data: { name }
  })
}

export async function createTestChannels(names) {
  const db = getTestDb()
  const channels = []
  for (const name of names) {
    const channel = await db.channel.create({
      data: { name }
    })
    channels.push(channel)
  }
  return channels
}


export async function disconnectTestDb() {
  if (prisma) {
    await prisma.$disconnect()
    prisma = null
  }
}