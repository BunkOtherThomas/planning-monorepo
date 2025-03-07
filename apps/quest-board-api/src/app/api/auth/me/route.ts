import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@quest-board/database';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-scroll') as { userId: string };
    
    // Get user data
    const users = await prisma.$queryRaw<Array<{
      id: string;
      email: string;
      displayName: string;
      avatarId: number;
      isProjectManager: boolean;
      isTeamMember: boolean;
      skills: Prisma.JsonValue;
      favoriteSkills: string[];
    }>>`
      SELECT id, email, "displayName", "avatarId", "isProjectManager", "isTeamMember", skills, "favoriteSkills"
      FROM "User"
      WHERE id = ${decoded.userId}
    `;
    const user = users[0];

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
} 