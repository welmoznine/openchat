import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'J@pZr7!b9Xh3uV$e2TqWlM8nDf#A1KcY';
const JWT_EXPIRES_IN = '1h';

router.post('/register', async (req, res) => {
    
    const { email, username, password } = req.body;
    
    if (!email || !username || !password ) {
        return res.status(400).json({ error: 'Email, username, and password are required.'});
    }

    try {

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(409).json({ error: 'User with this email already exists.'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                username,
                passwordHash: hashedPassword,
            }
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                username: user.username
            }
        });

    } catch (error) {
        console.error('Registration Error: ', error);
        res.status(500).json({ error: 'Internal server error.' })
    }

    res.status(201).json({ message: 'TODO: Implement Registration Endpoint'})
});

router.post('/login', async (req, res) => {

    const { email, password } = req.body;

    try {

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required.'});
        }

        //TODO: Update to allow email or username?
        const user = await prisma.user.findUnique({where: { email }});

        // No user object found, return error
        if (!user) {  
            return res.status(401).json({ message: 'Invalid email or password.'});
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);

        // Password does not match, return error
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid email or password.'});
        }

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        res.status(200).json({
            message: 'Login successful.',
            token,
            user: { id: user.id, email: user.email },
        });

    } catch(error) {
        console.log('Login Error:', error);
        res.status(500).json({ message: 'Server error'});
    }

});

router.post('/logout', async (req, res) => {
    // TODO: Implement logout logic
    console.log('Logout Endpoint');
    res.status(200).json({ message: 'TODO: Implement Logout Endpoint'})
});

router.post('/me', async (req,res) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing.'});
    }

    const token = authHeader.split(' ')[1];  // format: "Bearer <token>"

    try {

        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                lastLoginAt: true
            }
        });

        res.json(user);

    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

});

export default router;