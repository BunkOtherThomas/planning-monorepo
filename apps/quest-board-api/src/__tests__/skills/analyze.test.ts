import { POST } from '../../app/api/skills/analyze/route';
import { prismaMock, mockOpenAIInstance } from '../../test/setup';
import { OpenAI } from 'openai';

describe('Skills Analyze API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should analyze task skills', async () => {
    const req = new Request('http://localhost/api/skills/analyze', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Build a React App',
        description: 'Create a React application with TypeScript',
        skills: ['JavaScript', 'TypeScript', 'React'],
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(data.skillProficiencies).toEqual([
      { skill: 'JavaScript', proficiency: 2 },
      { skill: 'TypeScript', proficiency: 1 },
    ]);
  });

  it('should handle invalid GPT response', async () => {
    const req = new Request('http://localhost/api/skills/analyze', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Build a React App',
        description: 'invalid response',
        skills: ['JavaScript', 'TypeScript', 'React'],
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(data.error).toBe('Failed to analyze skills');
    expect(data.skillProficiencies).toEqual([]);
  });

  it('should handle OpenAI API errors', async () => {
    const req = new Request('http://localhost/api/skills/analyze', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Build a React App',
        description: 'API error',
        skills: ['JavaScript', 'TypeScript', 'React'],
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(data.error).toBe('Failed to analyze skills');
    expect(data.skillProficiencies).toEqual([]);
  });

  it('should return mock data when OpenAI client is not initialized', async () => {
    const req = new Request('http://localhost/api/skills/analyze', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Build a React App',
        description: 'not initialized',
        skills: ['JavaScript', 'TypeScript', 'React'],
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(data.skillProficiencies).toEqual([
      { skill: 'JavaScript', proficiency: 2 },
      { skill: 'TypeScript', proficiency: 1 },
    ]);
  });
}); 