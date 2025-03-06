import { Modal } from '@repo/ui/modal';
import { LevelProgress } from './LevelProgress';
import { getLevel } from '@planning/common-utils';
import styles from './Dashboard.module.css';

interface SkillLevelModalProps {
  skillName: string;
  xp: number;
  onClose: () => void;
}

export function SkillLevelModal({ skillName, xp, onClose }: SkillLevelModalProps) {
  const { level, remaining, xp: _xp } = getLevel(xp);
  const progress = remaining > 0 ? (_xp / (_xp + remaining)) : 1;

  return (
    <Modal isOpen={true} onClose={onClose} title={skillName}>
      <div className={styles.skillLevelInfo}>
        <div className={styles.levelDisplay}>
          <span className={styles.levelLabel}>Level</span>
          <span className={styles.levelValue}>{level}</span>
        </div>
        <LevelProgress level={level} progress={progress} />
        {remaining > 0 ? (
          <p className={styles.nextLevelText}>
            {remaining} XP needed for next level
          </p>
        ) : (
          <p className={styles.maxLevelText}>Maximum level reached!</p>
        )}
      </div>
    </Modal>
  );
} 