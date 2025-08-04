import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { createApp } from '../app.js'
import {
  clearDatabase,
  createTestUser,
  createTestChannel,
  getTestDb,
  disconnectTestDb
} from '../test/database.js'

vi.mock('../socket-handlers/socket.js', () => ({
  getIO: vi.fn(() => ({
    emit: vi.fn(),
  })),
  setIO: vi.fn(),
}))

const createToken = (user) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'test-secret'
  return jwt.sign({
    id: user.id,
    email: user.email,
    username: user.username
  }, JWT_SECRET, {
    expiresIn: '24h',
  })
}

describe('User API Routes', () => {
  let app
  let prisma
  let testUser
  let authToken

  beforeAll(async () => {
    const appData = createApp()
    app = appData.app
    prisma = appData.prisma
  })

  beforeEach(async () => {
    await clearDatabase()
    testUser = await createTestUser('testuser', 'test@example.com', {
      status: 'ONLINE',
    })
    authToken = createToken(testUser)
  })

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect()
    }
    await disconnectTestDb()
  })

  describe('GET /api/user/me', () => {
    it('should return 401 when no authorization header is provided', async () => {
      const response = await request(app)
        .get('/api/user/me')
        .expect(401)

      expect(response.body).toEqual({
        error: 'Authorization header missing',
      })
    })

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/user/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
        status: testUser.status,
      })
      expect(response.body.createdAt).toBeDefined()
      expect(response.body.updatedAt).toBeDefined()
    })
  })

  describe('GET /api/user/channels', () => {
    it('should return 401 when no authorization header is provided', async () => {
      await request(app)
        .get('/api/user/channels')
        .expect(401)
    })

    it('should return all public channels and private channels user is member of', async () => {
      const db = getTestDb()

      const publicChannel = await createTestChannel('Public Channel')
      const privateChannel1 = await db.channel.create({
        data: {
          name: 'Private Channel 1',
          isPrivate: true,
        },
      })
      const privateChannel2 = await db.channel.create({
        data: {
          name: 'Private Channel 2',
          isPrivate: true,
        },
      })

      await db.channelMember.create({
        data: {
          userId: testUser.id,
          channelId: privateChannel1.id,
        },
      })

      const response = await request(app)
        .get('/api/user/channels')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveLength(2)
      const channelIds = response.body.map(ch => ch.id)

      expect(channelIds).toContain(publicChannel.id)
      expect(channelIds).toContain(privateChannel1.id)
      expect(channelIds).not.toContain(privateChannel2.id)
    })
  })

  describe('POST /api/user/channels', () => {
    it('should return 401 when no authorization header is provided', async () => {
      await request(app)
        .post('/api/user/channels')
        .send({ name: 'Test Channel' })
        .expect(401)
    })

    it('should create a public channel and add all users as members', async () => {
      const user2 = await createTestUser('user2', 'user2@example.com')

      const channelData = {
        name: 'Public Channel',
        description: 'A test channel',
        isPrivate: false,
      }

      const response = await request(app)
        .post('/api/user/channels')
        .set('Authorization', `Bearer ${authToken}`)
        .send(channelData)
        .expect(201)

      expect(response.body).toMatchObject({
        name: channelData.name,
        description: channelData.description,
        isPrivate: false,
      })

      const db = getTestDb()
      const members = await db.channelMember.findMany({
        where: { channelId: response.body.id },
        select: { userId: true },
      })

      const memberIds = members.map(m => m.userId)
      expect(memberIds).toContain(testUser.id)
      expect(memberIds).toContain(user2.id)
      expect(members).toHaveLength(2)
    })

    it('should create a private channel with only creator as member', async () => {
      await createTestUser('user2', 'user2@example.com')

      const channelData = {
        name: 'Private Channel',
        isPrivate: true,
      }

      const response = await request(app)
        .post('/api/user/channels')
        .set('Authorization', `Bearer ${authToken}`)
        .send(channelData)
        .expect(201)

      expect(response.body.isPrivate).toBe(true)

      const db = getTestDb()
      const members = await db.channelMember.findMany({
        where: { channelId: response.body.id },
      })
      expect(members).toHaveLength(1)
      expect(members[0].userId).toBe(testUser.id)
    })

    it('should return 400 when name exceeds 100 characters', async () => {
      const channelData = {
        name: 'A'.repeat(101),
        isPrivate: false,
      }

      const response = await request(app)
        .post('/api/user/channels')
        .set('Authorization', `Bearer ${authToken}`)
        .send(channelData)
        .expect(400)

      expect(response.body).toEqual({
        error: 'Name exceeds 100 characters.',
      })
    })
  })

  describe('DELETE /api/user/channels/:id', () => {
    let channelToDelete

    beforeEach(async () => {
      channelToDelete = await createTestChannel('Channel to Delete')
    })

    it('should delete an existing channel', async () => {
      const response = await request(app)
        .delete(`/api/user/channels/${channelToDelete.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toEqual({
        message: 'Channel deleted successfully',
      })

      const db = getTestDb()
      const channel = await db.channel.findUnique({
        where: { id: channelToDelete.id },
      })
      expect(channel).toBeNull()
    })

    it('should return 404 when channel does not exist', async () => {
      const response = await request(app)
        .delete('/api/user/channels/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body).toEqual({
        error: 'Channel not found',
      })
    })

    it('should cascade delete channel members', async () => {
      const db = getTestDb()

      await db.channelMember.create({
        data: {
          userId: testUser.id,
          channelId: channelToDelete.id,
        },
      })

      await request(app)
        .delete(`/api/user/channels/${channelToDelete.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      const members = await db.channelMember.findMany({
        where: { channelId: channelToDelete.id },
      })
      expect(members).toHaveLength(0)
    })
  })

  describe('GET /api/user/channels/:channelId/messages', () => {
    let testChannel

    beforeEach(async () => {
      testChannel = await createTestChannel('Test Channel')
      const db = getTestDb()
      await db.channelMember.create({
        data: {
          userId: testUser.id,
          channelId: testChannel.id,
        },
      })
    })

    it('should return messages for channel member', async () => {
      const db = getTestDb()
      await db.message.create({
        data: {
          content: 'Hello world',
          userId: testUser.id,
          channelId: testChannel.id,
        },
      })

      const response = await request(app)
        .get(`/api/user/channels/${testChannel.id}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveLength(1)
      expect(response.body[0]).toMatchObject({
        text: 'Hello world',
        username: testUser.username,
        userId: testUser.id,
      })
    })

    it('should return 403 when user is not a channel member', async () => {
      const nonMemberChannel = await createTestChannel('Non Member Channel', { isPrivate: true })

      const response = await request(app)
        .get(`/api/user/channels/${nonMemberChannel.id}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403)

      console.log(response.body)
      expect(response.body).toEqual({
        error: 'Not a member of this channel',
      })
    })
  })

  describe('POST /api/user/channels/:channelId/members', () => {
    let testChannel

    beforeEach(async () => {
      testChannel = await createTestChannel('Test Channel')
    })

    it('should add user to channel', async () => {
      const newUser = await createTestUser('newuser', 'newuser@example.com')

      const response = await request(app)
        .post(`/api/user/channels/${testChannel.id}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ username: 'newuser' })
        .expect(201)

      expect(response.body.message).toBe('User added to channel')

      const db = getTestDb()
      const membership = await db.channelMember.findUnique({
        where: {
          userId_channelId: {
            userId: newUser.id,
            channelId: testChannel.id,
          },
        },
      })
      expect(membership).toBeTruthy()
    })

    it('should return 400 when username is missing', async () => {
      const response = await request(app)
        .post(`/api/user/channels/${testChannel.id}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400)

      expect(response.body).toEqual({
        error: 'Username is required',
      })
    })

    it('should return 404 when user does not exist', async () => {
      const response = await request(app)
        .post(`/api/user/channels/${testChannel.id}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ username: 'nonexistent' })
        .expect(404)

      expect(response.body).toEqual({
        error: 'User not found',
      })
    })

    it('should return 409 when user is already a member', async () => {
      const existingUser = await createTestUser('existing', 'existing@example.com')
      const db = getTestDb()
      await db.channelMember.create({
        data: {
          userId: existingUser.id,
          channelId: testChannel.id,
        },
      })

      const response = await request(app)
        .post(`/api/user/channels/${testChannel.id}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ username: 'existing' })
        .expect(409)

      expect(response.body).toEqual({
        error: 'User is already a member of this channel',
      })
    })
  })
})
