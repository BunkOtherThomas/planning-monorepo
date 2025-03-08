// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock next/navigation
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
};

const mockSearchParams = () => new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams(),
})); 