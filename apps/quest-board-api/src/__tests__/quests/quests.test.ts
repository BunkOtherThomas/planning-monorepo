import { verify } from 'jsonwebtoken';
import { prismaMock } from '../../test/setup';
import { GET, POST } from '../../app/quests/route';
import { QuestStatus } from '@prisma/client';

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
  skills: {},
  favoriteSkills: [],
};

describe('Quests API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verify as jest.Mock).mockReturnValue({ userId: mockUserId });
    prismaMock.quest.findMany.mockReset();
    prismaMock.quest.create.mockReset();
  });

  describe('GET /quests', () => {
    it('should return 401 if no token is provided', async () => {
      const req = new Request('http://localhost/quests');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Missing token');
    });

    it('should return quests for type=created', async () => {
      const mockQuests = [
        {
          id: '1',
          title: 'Test Quest',
          description: 'Test Description',
          status: QuestStatus.OPEN,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdById: mockUserId,
          assignedToId: null,
          questSkills: { 'JavaScript': 1 },
          assignedTo: null,
          completedAt: null,
        },
      ];

      const req = new Request('http://localhost/quests?type=created', {
        headers: {
          Authorization: 'Bearer test-token',
        },
      });

      prismaMock.quest.findMany.mockResolvedValue(mockQuests);

      const response = await GET(req);
      const data = await response.json();

      expect(prismaMock.quest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { createdById: mockUserId },
          include: {
            assignedTo: {
              select: {
                id: true,
                displayName: true,
                avatarId: true
              }
            },
          },
          orderBy: {
            createdAt: 'desc'
          }
        })
      );
      expect(data).toHaveLength(1);
      expect(data[0]).toEqual(expect.objectContaining({
        id: '1',
        title: 'Test Quest',
        createdBy: mockUserId,
        skills: { 'JavaScript': 1 },
      }));
    });
  });

  describe('POST /quests', () => {
    it('should return 401 if no token is provided', async () => {
      const req = new Request('http://localhost/quests', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Missing token');
    });

    it('should create a new quest', async () => {
      const mockQuest = {
        id: '1',
        title: 'New Quest',
        description: 'Quest Description',
        status: QuestStatus.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdById: mockUserId,
        assignedToId: null,
        questSkills: { 'JavaScript': 1 },
        assignedTo: null,
        completedAt: null,
      };

      const req = new Request('http://localhost/quests', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          title: 'New Quest',
          description: 'Quest Description',
          skills: { 'JavaScript': 1 },
        }),
      });

      prismaMock.quest.create.mockResolvedValue(mockQuest);

      const response = await POST(req);
      const data = await response.json();

      expect(prismaMock.quest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'New Quest',
            description: 'Quest Description',
            createdById: mockUserId,
            status: 'OPEN',
            questSkills: { 'JavaScript': 1 },
          }),
          include: {
            assignedTo: {
              select: {
                id: true,
                displayName: true,
                avatarId: true
              }
            }
          }
        })
      );
      expect(data).toEqual(expect.objectContaining({
        id: '1',
        title: 'New Quest',
        createdBy: mockUserId,
        skills: { 'JavaScript': 1 },
      }));
    });

    it('should return 500 on internal error', async () => {
      const req = new Request('http://localhost/quests', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          title: 'New Quest',
          description: 'Quest Description',
          skills: { 'JavaScript': 1 },
        }),
      });

      prismaMock.quest.create.mockRejectedValue(new Error('Database error'));

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create quest');
    });
  });
}); 