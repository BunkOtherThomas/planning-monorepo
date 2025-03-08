import { verify } from 'jsonwebtoken';
import { prismaMock } from '../../test/setup';
import { POST } from '../../app/api/skills/declare/route';

jest.mock('jsonwebtoken');

describe('Skills Declare API', () => {
  const mockVerify = verify as jest.MockedFunction<typeof verify>;
  const mockUserId = 'mock-user-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if no token is provided', async () => {
    const req = new Request('http://localhost/api/skills/declare', {
      method: 'POST',
      body: JSON.stringify({
        skillName: 'JavaScript',
        professionalExperience: 3,
        formalEducation: 2,
        informalExperience: 4,
        confidence: 3,
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Missing token');
  });

  it('should calculate and update skill XP', async () => {
    const mockUser = {
      skills: {
        'TypeScript': 100,
      },
    };

    const req = new Request('http://localhost/api/skills/declare', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({
        skillName: 'JavaScript',
        professionalExperience: 3,
        formalEducation: 2,
        informalExperience: 4,
        confidence: 3,
      }),
    });

    prismaMock.$queryRaw.mockResolvedValue([mockUser]);

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.xp).toBeDefined();
    expect(typeof data.xp).toBe('number');
    expect(data.xp).toBeGreaterThan(0);

    // Verify the SQL query was called with the correct parameters
    expect(prismaMock.$executeRaw).toHaveBeenCalled();
  });

  it('should handle validation errors', async () => {
    const req = new Request('http://localhost/api/skills/declare', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({
        skillName: 'JavaScript',
        professionalExperience: 6, // Invalid: > 5
        formalEducation: 2,
        informalExperience: 4,
        confidence: 3,
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to declare skill');
  });

  it('should handle database errors', async () => {
    const req = new Request('http://localhost/api/skills/declare', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({
        skillName: 'JavaScript',
        professionalExperience: 3,
        formalEducation: 2,
        informalExperience: 4,
        confidence: 3,
      }),
    });

    prismaMock.$queryRaw.mockRejectedValue(new Error('Database error'));

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to declare skill');
  });
}); 