'use client';

import { useEffect, useState, useMemo } from 'react';
import { getCurrentTeam, getSkills } from '../lib/api';
import styles from './Dashboard.module.css';
import { SkillAssessmentModal } from './SkillAssessmentModal';
import { Team, UserSkills, SkillAssessment, User } from '@quest-board/types';
import { FC } from 'react';
import { getLevel } from '@planning/common-utils';

interface Skill {
  id: string;
  name: string;
  description: string;
  isGlobal: boolean;
}

interface SkillAssessmentValues {
  professionalExperience: number;
  formalEducation: number;
  informalEducation: number;
  confidence: number;
}

interface AdventurerDashboardProps {
  user: User;
}

const AdventurerDashboard: FC<AdventurerDashboardProps> = ({ user }) => {
  const [team, setTeam] = useState<Team | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [skillAssessments, setSkillAssessments] = useState<SkillAssessment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamData, skillsData] = await Promise.all([
          getCurrentTeam(),
          getSkills(true)
        ]);

        setTeam(teamData);
        setSkills(skillsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSkillClick = (skill: string) => {
    setSelectedSkill(skill);
  };

  const handleAssessmentSubmit = (values: SkillAssessmentValues) => {
    if (!selectedSkill) return;
    
    // Calculate XP based on the form values
    const xp = Math.round(
      (values.professionalExperience * 0.4 +
       values.formalEducation * 0.3 +
       values.informalEducation * 0.2 +
       values.confidence * 0.1) * 100
    );
    
    setSkillAssessments(prev => {
      const existingIndex = prev.findIndex(a => a.skill === selectedSkill);
      if (existingIndex >= 0) {
        const newAssessments = [...prev];
        newAssessments[existingIndex] = { skill: selectedSkill, xp };
        return newAssessments;
      }
      return [...prev, { skill: selectedSkill, xp }];
    });
    setSelectedSkill(null);
  };

  const sortedSkills = useMemo(() => {
    if (!team?.skills) return [];
    
    return [...team.skills].sort((a, b) => {
      const aXP = user.skills?.[a] || 0;
      const bXP = user.skills?.[b] || 0;
      
      return bXP - aXP;
    });
  }, [team?.skills, user.skills]);

  const getSkillName = (skillId: string) => {
    return skills.find(s => s.id === skillId)?.name || skillId;
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
              {sortedSkills.map((skill) => {
                const isNewSkill = user.skills?.[skill] === -1;
                
                return (
                  <div
                    key={skill}
                    className={`${styles.skillTag} cursor-pointer hover:bg-blue-100 transition-colors relative flex justify-between items-center`}
                    onClick={() => handleSkillClick(skill)}
                  >
                    <div className="flex items-center">
                      {skill}
                    </div>
                    {isNewSkill ? (
                      <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        NEW
                      </span>
                    ) : (
                      <span className="ml-2">Lv. {getLevel(user.skills?.[skill] || 0).level}</span>
                    )}
                  </div>
                );
              })}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedSkills.map((skillId) => {
            const xp = user.skills?.[skillId] ?? 0;
            const { level, xp: currentXP, remaining } = getLevel(xp);
            return (
              <div
                key={skillId}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {getSkillName(skillId)}
                </h3>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>Level</span>
                    <span>{level || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>XP</span>
                    <span>{currentXP || 0}</span>
                  </div>
                  {remaining > 0 && (
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>Next Level</span>
                      <span>{remaining || 0} XP</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdventurerDashboard; 