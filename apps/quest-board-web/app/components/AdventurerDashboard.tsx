'use client';

import { useEffect, useState } from 'react';
import { getCurrentTeam } from '../lib/api';
import styles from './Dashboard.module.css';
import { SkillAssessmentModal } from './SkillAssessmentModal';

interface Team {
  id: string;
  inviteCode: string;
  members: {
    id: string;
    displayName: string;
    avatarId: number;
  }[];
  skills: string[];
}

interface SkillAssessment {
  skill: string;
  professionalExperience: number;
  formalEducation: number;
  informalEducation: number;
  confidence: number;
}

export default function AdventurerDashboard() {
  const [team, setTeam] = useState<Team | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [skillAssessments, setSkillAssessments] = useState<SkillAssessment[]>([]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const teamData = await getCurrentTeam();
        setTeam(teamData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch team');
      }
    };

    fetchTeam();
  }, []);

  const handleSkillClick = (skill: string) => {
    setSelectedSkill(skill);
  };

  const handleAssessmentSubmit = (values: Omit<SkillAssessment, 'skill'>) => {
    if (!selectedSkill) return;
    
    setSkillAssessments(prev => {
      const existingIndex = prev.findIndex(a => a.skill === selectedSkill);
      if (existingIndex >= 0) {
        const newAssessments = [...prev];
        newAssessments[existingIndex] = { ...values, skill: selectedSkill };
        return newAssessments;
      }
      return [...prev, { ...values, skill: selectedSkill }];
    });
    setSelectedSkill(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Team Skills</h3>
          {error ? (
            <div className={styles.error}>{error}</div>
          ) : team ? (
            <div className={styles.skillsList}>
              {team.skills.map((skill) => (
                <div
                  key={skill}
                  className={`${styles.skillTag} cursor-pointer hover:bg-blue-100 transition-colors`}
                  onClick={() => handleSkillClick(skill)}
                >
                  {skill}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.loading}>Loading team skills...</div>
          )}
        </section>

        {selectedSkill && (
          <SkillAssessmentModal
            skillName={selectedSkill}
            onSubmit={handleAssessmentSubmit}
            onClose={() => setSelectedSkill(null)}
          />
        )}

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Available Quests</h3>
          <div className={styles.questList}>
            <div className={styles.quest}>
              <h4 className={styles.questTitle}>The Lost Scroll</h4>
              <p className={styles.questDescription}>
                A mysterious scroll has gone missing from the library. Find it and return it safely.
              </p>
              <div className={styles.questMeta}>
                <span>Difficulty: Easy</span>
                <span className={styles.questReward}>
                  <span className={styles.statIcon}>💰</span>
                  50 Gold
                </span>
              </div>
            </div>
            <div className={styles.quest}>
              <h4 className={styles.questTitle}>Dragon's Den Cleanup</h4>
              <p className={styles.questDescription}>
                Clear out the pesky creatures that have taken residence in the old dragon's den.
              </p>
              <div className={styles.questMeta}>
                <span>Difficulty: Medium</span>
                <span className={styles.questReward}>
                  <span className={styles.statIcon}>💰</span>
                  100 Gold
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Your Active Quests</h3>
          <div className={styles.questList}>
            <div className={styles.emptyState}>
              No active quests. Time to embark on a new adventure!
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 