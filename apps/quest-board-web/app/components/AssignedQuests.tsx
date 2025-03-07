'use client';

import { useEffect, useState } from 'react';
import { getQuests, getCurrentUser, turnInQuest, assignQuestToSelf } from '../lib/api';
import { QuestResponse, QuestStatus, User } from '@quest-board/types';
import { Avatar } from '../../components/Avatar';
import { QuestDetailsModal } from '@repo/ui/quest-details-modal';
import { Toast } from './Toast';
import styles from './Dashboard.module.css';
import { checkLevelUp } from '../utils/checkLevelUp';

export default function AssignedQuests() {
  const [quests, setQuests] = useState<QuestResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<QuestResponse | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questsData, userData] = await Promise.all([
          getQuests('assigned'),
          getCurrentUser()
        ]);
        setQuests(questsData);
        setCurrentUser(userData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load quests');
      }
    };

    fetchData();
  }, []);

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

  const handleTurnInQuest = async () => {
    if (selectedQuest) {
      const response = await turnInQuest(selectedQuest.id);
      
      // Check for level ups in skill changes
      if (response.skillChanges) {
        const leveledUpSkills: string[] = [];
        const xpGains: string[] = [];

        Object.entries(response.skillChanges).forEach(([skill, changes]) => {
          const leveledUp = checkLevelUp(changes.before, changes.after);
          if (leveledUp) {
            leveledUpSkills.push(skill);
          }
          xpGains.push(`${changes.gained} ${skill}`);
        });

        // If any skills leveled up, log them
        if (leveledUpSkills.length > 0) {
          console.debug('Leveled up skills:', leveledUpSkills);
          console.debug('Skills that did not level up:', 
            Object.keys(response.skillChanges).filter(skill => !leveledUpSkills.includes(skill))
          );
        } else {
          // Only show toast if no skills leveled up
          setToastMessage(`Gained ${xpGains.join(' XP and ')} XP`);
        }
      }

      // Refresh quests after turn in
      const updatedQuests = await getQuests('assigned');
      setQuests(updatedQuests);
    }
  };

  const handleAssignQuestToSelf = async () => {
    if (selectedQuest) {
      await assignQuestToSelf(selectedQuest.id);
      // Refresh quests after assignment
      const updatedQuests = await getQuests('assigned');
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
            {quest.assignedTo && (
              <div className={styles.assignedTo}>
                <Avatar avatarId={quest.assignedTo.avatarId} size={24} />
                <span>{quest.assignedTo.displayName}</span>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className={styles.emptyState}>No quests assigned to you</div>
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
    </>
  );
} 