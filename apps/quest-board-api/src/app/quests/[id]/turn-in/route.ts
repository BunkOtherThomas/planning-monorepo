import { NextResponse } from 'next/server';
import { prisma } from '@quest-board/database';
import { verify } from 'jsonwebtoken';
import { QuestStatus, Quest, Prisma } from '@prisma/client';

// XP multiplier for quest completion
const QUEST_COMPLETION_XP_MULTIPLIER = 5;
const FAVORITE_SKILL_XP_MULTIPLIER = 3;

type QuestWithAssignedTo = Quest & {
  assignedTo: {
    id: string;
    displayName: string;
    avatarId: number;
  } | null;
  questSkills: Record<string, number>;
};

interface SkillXPChange {
  before: number;
  after: number;
  gained: number;
  isFavorite: boolean;
}

interface UserSkillsResult {
  skills: Record<string, number>;
  favoriteSkills: string[];
}

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

    // Check if the quest is assigned to the user
    if (quest.assignedToId !== userId) {
      return NextResponse.json({ error: 'Not authorized to turn in this quest' }, { status: 403 });
    }

    // Get user's current skills and favorite skills using raw query
    const users = await prisma.$queryRaw<UserSkillsResult[]>`
      SELECT skills, "favoriteSkills"
      FROM "User"
      WHERE id = ${userId}
    `;
    const user = users[0];

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentSkills = user.skills as Record<string, number>;
    const favoriteSkills = user.favoriteSkills;
    const questSkills = quest.questSkills as Record<string, number>;
    const updatedSkills = { ...currentSkills };
    const skillChanges: Record<string, SkillXPChange> = {};

    // Update user's skills based on quest skills
    for (const [skillName, skillValue] of Object.entries(questSkills)) {
      const currentXP = currentSkills[skillName] || 0;
      const isFavorite = favoriteSkills.includes(skillName);
      const multiplier = isFavorite ? 
        QUEST_COMPLETION_XP_MULTIPLIER * FAVORITE_SKILL_XP_MULTIPLIER : 
        QUEST_COMPLETION_XP_MULTIPLIER;
      const xpGain = skillValue * multiplier;
      const newXP = currentXP + xpGain;
      
      updatedSkills[skillName] = newXP;
      skillChanges[skillName] = {
        before: currentXP,
        after: newXP,
        gained: xpGain,
        isFavorite
      };
    }

    // Update both the quest status and user's skills in a transaction
    const result = await prisma.$transaction([
      prisma.quest.update({
        where: { id: params.id },
        data: {
          status: QuestStatus.COMPLETED
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
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          skills: updatedSkills
        }
      })
    ]);

    const updatedQuest = result[0] as QuestWithAssignedTo;

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
      skills: updatedQuest.questSkills as Record<string, number>,
      skillChanges
    };

    return NextResponse.json(transformedQuest);
  } catch (error) {
    console.error('Failed to turn in quest:', error);
    return NextResponse.json({ error: 'Failed to turn in quest' }, { status: 500 });
  }
} 