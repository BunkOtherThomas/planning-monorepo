'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getQuests, getSkills } from '../../lib/api';
import styles from './adventurer.module.css';

interface Skill {
  id: string;
  name: string;
  level: number;
  isTagged: boolean;
  professionalExp: number;
  formalEducation: number;
  informalEducation: number;
  confidenceMultiplier: number;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  deadline?: string;
  complexity: number;
  skills: Array<{
    skillId: string;
    name: string;
    weight: number;
  }>;
}

export default function AdventurerDashboard() {
  const [myQuests, setMyQuests] = useState<Quest[]>([]);
  const [availableQuests, setAvailableQuests] = useState<Quest[]>([]);
  const [mySkills, setMySkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [assigned, available, skills] = await Promise.all([
          getQuests('assigned'),
          getQuests('available'),
          getSkills(false), // false to only get user's skills
        ]);

        // Sort assigned quests by complexity and deadline
        const sortedAssigned = assigned.sort((a: Quest, b: Quest) => {
          if (a.deadline && b.deadline) {
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          }
          return b.complexity - a.complexity;
        });

        // Filter and sort available quests by tagged skills
        const taggedSkillIds = skills
          .filter((skill: Skill) => skill.isTagged)
          .map((skill: Skill) => skill.id);

        const sortedAvailable = available.sort((a: Quest, b: Quest) => {
          const aTaggedSkills = a.skills.filter(s => taggedSkillIds.includes(s.skillId)).length;
          const bTaggedSkills = b.skills.filter(s => taggedSkillIds.includes(s.skillId)).length;
          return bTaggedSkills - aTaggedSkills;
        });

        setMyQuests(sortedAssigned);
        setAvailableQuests(sortedAvailable);
        setMySkills(skills);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return <div>Loading your quest log...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.actions}>
        <Link href="/skills" className={styles.skillsButton}>
          View My Skills
        </Link>
      </div>

      <div className={styles.questBoards}>
        <section className={styles.questBoard}>
          <h2>My Active Quests</h2>
          {myQuests.length === 0 ? (
            <p>No active quests</p>
          ) : (
            <div className={styles.questList}>
              {myQuests.map((quest) => (
                <Link 
                  href={`/quests/${quest.id}`} 
                  key={quest.id}
                  className={styles.questCard}
                >
                  <div className={styles.questHeader}>
                    <h3>{quest.title}</h3>
                    {quest.deadline && (
                      <span className={styles.deadline}>
                        Due: {new Date(quest.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p>{quest.description}</p>
                  <div className={styles.complexity}>
                    Complexity: {quest.complexity}
                  </div>
                  <div className={styles.skills}>
                    {quest.skills.map((skill) => {
                      const isTagged = mySkills.some(s => 
                        s.id === skill.skillId && s.isTagged
                      );
                      return (
                        <span 
                          key={skill.skillId} 
                          className={`${styles.skill} ${isTagged ? styles.tagged : ''}`}
                        >
                          {skill.name} ({skill.weight}%)
                        </span>
                      );
                    })}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className={styles.questBoard}>
          <h2>Available Quests</h2>
          <p className={styles.subtitle}>Prioritized by your tagged skills</p>
          {availableQuests.length === 0 ? (
            <p>No available quests match your skills</p>
          ) : (
            <div className={styles.questList}>
              {availableQuests.map((quest) => (
                <Link 
                  href={`/quests/${quest.id}`} 
                  key={quest.id}
                  className={styles.questCard}
                >
                  <div className={styles.questHeader}>
                    <h3>{quest.title}</h3>
                    {quest.deadline && (
                      <span className={styles.deadline}>
                        Due: {new Date(quest.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p>{quest.description}</p>
                  <div className={styles.complexity}>
                    Complexity: {quest.complexity}
                  </div>
                  <div className={styles.skills}>
                    {quest.skills.map((skill) => {
                      const isTagged = mySkills.some(s => 
                        s.id === skill.skillId && s.isTagged
                      );
                      return (
                        <span 
                          key={skill.skillId} 
                          className={`${styles.skill} ${isTagged ? styles.tagged : ''}`}
                        >
                          {skill.name} ({skill.weight}%)
                          {isTagged && <span className={styles.tagIcon}>★</span>}
                        </span>
                      );
                    })}
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