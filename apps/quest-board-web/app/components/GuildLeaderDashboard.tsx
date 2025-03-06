'use client';

import { useEffect, useState } from 'react';
import { getCurrentTeam, addTeamSkill, getQuests } from '../lib/api';
import { Avatar } from '../../components/Avatar';
import styles from './Dashboard.module.css';
import { QuestResponse } from '@quest-board/types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.modalCloseButton}
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        {title && (
          <h2 className={styles.modalTitle}>{title}</h2>
        )}
        <div className={styles.modalBody}>
          {children}
        </div>
      </div>
    </div>
  );
}

interface TeamMember {
  id: string;
  displayName: string;
  avatarId: number;
}

interface Team {
  id: string;
  inviteCode: string;
  members: TeamMember[];
  skills: string[];
}

export default function GuildLeaderDashboard() {
  const [team, setTeam] = useState<Team | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [skillError, setSkillError] = useState<string | null>(null);
  const [quests, setQuests] = useState<QuestResponse[]>([]);
  const [isCreateQuestModalOpen, setIsCreateQuestModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamData, questsData] = await Promise.all([
          getCurrentTeam(),
          getQuests('created')
        ]);
        setTeam(teamData);
        setQuests(questsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      }
    };

    fetchData();
  }, []);

  const handleCopyInvite = async () => {
    if (!team) return;
    const inviteUrl = `${window.location.origin}/signup/?team=${team.inviteCode}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) {
      setSkillError('Skill name cannot be empty');
      return;
    }

    if (team?.skills.some(s => s.toLowerCase() === newSkill.toLowerCase())) {
      setSkillError('This skill already exists in your team');
      return;
    }

    try {
      await addTeamSkill(newSkill.trim());
      const updatedTeam = await getCurrentTeam();
      setTeam(updatedTeam);
      setIsAddingSkill(false);
      setNewSkill('');
      setSkillError(null);
    } catch (err) {
      setSkillError(err instanceof Error ? err.message : 'Failed to add skill');
    }
  };

  const sortedQuests = [...quests].sort((a, b) => {
    // First sort by status
    const statusOrder = {
      'OPEN': 0,
      'IN_PROGRESS': 1,
      'COMPLETED': 2,
      'CANCELLED': 3
    };
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    
    // Then by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Team Information</h3>
          {error ? (
            <div className={styles.error}>{error}</div>
          ) : team ? (
            <div className={styles.teamInfo}>
              <div className={styles.teamMembers}>
                <h4 className={styles.questTitle}>Team Members</h4>
                <div className={styles.questList}>
                  {team.members.map((member) => (
                    <div key={member.id} className={styles.quest}>
                      <div className={styles.applicantInfo}>
                        <Avatar avatarId={member.avatarId} size={32} />
                        <span className={styles.memberName}>{member.displayName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.teamCode}>
                <h4 className={styles.questTitle}>Invite team members</h4>
                <code 
                  className={`${styles.inviteCode} ${copied ? styles.copied : ''}`}
                  onClick={handleCopyInvite}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.inviteHeader}>Dangerous to go alone!</div>
                  <div className={styles.inviteUrl}>Use this url to invite your team members: {`${window.location.origin}/signup/?team=${team.inviteCode}`}</div>
                </code>
                {copied && (
                  <div className={styles.copyMessage}>
                    URL copied to clipboard!
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.loading}>Loading team information...</div>
          )}
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Team Skills</h3>
          <div className={styles.questList}>
            {team?.skills && team.skills.length > 0 ? (
              team.skills.map((skill, index) => (
                <div key={index} className={styles.quest}>
                  <div className={styles.applicantInfo}>
                    <span className={styles.statIcon}>⚔️</span>
                    <span>{skill}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>No skills defined yet</div>
            )}
          </div>
          {isAddingSkill ? (
            <div className={styles.skillInputContainer}>
              <input
                type="text"
                value={newSkill}
                onChange={(e) => {
                  setNewSkill(e.target.value);
                  setSkillError(null);
                }}
                placeholder="Enter skill name"
                className={styles.skillInput}
              />
              {skillError && <div className={styles.error}>{skillError}</div>}
              <div className={styles.skillInputActions}>
                <button onClick={() => {
                  setIsAddingSkill(false);
                  setNewSkill('');
                  setSkillError(null);
                }} className={styles.cancelButton}>
                  Cancel
                </button>
                <button onClick={handleAddSkill} className={styles.submitButton}>
                  Submit
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.stickyAddButton}>
              <button 
                className={styles.addButton}
                onClick={() => setIsAddingSkill(true)}
              >
                <span className={styles.statIcon}>➕</span>
                Add Skill
              </button>
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Team Quests</h3>
          <div className={styles.questListContainer}>
            {error ? (
              <div className={styles.error}>{error}</div>
            ) : quests.length > 0 ? (
              sortedQuests.map((quest) => (
                <div key={quest.id} className={styles.quest}>
                  <div className={styles.questHeader}>
                    <h4 className={styles.questTitle}>{quest.title}</h4>
                    <span className={`${styles.questStatus} ${styles[quest.status.toLowerCase()]}`}>
                      {quest.status.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                  {quest.assignedTo && (
                    <div className={styles.assignedTo}>
                      <Avatar avatarId={0} size={24} />
                      <span>{quest.assignedTo}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>No quests created yet</div>
            )}
            <div className={styles.stickyAddButton}>
              <button 
                className={styles.addButton}
                onClick={() => setIsCreateQuestModalOpen(true)}
              >
                <span className={styles.statIcon}>➕</span>
                Create New Quest
              </button>
            </div>
          </div>
        </section>
      </div>

      <Modal
        isOpen={isCreateQuestModalOpen}
        onClose={() => setIsCreateQuestModalOpen(false)}
        title="Create New Quest"
      >
        <div className={styles.modalContent}>
          <p>Quest creation form will go here</p>
        </div>
      </Modal>
    </div>
  );
} 