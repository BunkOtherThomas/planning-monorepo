import { NextResponse } from 'next/server';
import { prisma } from '@quest-board/database';
import { z } from 'zod';
import { verify } from 'jsonwebtoken';
import { Quest, QuestStatus, Prisma } from '@prisma/client';

const questSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  skills: z.record(z.string(), z.number()),
  assigneeId: z.string().optional(),
});

type QuestWithAssignedTo = Quest & {
  assignedTo: {
    id: string;
    displayName: string;
    avatarId: number;
  } | null;
  questSkills: Record<string, number>;
};

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
    const status = searchParams.get('status');

    // Build the query based on type
    let whereClause: Prisma.QuestWhereInput = {};
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

    if (status) {
      whereClause = {
        ...whereClause,
        status: status as QuestStatus
      };
    }

    // Fetch quests
    const quests = await prisma.quest.findMany({
      where: whereClause,
      include: {
        assignedTo: {
          select: {
            id: true,
            displayName: true,
            avatarId: true
          }
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    }) as QuestWithAssignedTo[];

    // Transform the response to match the expected format
    const transformedQuests = quests.map(quest => ({
      id: quest.id,
      title: quest.title,
      description: quest.description,
      status: quest.status,
      createdAt: quest.createdAt,
      updatedAt: quest.updatedAt,
      createdBy: quest.createdById,
      assignedTo: quest.assignedTo ? {
        id: quest.assignedTo.id,
        displayName: quest.assignedTo.displayName,
        avatarId: quest.assignedTo.avatarId
      } : null,
      skills: quest.questSkills as Record<string, number>
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

export async function POST(req: Request) {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-scroll') as { userId: string };
    const createdById = decoded.userId;

    const body = await req.json();
    const validatedData = questSchema.parse(body);


    const quest = await prisma.quest.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || '',
        createdById,
        status: 'OPEN',
        questSkills: validatedData.skills,
        assignedToId: validatedData.assigneeId,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            displayName: true,
            avatarId: true
          }
        }
      },
    }) as QuestWithAssignedTo;

    // Transform the response to match the expected format
    const transformedQuest = {
      id: quest.id,
      title: quest.title,
      description: quest.description,
      status: quest.status,
      createdAt: quest.createdAt,
      updatedAt: quest.updatedAt,
      createdBy: quest.createdById,
      assignedTo: quest.assignedTo ? {
        id: quest.assignedTo.id,
        displayName: quest.assignedTo.displayName,
        avatarId: quest.assignedTo.avatarId
      } : null,
      skills: quest.questSkills as Record<string, number>
    };

    return NextResponse.json(transformedQuest);
  } catch (error) {
    console.error('Failed to create quest:', error);
    return NextResponse.json({ error: 'Failed to create quest' }, { status: 500 });
  }
} 