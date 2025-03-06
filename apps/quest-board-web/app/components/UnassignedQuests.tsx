'use client';

import { useEffect, useState } from 'react';
import { getQuests, getCurrentUser } from '../lib/api';
import styles from './Dashboard.module.css';
import { QuestResponse, User } from '@quest-board/types';
import { QuestDetailsModal } from '@repo/ui/quest-details-modal';

export default function UnassignedQuests() {
  const [quests, setQuests] = useState<QuestResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<QuestResponse | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [questsData, userData] = await Promise.all([
          getQuests('available'),
          getCurrentUser()
        ]);
        
        if (isMounted) {
          // Filter quests to only show those with no assignee
          const unassignedQuests = questsData.filter((quest: QuestResponse) => !quest.assignedTo);
          setQuests(unassignedQuests);
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

  const sortedQuests = [...quests].sort((a, b) => {
    // Sort by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Available Quests</h3>
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
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>No available quests</div>
        )}
      </div>

      {selectedQuest && currentUser && (
        <QuestDetailsModal
          isOpen={!!selectedQuest}
          onClose={() => setSelectedQuest(null)}
          currentUserId={currentUser.id}
          quest={{
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
    </div>
  );
} 