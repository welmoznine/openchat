import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from '../middleware/auth.js'
import { getIO } from '../socket-handlers/socket.js'

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
      orderBy: {
        isPrivate: 'asc',
      }
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
  const io = getIO()

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

    io.emit('channel_refresh')
    return res.status(201).json(newChannel)
  } catch (error) {
    console.error('Failed to create channel: ', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete a channel
router.delete('/channels/:id', async (req, res) => {
  const io = getIO()
  const { id } = req.params

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

    io.emit('channel_refresh')
    return res.status(200).json({ message: 'Channel deleted successfully' })
  } catch (error) {
    console.error()
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete a channel member
router.delete('/channel-members/:channelId', async (req, res) => {
  const io = getIO()
  const userId = req.user.id
  const { channelId } = req.params

  try {
    await prisma.channelMember.delete({
      where: {
        userId_channelId: {
          userId,
          channelId,
        },
      },
    })

    // TODO: Only needs to go to specific user leaving channel
    io.emit('channel_refresh')
    res.status(200).json({ message: 'User removed from channel.' })
  } catch (error) {
    console.error(error)

    // Not found error handling
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Channel membership not found.' })
    } else {
      res.status(500).json({ error: 'Failed to remove user from channel.' })
    }
  }
})

// Get message history for a specific channel by channel ID
router.get('/channels/:channelId/messages', async (req, res) => {
  try {
    const { channelId } = req.params
    const { limit = 50, before } = req.query

    // First need to verify if channel is public
    const channel = await prisma.channel.findUnique({
      where: {
        id: channelId,
      }
    })

    if (channel.isPrivate) {
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
    }

    // Build query conditions
    const whereConditions = { channelId, isDeleted: false }
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

// Add member to channel
router.post('/channels/:channelId/members', async (req, res) => {
  const io = getIO()
  const { channelId } = req.params
  const { username } = req.body

  if (!username) {
    return res.status(400).json({ error: 'Username is required' })
  }

  try {
    // Find the user by username
    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check if channel exists
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
    })

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' })
    }

    const existingMember = await prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: user.id,
          channelId,
        },
      },
    })

    if (existingMember) {
      return res.status(409).json({ error: 'User is already a member of this channel' })
    }

    // Add user to channel
    const newMember = await prisma.channelMember.create({
      data: {
        userId: user.id,
        channelId,
      },
    })

    // TODO: This really only needs to go to the user who was added
    io.emit('channel_refresh')

    return res.status(201).json({ message: 'User added to channel', member: newMember })
  } catch (error) {
    console.error('Error adding member:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete a message (soft delete)
router.delete('/messages/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params
    const userId = req.user.id

    // Find the message and verify ownership
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        user: {
          select: { id: true, username: true }
        },
        channel: {
          select: { id: true, name: true }
        }
      }
    })

    if (!message) {
      return res.status(404).json({ error: 'Message not found' })
    }

    // If message is already deleted
    if (message.isDeleted) {
      console.log(`Message ${messageId} already deleted`)
      return res.json({
        success: true,
        messageId,
        channelId: message.channelId,
        alreadyDeleted: true
      })
    }

    // Check if user owns the message
    if (message.userId !== userId) {
      return res.status(403).json({ error: 'You can only delete your own messages' })
    }

    // Soft delete the message
    await prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    })

    res.json({
      success: true,
      messageId,
      channelId: message.channelId
    })
  } catch (error) {
    console.error('Error deleting message:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
