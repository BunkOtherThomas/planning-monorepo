'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@repo/ui/modal';
import { Avatar } from '../../components/Avatar';
import { LevelProgress } from './LevelProgress';
import { Team, UserSkills } from '@quest-board/types';
import { getLevel } from '@planning/common-utils';
import { getUserSkills } from '../lib/api';
import styles from './TeamMemberModal.module.css';

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Team['members'][0];
}

export function TeamMemberModal({ isOpen, onClose, member }: TeamMemberModalProps) {
  const [skills, setSkills] = useState<UserSkills | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserSkills() {
      if (!isOpen) return;
      
      setLoading(true);
      setError(null);
      try {
        const userSkills = await getUserSkills(member.id);
        setSkills(userSkills);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch skills');
      } finally {
        setLoading(false);
      }
    }

    fetchUserSkills();
  }, [isOpen, member.id]);

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
          {loading && <p>Loading skills...</p>}
          {error && <p className={styles.error}>Error: {error}</p>}
          {!loading && !error && skills && (
            <div className={styles.skillsList}>
              {Object.entries(skills).map(([skillName, xp]) => (
                <div key={skillName} className={styles.skillItem}>
                  <span className={styles.skillName}>{skillName}</span>
                  <span className={styles.skillXP}>XP: {xp}</span>
                </div>
              ))}
            </div>
          )}
          {!loading && !error && (!skills || Object.keys(skills).length === 0) && (
            <p className={styles.noSkills}>No skills found for this user</p>
          )}
        </div>
      </div>
    </Modal>
  );
} 