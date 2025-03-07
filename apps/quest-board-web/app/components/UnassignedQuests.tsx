'use client';

import { useEffect, useState } from 'react';
import { getQuests, getCurrentUser, turnInQuest, assignQuestToSelf } from '../lib/api';
import { QuestResponse, QuestStatus, User } from '@quest-board/types';
import { QuestDetailsModal } from '@repo/ui/quest-details-modal';
import styles from './Dashboard.module.css';

export default function UnassignedQuests() {
  const [quests, setQuests] = useState<QuestResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<QuestResponse | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questsData, userData] = await Promise.all([
          getQuests('available'),
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
      await turnInQuest(selectedQuest.id);
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
    </>
  );
} 