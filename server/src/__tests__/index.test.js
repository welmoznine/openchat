import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import request from 'supertest'
import { createApp, handleSocketConnection } from '../app.js'
import { clearDatabase, disconnectTestDb } from '../test/database.js'

describe('Express Server', () => {
  let app

  beforeAll(async () => {
    await clearDatabase()
    app = createApp()
  })

  afterAll(async () => {
    await disconnectTestDb()
  })

  describe('GET /', () => {
    it('should return server running message', async () => {
      const response = await request(app)
        .get('/')
        .expect(200)

      expect(response.body).toEqual({
        message: 'Server is running!'
      })
    })
  })

  describe('GET /health', () => {
    it('should return healthy status when database is connected', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)

      expect(response.body).toEqual({
        status: 'healthy',
        database: 'connected'
      })
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

describe('Socket.io Handler', () => {
  it('should be a function', () => {
    expect(typeof handleSocketConnection).toBe('function')
  })

  it('should handle socket without errors', () => {
    const mockSocket = {
      id: 'test-socket-id',
      on: vi.fn(),
      emit: vi.fn()
    }

    expect(() => handleSocketConnection(mockSocket)).not.toThrow()
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function))
  })
})
