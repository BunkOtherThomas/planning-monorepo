import { FC, useState } from 'react';
import { Team as TeamType, User, SkillAssessment } from '@quest-board/types';
import { ScrollableSection } from './ScrollableSection';
import TeamSkills from './TeamSkills';
import { SkillAssessmentModal } from './SkillAssessmentModal';
import { SkillLevelModal } from './SkillLevelModal';
import { SkillsModal } from './SkillsModal';
import styles from './Dashboard.module.css';

interface SkillsSectionProps {
  team: TeamType | null;
  user: User | null;
  error: string | null;
  favoriteSkills: string[];
  isGuildLeader?: boolean;
  onSkillClick: (skill: string) => void;
  onDeclineSkill: (skill: string) => void;
  onTagSkill: (skill: string) => void;
}

interface SkillAssessmentValues {
  professionalExperience: number;
  formalEducation: number;
  informalExperience: number;
  confidence: number;
}

export const SkillsSection: FC<SkillsSectionProps> = ({
  team,
  user,
  error,
  favoriteSkills,
  isGuildLeader = false,
  onSkillClick,
  onDeclineSkill,
  onTagSkill,
}) => {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [viewingSkillLevel, setViewingSkillLevel] = useState<string | null>(null);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [skillAssessments, setSkillAssessments] = useState<SkillAssessment[]>([]);

  const handleSkillClick = (skill: string) => {
    if (!user) return;
    const isNewSkill = user.skills?.[skill] === -1;
    if (isNewSkill) {
      setSelectedSkill(skill);
    } else {
      setViewingSkillLevel(skill);
    }
  };

  const handleAssessmentSubmit = async (values: SkillAssessmentValues) => {
    if (!selectedSkill) return;
    setSelectedSkill(null);
  };

  return (
    <ScrollableSection 
      title="Skills"
      footer={
        <button
          className={`${styles.manageSkillsButton} ${favoriteSkills.length < Math.min(3, team?.skills?.length || 0) ? styles.manageSkillsButtonHighlight : ''}`}
          onClick={() => setIsSkillsModalOpen(true)}
        >
          {favoriteSkills.length < Math.min(3, team?.skills?.length || 0) ? '✨ Manage Skills ✨' : 'Manage Skills'}
        </button>
      }
    >
      <TeamSkills
        team={team}
        user={user}
        error={error}
        onSkillClick={handleSkillClick}
        onDeclineSkill={onDeclineSkill}
        isGuildLeader={isGuildLeader}
      />

      {selectedSkill && (
        <SkillAssessmentModal
          skillName={selectedSkill}
          onSubmit={handleAssessmentSubmit}
          onClose={() => setSelectedSkill(null)}
        />
      )}

      {viewingSkillLevel && user && (
        <SkillLevelModal
          skillName={viewingSkillLevel}
          xp={user.skills?.[viewingSkillLevel] || 0}
          onClose={() => setViewingSkillLevel(null)}
        />
      )}

      {user && (
        <SkillsModal
          isOpen={isSkillsModalOpen}
          onClose={() => setIsSkillsModalOpen(false)}
          user={user}
          teamSkills={team?.skills || []}
          onSkillClick={handleSkillClick}
          onDeclineSkill={onDeclineSkill}
          onTagSkill={onTagSkill}
          onUntagSkill={onTagSkill}
          taggedSkills={favoriteSkills}
        />
      )}
    </ScrollableSection>
  );
}; 