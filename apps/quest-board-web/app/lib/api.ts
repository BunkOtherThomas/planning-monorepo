import {
  LoginRequest,
  SignupRequest,
  SkillDeclarationRequest,
  QuestCreationRequest,
  QuestStatus,
  AuthResponse,
} from '@quest-board/types';

// API routes are now running on port 3001
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  isProjectManager: boolean;
  isTeamMember: boolean;
}

// Common fetch options for all API requests
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include' as const,
};

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Helper function to get the auth token from cookies
function getAuthToken(): string | null {
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
  const token = authCookie ? authCookie.split('=')[1].trim() : null;
  return token;
}

// Helper function to get default options with auth header if needed
function getDefaultOptions(requiresAuth: boolean = false): RequestInit {
  const headers: Record<string, string> = {
    'content-type': 'application/json'  // lowercase for consistency
  };

  if (requiresAuth) {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
    headers['authorization'] = `Bearer ${token}`;  // lowercase for consistency
  }

  return {
    headers,
    credentials: 'include' as const
  };
}

// Auth API calls
export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'  // lowercase for consistency
    },
    body: JSON.stringify({ email, password } as LoginRequest),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to login');
  }

  const data = await response.json();
  
  // Set the auth token in cookies with SameSite attribute
  const cookieValue = `auth-token=${data.token}; path=/; max-age=604800; SameSite=Lax`;  // 7 days
  document.cookie = cookieValue;

  return data;
}

export async function logout(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to logout');
    }

    // Clear the auth token cookie
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  } catch (error) {
    // Even if the API call fails, still clear the cookie
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    throw error;
  }
}

export async function signup(
  email: string,
  password: string,
  displayName: string,
  isProjectManager: boolean,
  isTeamMember: boolean,
  businessDetails?: {
    name: string;
    description: string;
  }
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    ...defaultOptions,
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      displayName,
      isProjectManager,
      isTeamMember,
      businessDetails
    } as SignupRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to signup');
  }

  return response.json();
}

export async function declareSkill(
  skillId: string,
  professionalExp: number,
  formalEducation: number,
  informalEducation: number,
  confidenceMultiplier: number,
  isTagged: boolean
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/skills`, {
    ...defaultOptions,
    method: 'POST',
    body: JSON.stringify({
      skillId,
      professionalExp,
      formalEducation,
      informalEducation,
      confidenceMultiplier,
      isTagged
    } as SkillDeclarationRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to declare skill');
  }
}

export async function getSkills(includeGlobal = true) {
  const response = await fetch(
    `${API_BASE_URL}/skills?includeGlobal=${includeGlobal}`,
    defaultOptions
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch skills');
  }

  return response.json();
}

export async function createQuest(
  title: string,
  description: string,
  skills: Array<{ skillId: string; weight: number }>,
  deadline?: Date
) {
  const response = await fetch(`${API_BASE_URL}/quests`, {
    ...defaultOptions,
    method: 'POST',
    body: JSON.stringify({
      title,
      description,
      skills,
      deadline: deadline?.toISOString()
    } as QuestCreationRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create quest');
  }

  return response.json();
}

export async function getQuests(type: 'created' | 'assigned' | 'available', status?: QuestStatus) {
  const params = new URLSearchParams();
  if (type) params.append('type', type);
  if (status) params.append('status', status);

  const response = await fetch(
    `${API_BASE_URL}/quests?${params.toString()}`,
    defaultOptions
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch quests');
  }

  return response.json();
}

export async function createTeam(skills: string[]) {
  
  const options = {
    ...getDefaultOptions(true),
    method: 'POST',
    body: JSON.stringify({ skills })
  };
    
  try {
    const response = await fetch(`${API_BASE_URL}/api/teams`, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Team creation failed:', {
        status: response.status,
        statusText: response.statusText,
        headers: Array.from(response.headers.entries()),
        error: errorData
      });
      throw new Error(errorData.error || `Failed to create team: ${response.status}`);
    }

    return handleResponse<{ team: any }>(response);
  } catch (error) {
    console.error('Error in createTeam:', error);
    throw error;
  }
}
  export async function checkTeamStatus() {
    const response = await fetch(`${API_BASE_URL}/api/teams/check`, {
      ...getDefaultOptions(true),
    });
    return handleResponse<{ hasTeamWithSkills: boolean }>(response);
  }
