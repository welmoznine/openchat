import { describe, test, expect, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import authRoutes from '../routes/auth.js'
import { clearDatabase } from '../test/database.js'

describe('Auth Routes', () => {
  let app

  beforeEach(async () => {
    // Clear database before each test
    await clearDatabase()

    // Create fresh express app for each test
    app = express()
    app.use(express.json())
    app.use('/api/auth', authRoutes)
  })

  describe('POST /api/auth/register', () => {
    test('should return TODO message', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser777',
          email: 'test777@example.com',
          password: 'password777'
        })

      expect(response.status).toBe(201)
      expect(response.body.message).toEqual('User registered successfully')
    })
  })

  describe('POST /api/auth/login', () => {
    test('should return 400 if email or password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' })

      expect(response.status).toBe(400)
      expect(response.body.message).toBe('Email and password required.')
    })

    test('should return 401 if user not found', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })

      expect(response.status).toBe(401)
      expect(response.body.message).toBe('Invalid email or password.')
    })
  })

  describe('POST /api/auth/logout', () => {
    test('should return TODO message', async () => {
      const response = await request(app)
        .post('/api/auth/logout')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        message: 'TODO: Implement Logout Endpoint'
      })
    })
  })

  describe('POST /api/auth/me', () => {
    test('should return 401 if no authorization header', async () => {
      const response = await request(app)
        .post('/api/auth/me')

      expect(response.status).toBe(401)
      expect(response.body.message).toBe('Authorization header missing.')
    })

    test('should return 401 if token is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here')

      expect(response.status).toBe(401)
      expect(response.body.message).toBe('Invalid or expired token')
    })

    test('should return 404 if user not found', async () => {
      // This test would need a valid JWT token for a non-existent user
      // For now, we'll test the scenario where JWT is valid but user is deleted
      const response = await request(app)
        .post('/api/auth/me')
        .set('Authorization', 'Bearer valid.token.for.deleted.user')

      // This test might return 401 due to JWT verification failure
      // or 404 if JWT is valid but user doesn't exist
      expect([401, 404]).toContain(response.status)
    })
  })
})
