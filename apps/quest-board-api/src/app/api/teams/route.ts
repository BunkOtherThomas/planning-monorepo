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

    // Initialize skills for all team members with -1 XP
    for (const member of team.members) {
      const currentSkills = member.user.skills as Record<string, number> || {};
      const updatedSkills = { ...currentSkills };
      
      for (const skillName of skills) {
        if (!(skillName in updatedSkills)) {
          updatedSkills[skillName] = -1;
        }
      }

      await prisma.user.update({
        where: { id: member.user.id },
        data: { skills: updatedSkills }
      });
    }

    return NextResponse.json({ team });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create team' },
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
      members: team.members.map((member: { user: any }) => member.user),
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
      },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    // Initialize the new skill for all team members with -1 XP
    for (const member of updatedTeam.members) {
      const currentSkills = member.user.skills as Record<string, number> || {};
      const updatedSkills = { ...currentSkills };
      
      if (!(skill in updatedSkills)) {
        updatedSkills[skill] = -1;
      }

      await prisma.user.update({
        where: { id: member.user.id },
        data: { skills: updatedSkills }
      });
    }

    return NextResponse.json({ team: updatedTeam });
  } catch (error) {
    console.error('Error adding skill to team:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add skill to team' },
      { status: 500 }
    );
  }
} 