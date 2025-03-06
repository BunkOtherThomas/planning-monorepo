import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { verify } from 'jsonwebtoken';

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
    const userId = decoded.userId;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Get user's teams
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teams: {
          include: {
            team: true
          }
        }
      }
    });

    if (!user?.teams || user.teams.length === 0) {
      return NextResponse.json({ error: 'User is not part of any team' }, { status: 404 });
    }

    // Get the first team (for now, we'll assume one team per user)
    const teamId = user.teams[0].team.id;

    // Build the query based on type
    let whereClause = {};
    if (type === 'created') {
      whereClause = {
        createdById: userId
      };
    } else if (type === 'assigned') {
      whereClause = {
        assignedToId: userId
      };
    } else if (type === 'available') {
      whereClause = {
        status: 'OPEN'
      };
    }

    // Fetch quests
    const quests = await prisma.quest.findMany({
      where: whereClause,
      include: {
        questSkills: {
          include: {
            skill: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            displayName: true,
            avatarId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the response to match the expected format
    const transformedQuests = quests.map(quest => ({
      id: quest.id,
      title: quest.title,
      description: quest.description,
      status: quest.status,
      createdAt: quest.createdAt,
      updatedAt: quest.updatedAt,
      deadline: quest.deadline,
      createdBy: quest.createdById,
      assignedTo: quest.assignedTo ? {
        id: quest.assignedTo.id,
        displayName: quest.assignedTo.displayName,
        avatarId: quest.assignedTo.avatarId
      } : null,
      skills: quest.questSkills.map(qs => ({
        skillId: qs.skill.id,
        weight: qs.weight
      }))
    }));

    return NextResponse.json(transformedQuests);
  } catch (error) {
    console.error('Failed to fetch quests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quests' },
      { status: 500 }
    );
  }
} 