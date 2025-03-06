'use client';

import { useEffect, useState } from 'react';
import { getQuests } from '../lib/api';
import { Avatar } from '../../components/Avatar';
import styles from './Dashboard.module.css';
import { QuestResponse, QuestStatus } from '@quest-board/types';
import { QuestDetailsModal } from '@repo/ui/quest-details-modal';

export default function AssignedQuests() {
  const [quests, setQuests] = useState<QuestResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<QuestResponse | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const questsData = await getQuests('assigned');
        
        if (isMounted) {
          setQuests(questsData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch quests');
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
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

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>My Quests</h3>
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
          <div className={styles.emptyState}>No quests assigned to you</div>
        )}
      </div>

      {selectedQuest && (
        <QuestDetailsModal
          isOpen={!!selectedQuest}
          onClose={() => setSelectedQuest(null)}
          quest={{
            title: selectedQuest.title,
            description: selectedQuest.description,
            skills: Object.entries(selectedQuest.skills ?? {}).map(([skill, xp]) => ({
              name: skill,
              xp: xp
            })),
            assignedTo: selectedQuest.assignedTo ? {
              displayName: selectedQuest.assignedTo.displayName,
              avatarId: selectedQuest.assignedTo.avatarId
            } : undefined
          }}
        />
      )}
    </div>
  );
} 