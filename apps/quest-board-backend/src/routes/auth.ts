import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword, createSession, deleteSession } from '../lib/auth';

const router: Router = express.Router();
const prisma = new PrismaClient();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: 'No adventurer found with this scroll of identification'
      });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        error: 'Your scroll of passage is incorrect'
      });
    }

    // Create session and get token
    const token = await createSession(user.id);

    // Set cookie
    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return user data
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        title: user.title,
        rank: user.rank,
        experience: user.experience,
        gold: user.gold,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'A mysterious force prevented your login'
    });
  }
});

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate role
    if (role !== 'guild_leader' && role !== 'adventurer') {
      return res.status(400).json({
        error: 'Invalid role selection'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'An adventurer already bears this name or scroll of identification'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with role
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role,
        title: role === 'guild_leader' ? 'Guild Leader' : 'Novice Adventurer',
      },
    });

    // Create session and get token
    const token = await createSession(user.id);

    // Set cookie
    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return user data
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        title: user.title,
        rank: user.rank,
        experience: user.experience,
        gold: user.gold,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      error: 'The mystical forces prevented your registration'
    });
  }
});

// Logout route
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies['auth-token'];
    
    if (token) {
      await deleteSession(token);
    }

    res.clearCookie('auth-token');
    res.json({ message: 'Farewell, brave adventurer!' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'A mysterious force prevented your logout'
    });
  }
});

export default router; 