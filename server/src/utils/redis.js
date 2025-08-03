import Redis from 'ioredis'

export const createRedisClient = () => {
  const redisHost = process.env.REDIS_HOST

  if (!redisHost) {
    console.warn('REDIS_HOST not configured, Redis adapter will not be used')
    return null
  }

  const client = new Redis({
    host: redisHost,
    port: 6379,
    retryStrategy: (times) => {
      if (times > 10) {
        console.error('Redis: Max reconnection attempts reached')
        return null // Stop retrying
      }
      const delay = Math.min(times * 50, 500)
      console.log(`Redis: Reconnecting attempt ${times} after ${delay}ms`)
      return delay
    }
  })

  client.on('error', (err) => {
    console.error('Redis Client Error:', err)
  })

  client.on('connect', () => {
    console.log('Redis: Connected successfully')
  })

  client.on('reconnecting', () => {
    console.log('Redis: Reconnecting...')
  })

  client.on('ready', () => {
    console.log('Redis: Ready to accept commands')
  })

  return client
}

export const createRedisPubSubClients = () => {
  const pubClient = createRedisClient()

  if (!pubClient) {
    return { pubClient: null, subClient: null, redis: null }
  }

  const subClient = pubClient.duplicate()
  const redis = pubClient.duplicate() // General commands client
  subClient.on('error', (err) => {
    console.error('Redis Sub Client Error:', err)
  })

  redis.on('error', (err) => {
    console.error('Redis General Client Error:', err)
  })

  return { pubClient, subClient, redis }
}
