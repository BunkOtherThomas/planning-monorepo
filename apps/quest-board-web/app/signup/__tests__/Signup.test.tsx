import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Signup from '../page';
import { signup } from '../../lib/api';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock api calls
jest.mock('../../lib/api', () => ({
  signup: jest.fn(),
}));

describe('Signup Component', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (signup as jest.Mock).mockReset();
  });

  it('renders signup form', () => {
    render(<Signup />);
    
    expect(screen.getByText(/Join the Quest Board/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByText(/Adventurer/i)).toBeInTheDocument();
    expect(screen.getByText(/Guild Leader/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Begin Your Journey/i })).toBeInTheDocument();
  });

  it('shows error message when passwords do not match', async () => {
    render(<Signup />);

    fireEvent.change(screen.getByPlaceholderText(/Enter your name/i), {
      target: { value: 'TestUser' },
    });
    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Scroll of Passage/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Scroll of Passage/i), {
      target: { value: 'password456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Begin Your Journey/i }));

    await waitFor(() => {
      expect(screen.getByText(/Your scrolls of passage do not match/i)).toBeInTheDocument();
    });
  });

  it('redirects to dashboard on successful signup', async () => {
    (signup as jest.Mock).mockResolvedValue({
      user: {
        id: '1',
        email: 'test@example.com',
        username: 'TestUser',
        role: 'adventurer',
      },
    });

    render(<Signup />);

    fireEvent.change(screen.getByPlaceholderText(/Enter your name/i), {
      target: { value: 'TestUser' },
    });
    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Scroll of Passage/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Scroll of Passage/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Begin Your Journey/i }));

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('allows role selection', async () => {
    (signup as jest.Mock).mockResolvedValue({
      user: {
        id: '1',
        email: 'test@example.com',
        username: 'TestUser',
        role: 'guild_leader',
      },
    });

    render(<Signup />);

    fireEvent.change(screen.getByPlaceholderText(/Enter your name/i), {
      target: { value: 'TestUser' },
    });
    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Scroll of Passage/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Scroll of Passage/i), {
      target: { value: 'password123' },
    });
    
    const guildLeaderRadio = screen.getByLabelText(/Guild Leader/i);
    fireEvent.click(guildLeaderRadio);
    
    fireEvent.click(screen.getByRole('button', { name: /Begin Your Journey/i }));

    await waitFor(() => {
      expect(signup).toHaveBeenCalledWith(
        'TestUser',
        'test@example.com',
        'password123',
        'guild_leader'
      );
    });
  });
}); 