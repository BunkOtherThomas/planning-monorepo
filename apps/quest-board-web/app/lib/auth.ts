import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// JWT secret key - in production, use a proper secret management system
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-scroll';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<string> {
  // Create a session that expires in 7 days
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  // Generate JWT token
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  
  // Store session in database
  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });
  
  return token;
}

export async function verifySession(token: string): Promise<{ userId: string } | null> {
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // Check if session exists and is valid
    const session = await prisma.session.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
    
    if (!session) {
      return null;
    }
    
    return { userId: decoded.userId };
  } catch (error) {
    return null;
  }
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.delete({
    where: {
      token,
    },
  });
} 