import styles from './LevelProgress.module.css';

interface LevelProgressProps {
  level: number;
  progress: number;
}

export function LevelProgress({ level, progress }: LevelProgressProps) {
  // Ensure level is between 0 and 100
  const clampedLevel = Math.min(Math.max(level, 0), 100);
  // Ensure progress is between 0 and 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <div className={styles.container}>
      {Array.from({ length: 100 }).map((_, index) => {
        const isFilled = index < clampedLevel;
        const isPartial = index === clampedLevel && clampedProgress > 0;
        
        return (
          <div
            key={index}
            className={`${styles.pip} ${isFilled ? styles.filled : ''} ${
              isPartial ? styles.partial : ''
            }`}
            style={isPartial ? { '--progress': clampedProgress } as React.CSSProperties : undefined}
          />
        );
      })}
    </div>
  );
} 