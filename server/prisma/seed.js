import bcrypt from 'bcryptjs'
import prisma from './prisma.js'

async function main () {
  // Upsert test user: create if not exists, otherwise do nothing
  await prisma.user.upsert({
    where: { email: 'testuser@example.com' },
    update: {},
    create: {
      username: 'testuser',
      email: 'testuser@example.com',
      passwordHash: await bcrypt.hash('testuserpass', 10),
    },
  })

  // Upsert second test user: create if not exists, otherwise do nothing
  await prisma.user.upsert({
    where: { email: 'testuser2@example.com' },
    update: {},
    create: {
      username: 'testuser2',
      email: 'testuser2@example.com',
      passwordHash: await bcrypt.hash('testuser2pass', 10),
    },
  })

  // Fetch the users so we can reference their IDs
  const user1 = await prisma.user.findUnique({
    where: { email: 'testuser@example.com' },
  })
  const user2 = await prisma.user.findUnique({
    where: { email: 'testuser2@example.com' },
  })

  // Create a direct message from user1 to user2
  const dm = await prisma.directMessage.create({
    data: {
      senderId: user1.id,
      receiverId: user2.id,
      content: 'Hello from testuser to testuser2!',
    },
  })

  // Create a UserDMRead record marking that dm as last read by user2
  await prisma.userDMRead.create({
    data: {
      userId: user2.id,
      otherUserId: user1.id,
      lastReadDMId: dm.id,
    },
  })

  // Create a channel named 'general'
  const generalChannel = await prisma.channel.create({
    data: { name: 'general', description: 'Team-wide communication', isPrivate: false },
  })

  // Create 'random' channel
  const randomChannel = await prisma.channel.create({
    data: {
      name: 'random',
      description: 'Random conversations and casual chat',
      isPrivate: false
    },
  })

  // Create 'development' channel
  const devChannel = await prisma.channel.create({
    data: {
      name: 'development',
      description: 'Development-related discussions',
      isPrivate: false
    },
  })

  // Add users to channels based on the requirements
  await prisma.channelMember.createMany({
    data: [
      { userId: user1.id, channelId: generalChannel.id },
      { userId: user1.id, channelId: randomChannel.id },
      { userId: user1.id, channelId: devChannel.id },
      { userId: user2.id, channelId: generalChannel.id },
      { userId: user2.id, channelId: randomChannel.id },
      { userId: user2.id, channelId: devChannel.id },
    ],
  })

  // Create a message from user1 in the general channel
  const message = await prisma.message.create({
    data: {
      userId: user1.id,
      channelId: generalChannel.id,
      content: 'Welcome to the general channel!',
    },
  })

  // Mark message as last read by user2 in the general channel
  await prisma.userChannelRead.create({
    data: {
      userId: user2.id,
      channelId: generalChannel.id,
      lastReadMessageId: message.id,
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
