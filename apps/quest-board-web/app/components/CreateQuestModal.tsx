import { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import { getCurrentTeam, addTeamSkill, analyzeSkills, SkillProficiency } from '../lib/api';
import { sortCandidatesBySkills } from '../utils/sortCandidates';
import { Avatar } from '../../components/Avatar';
import { Button } from '@repo/ui/button';
import { Team } from '@quest-board/types';
import { getLevel } from '@planning/common-utils';

interface CreateQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description?: string, selectedSkills?: SkillProficiency[], assigneeId?: string) => void;
  team: Team | null;
}

type TeamMember = Team['members'][0];

export function CreateQuestModal({ isOpen, onClose, onSubmit, team }: CreateQuestModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<SkillProficiency[]>([]);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [skillError, setSkillError] = useState<string | null>(null);
  const [showSkills, setShowSkills] = useState(false);
  const [suggestedAssignees, setSuggestedAssignees] = useState<TeamMember[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [showAllMembers, setShowAllMembers] = useState(false);

  useEffect(() => {
    if (!team) return;

    const analyzeTeamMembers = async () => {
      try {
        if (selectedSkills.length === 0) {
          setSuggestedAssignees(team.members);
          return;
        }

        // Convert selected skills to a Record<string, number>
        const skillRequirements = selectedSkills.reduce((acc, skill) => {
          acc[skill.skill] = skill.proficiency;
          return acc;
        }, {} as Record<string, number>);

        // Sort team members based on skill requirements
        const sortedMembers = team.members.sort((a, b) => {
          // Since we don't have access to member skills in the team view,
          // we'll just return them in their original order
          return 0;
        });

        setSuggestedAssignees(sortedMembers);
      } catch (error) {
        console.error('Error analyzing team members:', error);
        setSuggestedAssignees(team.members);
      }
    };

    analyzeTeamMembers();
  }, [selectedSkills, team]);

  useEffect(() => {
    if (!isOpen) {
      setShowSkills(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      return;
    }
    onSubmit(title, description, selectedSkills, selectedAssignee || undefined);
  };

  const handleGenerateSkills = async () => {
    if (!title.trim()) return;
    
    setIsLoading(true);
    setError(null);

    try {
      if (!team) {
        throw new Error('Team data is required to generate skills');
      }

      const data = await analyzeSkills(title, description, team.skills);
      setSelectedSkills(data.skillProficiencies.filter(s => s.proficiency > 0));
      setShowSkills(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate skills');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) {
      setSkillError('Skill name cannot be empty');
      return;
    }

    if (!team) {
      setSkillError('Team data is required to add skills');
      return;
    }

    if (team.skills.some(s => s.toLowerCase() === newSkill.toLowerCase())) {
      setSkillError('This skill already exists in your team');
      return;
    }

    try {
      await addTeamSkill(newSkill.trim());
      // Refresh team data to get the updated skills list
      const updatedTeam = await getCurrentTeam();
      if (updatedTeam) {
        team.skills = updatedTeam.skills;
      }
      setIsAddingSkill(false);
      setNewSkill('');
      setSkillError(null);
    } catch (err) {
      setSkillError(err instanceof Error ? err.message : 'Failed to add skill');
    }
  };

  const toggleSkillSelection = (skill: string) => {
    setSelectedSkills(prev => {
      const existing = prev.find(s => s.skill === skill);
      if (existing) {
        return prev.filter(s => s.skill !== skill);
      }
      return [...prev, { skill, proficiency: 1 }];
    });
  };

  const updateSkillProficiency = (skill: string, proficiency: number) => {
    setSelectedSkills(prev => {
      if (proficiency === 0) {
        // If dragged to 0, snap back to 1
        return prev.map(s => s.skill === skill ? { ...s, proficiency: 1 } : s);
      }
      return prev.map(s => s.skill === skill ? { ...s, proficiency } : s);
    });
  };

  const handleClose = () => {
    setShowSkills(false);
    onClose();
  };

  const displayedMembers = showAllMembers
    ? suggestedAssignees
    : suggestedAssignees.slice(0, 3);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={handleClose}>
          ×
        </button>
        <h2>Create New Quest</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Quest Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quest title"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter quest description"
              rows={4}
            />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.skillButtons}>
              {!showSkills && (
                <>
                  <Button
                    label={isLoading ? 'Generating...' : 'Generate Skills'}
                    onClick={handleGenerateSkills}
                    disabled={!title.trim() || isLoading}
                  />
                  <Button
                    label="Manually Select Skills"
                    onClick={() => setShowSkills(true)}
                    disabled={!title.trim() || isLoading}
                  />
                </>
              )}
              {error && <div className={styles.error}>{error}</div>}
            </div>
          </div>

          {showSkills && (
            <div className={styles.formGroup}>
              <label>Required Skills</label>
              <div className={styles.skillsContainer}>
                {team?.skills.map((skill) => (
                  <div
                    key={skill}
                    className={`${styles.skill} ${
                      selectedSkills.some((s) => s.skill === skill)
                        ? styles.selected
                        : ''
                    }`}
                    onClick={() => {
                      setSelectedSkills((prev) => {
                        const existing = prev.find((s) => s.skill === skill);
                        if (existing) {
                          return prev.filter((s) => s.skill !== skill);
                        }
                        return [...prev, { skill, proficiency: 1 }];
                      });
                    }}
                  >
                    {skill}
                  </div>
                ))}
              </div>
              {skillError && <div className={styles.error}>{skillError}</div>}
            </div>
          )}

          {selectedSkills.length > 0 && (
            <div className={styles.formGroup}>
              <label>Suggested Adventurers</label>
              <div className={styles.assigneeList}>
                {displayedMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`${styles.assignee} ${
                      selectedAssignee === member.id ? styles.selected : ''
                    }`}
                    onClick={() =>
                      setSelectedAssignee((prev) =>
                        prev === member.id ? null : member.id
                      )
                    }
                  >
                    <Avatar avatarId={member.avatarId} size={32} />
                    <span>{member.displayName}</span>
                  </div>
                ))}
                {suggestedAssignees.length > 3 && !showAllMembers && (
                  <button
                    type="button"
                    className={styles.showMoreButton}
                    onClick={() => setShowAllMembers(true)}
                  >
                    Show More
                  </button>
                )}
              </div>
            </div>
          )}

          <div className={styles.formActions}>
            <Button
              label="Create Quest"
              type="submit"
              disabled={!title.trim()}
              buttonStyle="submit"
            />
          </div>
        </form>
      </div>
    </div>
  );
} 