'use client';

import { useEffect, useState, useMemo } from 'react';
import { getCurrentTeam, getSkills, declareSkill } from '../lib/api';
import styles from './Dashboard.module.css';
import { SkillAssessmentModal } from './SkillAssessmentModal';
import { SkillLevelModal } from './SkillLevelModal';
import { Team, UserSkills, SkillAssessment, User } from '@quest-board/types';
import { FC } from 'react';
import { getLevel } from '@planning/common-utils';
import AssignedQuests from './AssignedQuests';
import UnassignedQuests from './UnassignedQuests';
import TeamSkills from './TeamSkills';
import { ScrollableSection } from './ScrollableSection';
import { SkillsModal } from './SkillsModal';

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
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [favoriteSkills, setFavoriteSkills] = useState<string[]>(user.favoriteSkills || []);

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
        values.confidence
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

  const handleTagSkill = (skill: string) => {
    setFavoriteSkills(prev => {
      if (prev.includes(skill)) {
        return prev.filter(s => s !== skill);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, skill];
    });
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
        <ScrollableSection 
          title="Skills"
          footer={
            <button
              className={`${styles.manageSkillsButton} ${favoriteSkills.length < 3 ? styles.manageSkillsButtonHighlight : ''}`}
              onClick={() => setIsSkillsModalOpen(true)}
            >
              {favoriteSkills.length < 3 ? '✨ Manage Skills ✨' : 'Manage Skills'}
            </button>
          }
        >
          <TeamSkills
            team={team}
            user={user}
            error={error}
            onSkillClick={handleSkillClick}
            onDeclineSkill={handleDeclineSkill}
          />
        </ScrollableSection>

        <ScrollableSection title="My Quests">
          <AssignedQuests />
        </ScrollableSection>

        <ScrollableSection title="Available Quests">
          <UnassignedQuests />
        </ScrollableSection>

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

        <SkillsModal
          isOpen={isSkillsModalOpen}
          onClose={() => setIsSkillsModalOpen(false)}
          user={user}
          teamSkills={team?.skills || []}
          onSkillClick={handleSkillClick}
          onDeclineSkill={handleDeclineSkill}
          onTagSkill={handleTagSkill}
          onUntagSkill={handleTagSkill}
          taggedSkills={favoriteSkills}
        />
      </div>
    </div>
  );
};

export default AdventurerDashboard; 