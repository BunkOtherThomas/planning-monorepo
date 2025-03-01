import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { QuestCreationRequest } from '@quest-board/types';
import { z } from 'zod';

const questSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  skills: z.array(z.object({
    skillId: z.string(),
    weight: z.number().min(0).max(1)
  })),
  deadline: z.string().datetime().optional()
});

export async function POST(request: Request) {
  try {
    const body: QuestCreationRequest = await request.json();
    const validatedData = questSchema.parse(body);

    // Check if user is a project manager
    const user = await prisma.user.findFirst({
      where: { id: 'user-id' } // TODO: Get from auth session
    });

    if (!user?.isProjectManager) {
      return NextResponse.json(
        { error: 'Only project managers can create quests' },
        { status: 403 }
      );
    }

    // Create quest with skills
    const quest = await prisma.quest.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        creatorId: user.id,
        deadline: validatedData.deadline ? new Date(validatedData.deadline) : null,
        skills: {
          create: validatedData.skills.map(skill => ({
            skill: {
              connect: { id: skill.skillId }
            },
            weight: skill.weight
          }))
        }
      },
      include: {
        skills: {
          include: {
            skill: true
          }
        }
      }
    });

    return NextResponse.json(quest, { status: 201 });
  } catch (error) {
    console.error('Quest creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'available';
    const status = searchParams.get('status');

    // TODO: Get user ID from auth session
    const userId = 'user-id';

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let quests;
    const includeOptions = {
      creator: true,
      assignee: true,
      skills: {
        include: {
          skill: true
        }
      }
    };

    switch (type) {
      case 'created':
        if (!user.isProjectManager) {
          return NextResponse.json(
            { error: 'Only project managers can view created quests' },
            { status: 403 }
          );
        }
        quests = await prisma.quest.findMany({
          where: {
            creatorId: userId,
            ...(status && { status })
          },
          include: includeOptions,
          orderBy: {
            createdAt: 'desc'
          }
        });
        break;

      case 'assigned':
        if (!user.isTeamMember) {
          return NextResponse.json(
            { error: 'Only team members can view assigned quests' },
            { status: 403 }
          );
        }
        quests = await prisma.quest.findMany({
          where: {
            assigneeId: userId,
            ...(status && { status })
          },
          include: includeOptions,
          orderBy: {
            createdAt: 'desc'
          }
        });
        break;

      default: // available
        quests = await prisma.quest.findMany({
          where: {
            assigneeId: null,
            status: 'open'
          },
          include: includeOptions,
          orderBy: {
            createdAt: 'desc'
          }
        });
    }

    return NextResponse.json(quests);
  } catch (error) {
    console.error('Quest fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate quest difficulty based on description
function calculateQuestDifficulty(description: string): number {
  // This is a placeholder implementation
  // You should implement a more sophisticated algorithm based on:
  // - Length and complexity of description
  // - Keywords indicating difficulty
  // - Required skills and their weights
  const length = description.length;
  const complexityIndicators = [
    'complex', 'difficult', 'challenging', 'advanced',
    'simple', 'easy', 'basic', 'straightforward'
  ];

  let difficultyScore = 5; // Default medium difficulty

  // Adjust based on length
  if (length > 500) difficultyScore += 2;
  else if (length > 200) difficultyScore += 1;
  else if (length < 50) difficultyScore -= 1;

  // Adjust based on complexity indicators
  const words = description.toLowerCase().split(' ');
  words.forEach(word => {
    if (complexityIndicators.slice(0, 4).includes(word)) difficultyScore += 1;
    if (complexityIndicators.slice(4).includes(word)) difficultyScore -= 1;
  });

  // Ensure score is between 1 and 10
  return Math.max(1, Math.min(10, difficultyScore));
} 