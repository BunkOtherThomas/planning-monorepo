export interface SignupRequest {
  email: string;
  password: string;
  displayName: string;
  isProjectManager: boolean;
  isTeamMember: boolean;
  businessDetails?: {
    name: string;
    description: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
} 