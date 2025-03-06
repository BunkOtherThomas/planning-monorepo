"use client";

import { FC, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styles from './page.module.css';
import { getOpenQuestsForUser, getSkills } from '../../lib/api';
import { Quest } from '@quest-board/types';
import { getLevel } from '@planning/common-utils';

const QuestPage: FC = () => {
  const params = useParams();
  const [quest, setQuest] = useState<Quest | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSkills, setEditedSkills] = useState<string[]>([]);
  const [editedDifficulty, setEditedDifficulty] = useState(0);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  useEffect(() => {
    const fetchQuest = async () => {
      try {
        const [questResponse, skillsResponse] = await Promise.all([
          getOpenQuestsForUser(params.id as string),
          getSkills(true),
        ]);

        if (!questResponse.ok) {
          throw new Error('Failed to fetch quest');
        }

        const questData = await questResponse.json();
        const skillsData = await skillsResponse;

        setQuest(questData);
        setEditedSkills(questData.skills.map((s: any) => s.name));
        setEditedDifficulty(questData.difficulty);
        setAvailableSkills(skillsData.map((s: any) => s.name));
      } catch (error) {
        console.error('Error fetching quest:', error);
      }
    };

    if (params.id) {
      fetchQuest();
    }
  }, [params.id]);

  const handleUpdateQuest = async () => {
    try {
      const response = await fetch(`/api/quests/${quest?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: editedSkills,
          difficulty: editedDifficulty,
        }),
      });

      if (!response.ok) throw new Error('Failed to update quest');

      const updatedQuest = await response.json();
      setQuest(updatedQuest);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating quest:', error);
    }
  };

  const handleAssignQuest = async (adventurerId: string) => {
    try {
      const response = await fetch(`/api/quests/${quest?.id}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adventurerId }),
      });

      if (!response.ok) throw new Error('Failed to assign quest');

      const updatedQuest = await response.json();
      setQuest(updatedQuest);
    } catch (error) {
      console.error('Error assigning quest:', error);
    }
  };

  if (!quest) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.questHeader}>
        <h1>{quest.title}</h1>
        <span className={`${styles.status} ${styles[quest.status]}`}>
          {quest.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className={styles.questContent}>
        <section className={styles.description}>
          <h2>Description</h2>
          <p>{quest.description}</p>
        </section>

        <section className={styles.requirements}>
          <div className={styles.sectionHeader}>
            <h2>Requirements</h2>
            {!isEditing && (
              <button
                className={styles.editButton}
                onClick={() => setIsEditing(true)}
              >
                Redefine Scope
              </button>
            )}
          </div>

          {isEditing ? (
            <div className={styles.editForm}>
              <div className={styles.skillsSelection}>
                <h3>Required Skills</h3>
                <div className={styles.skillsList}>
                  {availableSkills.map((skill) => (
                    <label key={skill} className={styles.skillCheckbox}>
                      <input
                        type="checkbox"
                        checked={editedSkills.includes(skill)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditedSkills([...editedSkills, skill]);
                          } else {
                            setEditedSkills(editedSkills.filter(s => s !== skill));
                          }
                        }}
                      />
                      {skill}
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.difficultySelection}>
                <h3>Difficulty Level</h3>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={editedDifficulty}
                  onChange={(e) => setEditedDifficulty(Number(e.target.value))}
                />
                <span>Level {editedDifficulty}</span>
              </div>

              <div className={styles.editActions}>
                <button
                  className={styles.saveButton}
                  onClick={handleUpdateQuest}
                >
                  Save Changes
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.skills}>
                <h3>Required Skills</h3>
                <div className={styles.skillsList}>
                  {quest.skills.map((skill) => {
                    const { level } = getLevel(skill.xp);
                    return (
                      <div key={skill.name} className={styles.skillBadge}>
                        <span>{skill.name}</span>
                        <span>Lvl {level}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={styles.difficulty}>
                <h3>Difficulty Level</h3>
                <div className={styles.difficultyBadge}>
                  Level {quest.difficulty}
                </div>
              </div>
            </>
          )}
        </section>

        <section className={styles.assignment}>
          <h2>Assignment</h2>
          {quest.assignedTo ? (
            <div className={styles.assignedAdventurer}>
              <div className={styles.adventurerInfo}>
                <h3>{quest.assignedTo.displayName}</h3>
                <button
                  className={styles.reassignButton}
                  onClick={() => setIsEditing(true)}
                >
                  Reassign Quest
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.suggestedAdventurers}>
              <h3>Suggested Adventurers</h3>
              <div className={styles.adventurersList}>
                {quest.suggestedAdventurers.map((adventurer) => (
                  <div key={adventurer.id} className={styles.adventurerCard}>
                    <div className={styles.adventurerInfo}>
                      <h4>{adventurer.displayName}</h4>
                      <div className={styles.adventurerSkills}>
                        {adventurer.skills.map((skill) => {
                          const { level } = getLevel(skill.xp);
                          return (
                            <span key={skill.name} className={styles.skillLevel}>
                              {skill.name} Lvl {level}
                            </span>
                          );
                        })}
                      </div>
                      <span className={styles.adventurerType}>
                        {adventurer.type === 'highest' && '🏆 Highest Level'}
                        {adventurer.type === 'second' && '🥈 Second Highest'}
                        {adventurer.type === 'underdog' && '⭐ Rising Star'}
                      </span>
                    </div>
                    <button
                      className={styles.assignButton}
                      onClick={() => handleAssignQuest(adventurer.id)}
                    >
                      Assign Quest
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default QuestPage; 