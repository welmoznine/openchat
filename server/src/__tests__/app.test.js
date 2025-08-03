import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { disconnectTestDb } from '../test/database.js'

vi.mock('../socket-handlers/socket.js', () => ({
  getIO: vi.fn(() => ({
    emit: vi.fn(),
  })),
  setIO: vi.fn(),
}))

describe('App Routes', () => {
  let app
  let prisma

  beforeAll(async () => {
    const appData = createApp()
    app = appData.app
    prisma = appData.prisma
  })

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect()
    }
    await disconnectTestDb()
  })

  describe('GET /', () => {
    it('should return 200 status', async () => {
      await request(app)
        .get('/')
        .expect(200)
    })
  })

  describe('GET /health', () => {
    it('should return 200 status', async () => {
      await request(app)
        .get('/health')
        .expect(200)
    })
  })

  describe('404 handling', () => {
    it('should return 404 for unknown routes', async () => {
      await request(app)
        .get('/unknown-route')
        .expect(404)
    })
  })
})