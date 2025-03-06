'use client';

import { useEffect, useState } from 'react';
import { getCurrentTeam, addTeamSkill, getQuests, createQuest, getCurrentUser, declareSkill } from '../lib/api';
import { Avatar } from '../../components/Avatar';
import styles from './Dashboard.module.css';
import { QuestResponse, QuestStatus, User, SkillAssessment } from '@quest-board/types';
import { CreateQuestModal } from './CreateQuestModal';
import { QuestDetailsModal } from '@repo/ui/quest-details-modal';
import TeamSkills from './TeamSkills';
import { SkillAssessmentModal } from './SkillAssessmentModal';
import { SkillLevelModal } from './SkillLevelModal';

interface Team {
  id: string;
  inviteCode: string;
  members: User[];
  skills: string[];
}

interface SkillAssessmentValues {
  professionalExperience: number;
  formalEducation: number;
  informalExperience: number;
  confidence: number;
}

export default function GuildLeaderDashboard() {
  const [team, setTeam] = useState<Team | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [quests, setQuests] = useState<QuestResponse[]>([]);
  const [isCreateQuestModalOpen, setIsCreateQuestModalOpen] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<QuestResponse | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [viewingSkillLevel, setViewingSkillLevel] = useState<string | null>(null);
  const [skillAssessments, setSkillAssessments] = useState<SkillAssessment[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [teamData, questsData, userData] = await Promise.all([
          getCurrentTeam(),
          getQuests('created'),
          getCurrentUser()
        ]);
        
        if (isMounted) {
          setTeam(teamData);
          setQuests(questsData);
          setCurrentUser(userData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch data');
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
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

  const handleSkillClick = (skill: string) => {
    if (!currentUser) return;
    const isNewSkill = currentUser.skills?.[skill] === -1;
    if (isNewSkill) {
      setSelectedSkill(skill);
    } else {
      setViewingSkillLevel(skill);
    }
  };

  const handleDeclineSkill = async (skill: string) => {
    try {
      const response = await declareSkill(
        skill,
        0, // professionalExperience
        0, // formalEducation
        0, // informalExperience
        0, // confidence
      );
      
      setSkillAssessments(prev => {
        const existingIndex = prev.findIndex(a => a.skill === skill);
        if (existingIndex >= 0) {
          const newAssessments = [...prev];
          newAssessments[existingIndex] = { skill, xp: response.xp };
          return newAssessments;
        }
        return [...prev, { skill, xp: response.xp }];
      });

      // Refresh user data to get updated skills
      const updatedUser = await getCurrentUser();
      setCurrentUser(updatedUser);
    } catch (error) {
      console.error('Error declining skill:', error);
    }
  };

  const handleAssessmentSubmit = async (values: SkillAssessmentValues) => {
    if (!selectedSkill) return;
    
    try {
      const response = await declareSkill(
        selectedSkill,
        values.professionalExperience,
        values.formalEducation,
        values.informalExperience,
        values.confidence
      );
      
      setSkillAssessments(prev => {
        const existingIndex = prev.findIndex(a => a.skill === selectedSkill);
        if (existingIndex >= 0) {
          const newAssessments = [...prev];
          newAssessments[existingIndex] = { skill: selectedSkill, xp: response.xp };
          return newAssessments;
        }
        return [...prev, { skill: selectedSkill, xp: response.xp }];
      });

      // Refresh user data to get updated skills
      const updatedUser = await getCurrentUser();
      setCurrentUser(updatedUser);
      
      setSelectedSkill(null);
    } catch (error) {
      console.error('Error submitting skill assessment:', error);
    }
  };

  const sortedQuests = [...quests].sort((a, b) => {
    // First sort by status
    const statusOrder: Record<QuestStatus, number> = {
      [QuestStatus.OPEN]: 0,
      [QuestStatus.IN_PROGRESS]: 1,
      [QuestStatus.COMPLETED]: 2,
      [QuestStatus.CANCELLED]: 3
    };
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    
    // Then by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleCreateQuest = async (title: string, description?: string, selectedSkills?: { skill: string; proficiency: number }[], assigneeId?: string) => {
    try {
      const transformedSkills = {} as Record<string, number>;
      selectedSkills?.forEach(skill => {
        transformedSkills[skill.skill] = skill.proficiency;
      });
      
      // Call the API to create the quest
      const newQuest = await createQuest(
        title,
        description || '',
        transformedSkills,
        assigneeId
      );

      // Refresh the quests list
      const updatedQuests = await getQuests('created');
      setQuests(updatedQuests);
      
      setIsCreateQuestModalOpen(false);
    } catch (error) {
      console.error('Failed to create quest:', error);
      setError(error instanceof Error ? error.message : 'Failed to create quest');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Team</h3>
          {error ? (
            <div className={styles.error}>{error}</div>
          ) : team ? (
            <div className={styles.teamInfo}>
              <div className={styles.teamMembers}>
                <div className={styles.questList}>
                  {team.members.map((member) => (
                    <div key={member.id} className={styles.quest}>
                      <div className={styles.applicantInfo}>
                        <Avatar avatarId={member.avatarId || 0} size={32} />
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

        <TeamSkills
          team={team}
          user={currentUser}
          error={error}
          onSkillClick={handleSkillClick}
          onDeclineSkill={handleDeclineSkill}
          isGuildLeader={true}
        />

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Quests</h3>
          <div className={styles.questListContainer}>
            {error ? (
              <div className={styles.error}>{error}</div>
            ) : quests.length > 0 ? (
              sortedQuests.map((quest) => (
                <div 
                  key={quest.id} 
                  className={styles.quest}
                  onClick={() => setSelectedQuest(quest)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.questHeader}>
                    <h4 className={styles.questTitle}>{quest.title}</h4>
                    <span className={`${styles.questStatus} ${styles[quest.status.toLowerCase()]}`}>
                      {quest.status.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                  {quest.assignedTo && (
                    <div className={styles.assignedTo}>
                      <Avatar avatarId={quest.assignedTo.avatarId} size={24} />
                      <span>{quest.assignedTo.displayName}</span>
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

      <CreateQuestModal
        isOpen={isCreateQuestModalOpen}
        onClose={() => setIsCreateQuestModalOpen(false)}
        onSubmit={handleCreateQuest}
        team={team}
      />

      {selectedQuest && currentUser && (
        <QuestDetailsModal
          isOpen={!!selectedQuest}
          onClose={() => setSelectedQuest(null)}
          currentUserId={currentUser.id}
          quest={{
            id: selectedQuest.id,
            title: selectedQuest.title,
            description: selectedQuest.description,
            skills: Object.entries(selectedQuest.skills ?? {}).map(([skill, xp]) => ({
              name: skill,
              xp: xp
            })),
            assignedTo: selectedQuest.assignedTo ? {
              id: selectedQuest.assignedTo.id,
              displayName: selectedQuest.assignedTo.displayName,
              avatarId: selectedQuest.assignedTo.avatarId
            } : undefined
          }}
          onTurnIn={async () => {
            // Refresh quests after turn in
            const updatedQuests = await getQuests('created');
            setQuests(updatedQuests);
          }}
          onAssignToSelf={async () => {
            // Refresh quests after assignment
            const updatedQuests = await getQuests('created');
            setQuests(updatedQuests);
          }}
        />
      )}

      {selectedSkill && (
        <SkillAssessmentModal
          skillName={selectedSkill}
          onSubmit={handleAssessmentSubmit}
          onClose={() => setSelectedSkill(null)}
        />
      )}

      {viewingSkillLevel && currentUser && (
        <SkillLevelModal
          skillName={viewingSkillLevel}
          xp={currentUser.skills?.[viewingSkillLevel] || 0}
          onClose={() => setViewingSkillLevel(null)}
        />
      )}
    </div>
  );
} 