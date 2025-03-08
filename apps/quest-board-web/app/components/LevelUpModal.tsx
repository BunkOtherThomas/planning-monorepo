'use client';

import { Modal } from '@repo/ui/modal';
import styles from './LevelUpModal.module.css';
import { getLevel } from '@planning/common-utils';
import { Avatar } from '../../components/Avatar';
import { LevelProgress } from './LevelProgress';
import { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';

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
  const [showBouncingAvatar, setShowBouncingAvatar] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setShowBouncingAvatar(true);
        setShowConfetti(true);
      }, 500);

      // Hide confetti after 5 seconds
      const confettiTimer = setTimeout(() => {
        setShowConfetti(false);
      }, 5500);

      return () => {
        clearTimeout(timer);
        clearTimeout(confettiTimer);
      };
    } else {
      setShowConfetti(false);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Level Up!">
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.5}
          colors={[
            '#ffd700', // --accent-gold
            '#8b7355', // --accent-brown
            '#9c8261', // --accent-brown-light
            '#6b5a40', // --accent-brown-dark
            '#ffffff', // white
            '#000000', // black
            '#1a1a2e', // --primary-dark
            '#16213e', // --primary-darker
          ]}
        />
      )}
      <div className={styles.content}>
        <div className={styles.avatarContainer}>
          <Avatar 
            avatarId={avatarId} 
            size={136} 
            className={showBouncingAvatar ? styles.celebratingAvatar : ''} 
            spritesheet={showBouncingAvatar ? "/images/level-up.jpg" : undefined}
          />
        </div>
        <div className={styles.levelUpGrid}>
          {leveledUpSkills.map(({ skill, before, after }) => {
            const beforeLevel = getLevel(before);
            const afterLevel = getLevel(after);
            
            // Calculate progress within the level
            const beforeProgress = beforeLevel.remaining > 0 
              ? (beforeLevel.xp / (beforeLevel.xp + beforeLevel.remaining)) 
              : 1;
            const afterProgress = afterLevel.remaining > 0 
              ? (afterLevel.xp / (afterLevel.xp + afterLevel.remaining)) 
              : 1;

            return (
              <div key={skill} className={styles.levelUpMessage}>
                <div className={styles.skillName}>{skill}</div>
                <div className={styles.levelProgressContainer}>
                  <div className={styles.levelText}>
                    Level {beforeLevel.level} → Level {afterLevel.level}
                  </div>
                  <LevelProgress
                    level={afterLevel.level}
                    progress={afterProgress}
                    previousLevel={beforeLevel.level}
                    previousProgress={beforeProgress}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
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