import { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import { getCurrentTeam, addTeamSkill, analyzeSkills, SkillProficiency } from '../lib/api';
import { sortCandidatesBySkills } from '../utils/sortCandidates';
import { Avatar } from '../../components/Avatar';
import { User } from '@quest-board/types';
import { getLevel } from '@planning/common-utils';

interface CreateQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description?: string, selectedSkills?: SkillProficiency[], assigneeId?: string) => void;
  team: Team | null;
}

interface Team {
  id: string;
  skills: string[];
  members: User[];
}

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
  const [suggestedAssignees, setSuggestedAssignees] = useState<User[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [showAllMembers, setShowAllMembers] = useState(false);

  useEffect(() => {
    if (selectedSkills.length > 0 && team?.members) {
      const requiredSkills = selectedSkills.reduce((acc, skill) => {
        acc[skill.skill] = skill.proficiency;
        return acc;
      }, {} as Record<string, number>);

      const sortedMembers = sortCandidatesBySkills(requiredSkills, team.members);
      setSuggestedAssignees(sortedMembers.slice(0, 3));
      setSelectedAssignee(null);
    } else {
      setSuggestedAssignees([]);
      setSelectedAssignee(null);
    }
  }, [selectedSkills, team?.members]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(title, description, selectedSkills, selectedAssignee || undefined);
    setTitle('');
    setDescription('');
    setSelectedSkills([]);
    setSelectedAssignee(null);
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-button"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg
            className="h-6 w-6"
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
        <h2 className="modal-title">Create New Quest</h2>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.formLabel}>Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.formInput}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.formLabel}>Description (Optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.formInput}
            />
          </div>
          
          <div className={styles.formGroup}>
            <div className={styles.skillButtons}>
              {!showSkills && (
                <>
                  <button
                    type="button"
                    onClick={handleGenerateSkills}
                    className={styles.skillButton}
                    disabled={!title.trim() || isLoading}
                  >
                    {isLoading ? 'Generating...' : 'Generate Skills'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSkills(true)}
                    className={styles.skillButton}
                    disabled={!title.trim() || isLoading}
                  >
                    Manually Select Skills
                  </button>
                </>
              )}
              {error && <div className={styles.error}>{error}</div>}
            </div>
          </div>

          {showSkills && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Required Skills</label>
              <div className={styles.skillsGrid}>
                {team?.skills.map((skill) => {
                  const selected = selectedSkills.find(s => s.skill === skill);
                  return (
                    <div 
                      key={skill} 
                      className={`${styles.skillItem} ${selected ? styles.selected : ''}`}
                      onClick={() => !selected && toggleSkillSelection(skill)}
                    >
                      {selected && (
                        <button
                          className={styles.closeButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSkillSelection(skill);
                          }}
                          aria-label="Remove skill"
                        >
                          <svg
                            className={styles.closeIcon}
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
                      )}
                      <div className={styles.skillContent}>
                        <div className={styles.skillName}>{skill}</div>
                        <div 
                          className={styles.sliderContainer}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {selected && (
                            <div className={styles.healthBarContainer}>
                              <input
                                type="range"
                                min="0"
                                max="3"
                                value={selected.proficiency}
                                onChange={(e) => updateSkillProficiency(skill, Number(e.target.value))}
                                className={styles.healthBar}
                              />
                              <div 
                                className={styles.healthBarFill}
                                style={{
                                  width: `${(selected.proficiency / 3) * 100}%`
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {isAddingSkill ? (
                <div className={styles.formGroup}>
                  <label htmlFor="newSkill" className={styles.formLabel}>New Skill</label>
                  <div className={styles.skillInputContainer}>
                    <input
                      id="newSkill"
                      type="text"
                      value={newSkill}
                      onChange={(e) => {
                        setNewSkill(e.target.value);
                        setSkillError(null);
                      }}
                      placeholder="Enter skill name"
                      className={styles.formInput}
                    />
                    {skillError && <div className={styles.error}>{skillError}</div>}
                    <div className={styles.modalActions}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingSkill(false);
                          setNewSkill('');
                          setSkillError(null);
                        }}
                        className={styles.skillButton}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className={styles.skillButton}
                      >
                        Add Skill
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingSkill(true)}
                  className={styles.skillButton}
                >
                  Add New Skill
                </button>
              )}
            </div>
          )}

          {selectedSkills.length > 0 && team?.members && team.members.length > 1 && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Suggested Assignees</label>
              <div className={styles.assigneesGrid}>
                {suggestedAssignees.map((member) => (
                  <div
                    key={member.id}
                    className={`${styles.assigneeCard} ${selectedAssignee === member.id ? styles.selected : ''}`}
                    onClick={() => setSelectedAssignee(member.id)}
                  >
                    <Avatar avatarId={member.avatarId || 1} size={48} />
                    <div className={styles.assigneeInfo}>
                      <div className={styles.assigneeName}>
                        {member.displayName}
                        {selectedAssignee === member.id && (
                          <span className={styles.selectedIndicator}>Selected</span>
                        )}
                      </div>
                      <div className={styles.assigneeSkills}>
                        {selectedSkills.map((skill) => {
                          const xp = member.skills?.[skill.skill] || 0;
                          const skillLevel = getLevel(xp).level;
                          return xp > 0 ? (
                            <div key={skill.skill} className={styles.assigneeSkill}>
                              {`${skill.skill}: ${skillLevel}`}
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                {team.members.length > 3 && !showAllMembers && (
                  <div
                    className={styles.assigneeCard}
                    onClick={() => setShowAllMembers(true)}
                  >
                    <div className={styles.moreMembers}>
                      +{team.members.length - 3} more
                    </div>
                  </div>
                )}
              </div>
              {showAllMembers && (
                <div className={styles.allMembersList}>
                  {team.members
                    .filter(member => !suggestedAssignees.find(s => s.id === member.id))
                    .map((member) => (
                      <div
                        key={member.id}
                        className={`${styles.assigneeCard} ${selectedAssignee === member.id ? styles.selected : ''}`}
                        onClick={() => setSelectedAssignee(member.id)}
                      >
                        <Avatar avatarId={member.avatarId || 1} size={48} />
                        <div className={styles.assigneeInfo}>
                          <div className={styles.assigneeName}>
                            {member.displayName}
                            {selectedAssignee === member.id && (
                              <span className={styles.selectedIndicator}>Selected</span>
                            )}
                          </div>
                          <div className={styles.assigneeSkills}>
                            {selectedSkills.map((skill) => {
                              const skillLevel = member.skills?.[skill.skill] || 0;
                              return skillLevel > 0 ? (
                                <div key={skill.skill} className={styles.assigneeSkill}>
                                  {`${skill.skill}: ${skillLevel}`}
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  <button
                    type="button"
                    className={styles.skillButton}
                    onClick={() => setShowAllMembers(false)}
                  >
                    Show Less
                  </button>
                </div>
              )}
            </div>
          )}

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.skillButton}>
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.skillButton}
              disabled={selectedSkills.length === 0}
            >
              Create Quest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 