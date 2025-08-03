import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import bcrypt from 'bcryptjs'
import { createApp } from '../app.js'
import {
  clearDatabase,
  createTestUser,
  getTestDb,
  disconnectTestDb
} from '../test/database.js'

vi.mock('../socket-handlers/socket.js', () => ({
  getIO: vi.fn(() => ({
    emit: vi.fn(),
  })),
  setIO: vi.fn(),
}))

describe('Auth Routes', () => {
  let app
  let prisma

  beforeAll(async () => {
    const appData = createApp()
    app = appData.app
    prisma = appData.prisma
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect()
    }
    await disconnectTestDb()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body.message).toBe('User registered successfully')
      expect(response.body.token).toBeDefined()
      expect(response.body.user).toMatchObject({
        email: userData.email,
        username: userData.username
      })
      expect(response.body.user.id).toBeDefined()

      const db = getTestDb()
      const user = await db.user.findUnique({
        where: { email: userData.email }
      })
      expect(user).toBeTruthy()
      expect(user.username).toBe(userData.username)
    })

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' })
        .expect(400)

      expect(response.body.error).toBe('Email, username, and password are required.')
    })

    it('should return 409 when user already exists', async () => {
      await createTestUser('testuser', 'test@example.com')

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123'
        })
        .expect(409)

      expect(response.body.message).toBe('User with this email or username already exists.')
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('password123', 10)
      const db = getTestDb()
      await db.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          passwordHash: hashedPassword
        }
      })
    })

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200)

      expect(response.body.message).toBe('Login successful.')
      expect(response.body.token).toBeDefined()
      expect(response.body.user).toMatchObject({
        email: 'test@example.com'
      })
    })

    it('should return 400 when credentials are missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400)

      expect(response.body.message).toBe('Email and password required.')
    })

    it('should return 401 when user does not exist', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401)

      expect(response.body.message).toBe('Invalid email or password.')
    })

    it('should return 401 when password is incorrect', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401)

      expect(response.body.message).toBe('Invalid email or password.')
    })
  })
})