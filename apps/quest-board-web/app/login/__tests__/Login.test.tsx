import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Login from '../page';
import { login } from '../../lib/api';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue(null),
  }),
}));

// Mock api calls
jest.mock('../../lib/api', () => ({
  login: jest.fn(),
}));

describe('Login Component', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (login as jest.Mock).mockReset();
  });

  it('renders login form', () => {
    render(<Login />);
    
    expect(screen.getByText(/Welcome, Adventurer/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enter the Realm/i })).toBeInTheDocument();
  });

  it('shows error message on invalid credentials', async () => {
    (login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));
    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Enter the Realm/i }));

    await waitFor(() => {
      expect(screen.getByText(/Your scroll of passage seems to be incorrect/i)).toBeInTheDocument();
    });
  });

  it('redirects to dashboard on successful login', async () => {
    (login as jest.Mock).mockResolvedValue({
      user: {
        id: '1',
        email: 'test@example.com',
        username: 'TestUser',
        role: 'adventurer',
      },
    });

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Enter the Realm/i }));

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('disables form submission while loading', async () => {
    (login as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Enter the Realm/i }));

    expect(screen.getByRole('button', { name: /Opening Portal/i })).toBeDisabled();
  });
}); 