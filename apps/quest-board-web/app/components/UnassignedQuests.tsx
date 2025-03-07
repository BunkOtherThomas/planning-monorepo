'use client';

import { useEffect, useState } from 'react';
import { getQuests, getCurrentUser, turnInQuest, assignQuestToSelf, getCurrentTeam } from '../lib/api';
import { QuestResponse, QuestStatus, User, Team } from '@quest-board/types';
import { QuestDetailsModal } from '@repo/ui/quest-details-modal';
import { Toast } from './Toast';
import { LevelUpModal } from './LevelUpModal';
import styles from './Dashboard.module.css';
import { checkLevelUp } from '../utils/checkLevelUp';

export default function UnassignedQuests() {
  const [quests, setQuests] = useState<QuestResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<QuestResponse | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [levelUpData, setLevelUpData] = useState<{
    leveledUpSkills: Array<{ skill: string; before: number; after: number }>;
    otherSkills: Array<{ skill: string; gained: number }>;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questsData, userData, teamData] = await Promise.all([
          getQuests('available'),
          getCurrentUser(),
          getCurrentTeam()
        ]);
        setQuests(questsData);
        setCurrentUser(userData);
        setTeam(teamData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load quests');
      }
    };

    fetchData();
  }, []);

  const sortedQuests = [...quests]
    .filter(quest => team?.members.some(member => member.id === quest.createdBy))
    .sort((a, b) => {
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

  const handleTurnInQuest = async () => {
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
      const updatedQuests = await getQuests('available');
      setQuests(updatedQuests);
    }
  };

  const handleAssignQuestToSelf = async () => {
    if (selectedQuest) {
      await assignQuestToSelf(selectedQuest.id);
      // Refresh quests after assignment
      const updatedQuests = await getQuests('available');
      setQuests(updatedQuests);
    }
  };

  return (
    <>
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
          </div>
        ))
      ) : (
        <div className={styles.emptyState}>No available quests</div>
      )}

      {selectedQuest && currentUser && (
        <QuestDetailsModal
          isOpen={!!selectedQuest}
          onClose={() => setSelectedQuest(null)}
          currentUserId={currentUser.id}
          onTurnIn={handleTurnInQuest}
          onAssignToSelf={handleAssignQuestToSelf}
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
    </>
  );
} 