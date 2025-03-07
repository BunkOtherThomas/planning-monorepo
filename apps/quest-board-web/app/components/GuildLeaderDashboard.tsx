'use client';

import { useEffect, useState } from 'react';
import { getCurrentTeam, addTeamSkill, getQuests, createQuest, getCurrentUser, declareSkill, turnInQuest, assignQuestToSelf } from '../lib/api';
import { Avatar } from '../../components/Avatar';
import styles from './Dashboard.module.css';
import { QuestResponse, QuestStatus, User, SkillAssessment, Team as TeamType } from '@quest-board/types';
import { CreateQuestModal } from './CreateQuestModal';
import { QuestDetailsModal } from '@repo/ui/quest-details-modal';
import TeamSkills from './TeamSkills';
import { SkillAssessmentModal } from './SkillAssessmentModal';
import { SkillLevelModal } from './SkillLevelModal';
import { ScrollableSection } from './ScrollableSection';
import { SkillsModal } from './SkillsModal';
import { Toast } from './Toast';
import { LevelUpModal } from './LevelUpModal';
import { checkLevelUp } from '../utils/checkLevelUp';
import { SkillsSection } from './SkillsSection';

interface SkillAssessmentValues {
  professionalExperience: number;
  formalEducation: number;
  informalExperience: number;
  confidence: number;
}

export default function GuildLeaderDashboard() {
  const [team, setTeam] = useState<TeamType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [quests, setQuests] = useState<QuestResponse[]>([]);
  const [isCreateQuestModalOpen, setIsCreateQuestModalOpen] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<QuestResponse | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [viewingSkillLevel, setViewingSkillLevel] = useState<string | null>(null);
  const [skillAssessments, setSkillAssessments] = useState<SkillAssessment[]>([]);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [favoriteSkills, setFavoriteSkills] = useState<string[]>([]);
  const [skills, setSkills] = useState<Record<string, number>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [levelUpData, setLevelUpData] = useState<{
    leveledUpSkills: Array<{ skill: string; before: number; after: number }>;
    otherSkills: Array<{ skill: string; gained: number }>;
  } | null>(null);

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
          setSkills(userData.skills || {});
          setFavoriteSkills(userData.favoriteSkills || []);
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

  const handleTagSkill = (skill: string) => {
    setFavoriteSkills(prev => {
      if (prev.includes(skill)) {
        return prev.filter(s => s !== skill);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, skill];
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <ScrollableSection title="Team">
          {error ? (
            <div className={styles.error}>{error}</div>
          ) : team ? (
            <div className={styles.teamInfo}>
              <div className={styles.teamMembers}>
                {team.members.map((member) => (
                  <div key={member.id} className={styles.quest} style={{ maxHeight: '60px' }}>
                    <div className={styles.applicantInfo}>
                      <Avatar avatarId={member.avatarId} size={32} />
                      <span className={styles.memberName}>{member.displayName}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.teamCode}>
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
        </ScrollableSection>

        <SkillsSection
          team={team}
          user={currentUser}
          error={error}
          favoriteSkills={favoriteSkills}
          isGuildLeader={true}
          onSkillClick={handleSkillClick}
          onDeclineSkill={handleDeclineSkill}
          onTagSkill={handleTagSkill}
        />

        <ScrollableSection
          title="Quests"
          footer={
            <button
              className={styles.addButton}
              onClick={() => setIsCreateQuestModalOpen(true)}
            >
              Create New Quest
            </button>
          }
        >
          <div className={styles.questList}>
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
          </div>
        </ScrollableSection>
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
            if (selectedQuest) {
              const response = await turnInQuest(selectedQuest.id);
              
              // Check for level ups in skill changes
              if (response.skillChanges) {
                const leveledUpSkills: Array<{ skill: string; before: number; after: number }> = [];
                const otherSkills: Array<{ skill: string; gained: number }> = [];

                Object.entries(response.skillChanges).forEach(([skill, changes]) => {
                  const leveledUp = checkLevelUp(changes.before, changes.after);
                  if (leveledUp) {
                    leveledUpSkills.push({
                      skill,
                      before: changes.before,
                      after: changes.after
                    });
                  } else {
                    otherSkills.push({
                      skill,
                      gained: changes.gained
                    });
                  }
                });

                // If any skills leveled up, show the modal
                if (leveledUpSkills.length > 0) {
                  setLevelUpData({ leveledUpSkills, otherSkills });
                } else {
                  // Only show toast if no skills leveled up
                  setToastMessage(`Gained ${otherSkills.map(s => `${s.gained} ${s.skill}`).join(' XP and ')} XP`);
                }
              }

              // Refresh quests after turn in
              const updatedQuests = await getQuests('created');
              setQuests(updatedQuests);
            }
          }}
          onAssignToSelf={async () => {
            if (selectedQuest) {
              await assignQuestToSelf(selectedQuest.id);
              // Refresh quests after assignment
              const updatedQuests = await getQuests('created');
              setQuests(updatedQuests);
            }
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

      {currentUser && (
        <SkillsModal
          isOpen={isSkillsModalOpen}
          onClose={() => setIsSkillsModalOpen(false)}
          user={currentUser}
          teamSkills={team?.skills || []}
          onSkillClick={handleSkillClick}
          onDeclineSkill={handleDeclineSkill}
          onTagSkill={handleTagSkill}
          onUntagSkill={handleTagSkill}
          taggedSkills={favoriteSkills}
        />
      )}

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      {levelUpData && (
        <LevelUpModal
          isOpen={!!levelUpData}
          onClose={() => setLevelUpData(null)}
          avatarId={currentUser?.avatarId || 0}
          leveledUpSkills={levelUpData.leveledUpSkills}
          otherSkills={levelUpData.otherSkills}
        />
      )}
    </div>
  );
} 