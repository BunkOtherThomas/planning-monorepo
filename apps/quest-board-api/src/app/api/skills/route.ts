import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { SkillDeclarationRequest, UserSkills } from '@quest-board/types';
import { z } from 'zod';
import { verify } from 'jsonwebtoken';

interface Skill {
  id: string;
  name: string;
  description: string;
  isGlobal: boolean;
}

const skillDeclarationSchema = z.object({
  skillName: z.string(),
  xp: z.number().min(0)
});

export async function POST(request: Request) {
  try {
    const body: SkillDeclarationRequest = await request.json();
    const validatedData = skillDeclarationSchema.parse(body);

    // TODO: Get user ID from auth session
    const userId = 'user-id';

    // Check if skill exists
    const skills = await prisma.$queryRaw<Skill[]>`
      SELECT * FROM "Skill" WHERE name = ${validatedData.skillName}
    `;

    if (!skills[0]) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    // Get current user skills
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { skills: true }
    });

    const currentSkills = user?.skills as UserSkills || {};
    
    // Update user's skills
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        skills: {
          ...currentSkills,
          [validatedData.skillName]: validatedData.xp
        }
      },
      select: { skills: true }
    });

    return NextResponse.json(updatedUser, { status: 201 });
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
    // Get the token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-scroll') as { userId: string };
    const userId = decoded.userId;

    const { searchParams } = new URL(request.url);
    const includeGlobal = searchParams.get('includeGlobal') !== 'false';
    const getAll = searchParams.get('all') === 'true';

    // If getAll is true, return all global skills
    if (getAll) {
      const skills = await prisma.$queryRaw<Skill[]>`
        SELECT * FROM "Skill"
        WHERE "businessId" IS NULL
      `;

      return NextResponse.json(skills);
    }

    // Get user's skills
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { skills: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all skills (global and user's)
    const skills = await prisma.$queryRaw<Skill[]>`
      SELECT s.*
      FROM "Skill" s
      WHERE (${includeGlobal} AND s."businessId" IS NULL)
        OR s.name = ANY(${Object.keys(user.skills as UserSkills)})
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