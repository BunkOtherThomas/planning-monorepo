import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { z } from 'zod';
import { UserSkills } from '@quest-board/types';
import { verify } from 'jsonwebtoken';

const skillDeclarationSchema = z.object({
  skillName: z.string(),
  professionalExperience: z.number().min(0).max(5),
  formalEducation: z.number().min(0).max(5),
  informalExperience: z.number().min(0).max(5),
  confidence: z.number().min(0).max(5),
});

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

    const body = await req.json();
    const validatedData = skillDeclarationSchema.parse(body);

    // Calculate XP based on the form values
    const xp = Math.round(
      (validatedData.professionalExperience * 0.4 +
       validatedData.formalEducation * 0.3 +
       validatedData.informalExperience * 0.2 +
       validatedData.confidence * 0.1) * 165 // This will give us a max of 165 XP
    );

    const user = await prisma.$queryRaw<{ skills: UserSkills }[]>`
      SELECT skills FROM "User" WHERE id = ${decoded.userId}
    `;

    if (!user[0]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentSkills = user[0]?.skills || {};

    // Update user's skills
    await prisma.$executeRaw`
      UPDATE "User"
      SET "skills" = ${JSON.stringify({
        ...currentSkills,
        [validatedData.skillName]: xp
      })}::jsonb
      WHERE id = ${decoded.userId}
    `;

    return NextResponse.json({ xp }, { status: 200 });
  } catch (error) {
    console.error('Error declaring skill:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Failed to declare skill' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to declare skill' },
      { status: 500 }
    );
  }
} 