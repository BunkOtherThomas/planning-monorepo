import { NextResponse } from 'next/server';
import { prisma } from '@quest-board/database';
import { verify } from 'jsonwebtoken';
import { z } from 'zod';

const addSkillSchema = z.object({
  skill: z.string().min(1),
});

export async function POST(request: Request) {  
  // Get the token from the Authorization header
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: `Missing token` }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token
    const decoded = verify(token, process.env.JWT_SECRET ?? 'your-secret-scroll') as { userId: string };

    const body = await request.json();

    const { skills } = body;

    // Create a new team with the current user as the first member
    const team = await prisma.team.create({
      data: {
        members: {
          create: {
            userId: decoded.userId
          }
        },
        skills
      },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    // Create UserSkill entries for all team members for each skill
    for (const member of team.members) {
      for (const skillName of skills) {
        // Find or create the skill
        let skill = await prisma.skill.findUnique({
          where: { name: skillName },
        });

        if (!skill) {
          skill = await prisma.skill.create({
            data: {
              name: skillName,
              description: `Team skill for ${team.name}`,
            },
          });
        }

        // Create UserSkill entry
        await prisma.userSkill.create({
          data: {
            userId: member.userId,
            skillId: skill.id,
            level: -1,
            currentXP: -1,
            professionalExp: -1,
            formalEducation: -1,
            informalEducation: -1,
            confidenceMultiplier: -1,
          },
        });
      }
    }

    return NextResponse.json({ team });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid token' },
      { status: 401 }
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

    // Get the team that the user is a member of
    const teamMembership = await prisma.teamsOnUsers.findFirst({
      where: {
        userId: decoded.userId,
      },
      include: {
        team: {
          include: {
            members: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    if (!teamMembership) {
      return NextResponse.json({ error: 'User is not a member of any team' }, { status: 404 });
    }

    const team = teamMembership.team;
    const teamResponse = {
      id: team.id,
      inviteCode: team.inviteCode,
      members: team.members.map(member => member.user),
      skills: team.skills || []
    };

    return NextResponse.json(teamResponse);
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-scroll') as { userId: string };

    const body = await request.json();
    const { skill } = addSkillSchema.parse(body);

    // Get the user's team
    const teamMembership = await prisma.teamsOnUsers.findFirst({
      where: {
        userId: decoded.userId,
      },
      include: {
        team: true
      }
    });

    if (!teamMembership) {
      return NextResponse.json({ error: 'User is not a member of any team' }, { status: 404 });
    }

    // Check if skill already exists
    if (teamMembership.team.skills.includes(skill)) {
      return NextResponse.json({ error: 'Skill already exists in team' }, { status: 400 });
    }

    // Add the skill to the team
    const updatedTeam = await prisma.team.update({
      where: { id: teamMembership.team.id },
      data: {
        skills: {
          push: skill
        }
      }
    });

    // Create or update the skill in the skills table
    const skillRecord = await prisma.skill.upsert({
      where: { name: skill },
      create: {
        name: skill,
        description: `Team skill for ${updatedTeam.name}`,
      },
      update: {}
    });

    // Create UserSkill entries for all team members
    const teamMembers = await prisma.teamsOnUsers.findMany({
      where: { teamId: updatedTeam.id },
      include: { user: true }
    });

    await Promise.all(
      teamMembers.map(member =>
        prisma.userSkill.upsert({
          where: {
            userId_skillId: {
              userId: member.userId,
              skillId: skillRecord.id,
            }
          },
          create: {
            userId: member.userId,
            skillId: skillRecord.id,
            level: -1,
            currentXP: -1,
            professionalExp: -1,
            formalEducation: -1,
            informalEducation: -1,
            confidenceMultiplier: -1,
          },
          update: {}
        })
      )
    );

    return NextResponse.json({ team: updatedTeam });
  } catch (error) {
    console.error('Error adding skill to team:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add skill to team' },
      { status: 500 }
    );
  }
} 