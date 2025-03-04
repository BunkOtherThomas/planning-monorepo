export enum QuestStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface QuestCreationRequest {
  title: string;
  description: string;
  skills: Array<{
    skillId: string;
    weight: number;
  }>;
  deadline?: string;
}

export interface QuestResponse {
  id: string;
  title: string;
  description: string;
  status: QuestStatus;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  createdBy: string;
  assignedTo?: string;
  skills: Array<{ skillId: string; weight: number }>;
}

export interface QuestListResponse {
  quests: QuestResponse[];
}

export interface CreateQuestRequest extends QuestCreationRequest {}

export interface UpdateQuestRequest {
  title?: string;
  description?: string;
  status?: QuestStatus;
  skills?: Array<{ skillId: string; weight: number }>;
  deadline?: string;
}

export interface AssignQuestRequest {
  questId: string;
  userId: string;
} 

export interface Quest {
    id: string;
    title: string;
    description: string;
    status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
    difficulty: number;
    skills: {
      name: string;
      level: number;
    }[];
    assignedTo?: {
      id: string;
      displayName: string;
      avatarUrl: string;
    };
    suggestedAdventurers: {
      id: string;
      displayName: string;
      avatarUrl: string;
      skillLevels: {
        name: string;
        level: number;
      }[];
      type: 'highest' | 'second' | 'underdog';
    }[];
  }