import { NextResponse } from 'next/server';
import { prisma } from '@quest-board/database';
import { verify } from 'jsonwebtoken';

export async function POST(request: Request) {  
  // Get the token from the Authorization header
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: `Missing token` }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token
    const decoded = verify(token, process.env.JWT_SECRET ?? 'your-secret-scroll') as { userId: string };

    const body = await request.json();

    const { skills } = body;

    // Create a new team with the current user as the first member
    const team = await prisma.team.create({
      data: {
        members: {
          create: {
            userId: decoded.userId
          }
        },
        skills
      },
      include: {
        members: true
      }
    });

    return NextResponse.json({ team });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid token' },
      { status: 401 }
    );
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

    // Get the team that the user is a member of
    const teamMembership = await prisma.teamsOnUsers.findFirst({
      where: {
        userId: decoded.userId,
      },
      include: {
        team: {
          include: {
            members: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    if (!teamMembership) {
      return NextResponse.json({ error: 'User is not a member of any team' }, { status: 404 });
    }

    const team = teamMembership.team;
    const teamResponse = {
      id: team.id,
      inviteCode: team.inviteCode,
      members: team.members.map(member => member.user)
    };

    return NextResponse.json(teamResponse);
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
} 