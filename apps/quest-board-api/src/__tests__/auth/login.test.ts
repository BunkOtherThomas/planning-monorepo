import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { prismaMock } from '../../test/setup';
import { POST } from '../../app/api/auth/login/route';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockUser = {
  id: 'mock-user-id',
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

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (compare as jest.Mock).mockImplementation((password, hashedPassword) => {
      return Promise.resolve(password === 'password123');
    });
    (sign as jest.Mock).mockReturnValue('mock-token');
    prismaMock.user.findUnique.mockReset();
  });

  it('should return 401 for non-existent user', async () => {
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    prismaMock.user.findUnique.mockResolvedValue(null);

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid credentials');
  });

  it('should return 401 for invalid password', async () => {
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword',
      }),
    });

    prismaMock.user.findUnique.mockResolvedValue(mockUser);

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid credentials');
  });

  it('should return token and user data for valid credentials', async () => {
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    prismaMock.user.findUnique.mockResolvedValue(mockUser);

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.token).toBeDefined();
    expect(data.user).toEqual(expect.objectContaining({
      id: mockUser.id,
      email: mockUser.email,
      displayName: mockUser.displayName,
    }));
  });

  it('should return 500 for internal errors', async () => {
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    prismaMock.user.findUnique.mockRejectedValue(new Error('Database error'));

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to authenticate');
  });
}); 