import { getLevel } from '../getLevel';

describe('getLevel', () => {
  it('should return level 0 for 0 XP', () => {
    const result = getLevel(0);
    expect(result).toEqual({
      level: 0,
      xp: 0,
      remaining: 3,
    });
  });

  it('should return level 1 for 3 XP', () => {
    const result = getLevel(3);
    expect(result).toEqual({
      level: 1,
      xp: 0,
      remaining: 6,
    });
  });

  it('should return level 2 for 9 XP', () => {
    const result = getLevel(9);
    expect(result).toEqual({
      level: 2,
      xp: 0,
      remaining: 9,
    });
  });

  it('should return level 3 for 18 XP', () => {
    const result = getLevel(18);
    expect(result).toEqual({
      level: 3,
      xp: 0,
      remaining: 12,
    });
  });

  it('should return correct progress within a level', () => {
    const result = getLevel(5);
    expect(result).toEqual({
      level: 1,
      xp: 2,
      remaining: 4,
    });
  });

  it('should never return a level higher than 100', () => {
    // Calculate XP needed for level 100
    const xpForLevel100 = (100 * 99 * 3) / 2;
    const result = getLevel(xpForLevel100 + 1000);
    expect(result.level).toBe(100);
    expect(result.remaining).toBe(0);
  });

  it('should handle XP between levels correctly', () => {
    // 9 XP is exactly level 2
    // 10 XP should be level 2 with 1 XP progress
    const result = getLevel(10);
    expect(result).toEqual({
      level: 2,
      xp: 1,
      remaining: 8,
    });
  });
}); 