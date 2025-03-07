import { NextResponse } from 'next/server';
import { prisma } from '@quest-board/database';
import { verify } from 'jsonwebtoken';
import { UserSkills } from '@quest-board/types';

export async function GET(request: Request) {
  try {
    // Authenticate the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verify(token, process.env.JWT_SECRET || 'your-secret-scroll') as { userId: string };
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get userId from search params
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Fetch user from database
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        skills: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return the skills directly since they're already in the correct format
    return NextResponse.json(targetUser.skills as UserSkills);
  } catch (error) {
    console.error('Error fetching user skills:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 