export type QuestStatus = 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface QuestCreationRequest {
  title: string;
  description: string;
  skills: Array<{
    skillId: string;
    weight: number;
  }>;
  deadline?: string;
}

export interface QuestAssignmentRequest {
  questId: string;
  assignedToId: string;
}

export interface QuestUpdateRequest {
  questId: string;
  status: QuestStatus;
  completedAt?: Date;
} 