import styles from './LevelProgress.module.css';
import { useEffect, useState } from 'react';

interface LevelProgressProps {
  level: number;
  progress: number;
  previousLevel?: number;
  previousProgress?: number;
}

export function LevelProgress({ level, progress, previousLevel, previousProgress }: LevelProgressProps) {
  // Ensure level is between 0 and 100
  const clampedLevel = Math.min(Math.max(level, 0), 100);
  // Ensure progress is between 0 and 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  
  // Track which pips have just been completed
  const [completedPips, setCompletedPips] = useState<Set<number>>(new Set());
  // Track the current display values for animation
  const [displayLevel, setDisplayLevel] = useState(previousLevel ?? clampedLevel);
  const [displayProgress, setDisplayProgress] = useState(previousProgress ?? clampedProgress);

  useEffect(() => {
    if (previousLevel === undefined || previousProgress === undefined) return;

    // Start with previous values
    setDisplayLevel(previousLevel);
    setDisplayProgress(previousProgress);

    // Find newly completed pips
    const newCompletedPips = new Set<number>();
    const prevLevel = Math.floor(previousLevel);
    const currentLevel = Math.floor(clampedLevel);
    
    for (let i = prevLevel; i < currentLevel; i++) {
      newCompletedPips.add(i);
    }
    
    if (prevLevel === currentLevel && progress > previousProgress) {
      const prevWasPartial = previousProgress > 0;
      const nowIsPartial = progress > 0;
      if (!prevWasPartial && nowIsPartial) {
        newCompletedPips.add(currentLevel);
      }
    }

    setCompletedPips(newCompletedPips);

    // After 0.5s, flash to new values
    const timeout = setTimeout(() => {
      setDisplayLevel(clampedLevel);
      setDisplayProgress(clampedProgress);
      // Clear completed pips after animation
      setTimeout(() => {
        setCompletedPips(new Set());
      }, 500);
    }, 500);

    return () => clearTimeout(timeout);
  }, [level, progress, previousLevel, previousProgress]);

  return (
    <div className={styles.container}>
      {Array.from({ length: 100 }).map((_, index) => {
        const isFilled = index < Math.floor(displayLevel);
        const isPartial = index === Math.floor(displayLevel) && displayProgress > 0;
        const isCompleted = completedPips.has(index);
        
        return (
          <div
            key={index}
            className={`${styles.pip} ${isFilled ? styles.filled : ''} ${
              isPartial ? styles.partial : ''
            } ${isCompleted ? styles.completed : ''}`}
            style={isPartial ? { '--progress': displayProgress } as React.CSSProperties : undefined}
          />
        );
      })}
    </div>
  );
} 