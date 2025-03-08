import { NextResponse } from 'next/server';
import { prisma } from '@quest-board/database';
import { Skill, SkillDeclarationRequest, UserSkills } from '@quest-board/types';
import { z } from 'zod';
import { verify } from 'jsonwebtoken';

const skillDeclarationSchema = z.object({
  skillName: z.string(),
  xp: z.number().min(0)
});

export async function POST(request: Request) {
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

    const body: SkillDeclarationRequest = await request.json();
    const validatedData = skillDeclarationSchema.parse(body);

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const currentSkills = user.skills as UserSkills || {};
    
    // Update user's skills
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        skills: {
          ...currentSkills,
          [validatedData.skillName]: validatedData.xp
        }
      }
    });

    return NextResponse.json({ skills: updatedUser.skills }, { status: 201 });
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

    // Get user's skills
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all global skills
    const skills = await prisma.$queryRaw<Skill[]>`
      SELECT * FROM "Skill"
      WHERE "businessId" IS NULL
    `;

    return NextResponse.json(skills, { status: 200 });
  } catch (error) {
    console.error('Skills fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 