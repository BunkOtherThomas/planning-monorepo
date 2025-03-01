export * from './auth';
export * from './quest';
export * from './skill';
export * from './team';

export interface ProjectManagerGoals {
  goals: string;
  skipGoals?: boolean;
}

export interface SkillsResponse {
  skills: string[];
  error?: string;
}

export interface SelectedSkills {
  selectedSkills: string[];
  customSkills: string[];
} 