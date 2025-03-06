export interface Skill {
  id: string;
  name: string;
  description: string;
  isGlobal: boolean;
}

export interface UserSkills {
  [skillName: string]: number; // XP value for each skill
}

export interface SkillDeclarationRequest {
  skillName: string;
  xp: number;
}

export interface SkillAssessment {
  skill: string;
  xp: number;
} 