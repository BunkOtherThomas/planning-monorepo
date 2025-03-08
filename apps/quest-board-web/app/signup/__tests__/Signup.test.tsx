import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signup } from '../../lib/api';
import Signup from '../page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue(null),
  }),
}));

// Mock signup API
jest.mock('../../lib/api', () => ({
  signup: jest.fn(),
}));

const mockRouter = {
  push: jest.fn(),
};

(useRouter as jest.Mock).mockReturnValue(mockRouter);

describe('Signup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders signup form', () => {
    render(<Signup />);
    expect(screen.getByPlaceholderText(/How shall we address you\?/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
    expect(screen.getByTestId('password')).toBeInTheDocument();
    expect(screen.getByText(/Leave empty to create a new team as a Guild Leader/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Begin Your Journey/i })).toBeInTheDocument();
  });

  it('shows error message when passwords do not match', async () => {
    render(<Signup />);
    
    fireEvent.change(screen.getByPlaceholderText(/How shall we address you\?/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByTestId('password'), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByTestId('confirmPassword'), {
      target: { value: 'Password124!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Begin Your Journey/i }));

    await waitFor(() => {
      expect(screen.getByText(/Your scrolls of passage do not match/i)).toBeInTheDocument();
    });
  });

  it('redirects to dashboard on successful signup with team code', async () => {
    (signup as jest.Mock).mockResolvedValueOnce({ token: 'fake-token' });

    render(<Signup />);
    
    fireEvent.change(screen.getByPlaceholderText(/How shall we address you\?/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByTestId('password'), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByTestId('confirmPassword'), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter team code to join as an adventurer/i), {
      target: { value: 'TEAM123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Begin Your Journey/i }));

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('redirects to goals on successful signup without team code', async () => {
    (signup as jest.Mock).mockResolvedValueOnce({ token: 'fake-token' });

    render(<Signup />);
    
    fireEvent.change(screen.getByPlaceholderText(/How shall we address you\?/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByTestId('password'), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByTestId('confirmPassword'), {
      target: { value: 'Password123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Begin Your Journey/i }));

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/goals');
    });
  });
}); 