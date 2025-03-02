import { NextResponse } from 'next/server';
import { prisma } from '@quest-board/database';
import { verify } from 'jsonwebtoken';

export async function POST(request: Request) {
  console.log('POST /api/teams - Request received');
  try {
    // Log all headers for debugging
    const headers = Object.fromEntries(request.headers.entries());

    // Get the token from the Authorization header
    const authHeader = request.headers.get('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-scroll') as { userId: string };

    const body = await request.json();

    const { skills } = body;

    // Create a new team with the current user as the first member
    const team = await prisma.team.create({
      data: {
        skills,
        members: {
          create: {
            userId: decoded.userId
          }
        }
      },
      include: {
        members: true
      }
    });

    return NextResponse.json({ team });
  } catch (error) {
    console.error('Error in POST /api/teams:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}

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

    // Get all teams the user is a member of
    const teams = await prisma.teamsOnUsers.findMany({
      where: {
        userId: decoded.userId,
      },
      include: {
        team: true,
      },
    });

    return NextResponse.json({ teams: teams.map(t => t.team) });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
} 