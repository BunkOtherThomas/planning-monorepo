import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { OpenAI } from 'openai';

// Create a mock Prisma client
export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

// Create a mock OpenAI instance that can be customized per test
const mockOpenAIInstance = {
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
};

// Create the mock OpenAI constructor
const MockOpenAI = jest.fn(() => mockOpenAIInstance);

// Mock the OpenAI module
jest.mock('openai', () => ({
  OpenAI: MockOpenAI,
}));

// Mock Prisma
jest.mock('@quest-board/database', () => ({
  __esModule: true,
  prisma: prismaMock,
}));

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockReturnValue({ userId: 'mock-user-id' }),
  sign: jest.fn().mockReturnValue('mock-token'),
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockImplementation((password, hashedPassword) => {
    return Promise.resolve(password === 'password123' && hashedPassword === 'hashed-password');
  }),
}));

beforeEach(() => {
  mockReset(prismaMock);
  // Reset the OpenAI mock
  mockOpenAIInstance.chat.completions.create.mockReset();
  MockOpenAI.mockClear();
  
  // Set default success response that will be overridden in specific tests
  mockOpenAIInstance.chat.completions.create.mockImplementation(async (params) => {
    // Check if the messages array exists and has content
    const systemMessage = params?.messages?.[0]?.content || '';
    const userMessage = params?.messages?.[1]?.content || '';
    
    if (systemMessage.includes('analyzes tasks and determines required skill proficiencies')) {
      // Handle API error case
      if (userMessage.includes('API error')) {
        throw new Error('API Error');
      }

      // Handle invalid response case
      if (userMessage.includes('invalid response')) {
        return {
          choices: [
            {
              message: {
                content: 'Invalid JS'
              },
            },
          ],
        };
      }

      return {
        choices: [
          {
            message: {
              content: JSON.stringify([
                { skill: 'JavaScript', proficiency: 2 },
                { skill: 'TypeScript', proficiency: 1 }
              ])
            },
          },
        ],
      };
    } else if (systemMessage.includes('suggests relevant technical skills')) {
      // Handle API error case
      if (userMessage.includes('API error')) {
        throw new Error('API Error');
      }

      // Handle empty response case
      if (userMessage.includes('empty response')) {
        return {
          choices: [
            {
              message: {
                content: 'I am unable to comply: Empty response'
              },
            },
          ],
        };
      }

      // Handle not initialized case
      if (userMessage.includes('not initialized')) {
        return {
          choices: [
            {
              message: {
                content: 'Mock Skill 1, Mock Skill 2, Mock Skill 3'
              },
            },
          ],
        };
      }

      return {
        choices: [
          {
            message: {
              content: 'JavaScript, TypeScript, React, Node.js, Express'
            },
          },
        ],
      };
    }

    return {
      choices: [
        {
          message: {
            content: 'Default response'
          },
        },
      ],
    };
  });
});

export { mockOpenAIInstance, MockOpenAI }; 