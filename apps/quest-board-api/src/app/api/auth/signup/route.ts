import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '../../../../lib/prisma';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2),
  isProjectManager: z.boolean(),
  isTeamMember: z.boolean(),
  avatarUrl: z.string().optional(),
  businessDetails: z.object({
    name: z.string(),
    description: z.string(),
    relevantSkills: z.array(z.object({
      name: z.string(),
      description: z.string(),
    })),
  }).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 12);

    // Create user with business details if provided
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        displayName: validatedData.displayName,
        password: hashedPassword,
        isProjectManager: validatedData.isProjectManager,
        isTeamMember: validatedData.isTeamMember,
        avatarUrl: validatedData.avatarUrl,
        businessDetails: validatedData.businessDetails ? {
          create: {
            name: validatedData.businessDetails.name,
            description: validatedData.businessDetails.description,
          }
        } : undefined,
      },
    });

    // If business details were provided, create skills
    if (validatedData.businessDetails?.relevantSkills) {
      for (const skillData of validatedData.businessDetails.relevantSkills) {
        const skill = await prisma.skill.create({
          data: {
            name: skillData.name,
            description: skillData.description,
            isGlobal: false,
          },
        });

        // Create UserSkill connection
        await prisma.userSkill.create({
          data: {
            userId: user.id,
            skillId: skill.id,
            isTagged: false,
            professionalExp: 0,
            formalEducation: 0,
            informalEducation: 0,
            confidenceMultiplier: 1,
          },
        });
      }
    }

    // Fetch user with relationships
    const userWithRelations = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        businessDetails: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!userWithRelations) {
      throw new Error('Failed to fetch user details');
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = userWithRelations;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 