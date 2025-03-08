import { verify } from 'jsonwebtoken';
import { prismaMock } from '../../test/setup';
import { GET, POST } from '../../app/api/skills/route';

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

describe('Skills API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verify as jest.Mock).mockReturnValue({ userId: mockUserId });
  });

  describe('GET /api/skills', () => {
    it('should return 401 if no token is provided', async () => {
      const req = new Request('http://localhost/api/skills');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Missing token');
    });

    it('should return user skills and global skills', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.$queryRaw.mockResolvedValue([
        { id: 1, name: 'JavaScript', businessId: null },
        { id: 2, name: 'TypeScript', businessId: null },
        { id: 3, name: 'React', businessId: null },
      ]);

      const req = new Request('http://localhost/api/skills', {
        headers: {
          Authorization: 'Bearer test-token',
        },
      });

      const response = await GET(req);
      const data = await response.json();

      expect(data).toHaveLength(3);
      expect(data).toEqual(expect.arrayContaining([
        expect.objectContaining({ name: 'JavaScript' }),
        expect.objectContaining({ name: 'TypeScript' }),
        expect.objectContaining({ name: 'React' }),
      ]));
    });

    it('should return 404 if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const req = new Request('http://localhost/api/skills', {
        headers: {
          Authorization: 'Bearer test-token',
        },
      });

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });
  });

  describe('POST /api/skills', () => {
    it('should update user skills', async () => {
      const updatedUser = {
        ...mockUser,
        skills: { 'JavaScript': 2 },
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.user.update.mockResolvedValue(updatedUser);

      const req = new Request('http://localhost/api/skills', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          skillName: 'JavaScript',
          xp: 2,
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.skills).toEqual(updatedUser.skills);
    });

    it('should return 500 on internal error', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.user.update.mockRejectedValue(new Error('Database error'));

      const req = new Request('http://localhost/api/skills', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          skillName: 'JavaScript',
          xp: 2,
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
}); 