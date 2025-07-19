// prisma-schema.test.js
import { beforeEach, describe, it, expect } from 'vitest'
import { getTestDb, clearDatabase, createTestUsers, createTestChannel, createTestChannels } from '../test/database.js'

const prisma = getTestDb()

describe('Prisma Schema Tests', () => {
  beforeEach(async () => {
    await clearDatabase()
  })

  // ------ USER MODEL TESTS -----
  describe('User Model Tests', () => {
    // 1. Test user creation with required fields
    it('should create a user with required fields', async () => {
      const user = await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          passwordHash: 'hashedpassword123',
        },
      })

      expect(user.id).toBeDefined()
      expect(user.username).toBe('testuser')
      expect(user.email).toBe('test@example.com')
      expect(user.status).toBe('OFFLINE')
      expect(user.lastLoginAt).toBeNull()
      expect(user.createdAt).toBeDefined()
      expect(user.updatedAt).toBeDefined()
    })

    // 2. Test user creation with all optional fields
    it('should create a user with all optional fields', async () => {
      const lastLogin = new Date()
      const user = await prisma.user.create({
        data: {
          username: 'fulluser',
          email: 'full@example.com',
          passwordHash: 'hashedpassword123',
          status: 'ONLINE',
          lastLoginAt: lastLogin,
        },
      })

      expect(user.status).toBe('ONLINE')
      expect(user.lastLoginAt).toEqual(lastLogin)
    })

    // 3. Test unique constraint on username
    it('should enforce unique username constraint', async () => {
      await prisma.user.create({
        data: {
          username: 'uniqueuser',
          email: 'first@example.com',
          passwordHash: 'hash123',
        },
      })

      await expect(
        prisma.user.create({
          data: {
            username: 'uniqueuser',
            email: 'second@example.com',
            passwordHash: 'hash123',
          },
        })
      ).rejects.toThrow()
    })

    // 4. Test unique constraint on email
    it('should enforce unique email constraint', async () => {
      await prisma.user.create({
        data: {
          username: 'firstuser',
          email: 'unique@example.com',
          passwordHash: 'hash123',
        },
      })

      await expect(
        prisma.user.create({
          data: {
            username: 'seconduser',
            email: 'unique@example.com',
            passwordHash: 'hash123',
          },
        })
      ).rejects.toThrow()
    })

    // 5. Test all enum status values (OFFLINE, ONLINE, AWAY)
    it('should handle all status enum values', async () => {
      const statuses = ['OFFLINE', 'ONLINE', 'AWAY']

      for (const status of statuses) {
        const user = await prisma.user.create({
          data: {
            username: `user_${status.toLowerCase()}`,
            email: `${status.toLowerCase()}@example.com`,
            passwordHash: 'hash123',
            status,
          },
        })

        expect(user.status).toBe(status)
      }
    })

    // 6. Test updating status and lastLoginAt field
    it('should update user status and lastLoginAt', async () => {
      const user = await prisma.user.create({
        data: {
          username: 'updateuser',
          email: 'update@example.com',
          passwordHash: 'hash123',
        },
      })

      const loginTime = new Date()
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          status: 'ONLINE',
          lastLoginAt: loginTime,
        },
      })

      expect(updatedUser.status).toBe('ONLINE')
      expect(updatedUser.lastLoginAt).toEqual(loginTime)
    })

    // 7. Test finding users by username, email, and status
    it('should find users by various criteria', async () => {
      const USER_1 = await prisma.user.create({
        data: {
          username: 'finduser1',
          email: 'find1@example.com',
          passwordHash: 'hash123',
          status: 'ONLINE',
        },
      })

      const USER_2 = await prisma.user.create({
        data: {
          username: 'finduser2',
          email: 'find2@example.com',
          passwordHash: 'hash123',
          status: 'OFFLINE',
        },
      })

      // Find by username
      const foundByUsername = await prisma.user.findUnique({
        where: { username: 'finduser1' },
      })
      expect(foundByUsername?.id).toBe(USER_1.id)

      // Find by email
      const foundByEmail = await prisma.user.findUnique({
        where: { email: 'find2@example.com' },
      })
      expect(foundByEmail?.id).toBe(USER_2.id)

      // Find by status
      const onlineUsers = await prisma.user.findMany({
        where: { status: 'ONLINE' },
      })
      expect(onlineUsers).toHaveLength(1)
      expect(onlineUsers[0].id).toBe(USER_1.id)
    })
  })

  // ------ CHANNEL MODEL TESTS -----
  describe('Channel Model Tests', () => {
    // 8. Test creating a channel with a name
    it('should create a channel with name', async () => {
      const channel = await prisma.channel.create({
        data: {
          name: 'General',
        },
      })

      expect(channel.id).toBeDefined()
      expect(channel.name).toBe('General')
    })

    // 9. Test creating a channel without a name (nullable field)
    it('should create a channel without name', async () => {
      const channel = await prisma.channel.create({
        data: {},
      })

      expect(channel.id).toBeDefined()
      expect(channel.name).toBeNull()
    })

    // 10. Test finding a channel by its name
    it('should find channels by name', async () => {
      const CHANNEL_1 = await prisma.channel.create({
        data: { name: 'Random' },
      })

      await prisma.channel.create({
        data: { name: 'Work' },
      })

      const foundChannel = await prisma.channel.findFirst({
        where: { name: 'Random' },
      })

      expect(foundChannel?.id).toBe(CHANNEL_1.id)
    })

    // 11. Test updating the name of an existing channel
    it('should update channel name', async () => {
      const channel = await prisma.channel.create({
        data: { name: 'Old Name' },
      })

      const updatedChannel = await prisma.channel.update({
        where: { id: channel.id },
        data: { name: 'New Name' },
      })

      expect(updatedChannel.name).toBe('New Name')
    })
  })

  // ------ CHANNEL MEMBER MODEL TESTS -----
  describe('ChannelMember Model Tests', () => {
    let USER_1, USER_2, CHANNEL_1, CHANNEL_2

    // Create two users and two channels for membership tests
    beforeEach(async () => {
      [USER_1, USER_2] = await createTestUsers(['member1', 'member2']);
      [CHANNEL_1, CHANNEL_2] = await createTestChannels(['Channel 1', 'Channel 2'])
    })

    // 12. Test creating a channel membership between a user and a channel
    it('should create channel membership', async () => {
      const membership = await prisma.channelMember.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
        },
        include: {
          user: true,
          channel: true,
        },
      })

      expect(membership.user.username).toBe('member1')
      expect(membership.channel.name).toBe('Channel 1')
    })

    // 13. Test preventing duplicate memberships (same user and channel)
    it('should prevent duplicate memberships', async () => {
      await prisma.channelMember.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
        },
      })

      await expect(
        prisma.channelMember.create({
          data: {
            userId: USER_1.id,
            channelId: CHANNEL_1.id,
          },
        })
      ).rejects.toThrow()
    })

    // 14. Test allowing a single user to join multiple different channels
    it('should allow user to join multiple channels', async () => {
      await prisma.channelMember.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
        },
      })

      await prisma.channelMember.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_2.id,
        },
      })

      const memberships = await prisma.channelMember.findMany({
        where: { userId: USER_1.id },
        include: { channel: true },
      })

      expect(memberships).toHaveLength(2)
      expect(memberships.some((m) => m.channel.name === 'Channel 1')).toBe(
        true
      )
      expect(memberships.some((m) => m.channel.name === 'Channel 2')).toBe(
        true
      )
    })

    // 15. Test allowing a single channel to have multiple different users
    it('should allow channel to have multiple members', async () => {
      await prisma.channelMember.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
        },
      })

      await prisma.channelMember.create({
        data: {
          userId: USER_2.id,
          channelId: CHANNEL_1.id,
        },
      })

      const memberships = await prisma.channelMember.findMany({
        where: { channelId: CHANNEL_1.id },
        include: { user: true },
      })

      expect(memberships).toHaveLength(2)
      expect(memberships.some((m) => m.user.username === 'member1')).toBe(true)
      expect(memberships.some((m) => m.user.username === 'member2')).toBe(true)
    })

    // 16. Test that memberships are deleted when a user is deleted (cascade)
    it('should cascade delete on user deletion', async () => {
      await prisma.channelMember.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
        },
      })

      await prisma.user.delete({
        where: { id: USER_1.id },
      })

      const memberships = await prisma.channelMember.findMany({
        where: { userId: USER_1.id },
      })

      expect(memberships).toHaveLength(0)
    })

    // 17. Test that memberships are deleted when a channel is deleted (cascade)
    it('should cascade delete on channel deletion', async () => {
      await prisma.channelMember.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
        },
      })

      await prisma.channel.delete({
        where: { id: CHANNEL_1.id },
      })

      const memberships = await prisma.channelMember.findMany({
        where: { channelId: CHANNEL_1.id },
      })

      expect(memberships).toHaveLength(0)
    })
  })

  // ------ MESSAGE MODEL TESTS -----
  describe('Message Model Tests', () => {
    let USER_1, USER_2, CHANNEL_1

    // Create two users and one channel for message tests
    beforeEach(async () => {
      [USER_1, USER_2] = await createTestUsers(['msguser1', 'msguser2'])
      CHANNEL_1 = await createTestChannel('Message Channel')
    })

    // 18. Test message creation without a mention
    it('should create message without mention', async () => {
      const MESSAGE_1 = await prisma.message.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
          content: 'Hello everyone!',
        },
        include: {
          user: true,
          channel: true,
        },
      })

      expect(MESSAGE_1.content).toBe('Hello everyone!')
      expect(MESSAGE_1.user.username).toBe('msguser1')
      expect(MESSAGE_1.channel.name).toBe('Message Channel')
      expect(MESSAGE_1.mentionedUserId).toBeNull()
    })

    // 19. Test message creation with a mention
    it('should create message with mention', async () => {
      const MESSAGE_1 = await prisma.message.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
          mentionedUserId: USER_2.id,
          content: 'Hello @msguser2!',
        },
        include: {
          user: true,
          channel: true,
          mentionedUser: true,
        },
      })

      expect(MESSAGE_1.content).toBe('Hello @msguser2!')
      expect(MESSAGE_1.mentionedUser?.username).toBe('msguser2')
    })

    // 20. Test that deleting a mentioned user sets mentionedUserId to null
    it('should handle mention user deletion with SetNull', async () => {
      const MESSAGE_1 = await prisma.message.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
          mentionedUserId: USER_2.id,
          content: 'Hello @msguser2!',
        },
      })

      await prisma.user.delete({
        where: { id: USER_2.id },
      })

      const updatedMessage = await prisma.message.findUnique({
        where: { id: MESSAGE_1.id },
      })

      expect(updatedMessage?.mentionedUserId).toBeNull()
    })

    // 21. Test cascade deletion when the message author is deleted
    it('should cascade delete on author deletion', async () => {
      await prisma.message.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
          content: 'This will be deleted',
        },
      })

      await prisma.user.delete({
        where: { id: USER_1.id },
      })

      const messages = await prisma.message.findMany({
        where: { userId: USER_1.id },
      })

      expect(messages).toHaveLength(0)
    })

    // 22. Test cascade deletion when the channel is deleted
    it('should cascade delete on channel deletion', async () => {
      await prisma.message.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
          content: 'This will be deleted',
        },
      })

      await prisma.channel.delete({
        where: { id: CHANNEL_1.id },
      })

      const messages = await prisma.message.findMany({
        where: { channelId: CHANNEL_1.id },
      })

      expect(messages).toHaveLength(0)
    })

    // 23. Test ordering of messages by createdAt timestamp
    it('should order messages by creation time', async () => {
      await prisma.message.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
          content: 'First message',
        },
      })

      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10))

      await prisma.message.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
          content: 'Second message',
        },
      })

      const messages = await prisma.message.findMany({
        where: { channelId: CHANNEL_1.id },
        orderBy: { createdAt: 'asc' },
      })

      expect(messages).toHaveLength(2)
      expect(messages[0].content).toBe('First message')
      expect(messages[1].content).toBe('Second message')
    })
  })

  // ------ DIRECT MESSAGES MODEL TESTS ------
  describe('DirectMessage Model Tests', () => {
    let SENDER_USER, RECEIVER_USER

    beforeEach(async () => {
      [SENDER_USER, RECEIVER_USER] = await createTestUsers(['sender', 'receiver'])
    })

    // 24. Test creation of a direct message between two users
    it('should create direct message', async () => {
      const DM = await prisma.directMessage.create({
        data: {
          senderId: SENDER_USER.id,
          receiverId: RECEIVER_USER.id,
          content: 'Hello there!',
        },
        include: {
          sender: true,
          receiver: true,
        },
      })

      expect(DM.content).toBe('Hello there!')
      expect(DM.sender.username).toBe('sender')
      expect(DM.receiver.username).toBe('receiver')
    })

    // 25. Test multiple messages can be exchanged between two users
    it('should allow multiple messages between users', async () => {
      await prisma.directMessage.create({
        data: {
          senderId: SENDER_USER.id,
          receiverId: RECEIVER_USER.id,
          content: 'First message',
        },
      })

      await prisma.directMessage.create({
        data: {
          senderId: RECEIVER_USER.id,
          receiverId: SENDER_USER.id,
          content: 'Reply message',
        },
      })

      const messages = await prisma.directMessage.findMany({
        where: {
          OR: [
            { senderId: SENDER_USER.id, receiverId: RECEIVER_USER.id },
            { senderId: RECEIVER_USER.id, receiverId: SENDER_USER.id },
          ],
        },
        orderBy: { createdAt: 'asc' },
      })

      expect(messages).toHaveLength(2)
      expect(messages[0].content).toBe('First message')
      expect(messages[1].content).toBe('Reply message')
    })

    // 26. Test cascade deletion of direct messages when sender is deleted
    it('should cascade delete on sender deletion', async () => {
      await prisma.directMessage.create({
        data: {
          senderId: SENDER_USER.id,
          receiverId: RECEIVER_USER.id,
          content: 'Test message',
        },
      })

      await prisma.user.delete({
        where: { id: SENDER_USER.id },
      })

      const messages = await prisma.directMessage.findMany({
        where: { senderId: SENDER_USER.id },
      })

      expect(messages).toHaveLength(0)
    })

    // 27. Test cascade deletion of direct messages when receiver is deleted
    it('should cascade delete on receiver deletion', async () => {
      await prisma.directMessage.create({
        data: {
          senderId: SENDER_USER.id,
          receiverId: RECEIVER_USER.id,
          content: 'Test message',
        },
      })

      await prisma.user.delete({
        where: { id: RECEIVER_USER.id },
      })

      const messages = await prisma.directMessage.findMany({
        where: { receiverId: RECEIVER_USER.id },
      })

      expect(messages).toHaveLength(0)
    })
  })

  // ------ USER CHANNEL READ MODEL TESTS -----
  describe('UserChannelRead Model Tests', () => {
    let USER_1, USER_2, CHANNEL_1, MESSAGE_1

    // Create two users, a channel, and a message before each test
    beforeEach(async () => {
      [USER_1, USER_2] = await createTestUsers(['readuser1', 'readuser2'])
      CHANNEL_1 = await createTestChannel('Read Test Channel')

      MESSAGE_1 = await prisma.message.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
          content: 'Test message for read state',
        },
      })
    })

    // 28. Test creation of a read state for a user in a channel
    it('should create channel read state', async () => {
      const readState = await prisma.userChannelRead.create({
        data: {
          userId: USER_2.id,
          channelId: CHANNEL_1.id,
          lastReadMessageId: MESSAGE_1.id,
        },
        include: {
          user: true,
          channel: true,
          lastReadMessage: true,
        },
      })

      expect(readState.user.username).toBe('readuser2')
      expect(readState.channel.name).toBe('Read Test Channel')
      expect(readState.lastReadMessage.content).toBe(
        'Test message for read state'
      )
    })

    // 29. Test prevention of duplicate read states for the same user and channel
    it('should prevent duplicate read states per user/channel', async () => {
      await prisma.userChannelRead.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
          lastReadMessageId: MESSAGE_1.id,
        },
      })

      await expect(
        prisma.userChannelRead.create({
          data: {
            userId: USER_1.id,
            channelId: CHANNEL_1.id,
            lastReadMessageId: MESSAGE_1.id,
          },
        })
      ).rejects.toThrow()
    })

    // 30. Test that the same user can have read states in different channels
    it('should allow same user to have read states in different channels', async () => {
      const CHANNEL_2 = await prisma.channel.create({
        data: { name: 'Second Channel' },
      })

      const MESSAGE_2 = await prisma.message.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_2.id,
          content: 'Message in second channel',
        },
      })

      await prisma.userChannelRead.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
          lastReadMessageId: MESSAGE_1.id,
        },
      })

      await prisma.userChannelRead.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_2.id,
          lastReadMessageId: MESSAGE_2.id,
        },
      })

      const readStates = await prisma.userChannelRead.findMany({
        where: { userId: USER_1.id },
      })

      expect(readStates).toHaveLength(2)
    })

    // 31. Test updating the read state to point to a newer message
    it('should update read state', async () => {
      const readState = await prisma.userChannelRead.create({
        data: {
          userId: USER_2.id,
          channelId: CHANNEL_1.id,
          lastReadMessageId: MESSAGE_1.id,
        },
      })

      const MESSAGE_2 = await prisma.message.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
          content: 'Newer message',
        },
      })

      const updatedReadState = await prisma.userChannelRead.update({
        where: { id: readState.id },
        data: { lastReadMessageId: MESSAGE_2.id },
      })

      expect(updatedReadState.lastReadMessageId).toBe(MESSAGE_2.id)
    })

    // 32. Test cascade deletion of read states when user is deleted
    it('should cascade delete on user deletion', async () => {
      await prisma.userChannelRead.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
          lastReadMessageId: MESSAGE_1.id,
        },
      })

      await prisma.user.delete({
        where: { id: USER_1.id },
      })

      const readStates = await prisma.userChannelRead.findMany({
        where: { userId: USER_1.id },
      })

      expect(readStates).toHaveLength(0)
    })

    // 33. Test cascade deletion of read states when channel is deleted
    it('should cascade delete on channel deletion', async () => {
      await prisma.userChannelRead.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
          lastReadMessageId: MESSAGE_1.id,
        },
      })

      await prisma.channel.delete({
        where: { id: CHANNEL_1.id },
      })

      const readStates = await prisma.userChannelRead.findMany({
        where: { channelId: CHANNEL_1.id },
      })

      expect(readStates).toHaveLength(0)
    })
  })

  // ------ USER DM READ MODEL TESTS -----
  describe('UserDMRead Model Tests', () => {
    let USER_1, USER_2, DIRECT_MESSAGE

    // Create two users and a direct message between them before each test
    beforeEach(async () => {
      [USER_1, USER_2] = await createTestUsers(['dmuser1', 'dmuser2'])

      DIRECT_MESSAGE = await prisma.directMessage.create({
        data: {
          senderId: USER_1.id,
          receiverId: USER_2.id,
          content: 'Direct message for read state',
        },
      })
    })

    // 34. Test creation of a DM read state for a user
    it('should create DM read state', async () => {
      const readState = await prisma.userDMRead.create({
        data: {
          userId: USER_2.id,
          otherUserId: USER_1.id,
          lastReadDMId: DIRECT_MESSAGE.id,
        },
        include: {
          user: true,
          otherUser: true,
          lastReadDM: true,
        },
      })

      expect(readState.user.username).toBe('dmuser2')
      expect(readState.otherUser.username).toBe('dmuser1')
      expect(readState.lastReadDM.content).toBe(
        'Direct message for read state'
      )
    })

    // 35. Test prevention of duplicate DM read states between the same user pair
    it('should prevent duplicate read states per user/other user', async () => {
      await prisma.userDMRead.create({
        data: {
          userId: USER_1.id,
          otherUserId: USER_2.id,
          lastReadDMId: DIRECT_MESSAGE.id,
        },
      })

      await expect(
        prisma.userDMRead.create({
          data: {
            userId: USER_1.id,
            otherUserId: USER_2.id,
            lastReadDMId: DIRECT_MESSAGE.id,
          },
        })
      ).rejects.toThrow()
    })

    // 36. Test that read states can exist in both directions between two users
    it('should allow bidirectional read states', async () => {
      // USER_1 reads messages from USER_2
      await prisma.userDMRead.create({
        data: {
          userId: USER_1.id,
          otherUserId: USER_2.id,
          lastReadDMId: DIRECT_MESSAGE.id,
        },
      })

      // USER_2 reads messages from USER_1
      await prisma.userDMRead.create({
        data: {
          userId: USER_2.id,
          otherUserId: USER_1.id,
          lastReadDMId: DIRECT_MESSAGE.id,
        },
      })

      const readStates = await prisma.userDMRead.findMany()
      expect(readStates).toHaveLength(2)
    })

    // 37. Test updating a DM read state with a newer direct message
    it('should update DM read state', async () => {
      const readState = await prisma.userDMRead.create({
        data: {
          userId: USER_2.id,
          otherUserId: USER_1.id,
          lastReadDMId: DIRECT_MESSAGE.id,
        },
      })

      const NEW_DM = await prisma.directMessage.create({
        data: {
          senderId: USER_1.id,
          receiverId: USER_2.id,
          content: 'Newer direct message',
        },
      })

      const updatedReadState = await prisma.userDMRead.update({
        where: { id: readState.id },
        data: { lastReadDMId: NEW_DM.id },
      })

      expect(updatedReadState.lastReadDMId).toBe(NEW_DM.id)
    })

    // 38. Test cascade deletion of DM read states when the user is deleted
    it('should cascade delete on user deletion', async () => {
      await prisma.userDMRead.create({
        data: {
          userId: USER_1.id,
          otherUserId: USER_2.id,
          lastReadDMId: DIRECT_MESSAGE.id,
        },
      })

      await prisma.user.delete({
        where: { id: USER_1.id },
      })

      const readStates = await prisma.userDMRead.findMany({
        where: { userId: USER_1.id },
      })

      expect(readStates).toHaveLength(0)
    })

    // 39. Test cascade deletion of DM read states when the other user is deleted
    it('should cascade delete on other user deletion', async () => {
      await prisma.userDMRead.create({
        data: {
          userId: USER_1.id,
          otherUserId: USER_2.id,
          lastReadDMId: DIRECT_MESSAGE.id,
        },
      })

      await prisma.user.delete({
        where: { id: USER_2.id },
      })

      const readStates = await prisma.userDMRead.findMany({
        where: { otherUserId: USER_2.id },
      })

      expect(readStates).toHaveLength(0)
    })
  })

  // ------ COMPLEX RELATIONSHIP TESTS -----
  describe('Complex Relationship Tests', () => {
    let USER_1, USER_2, CHANNEL_1, CHANNEL_2

    beforeEach(async () => {
      [USER_1, USER_2] = await createTestUsers(['complexuser1', 'complexuser2']);
      [CHANNEL_1, CHANNEL_2] = await createTestChannels(['Complex Channel 1', 'Complex Channel 2'])
    })

    // 40. Test complex nested queries involving users, their channel memberships, messages (including mentions), and read states to verify correct data retrieval with deep relational includes.
    it('should handle complex nested queries with user relationships', async () => {
      // Create memberships
      await prisma.channelMember.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
        },
      })

      await prisma.channelMember.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_2.id,
        },
      })

      // Create messages
      const MESSAGE_1 = await prisma.message.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
          content: 'Message in channel 1',
        },
      })

      await prisma.message.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_2.id,
          mentionedUserId: USER_2.id,
          content: 'Message with mention in channel 2',
        },
      })

      // Create read states
      await prisma.userChannelRead.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
          lastReadMessageId: MESSAGE_1.id,
        },
      })

      // Complex query to get user with all relationships
      const result = await prisma.user.findUnique({
        where: { id: USER_1.id },
        include: {
          channelMemberships: {
            include: {
              channel: {
                include: {
                  messages: {
                    include: {
                      user: true,
                      mentionedUser: true,
                    },
                  },
                },
              },
            },
          },
          channelReadStates: {
            include: {
              channel: true,
              lastReadMessage: true,
            },
          },
          messages: {
            include: {
              channel: true,
              mentionedUser: true,
            },
          },
        },
      })

      expect(result).toBeTruthy()
      expect(result.channelMemberships).toHaveLength(2)
      expect(result.channelReadStates).toHaveLength(1)
      expect(result.messages).toHaveLength(2)

      // Check nested relationships
      const channel1Messages = result.channelMemberships.find(
        (m) => m.channel.name === 'Complex Channel 1'
      )?.channel.messages
      expect(channel1Messages).toHaveLength(1)
      expect(channel1Messages[0].content).toBe('Message in channel 1')

      const channel2Messages = result.channelMemberships.find(
        (m) => m.channel.name === 'Complex Channel 2'
      )?.channel.messages
      expect(channel2Messages).toHaveLength(1)
      expect(channel2Messages[0].mentionedUser?.username).toBe('complexuser2')
    })

    // 41. Test querying a user's entire conversation context, including sent and received direct messages, mentions in channel messages, and DM read states, ensuring all relevant relationships are loaded.
    it('should handle user conversation query (DMs and mentions)', async () => {
      // Create direct messages
      await prisma.directMessage.create({
        data: {
          senderId: USER_1.id,
          receiverId: USER_2.id,
          content: 'Direct message 1',
        },
      })

      const DM_2 = await prisma.directMessage.create({
        data: {
          senderId: USER_2.id,
          receiverId: USER_1.id,
          content: 'Direct message reply',
        },
      })

      // Create channel message with mention
      await prisma.channelMember.create({
        data: {
          userId: USER_2.id,
          channelId: CHANNEL_1.id,
        },
      })

      await prisma.message.create({
        data: {
          userId: USER_2.id,
          channelId: CHANNEL_1.id,
          mentionedUserId: USER_1.id,
          content: 'Hey @complexuser1!',
        },
      })

      // Create DM read state
      await prisma.userDMRead.create({
        data: {
          userId: USER_1.id,
          otherUserId: USER_2.id,
          lastReadDMId: DM_2.id,
        },
      })

      // Query user with all conversation data
      const result = await prisma.user.findUnique({
        where: { id: USER_1.id },
        include: {
          sentMessages: {
            include: { receiver: true },
          },
          receivedMessages: {
            include: { sender: true },
          },
          mentionedIn: {
            include: {
              user: true,
              channel: true,
            },
          },
          userDMReads: {
            include: {
              otherUser: true,
              lastReadDM: true,
            },
          },
        },
      })

      expect(result.sentMessages).toHaveLength(1)
      expect(result.receivedMessages).toHaveLength(1)
      expect(result.mentionedIn).toHaveLength(1)
      expect(result.userDMReads).toHaveLength(1)

      expect(result.sentMessages[0].receiver.username).toBe('complexuser2')
      expect(result.receivedMessages[0].sender.username).toBe('complexuser2')
      expect(result.mentionedIn[0].content).toBe('Hey @complexuser1!')
    })

    // 42. Test overview of channel activity by fetching members, messages (with mentions), and read states, verifying message order and correct association of read states per user.
    it('should handle channel activity overview', async () => {
      // Setup channel with multiple users and messages
      await prisma.channelMember.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
        },
      })

      await prisma.channelMember.create({
        data: {
          userId: USER_2.id,
          channelId: CHANNEL_1.id,
        },
      })

      const MESSAGE_1 = await prisma.message.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
          content: 'First message',
        },
      })

      const MESSAGE_2 = await prisma.message.create({
        data: {
          userId: USER_2.id,
          channelId: CHANNEL_1.id,
          mentionedUserId: USER_1.id,
          content: 'Reply with mention',
        },
      })

      // Create read states
      await prisma.userChannelRead.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
          lastReadMessageId: MESSAGE_1.id,
        },
      })

      await prisma.userChannelRead.create({
        data: {
          userId: USER_2.id,
          channelId: CHANNEL_1.id,
          lastReadMessageId: MESSAGE_2.id,
        },
      })

      // Query channel with all activity
      const result = await prisma.channel.findUnique({
        where: { id: CHANNEL_1.id },
        include: {
          members: {
            include: {
              user: true,
            },
          },
          messages: {
            include: {
              user: true,
              mentionedUser: true,
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
          readState: {
            include: {
              user: true,
              lastReadMessage: true,
            },
          },
        },
      })

      expect(result.members).toHaveLength(2)
      expect(result.messages).toHaveLength(2)
      expect(result.readState).toHaveLength(2)

      // Check message ordering
      expect(result.messages[0].content).toBe('First message')
      expect(result.messages[1].content).toBe('Reply with mention')

      // Check read states
      const user1ReadState = result.readState.find(
        (rs) => rs.user.username === 'complexuser1'
      )
      const user2ReadState = result.readState.find(
        (rs) => rs.user.username === 'complexuser2'
      )

      expect(user1ReadState?.lastReadMessage.content).toBe('First message')
      expect(user2ReadState?.lastReadMessage.content).toBe(
        'Reply with mention'
      )
    })

    // 43. Test that cascading deletes across multiple related models (users, messages, direct messages, memberships, read states) work properly, including nullifying mentions on messages when the mentioned user is deleted.
    it('should handle cross-model cascading deletes correctly', async () => {
      // Create complex interconnected data
      await prisma.channelMember.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
        },
      })

      const MESSAGE_1 = await prisma.message.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
          mentionedUserId: USER_2.id,
          content: 'Message with mention',
        },
      })

      const DM_1 = await prisma.directMessage.create({
        data: {
          senderId: USER_1.id,
          receiverId: USER_2.id,
          content: 'Direct message',
        },
      })

      await prisma.userChannelRead.create({
        data: {
          userId: USER_2.id,
          channelId: CHANNEL_1.id,
          lastReadMessageId: MESSAGE_1.id,
        },
      })

      await prisma.userDMRead.create({
        data: {
          userId: USER_2.id,
          otherUserId: USER_1.id,
          lastReadDMId: DM_1.id,
        },
      })

      // Delete USER_1 and verify cascading
      await prisma.user.delete({
        where: { id: USER_1.id },
      })

      // Check that related data was properly handled
      const messages = await prisma.message.findMany({
        where: { userId: USER_1.id },
      })
      expect(messages).toHaveLength(0)

      const dms = await prisma.directMessage.findMany({
        where: { senderId: USER_1.id },
      })
      expect(dms).toHaveLength(0)

      const memberships = await prisma.channelMember.findMany({
        where: { userId: USER_1.id },
      })
      expect(memberships).toHaveLength(0)

      const dmReads = await prisma.userDMRead.findMany({
        where: { otherUserId: USER_1.id },
      })
      expect(dmReads).toHaveLength(0)

      // Check that mentioned user was set to null
      const remainingMessages = await prisma.message.findMany({
        where: { mentionedUserId: USER_1.id },
      })
      expect(remainingMessages).toHaveLength(0)
    })

    // 44. Test retrieving unread messages for a user in a channel by comparing messages created after the user's last read message, validating correct filtering and ordering of unread messages.
    it('should find unread messages for user', async () => {
      // Setup channel membership
      await prisma.channelMember.create({
        data: {
          userId: USER_2.id,
          channelId: CHANNEL_1.id,
        },
      })

      // Create messages
      const MESSAGE_1 = await prisma.message.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
          content: 'First message',
        },
      })

      await new Promise((resolve) => setTimeout(resolve, 10))

      await prisma.message.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
          content: 'Second message',
        },
      })

      await new Promise((resolve) => setTimeout(resolve, 10))

      await prisma.message.create({
        data: {
          userId: USER_1.id,
          channelId: CHANNEL_1.id,
          content: 'Third message',
        },
      })

      // User has only read up to MESSAGE_1
      await prisma.userChannelRead.create({
        data: {
          userId: USER_2.id,
          channelId: CHANNEL_1.id,
          lastReadMessageId: MESSAGE_1.id,
        },
      })

      // Query for unread messages
      const readState = await prisma.userChannelRead.findUnique({
        where: {
          userId_channelId: {
            userId: USER_2.id,
            channelId: CHANNEL_1.id,
          },
        },
        include: {
          lastReadMessage: true,
        },
      })

      const unreadMessages = await prisma.message.findMany({
        where: {
          channelId: CHANNEL_1.id,
          createdAt: {
            gt: readState?.lastReadMessage.createdAt,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      })

      expect(unreadMessages).toHaveLength(2)
      expect(unreadMessages[0].content).toBe('Second message')
      expect(unreadMessages[1].content).toBe('Third message')
    })
  })

  // ------ PERFORMANCE AND STRESS TESTS -----
  describe('Performance and Stress Tests', () => {
    beforeEach(async () => {
      await clearDatabase()
    })

    // 45. Performance test for bulk user creation, ensuring that creating 100 users completes efficiently within a time threshold and that all users are correctly inserted.
    it('should handle bulk user creation efficiently', async () => {
      const users = Array.from({ length: 100 }, (_, i) => ({
        username: `bulk_user_${i}`,
        email: `bulk_user_${i}@example.com`,
        passwordHash: 'hash123',
      }))

      const start = Date.now()
      await prisma.user.createMany({
        data: users,
      })
      const end = Date.now()

      expect(end - start).toBeLessThan(5000)

      const userCount = await prisma.user.count()
      expect(userCount).toBe(100)
    })

    it('should handle bulk message creation efficiently', async () => {
      const USER_AUTHOR = await prisma.user.create({
        data: {
          username: 'bulk_author',
          email: 'bulk_author@example.com',
          passwordHash: 'hash123',
        },
      })

      const BULK_CHANNEL = await prisma.channel.create({
        data: { name: 'Bulk Channel' },
      })

      const messages = Array.from({ length: 500 }, (_, i) => ({
        userId: USER_AUTHOR.id,
        channelId: BULK_CHANNEL.id,
        content: `Bulk message ${i}`,
      }))

      const start = Date.now()
      await prisma.message.createMany({
        data: messages,
      })
      const end = Date.now()

      expect(end - start).toBeLessThan(10000)

      const messageCount = await prisma.message.count({
        where: { channelId: BULK_CHANNEL.id },
      })
      expect(messageCount).toBe(500)
    })

    // 46. Performance test for handling concurrent message creation operations, verifying that multiple simultaneous writes complete quickly and that the total messages created match expectations.
    it('should handle concurrent read/write operations', async () => {
      const CONCURRENT_USER = await prisma.user.create({
        data: {
          username: 'concurrent_user',
          email: 'concurrent_user@example.com',
          passwordHash: 'hash123',
        },
      })

      const CONCURRENT_CHANNEL = await prisma.channel.create({
        data: { name: 'Concurrent Channel' },
      })

      // Create concurrent operations
      const operations = Array.from({ length: 20 }, (_, i) => {
        return prisma.message.create({
          data: {
            userId: CONCURRENT_USER.id,
            channelId: CONCURRENT_CHANNEL.id,
            content: `Concurrent message ${i}`,
          },
        })
      })

      const start = Date.now()
      await Promise.all(operations)
      const end = Date.now()

      expect(end - start).toBeLessThan(3000)

      const messageCount = await prisma.message.count({
        where: { channelId: CONCURRENT_CHANNEL.id },
      })
      expect(messageCount).toBe(20)
    })
  })
})
