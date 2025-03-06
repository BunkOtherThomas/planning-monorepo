import { useState } from 'react';
import styles from './Dashboard.module.css';
import { getCurrentTeam, addTeamSkill, analyzeSkills, SkillProficiency } from '../lib/api';

interface CreateQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description?: string, selectedSkills?: SkillProficiency[]) => void;
  team: Team | null;
}

interface Team {
  id: string;
  skills: string[];
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(title, description, selectedSkills);
    setTitle('');
    setDescription('');
    setSelectedSkills([]);
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