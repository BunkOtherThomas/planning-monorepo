'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getQuests } from '../../lib/api';
import { QuestStatus } from '@quest-board/types';
import styles from './guild-leader.module.css';

interface Quest {
  id: string;
  title: string;
  description: string;
  status: QuestStatus;
  skills: Array<{
    skillId: string;
    name: string;
    weight: number;
  }>;
  assignee?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
}

export default function GuildLeaderDashboard() {
  const [unassignedQuests, setUnassignedQuests] = useState<Quest[]>([]);
  const [assignedQuests, setAssignedQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchQuests() {
      try {
        const [unassigned, assigned] = await Promise.all([
          getQuests('created', QuestStatus.OPEN),
          getQuests('created', QuestStatus.IN_PROGRESS),
        ]);
        setUnassignedQuests(unassigned);
        setAssignedQuests(assigned);
      } catch (error) {
        console.error('Failed to fetch quests:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuests();
  }, []);

  if (isLoading) {
    return <div>Loading your quest boards...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.actions}>
        <Link href="/quests/new" className={styles.newQuestButton}>
          Post New Quest
        </Link>
        <Link href="/team" className={styles.teamButton}>
          View Team
        </Link>
      </div>

      <div className={styles.questBoards}>
        <section className={styles.questBoard}>
          <h2>Unassigned Quests</h2>
          {unassignedQuests.length === 0 ? (
            <p>No unassigned quests available</p>
          ) : (
            <div className={styles.questList}>
              {unassignedQuests.map((quest) => (
                <Link 
                  href={`/quests/${quest.id}`} 
                  key={quest.id}
                  className={styles.questCard}
                >
                  <h3>{quest.title}</h3>
                  <p>{quest.description}</p>
                  <div className={styles.skills}>
                    {quest.skills.map((skill) => (
                      <span key={skill.skillId} className={styles.skill}>
                        {skill.name} ({skill.weight}%)
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className={styles.questBoard}>
          <h2>Assigned Quests</h2>
          {assignedQuests.length === 0 ? (
            <p>No assigned quests</p>
          ) : (
            <div className={styles.questList}>
              {assignedQuests.map((quest) => (
                <Link 
                  href={`/quests/${quest.id}`} 
                  key={quest.id}
                  className={styles.questCard}
                >
                  <h3>{quest.title}</h3>
                  <p>{quest.description}</p>
                  <div className={styles.assignee}>
                    {quest.assignee?.avatarUrl ? (
                      <img 
                        src={quest.assignee.avatarUrl} 
                        alt={quest.assignee.displayName} 
                        className={styles.assigneeAvatar}
                      />
                    ) : (
                      <div className={styles.assigneePlaceholder}>
                        {quest.assignee?.displayName[0]}
                      </div>
                    )}
                    <span>{quest.assignee?.displayName}</span>
                  </div>
                  <div className={styles.skills}>
                    {quest.skills.map((skill) => (
                      <span key={skill.skillId} className={styles.skill}>
                        {skill.name} ({skill.weight}%)
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
} 