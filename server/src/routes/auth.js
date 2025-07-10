import { Router } from 'express';

const router = Router();

router.post('/register', async (req, res) => {
    // TODO: Implement registration logic
    console.log('Registration Endpoint');
    res.status(201).json({ message: 'TODO: Implement Registration Endpoint'})
})

router.post('/login', async (req, res) => {
    // TODO: Implement login logic
    console.log('Login Endpoint');
    res.status(201).json({ message: 'TODO: Implement Login Endpoint'})
})

router.post('/logout', async (req, res) => {
    // TODO: Implement registration logic
    console.log('Logout Endpoint');
    res.status(201).json({ message: 'TODO: Implement Logout Endpoint'})
})

export default router;