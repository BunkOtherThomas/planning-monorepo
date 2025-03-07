import { User } from '@quest-board/types';
import { LevelProgress } from './LevelProgress';
import styles from './SkillsModal.module.css';
import { getLevel } from '@planning/common-utils';
import { Modal } from '@repo/ui/modal';
import { useState } from 'react';
import { updateFavoriteSkills } from '../lib/api';

interface SkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  teamSkills: string[];
  onSkillClick: (skill: string) => void;
  onDeclineSkill: (skill: string) => void;
  onTagSkill?: (skill: string) => void;
  onUntagSkill?: (skill: string) => void;
  taggedSkills?: string[];
}

const MAX_TAG_SKILLS = 3;

export function SkillsModal({ 
  isOpen, 
  onClose, 
  user, 
  teamSkills, 
  onSkillClick, 
  onDeclineSkill,
  onTagSkill,
  onUntagSkill,
  taggedSkills = []
}: SkillsModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const remainingTags = MAX_TAG_SKILLS - taggedSkills.length;

  const handleTagSkill = (skill: string) => {
    if (user.skills?.[skill] === -1) return;
    if (taggedSkills.includes(skill)) {
      onUntagSkill?.(skill);
    } else if (remainingTags > 0) {
      onTagSkill?.(skill);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateFavoriteSkills(taggedSkills);
      onClose();
    } catch (error) {
      console.error('Error saving tagged skills:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="My Skills">
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.headerText}>Select your tag skills</div>
          <div className={styles.remainingTags}>{remainingTags} remaining</div>
        </div>
        <div className={styles.modalNote}>
          Your tag skills will level faster than your other skills, you should select the skills you are most proficient in or most interested in developing
        </div>
        <div className={styles.skillsList}>
          {teamSkills.map((skill) => {
            const skillXp = user.skills?.[skill] ?? -1;
            const isNewSkill = skillXp === -1;
            const levelInfo = getLevel(skillXp);
            const isTagged = taggedSkills.includes(skill);

            return (
              <div 
                key={skill} 
                className={`${styles.skillItem} ${isTagged ? styles.taggedSkill : ''}`}
                onClick={() => !isNewSkill && handleTagSkill(skill)}
              >
                <div className={styles.skillName}>{skill}</div>
                {isNewSkill ? (
                  <div className={styles.skillStatus}>
                    <span 
                      className={styles.accept} 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSkillClick(skill);
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      ✓
                    </span>
                    <span 
                      className={styles.decline} 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeclineSkill(skill);
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      ✕
                    </span>
                  </div>
                ) : (
                  <div className={styles.levelProgress}>
                    <LevelProgress 
                      level={levelInfo.level} 
                      progress={levelInfo.xp / (levelInfo.xp + levelInfo.remaining)} 
                    />
                    {isTagged && <div className={styles.tagIndicator}>★</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className={styles.modalFooter}>
          <button 
            className={styles.cancelButton} 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className={styles.confirmButton} 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Confirm'}
          </button>
        </div>
      </div>
    </Modal>
  );
} 