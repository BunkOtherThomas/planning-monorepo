const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface User {
  id: string;
  username: string;  // Display name, doesn't need to be unique
  email: string;     // Unique identifier for authentication
  title: string | null;
  rank: number;
  experience: number;
  gold: number;
  role: 'guild_leader' | 'adventurer';
}

interface AuthResponse {
  user: User;
  token: string;
}

// Common fetch options for all API requests
const defaultOptions: RequestInit = {
  credentials: 'include', // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
};

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    ...defaultOptions,
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to login');
  }

  const data = await response.json();
  
  // Set the auth token in a cookie
  document.cookie = `auth-token=${data.token}; path=/`;

  return data;
}

export async function signup(
  username: string,  // Display name
  email: string,     // Unique identifier
  password: string,
  role: 'guild_leader' | 'adventurer'
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    ...defaultOptions,
    method: 'POST',
    body: JSON.stringify({ username, email, password, role }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to signup');
  }

  const data = await response.json();
  
  // Set the auth token in a cookie
  document.cookie = `auth-token=${data.token}; path=/`;

  return data;
}

export async function logout(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    ...defaultOptions,
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to logout');
  }

  // Remove the auth token cookie
  document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
} 