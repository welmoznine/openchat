import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from '../middleware/auth.js'

const prisma = new PrismaClient()
const router = Router()

// Apply authentication middleware to all routes in this router
router.use(authenticateToken)

// Get the authenticated user's profile from the JWT token
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

// Get all public channels, and also any private channels the user is a member of
router.get('/channels', async (req, res) => {
  try {
    console.log('User /channels endpoint hit, user:', req.user)

    const channels = await prisma.channel.findMany({
      where: {
        OR: [
          { isPrivate: false },
          {
            AND: [
              { isPrivate: true },
              {
                members: {
                  some: { userId: req.user.id },
                },
              },
            ],
          },
        ],
      },
    })

    console.log(
      `Found ${channels.length} accessible channels for ${req.user.username} (ID ${req.user.id})`
    )
    res.json(channels)
  } catch (error) {
    console.error('Error in /channels:', error)
    res.status(500).json({ error: 'Failed to fetch user channels' })
  }
})

// Create a new channel
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

    // Prepare channel member data
    const channelMembersToCreate = [{
      userId,
      channelId: newChannel.id,
    }]

    // If the channel is public, add all existing users as members
    if (!isPrivate) {
      const allUsers = await prisma.user.findMany({
        select: { id: true },
      })

      // Add all users (not including the creator, who is already added)
      allUsers.forEach(user => {
        if (user.id !== userId) {
          channelMembersToCreate.push({
            userId: user.id,
            channelId: newChannel.id,
          })
        }
      })
    }

    // Insert all members into the database
    await prisma.channelMember.createMany({
      data: channelMembersToCreate,
      skipDuplicates: true, // In case the creator is somehow duplicated, skip it
    })

    return res.status(201).json(newChannel)
  } catch (error) {
    console.error('Failed to create channel: ', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete a channel
router.delete('/channels/:id', async (req, res) => {
  const { id } = req.params

  console.log(id)

  try {
    // Check if existing channel
    const existing = await prisma.channel.findUnique({
      where: { id },
    })

    // Not existing, respond not found
    if (!existing) {
      return res.status(404).json({ error: 'Channel not found' })
    }

    // Deleting channel
    await prisma.channel.delete({
      where: { id },
    })

    return res.status(200).json({ message: 'Channel deleted successfully' })
  } catch (error) {
    console.error()
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

    // If not a member, return 403 Forbidden
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
