import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@quest-board/database';
import { z } from 'zod';
import { sign } from 'jsonwebtoken';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2),
  isProjectManager: z.boolean().optional(),
  isTeamMember: z.boolean().optional(),
  avatarId: z.number().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, displayName, isProjectManager, isTeamMember, avatarId } = signupSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        displayName,
        isProjectManager: isProjectManager || false,
        isTeamMember: isTeamMember || false,
        avatarId: avatarId || 0,
      },
    });

    // Generate JWT token
    const token = sign(
      {
        userId: user.id,
        email: user.email,
        isProjectManager: user.isProjectManager,
        isTeamMember: user.isTeamMember
      },
      process.env.JWT_SECRET || 'your-secret-scroll',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        token,
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
} 