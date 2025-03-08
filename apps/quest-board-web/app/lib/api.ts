import {
  LoginRequest,
  SignupRequest,
  SkillDeclarationRequest,
  QuestCreationRequest,
  QuestStatus,
  AuthResponse,
  Quest,
  User,
  UserSkills,
  QuestResponse,
} from '@quest-board/types';

// API routes are now running on port 3001
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
    'Content-Type': 'application/json'  // Use consistent casing
  };

  if (requiresAuth) {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    headers['Authorization'] = `Bearer ${token}`;  // Use consistent casing
  }

  const options = {
    headers,
    credentials: 'include' as const
  };

  return options;
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

export async function signup(data: SignupRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to signup');
  }

  return response.json();
}

export async function declareSkill(
  skillName: string,
  professionalExperience: number,
  formalEducation: number,
  informalExperience: number,
  confidence: number,
): Promise<{ xp: number }> {
  const response = await fetch(`${API_BASE_URL}/api/skills/declare`, {
    ...getDefaultOptions(true),
    method: 'POST',
    body: JSON.stringify({
      skillName,
      professionalExperience,
      formalEducation,
      informalExperience,
      confidence
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to declare skill');
  }

  return response.json();
}

export async function getSkills(includeGlobal = true) {
  const response = await fetch(
    `${API_BASE_URL}/api/skills?includeGlobal=${includeGlobal}`,
    getDefaultOptions(true)
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch skills');
  }

  return response.json();
}

export async function getOpenQuestsForUser(id: string) {
  const placeholderQuest: Quest = {
    id: '1',
    title: 'Placeholder Quest',
    description: 'Placeholder Description',
    status: 'open',
    difficulty: 1,
    skills: [],
    assignedTo: {
      id: '1',
      displayName: 'Placeholder User',
      avatarId: 0,
    },
    suggestedAdventurers: [],
  };
  return {ok: true, json: () => Promise.resolve(placeholderQuest)};
}

export async function generateSkills(goals: string): Promise<{ skills: string[], error?: string }> {
  const response = await fetch(`${API_BASE_URL}/api/skills/generate`, {
    ...getDefaultOptions(true),
    method: 'POST',
    body: JSON.stringify({ goals }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate skills');
  }

  return response.json();
}

export async function createQuest(
  title: string,
  description: string,
  skills: Record<string, number>,
  assigneeId?: string
) {
  const response = await fetch(`${API_BASE_URL}/quests`, {
    ...getDefaultOptions(true),
    method: 'POST',
    body: JSON.stringify({
      title,
      description,
      skills,
      assigneeId,
    }),
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
    getDefaultOptions(true)
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

export async function getCurrentUser(): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    ...getDefaultOptions(true),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to get current user');
  }

  return response.json();
}

export async function getCurrentTeam() {
  const response = await fetch(`${API_BASE_URL}/api/teams`, {
    ...getDefaultOptions(true),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch team');
  }

  return response.json();
}

export async function addTeamSkill(skill: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/teams`, {
    ...getDefaultOptions(true),
    method: 'PATCH',
    body: JSON.stringify({ skill }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add skill to team');
  }
}

export interface SkillProficiency {
  skill: string;
  proficiency: number; // 0-3
}

export interface TaskAnalysisResponse {
  skillProficiencies: SkillProficiency[];
  error?: string;
}

export async function analyzeSkills(title: string, description: string | undefined, skills: string[]): Promise<TaskAnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/api/skills/analyze`, {
    ...getDefaultOptions(true),
    method: 'POST',
    body: JSON.stringify({
      title,
      description,
      skills,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to analyze skills');
  }

  return response.json();
}

interface SkillXPChange {
  before: number;
  after: number;
  gained: number;
  isFavorite: boolean;
}

interface TurnInQuestResponse extends QuestResponse {
  skillChanges: Record<string, SkillXPChange>;
}

export async function turnInQuest(questId: string): Promise<TurnInQuestResponse> {
  const response = await fetch(`${API_BASE_URL}/quests/${questId}/turn-in`, {
    ...getDefaultOptions(true),
    method: 'POST'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to turn in quest');
  }

  return response.json();
}

export async function assignQuestToSelf(questId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/quests/${questId}/assign-self`, {
    ...getDefaultOptions(true),
    method: 'POST'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to assign quest');
  }
}

export async function updateFavoriteSkills(favoriteSkills: string[]): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/users/me/favorite-skills`, {
    method: 'PUT',
    ...getDefaultOptions(true),
    body: JSON.stringify({ favoriteSkills }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update favorite skills');
  }
}

export async function getUserSkills(userId: string): Promise<UserSkills> {
  const response = await fetch(`${API_BASE_URL}/api/skills/get?userId=${userId}`, {
    ...getDefaultOptions(true),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch user skills');
  }

  return response.json();
}
