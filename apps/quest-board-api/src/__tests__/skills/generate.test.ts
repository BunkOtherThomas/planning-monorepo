import { POST } from '../../app/api/skills/generate/route';
import { prismaMock, mockOpenAIInstance } from '../../test/setup';
import { OpenAI } from 'openai';

describe('Skills Generate API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate skills based on project goals', async () => {
    const req = new Request('http://localhost/api/skills/generate', {
      method: 'POST',
      body: JSON.stringify({
        goals: 'Build a web application with React and Node.js',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(data.skills).toEqual([
      'JavaScript',
      'TypeScript',
      'React',
      'Node.js',
      'Express',
    ]);
  });

  it('should handle invalid GPT response', async () => {
    const req = new Request('http://localhost/api/skills/generate', {
      method: 'POST',
      body: JSON.stringify({
        goals: 'empty response',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(data.error).toBe('Failed to generate skills');
    expect(data.skills).toEqual([]);
  });

  it('should handle OpenAI API errors', async () => {
    const req = new Request('http://localhost/api/skills/generate', {
      method: 'POST',
      body: JSON.stringify({
        goals: 'API error',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(data.error).toBe('Failed to generate skills');
    expect(data.skills).toEqual([]);
  });

  it('should return mock data when OpenAI client is not initialized', async () => {
    const req = new Request('http://localhost/api/skills/generate', {
      method: 'POST',
      body: JSON.stringify({
        goals: 'not initialized',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(data.skills).toEqual([
      'Mock Skill 1',
      'Mock Skill 2',
      'Mock Skill 3',
    ]);
  });
}); 