// server/src/middleware/auth.js
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable must be set')
}

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' })
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Token missing' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        status: true
      }
    })

    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
