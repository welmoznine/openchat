import { Router } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'J@pZr7!b9Xh3uV$e2TqWlM8nDf#A1KcY';
const JWT_EXPIRES_IN = '1h';

router.post('/register', async (req, res) => {
    // TODO: Implement registration logic
    console.log('Registration Endpoint');
    res.status(201).json({ message: 'TODO: Implement Registration Endpoint'})
});

router.post('/login', async (req, res) => {

    const { email, password } = req.body;
    console.log(email, password);

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

        //TODO: This needs to check hashed password w/ bcrypt, first need to setup hash on entry to database
        //const validPassword = await bcrypt.compare(password, user.password);
        const validPassword = (password === user.passwordHash) 

        // Password does not match, return error
        if (password != user.passwordHash){
            return res.status(401).json({ message: 'Invalid email or password.'});
        } else {}

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
    res.status(201).json({ message: 'TODO: Implement Logout Endpoint'})
});

export default router;