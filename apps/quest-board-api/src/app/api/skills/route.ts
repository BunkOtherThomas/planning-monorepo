import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { SkillDeclarationRequest } from '@quest-board/types';
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
}

const skillDeclarationSchema = z.object({
  skillId: z.string(),
  professionalExp: z.number().min(0).max(10),
  formalEducation: z.number().min(0).max(10),
  informalEducation: z.number().min(0).max(10),
  confidenceMultiplier: z.number().min(0.1).max(2.0),
  isTagged: z.boolean()
});

export async function POST(request: Request) {
  try {
    const body: SkillDeclarationRequest = await request.json();
    const validatedData = skillDeclarationSchema.parse(body);

    // TODO: Get user ID from auth session
    const userId = 'user-id';

    // Check if skill exists
    const skills = await prisma.$queryRaw<Skill[]>`
      SELECT * FROM Skill WHERE id = ${validatedData.skillId}
    `;

    if (!skills[0]) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

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
        ${userId},
        ${validatedData.skillId},
        ${validatedData.professionalExp},
        ${validatedData.formalEducation},
        ${validatedData.informalEducation},
        ${validatedData.confidenceMultiplier},
        ${validatedData.isTagged}
      )
      ON CONFLICT (userId, skillId)
      DO UPDATE SET
        professionalExp = ${validatedData.professionalExp},
        formalEducation = ${validatedData.formalEducation},
        informalEducation = ${validatedData.informalEducation},
        confidenceMultiplier = ${validatedData.confidenceMultiplier},
        isTagged = ${validatedData.isTagged}
      RETURNING *
    `;

    return NextResponse.json(userSkills[0], { status: 201 });
  } catch (error) {
    console.error('Skill declaration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeGlobal = searchParams.get('includeGlobal') !== 'false';
    const getAll = searchParams.get('all') === 'true';

    // If getAll is true, return all global skills
    if (getAll) {
      const skills = await prisma.$queryRaw<(Skill & { users: UserSkill[] })[]>`
        SELECT s.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', us.id,
                'userId', us.userId,
                'skillId', us.skillId,
                'professionalExp', us.professionalExp,
                'formalEducation', us.formalEducation,
                'informalEducation', us.informalEducation,
                'confidenceMultiplier', us.confidenceMultiplier,
                'isTagged', us.isTagged,
                'user', json_build_object(
                  'id', u.id,
                  'displayName', u.displayName,
                  'avatarUrl', u.avatarUrl
                )
              )
            ) FILTER (WHERE us.id IS NOT NULL),
            '[]'
          ) as users
        FROM Skill s
        LEFT JOIN UserSkill us ON s.id = us.skillId
        LEFT JOIN "User" u ON us.userId = u.id
        WHERE s.isGlobal = true
        GROUP BY s.id
      `;

      return NextResponse.json(skills);
    }

    // TODO: Get user ID from auth session
    const userId = 'user-id';

    // Check if user exists
    const users = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "User" WHERE id = ${userId}
    `;

    if (!users[0]) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's skills and optionally include global skills
    const skills = await prisma.$queryRaw<(Skill & { users: UserSkill[] })[]>`
      SELECT s.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', us.id,
              'userId', us.userId,
              'skillId', us.skillId,
              'professionalExp', us.professionalExp,
              'formalEducation', us.formalEducation,
              'informalEducation', us.informalEducation,
              'confidenceMultiplier', us.confidenceMultiplier,
              'isTagged', us.isTagged
            )
          ) FILTER (WHERE us.id IS NOT NULL),
          '[]'
        ) as users
      FROM Skill s
      LEFT JOIN UserSkill us ON s.id = us.skillId AND us.userId = ${userId}
      WHERE s.isGlobal = ${includeGlobal}
        OR EXISTS (
          SELECT 1 FROM UserSkill us2
          WHERE us2.skillId = s.id AND us2.userId = ${userId}
        )
      GROUP BY s.id
    `;

    return NextResponse.json(skills);
  } catch (error) {
    console.error('Skills fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 