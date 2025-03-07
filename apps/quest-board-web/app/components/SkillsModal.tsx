import { User } from '@quest-board/types';
import { LevelProgress } from './LevelProgress';
import styles from './SkillsModal.module.css';
import { getLevel } from '@planning/common-utils';
import { Modal } from '@repo/ui/modal';
import { Button } from '@repo/ui/button';
import { useState, useEffect } from 'react';
import { updateFavoriteSkills, addTeamSkill } from '../lib/api';
import { SkillAssessmentModal } from './SkillAssessmentModal';

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
  onTeamSkillsUpdate?: (newSkills: string[]) => void;
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
  taggedSkills = [],
  onTeamSkillsUpdate
}: SkillsModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [skillError, setSkillError] = useState<string | null>(null);
  const [localTeamSkills, setLocalTeamSkills] = useState<string[]>(teamSkills);
  const [skillToAssess, setSkillToAssess] = useState<string | null>(null);
  const remainingTags = MAX_TAG_SKILLS - taggedSkills.length;

  // Update local skills when prop changes
  useEffect(() => {
    setLocalTeamSkills(teamSkills);
  }, [teamSkills]);

  const handleTagSkill = (skill: string) => {
    if (user.skills?.[skill] === -1) return;
    if (taggedSkills.includes(skill)) {
      onUntagSkill?.(skill);
    } else if (remainingTags > 0) {
      onTagSkill?.(skill);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) {
      setSkillError('Skill name cannot be empty');
      return;
    }

    if (localTeamSkills.some(s => s.toLowerCase() === newSkill.trim().toLowerCase())) {
      setSkillError('This skill already exists in your team');
      return;
    }

    try {
      const trimmedSkill = newSkill.trim();
      await addTeamSkill(trimmedSkill);
      const updatedSkills = [...localTeamSkills, trimmedSkill];
      setLocalTeamSkills(updatedSkills);
      onTeamSkillsUpdate?.(updatedSkills);
      setIsAddingSkill(false);
      setNewSkill('');
      setSkillError(null);
    } catch (err) {
      setSkillError(err instanceof Error ? err.message : 'Failed to add skill');
    }
  };

  const handleSkillAssessment = (values: any) => {
    if (skillToAssess) {
      onSkillClick(skillToAssess);
      setSkillToAssess(null);
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
    <>
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
            {localTeamSkills.map((skill) => {
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

                      <span
                        className={styles.accept}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSkillToAssess(skill);
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        ✓
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
            {user.isProjectManager && (
              isAddingSkill ? (
                <div className={styles.skillItem}>
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => {
                      setNewSkill(e.target.value);
                      setSkillError(null);
                    }}
                    placeholder="Enter new skill"
                    className={styles.skillInput}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {skillError && <div className={styles.error}>{skillError}</div>}
                  <div className={styles.skillActions}>
                    <button
                      onClick={() => {
                        setIsAddingSkill(false);
                        setNewSkill('');
                        setSkillError(null);
                      }}
                      className={styles.decline}
                    >
                      ✕
                    </button>
                    <button
                      onClick={handleAddSkill}
                      className={styles.accept}
                    >
                      ✓
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingSkill(true)}
                  className={styles.addSkillButton}
                >
                  + Add New Skill
                </button>
              )
            )}
          </div>
          <div className={styles.modalFooter}>
            <Button
              label="Cancel"
              onClick={onClose}
              buttonStyle="cancel"
            />
            <Button
              label={isSaving ? 'Saving...' : 'Confirm'}
              onClick={handleSave}
              disabled={isSaving}
              buttonStyle="submit"
            />
          </div>
        </div>
      </Modal>
      {skillToAssess && (
        <SkillAssessmentModal
          skillName={skillToAssess}
          onSubmit={handleSkillAssessment}
          onClose={() => setSkillToAssess(null)}
        />
      )}
    </>
  );
} 