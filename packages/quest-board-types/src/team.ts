import { User } from './auth';

export interface TeamMembershipRequest {
  projectManagerId: string;
  teamMemberId: string;
}

export interface Team {
  id: string;
  inviteCode: string;
  members: User[];
  skills: string[];
} 