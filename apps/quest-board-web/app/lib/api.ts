import {
  SignupRequest,
  LoginRequest,
  SkillDeclarationRequest,
  QuestCreationRequest,
  QuestStatus
} from '@quest-board/types';

// API routes are now running on port 3001
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  isProjectManager: boolean;
  isTeamMember: boolean;
}

interface AuthResponse {
  user: User;
  token: string;
}

// Common fetch options for all API requests
const defaultOptions: RequestInit = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
};

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    ...defaultOptions,
    method: 'POST',
    body: JSON.stringify({ email, password } as LoginRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to login');
  }

  const data = await response.json();
  
  // Set the auth token cookie
  document.cookie = `auth-token=${data.token}; path=/; max-age=86400; samesite=lax`;

  return data;
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
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
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