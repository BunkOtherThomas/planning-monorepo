import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { z } from 'zod';

interface Skill {
  id: string;
  name: string;
  description: string;
  isGlobal: boolean;
}

interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  professionalExp: number;
  formalEducation: number;
  informalEducation: number;
  confidenceMultiplier: number;
  isTagged: boolean;
  skill: {
    id: string;
    name: string;
    description: string;
  };
  user: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

const skillDeclarationSchema = z.object({
  skillName: z.string(),
  experience: z.object({
    professional: z.number().min(0).max(10),
    formalEducation: z.number().min(0).max(10),
    informalEducation: z.number().min(0).max(10),
    confidence: z.number().min(0.25).max(1),
  }),
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

    // Calculate initial level based on experience
    const professionalWeight = 2;
    const formalEducationWeight = 1.5;
    const informalEducationWeight = 1;

    const baseLevel = Math.round(
      (validatedData.experience.professional * professionalWeight +
        validatedData.experience.formalEducation * formalEducationWeight +
        validatedData.experience.informalEducation * informalEducationWeight) /
        (professionalWeight + formalEducationWeight + informalEducationWeight) *
        validatedData.experience.confidence
    );

    // Create or update user skill
    const userSkills = await prisma.$queryRaw<UserSkill[]>`
      INSERT INTO UserSkill (
        userId,
        skillId,
        professionalExp,
        formalEducation,
        informalEducation,
        confidenceMultiplier,
        isTagged
      )
      VALUES (
        ${validatedData.userId},
        ${skill.id},
        ${validatedData.experience.professional},
        ${validatedData.experience.formalEducation},
        ${validatedData.experience.informalEducation},
        ${validatedData.experience.confidence},
        false
      )
      ON CONFLICT (userId, skillId)
      DO UPDATE SET
        professionalExp = ${validatedData.experience.professional},
        formalEducation = ${validatedData.experience.formalEducation},
        informalEducation = ${validatedData.experience.informalEducation},
        confidenceMultiplier = ${validatedData.experience.confidence}
      RETURNING *,
        (
          SELECT json_build_object(
            'id', s.id,
            'name', s.name,
            'description', s.description
          )
          FROM Skill s
          WHERE s.id = UserSkill.skillId
        ) as skill,
        (
          SELECT json_build_object(
            'id', u.id,
            'displayName', u.displayName,
            'avatarUrl', u.avatarUrl
          )
          FROM "User" u
          WHERE u.id = UserSkill.userId
        ) as user
    `;

    return NextResponse.json({
      ...userSkills[0],
      calculatedLevel: baseLevel,
    });
  } catch (error) {
    console.error('Error declaring skill:', error);
    return NextResponse.json(
      { error: 'Failed to declare skill' },
      { status: 500 }
    );
  }
} 