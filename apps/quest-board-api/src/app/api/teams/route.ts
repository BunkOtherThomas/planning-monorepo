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

    const { name, skills } = body;

    // Create a new team with the current user as the first member
    const team = await prisma.team.create({
      data: {
        name: name || 'Test Team',
        members: {
          create: {
            userId: decoded.userId
          }
        },
        skills: skills || []
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                email: true,
                skills: true,
                avatarId: true
              }
            }
          }
        }
      }
    });

    // Initialize skills for all team members with -1 XP
    for (const member of team.members) {
      const currentSkills = member.user.skills as Record<string, number> || {};
      const updatedSkills = { ...currentSkills };
      
      for (const skillName of team.skills) {
        if (!(skillName in updatedSkills)) {
          updatedSkills[skillName] = -1;
        }
      }

      await prisma.user.update({
        where: { id: member.user.id },
        data: { skills: updatedSkills }
      });
    }

    // Transform the response to match the expected structure
    const teamResponse = {
      id: team.id,
      name: team.name,
      inviteCode: team.inviteCode,
      skills: team.skills,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      members: team.members.map(member => ({
        id: member.user.id,
        displayName: member.user.displayName,
        email: member.user.email,
        skills: member.user.skills,
        avatarId: member.user.avatarId
      }))
    };

    return NextResponse.json({ team: teamResponse });
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
      }
    });

    if (!teamMembership) {
      return NextResponse.json({ error: 'User is not a member of any team' }, { status: 404 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamMembership.teamId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                email: true,
                skills: true,
                avatarId: true
              }
            }
          }
        }
      }
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Transform the response to match the expected structure
    const teamResponse = {
      id: team.id,
      name: team.name,
      inviteCode: team.inviteCode,
      skills: team.skills,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      members: team.members.map(member => ({
        id: member.user.id,
        displayName: member.user.displayName,
        email: member.user.email,
        skills: member.user.skills,
        avatarId: member.user.avatarId
      }))
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
      }
    });

    if (!teamMembership) {
      return NextResponse.json({ error: 'User is not a member of any team' }, { status: 404 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamMembership.teamId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                email: true,
                skills: true,
                avatarId: true
              }
            }
          }
        }
      }
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Check if skill already exists in team
    if (team.skills.includes(skill)) {
      return NextResponse.json({ error: 'Skill already exists in team' }, { status: 400 });
    }

    // Add the new skill to the team
    const updatedTeam = await prisma.team.update({
      where: { id: team.id },
      data: {
        skills: [...team.skills, skill]
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                email: true,
                skills: true,
                avatarId: true
              }
            }
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

    // Transform the response to match the expected structure
    const teamResponse = {
      id: updatedTeam.id,
      name: updatedTeam.name,
      inviteCode: updatedTeam.inviteCode,
      skills: updatedTeam.skills,
      createdAt: updatedTeam.createdAt,
      updatedAt: updatedTeam.updatedAt,
      members: updatedTeam.members.map(member => ({
        id: member.user.id,
        displayName: member.user.displayName,
        email: member.user.email,
        skills: member.user.skills,
        avatarId: member.user.avatarId
      }))
    };

    return NextResponse.json({ team: teamResponse });
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update team' },
      { status: 500 }
    );
  }
} 