import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from '../middleware/auth.js'

const prisma = new PrismaClient()
const router = Router()

// Apply authentication middleware to all routes in this router
router.use(authenticateToken)

router.get('/me', async (req, res) => {
  try {
    console.log('User /me endpoint hit, user:', req.user)

    // Query the database for the user by their unique ID from the JWT token
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    res.json(user)
  } catch (error) {
    console.error('Error in /me:', error)
    res.status(500).json({ error: 'Failed to fetch user profile' })
  }
})

// Get all channels that the authenticated user is a member of
router.get('/channels', async (req, res) => {
  try {
    console.log('User /channels endpoint hit, user:', req.user)

    // Getting all public user channels, and also any private channels they are a member of
    const channels = await prisma.channel.findMany({
      where: {
        OR: [
          { isPrivate: false }, // Public channels
          {
            AND: [
              { isPrivate: true },
              {
                members: {
                  some: { userId: req.user.id }, // Private channels the user is in
                },
              },
            ],
          },
        ],
      },
    })

    console.log(`Found ${channels.length} accessible channels for user ${req.user.id}`)
    res.json(channels)
  } catch (error) {
    console.error('Error in /channels:', error)
    res.status(500).json({ error: 'Failed to fetch user channels' })
  }
})

router.post('/channels', async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body

    // Get user id
    const userId = req.user?.id

    // Checking for name & length <= 100
    if (name && name.length > 100) {
      return res.status(400).json({ error: 'Name exceeds 100 characters.' })
    }

    if (description && description.length > 255) {
      return res.status(400).json({ error: 'Description exceeds 255 characters' })
    }

    const newChannel = await prisma.channel.create({

      data: {
        name,
        description,
        isPrivate
      },

    })

    // If it is a private channel adding creator as member
    if (isPrivate) {
      await prisma.channelMember.create({
        data: {
          userId,
          channelId: newChannel.id
        }
      })
    }

    return res.status(201).json(newChannel)
  } catch (error) {
    console.error('Failed to create channel: ', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
