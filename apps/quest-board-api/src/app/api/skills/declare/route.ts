import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { z } from 'zod';
import { UserSkills } from '@quest-board/types';

interface Skill {
  id: string;
  name: string;
  description: string;
  isGlobal: boolean;
}

const skillDeclarationSchema = z.object({
  skillName: z.string(),
  xp: z.number().min(0),
  userId: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = skillDeclarationSchema.parse(body);

    // Check if skill exists
    const skills = await prisma.$queryRaw<Skill[]>`
      SELECT * FROM Skill WHERE name = ${validatedData.skillName}
    `;
    let skill = skills[0];

    // If skill doesn't exist, create it
    if (!skill) {
      const newSkills = await prisma.$queryRaw<Skill[]>`
        INSERT INTO Skill (name, description, isGlobal)
        VALUES (${validatedData.skillName}, '', false)
        RETURNING *
      `;
      skill = newSkills[0];
    }

    // Get current user skills
    const user = await prisma.$queryRaw<{ skills: UserSkills }[]>`
      SELECT skills FROM "User" WHERE id = ${validatedData.userId}
    `;

    const currentSkills = user[0]?.skills || {};

    // Update user's skills
    await prisma.$executeRaw`
      UPDATE "User"
      SET "skills" = ${JSON.stringify({
        ...currentSkills,
        [validatedData.skillName]: validatedData.xp
      })}::jsonb
      WHERE id = ${validatedData.userId}
    `;

    return NextResponse.json({
      skill: {
        id: skill.id,
        name: skill.name,
        description: skill.description
      },
      xp: validatedData.xp
    });
  } catch (error) {
    console.error('Error declaring skill:', error);
    return NextResponse.json(
      { error: 'Failed to declare skill' },
      { status: 500 }
    );
  }
} 