import { NextResponse } from 'next/server';
import { prisma } from '@quest-board/database';
import { verify } from 'jsonwebtoken';
import { QuestStatus, Quest, Prisma } from '@prisma/client';

type QuestWithAssignedTo = Quest & {
  assignedTo: {
    id: string;
    displayName: string;
    avatarId: number;
  } | null;
  questSkills: Record<string, number>;
};

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Get the quest
    const quest = await prisma.quest.findUnique({
      where: { id: params.id },
      include: {
        assignedTo: true
      }
    }) as QuestWithAssignedTo;

    if (!quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
    }

    // Check if the quest is already assigned
    if (quest.assignedToId) {
      return NextResponse.json({ error: 'Quest is already assigned' }, { status: 400 });
    }

    // Update the quest status and assign it to the user
    const updatedQuest = await prisma.quest.update({
      where: { id: params.id },
      data: {
        status: QuestStatus.ASSIGNED,
        assignedToId: userId
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            displayName: true,
            avatarId: true
          }
        }
      }
    }) as QuestWithAssignedTo;

    // Transform the response to match the expected format
    const transformedQuest = {
      id: updatedQuest.id,
      title: updatedQuest.title,
      description: updatedQuest.description,
      status: updatedQuest.status,
      createdAt: updatedQuest.createdAt,
      updatedAt: updatedQuest.updatedAt,
      createdBy: updatedQuest.createdById,
      assignedTo: updatedQuest.assignedTo ? {
        id: updatedQuest.assignedTo.id,
        displayName: updatedQuest.assignedTo.displayName,
        avatarId: updatedQuest.assignedTo.avatarId
      } : null,
      skills: updatedQuest.questSkills as Record<string, number>
    };

    return NextResponse.json(transformedQuest);
  } catch (error) {
    console.error('Failed to assign quest:', error);
    return NextResponse.json({ error: 'Failed to assign quest' }, { status: 500 });
  }
} 