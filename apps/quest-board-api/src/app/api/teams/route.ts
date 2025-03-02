import { NextResponse } from 'next/server';
import { prisma } from '@quest-board/database';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { skills } = await request.json();

    // Create a new team with the current user as the first member
    const team = await prisma.team.create({
      data: {
        skills,
        members: {
          create: {
            userId: session.user.id
          }
        }
      },
      include: {
        members: true
      }
    });

    return NextResponse.json({ team });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all teams the user is a member of
    const teams = await prisma.teamsOnUsers.findMany({
      where: {
        userId: session.user.id,
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