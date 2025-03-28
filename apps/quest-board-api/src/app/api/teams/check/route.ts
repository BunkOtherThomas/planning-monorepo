import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@quest-board/database';

export const dynamic = 'force-dynamic';

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

    // Find teams that the user belongs to
    const userTeams = await prisma.teamsOnUsers.findMany({
      where: {
        userId: decoded.userId
      }
    });

    // Check if the user belongs to any teams
    const hasTeamWithSkills = userTeams.length > 0;

    return NextResponse.json({ hasTeamWithSkills });
  } catch (error) {
    console.error('Error checking team membership:', error);
    return NextResponse.json(
      { error: 'Failed to check team membership' },
      { status: 500 }
    );
  }
} 