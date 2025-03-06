export interface SignupRequest {
  email: string;
  password: string;
  displayName: string;
  isProjectManager: boolean;
  isTeamMember: boolean;
  avatarId: number;
  teamCode?: string;
  businessDetails?: {
    name: string;
    description: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    isProjectManager: boolean;
    avatarId: number;
    isTeamMember: boolean;
  };
  token: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarId?: number;
  isProjectManager: boolean;
  isTeamMember: boolean;
} 