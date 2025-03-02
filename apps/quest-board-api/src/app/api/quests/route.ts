import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@quest-board/database';
import { z } from 'zod';

const questSchema = z.object({
  title: z.string(),
  description: z.string(),
  difficulty: z.number().min(1).max(10),
  deadline: z.string().optional(),
  skills: z.array(z.object({
    name: z.string(),
    weight: z.number().min(0.1).max(10).default(1.0),
  })),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quests = await prisma.quest.findMany({
      include: {
        questSkills: {
          include: {
            skill: true,
          },
        },
      },
    });

    return NextResponse.json(quests);
  } catch (error) {
    console.error('Failed to fetch quests:', error);
    return NextResponse.json({ error: 'Failed to fetch quests' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 401 });
    }

    const createdById = session.user.id;

    const body = await req.json();
    const validatedData = questSchema.parse(body);

    // Find or create skills
    const questSkillsData = await Promise.all(
      validatedData.skills.map(async (skillData) => {
        const skill = await prisma.skill.upsert({
          where: { name: skillData.name },
          create: { name: skillData.name },
          update: {},
        });
        return {
          skillId: skill.id,
          weight: skillData.weight,
        };
      })
    );

    const quest = await prisma.quest.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        createdById,
        difficulty: validatedData.difficulty,
        deadline: validatedData.deadline,
        questSkills: {
          create: questSkillsData,
        },
      },
      include: {
        questSkills: {
          include: {
            skill: true,
          },
        },
      },
    });

    return NextResponse.json(quest);
  } catch (error) {
    console.error('Failed to create quest:', error);
    return NextResponse.json({ error: 'Failed to create quest' }, { status: 500 });
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