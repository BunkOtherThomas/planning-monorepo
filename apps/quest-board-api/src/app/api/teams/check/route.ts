import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@quest-board/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find teams that the user belongs to
    const userTeams = await prisma.teamsOnUsers.findMany({
      where: {
        userId: session.user.id
      }
    });

    // Check if the user belongs to any teams
    const hasTeams = userTeams.length > 0;

    return NextResponse.json({ hasTeams });
  } catch (error) {
    console.error('Error checking team membership:', error);
    return NextResponse.json(
      { error: 'Failed to check team membership' },
      { status: 500 }
    );
  }
} 