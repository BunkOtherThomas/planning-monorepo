'use client';

import { Modal } from '@repo/ui/modal';
import styles from './LevelUpModal.module.css';
import { getLevel } from '@planning/common-utils';
import { Avatar } from '../../components/Avatar';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarId: number;
  leveledUpSkills: Array<{
    skill: string;
    before: number;
    after: number;
  }>;
  otherSkills: Array<{
    skill: string;
    gained: number;
  }>;
}

export function LevelUpModal({ isOpen, onClose, avatarId, leveledUpSkills, otherSkills }: LevelUpModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Level Up!">
      <div className={styles.content}>
        <div className={styles.avatarContainer}>
          <Avatar 
            avatarId={avatarId} 
            size={136} 
            className={styles.celebratingAvatar} 
            spritesheet="/images/level-up.jpg"
          />
        </div>
        {leveledUpSkills.map(({ skill, before, after }) => (
          <div key={skill} className={styles.levelUpMessage}>
            {skill} level up! {getLevel(before).level} → {getLevel(after).level}
          </div>
        ))}
        
        {otherSkills.length > 0 && (
          <div className={styles.otherSkills}>
            {otherSkills.map(({ skill, gained }) => (
              <div key={skill} className={styles.xpGain}>
                Also gained {gained} {skill} XP
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
} 