import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@quest-board/database';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2),
  isProjectManager: z.boolean().optional(),
  isTeamMember: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, displayName, isProjectManager, isTeamMember } = signupSchema.parse(body);

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
      },
    });

    return NextResponse.json(
      { 
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          isProjectManager: user.isProjectManager,
          isTeamMember: user.isTeamMember,
        }
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