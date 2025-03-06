import { Skill, User } from '@quest-board/types';

/**
 * Sorts users based on how well their skills match the provided skill requirements
 * @param requiredSkills Array of required skills with their target values
 * @param users Array of users to sort
 * @returns Sorted array of users, with best matches first
 */
export function sortCandidatesBySkills(requiredSkills: Record<string, number>, users: User[]): User[] {
  return [...users].sort((userA, userB) => {
    const scoreA = calculateMatchScore(requiredSkills, userA.skills);
    const scoreB = calculateMatchScore(requiredSkills, userB.skills);
    return scoreB - scoreA; // Higher score first
  });
}

/**
 * Calculates a match score between required skills and user's skills
 * @param requiredSkills Array of required skills with their target values
 * @param userSkills User's current skill values
 * @returns Match score (0-1), where 1 is perfect match
 */
function calculateMatchScore(requiredSkills: Record<string, number>, userSkills: Record<string, number>): number {
  if (Object.keys(requiredSkills).length === 0) return 0;

  const scores = Object.entries(requiredSkills).map(([name, value]) => {
    const userValue = userSkills[name] || 0;
    // Calculate how close the user's skill is to the required value
    // If user's skill is higher than required, it's still a good match
    return Math.min(userValue, value) / value;
  });

  // Average of all skill matches
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
} 