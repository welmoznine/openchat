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

    const channels = await prisma.channel.findMany({
      where: {
        members: {
          some: { userId: req.user.id }, // User must be a member of the channel
        },
      },
      include: {
        members: {
          select: {
            userId: true,
            user: {
              select: {
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    })

    console.log(
      `Found ${channels.length} accessible channels for user ${req.user.id}`
    )
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
      return res
        .status(400)
        .json({ error: 'Description exceeds 255 characters' })
    }

    const newChannel = await prisma.channel.create({
      data: {
        name,
        description,
        isPrivate,
      },
    })

    // Always add creator as member (for both public and private channels)
    await prisma.channelMember.create({
      data: {
        userId,
        channelId: newChannel.id,
      },
    })

    return res.status(201).json(newChannel)
  } catch (error) {
    console.error('Failed to create channel: ', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Get message history for a specific channel by channel ID
router.get('/channels/:channelId/messages', async (req, res) => {
  try {
    const { channelId } = req.params
    const { limit = 50, before } = req.query

    // Verify user is a member of this channel
    const membership = await prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: req.user.id,
          channelId,
        },
      },
    })
    console.log(
      `User ${req.user.id} membership in channel ${channelId}:`,
      membership
    )

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this channel' })
    }

    // Build query conditions
    const whereConditions = { channelId }
    if (before) {
      whereConditions.createdAt = { lt: new Date(before) }
    }

    const messages = await prisma.message.findMany({
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        mentionedUser: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    })

    // Reverse to get chronological order (oldest first)
    const formattedMessages = messages.reverse().map((msg) => ({
      id: msg.id,
      text: msg.content,
      username: msg.user.username,
      userId: msg.userId,
      timestamp: msg.createdAt.toISOString(),
      mentionedUser: msg.mentionedUser,
    }))

    res.json(formattedMessages)
  } catch (error) {
    console.error('Error fetching channel messages:', error)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

export default router
