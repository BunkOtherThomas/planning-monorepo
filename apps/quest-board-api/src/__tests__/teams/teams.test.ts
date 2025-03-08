import { verify } from 'jsonwebtoken';
import { prismaMock } from '../../test/setup';
import { GET, POST, PATCH } from '../../app/api/teams/route';

jest.mock('jsonwebtoken');

const mockUserId = 'mock-user-id';
const mockUser = {
  id: mockUserId,
  email: 'test@example.com',
  password: 'hashed-password',
  displayName: 'Test User',
  avatarId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  isProjectManager: false,
  isTeamMember: false,
  skills: { 'JavaScript': 1, 'TypeScript': 1 },
  favoriteSkills: [],
};

const mockTeam = {
  id: 'team-1',
  name: 'Test Team',
  inviteCode: 'invite123',
  skills: ['JavaScript', 'TypeScript'],
  createdAt: new Date('2025-03-08T14:03:13.849Z'),
  updatedAt: new Date('2025-03-08T14:03:13.849Z'),
  members: [
    {
      userId: mockUserId,
      teamId: 'team-1',
      joinedAt: new Date(),
      user: {
        id: mockUserId,
        displayName: 'Test User',
        email: 'test@example.com',
        skills: { 'JavaScript': 1, 'TypeScript': 1 }
      }
    }
  ]
};

const mockTeamMembership = {
  userId: mockUserId,
  teamId: mockTeam.id,
  joinedAt: new Date()
};

describe('Teams API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verify as jest.Mock).mockReturnValue({ userId: mockUserId });
  });

  describe('GET /api/teams', () => {
    it('should return 401 if no token is provided', async () => {
      const req = new Request('http://localhost/api/teams');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Missing token');
    });

    it('should return team data for user', async () => {
      prismaMock.teamsOnUsers.findFirst.mockResolvedValue(mockTeamMembership);
      prismaMock.team.findUnique.mockResolvedValue(mockTeam);

      const req = new Request('http://localhost/api/teams', {
        headers: {
          Authorization: 'Bearer test-token',
        },
      });

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual(expect.objectContaining({
        id: mockTeam.id,
        inviteCode: mockTeam.inviteCode,
        skills: mockTeam.skills,
        members: [
          {
            id: mockUserId,
            displayName: 'Test User',
            email: 'test@example.com',
            skills: { 'JavaScript': 1, 'TypeScript': 1 }
          }
        ]
      }));
    });

    it('should return 404 if user is not in a team', async () => {
      prismaMock.teamsOnUsers.findFirst.mockResolvedValue(null);

      const req = new Request('http://localhost/api/teams', {
        headers: {
          Authorization: 'Bearer test-token',
        },
      });

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User is not a member of any team');
    });
  });

  describe('POST /api/teams', () => {
    it('should create a new team', async () => {
      prismaMock.team.create.mockResolvedValue(mockTeam);
      prismaMock.user.update.mockResolvedValue(mockUser);

      const req = new Request('http://localhost/api/teams', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          skills: ['JavaScript', 'TypeScript'],
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(prismaMock.team.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            members: {
              create: {
                userId: mockUserId
              }
            },
            skills: ['JavaScript', 'TypeScript']
          })
        })
      );

      expect(data.team).toEqual({
        id: mockTeam.id,
        name: mockTeam.name,
        inviteCode: mockTeam.inviteCode,
        skills: mockTeam.skills,
        createdAt: mockTeam.createdAt.toISOString(),
        updatedAt: mockTeam.updatedAt.toISOString(),
        members: [
          {
            id: mockUserId,
            displayName: 'Test User',
            email: 'test@example.com',
            skills: { 'JavaScript': 1, 'TypeScript': 1 }
          }
        ]
      });
    });
  });

  describe('PATCH /api/teams', () => {
    it('should add a new skill to team', async () => {
      const updatedTeam = {
        ...mockTeam,
        skills: [...mockTeam.skills, 'React']
      };

      prismaMock.teamsOnUsers.findFirst.mockResolvedValue(mockTeamMembership);
      prismaMock.team.findUnique.mockResolvedValue(mockTeam);
      prismaMock.team.update.mockResolvedValue(updatedTeam);
      prismaMock.user.update.mockResolvedValue(mockUser);

      const req = new Request('http://localhost/api/teams', {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          skill: 'React',
        }),
      });

      const response = await PATCH(req);
      const data = await response.json();

      expect(data.team).toEqual({
        id: updatedTeam.id,
        name: updatedTeam.name,
        inviteCode: updatedTeam.inviteCode,
        skills: updatedTeam.skills,
        createdAt: updatedTeam.createdAt.toISOString(),
        updatedAt: updatedTeam.updatedAt.toISOString(),
        members: [
          {
            id: mockUserId,
            displayName: 'Test User',
            email: 'test@example.com',
            skills: { 'JavaScript': 1, 'TypeScript': 1 }
          }
        ]
      });
    });

    it('should return 400 if skill already exists', async () => {
      prismaMock.teamsOnUsers.findFirst.mockResolvedValue(mockTeamMembership);
      prismaMock.team.findUnique.mockResolvedValue(mockTeam);

      const req = new Request('http://localhost/api/teams', {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          skill: 'JavaScript',
        }),
      });

      const response = await PATCH(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Skill already exists in team');
    });
  });
}); 