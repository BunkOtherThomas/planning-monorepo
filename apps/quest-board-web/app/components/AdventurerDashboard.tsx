'use client';

import { useEffect, useState, useMemo } from 'react';
import { getCurrentTeam, getSkills, declareSkill } from '../lib/api';
import styles from './Dashboard.module.css';
import { SkillAssessmentModal } from './SkillAssessmentModal';
import { SkillLevelModal } from './SkillLevelModal';
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
  informalExperience: number;
  confidence: number;
}

interface AdventurerDashboardProps {
  user: User;
  onSkillUpdate?: (skill: string, xp: number) => void;
}

const AdventurerDashboard: FC<AdventurerDashboardProps> = ({ user, onSkillUpdate }) => {
  const [team, setTeam] = useState<Team | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [skillAssessments, setSkillAssessments] = useState<SkillAssessment[]>([]);
  const [viewingSkillLevel, setViewingSkillLevel] = useState<string | null>(null);

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
    const isNewSkill = user.skills?.[skill] === -1;
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
        user.id
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

      // Update the parent component with the new skill XP
      onSkillUpdate?.(skill, response.xp);
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
        values.confidence,
        user.id
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

      // Update the parent component with the new skill XP
      onSkillUpdate?.(selectedSkill, response.xp);
      
      setSelectedSkill(null);
    } catch (error) {
      console.error('Error submitting skill assessment:', error);
      // You might want to show an error message to the user here
    }
  };

  const sortedSkills = useMemo(() => {
    if (!team?.skills) return [];
    
    // Split skills into new and existing
    const newSkills = team.skills.filter(skill => user.skills?.[skill] === -1);
    const existingSkills = team.skills.filter(skill => user.skills?.[skill] !== -1);
    
    // Sort existing skills by XP
    const sortedExistingSkills = existingSkills.sort((a, b) => {
      const aXP = user.skills?.[a] || 0;
      const bXP = user.skills?.[b] || 0;
      return bXP - aXP;
    });
    
    // Combine new skills at the top with sorted existing skills
    return [...newSkills, ...sortedExistingSkills];
  }, [team?.skills, user.skills]);

  const getSkillName = (skillId: string) => {
    return skills.find(s => s.id === skillId)?.name || skillId;
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Skills</h3>
          {error ? (
            <div className={styles.error}>{error}</div>
          ) : team ? (
            <div className={styles.skillsList}>
              {sortedSkills.map((skill) => {
                const isNewSkill = user.skills?.[skill] === -1;
                
                return (
                  <div
                    key={skill}
                    className={`${styles.skillTag} relative flex justify-between items-center cursor-pointer ${
                      user.skills?.[skill] === 0 ? 'opacity-10' : ''
                    }`}
                    onClick={() => !isNewSkill && handleSkillClick(skill)}
                  >
                    <div className="flex items-center font-lora text-text-light">
                      {getSkillName(skill)}
                    </div>
                    {isNewSkill ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeclineSkill(skill)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                          aria-label="Decline skill"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleSkillClick(skill)}
                          className="text-green-500 hover:text-green-600 transition-colors"
                          aria-label="Assess skill"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <span className="ml-2 font-lora text-text-light">Lv. {getLevel(user.skills?.[skill] || 0).level}</span>
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

        {viewingSkillLevel && (
          <SkillLevelModal
            skillName={viewingSkillLevel}
            xp={user.skills?.[viewingSkillLevel] || 0}
            onClose={() => setViewingSkillLevel(null)}
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
};

export default AdventurerDashboard; 