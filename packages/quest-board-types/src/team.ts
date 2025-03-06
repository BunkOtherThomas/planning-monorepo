export interface TeamMembershipRequest {
  projectManagerId: string;
  teamMemberId: string;
}

export interface Team {
  id: string;
  inviteCode: string;
  members: {
    id: string;
    displayName: string;
    avatarId: number;
  }[];
  skills: string[];
} 