import { LevelInfo } from "./types";

const MAX_LEVEL = 100;
const XP_INCREMENT = 3;

/**
 * Calculates the current level and progress based on total XP
 * @param totalXp - The total amount of XP the user has
 * @returns Object containing level, current XP, and remaining XP needed for next level
 */
export function getLevel(totalXp: number): LevelInfo {
  // Calculate the maximum possible level based on total XP
  // Using quadratic formula to solve: totalXp = (level * (level-1) * XP_INCREMENT) / 2
  const level = Math.min(
    Math.floor((1 + Math.sqrt(1 + (8 * totalXp) / XP_INCREMENT)) / 2) - 1,
    MAX_LEVEL
  );

  // Calculate XP needed for current level
  const xpForLevel = (level * (level + 1) * XP_INCREMENT) / 2;
  
  // Calculate current XP progress within the level
  const xp = totalXp - xpForLevel;
  
  // Calculate remaining XP needed for next level
  const remaining = level >= MAX_LEVEL ? 0 : ((level + 1) * XP_INCREMENT - xp);

  return {
    level,
    xp,
    remaining,
  };
} 