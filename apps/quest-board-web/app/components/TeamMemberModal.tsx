'use client';

import { Modal } from '@repo/ui/modal';
import { Avatar } from '../../components/Avatar';
import { LevelProgress } from './LevelProgress';
import { Team } from '@quest-board/types';
import { getLevel } from '@planning/common-utils';
import styles from './TeamMemberModal.module.css';

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Team['members'][0];
}

export function TeamMemberModal({ isOpen, onClose, member }: TeamMemberModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={member.displayName}
    >
      <div className={styles.container}>
        <div className={styles.avatarSection}>
          <Avatar avatarId={member.avatarId || 0} size={128} />
        </div>
        
        <div className={styles.skillsSection}>
          <h3>Skills</h3>
          <p className={styles.noSkills}>No skills information available in team view</p>
        </div>
      </div>
    </Modal>
  );
} 