import { FC, useState } from 'react';
import styles from './page.module.css';

interface QuestSuggestion {
  skills: string[];
  difficulty: number;
  suggestedAdventurers: {
    id: string;
    name: string;
    skillLevels: { skill: string; level: number }[];
    type: 'highest' | 'second' | 'underdog';
  }[];
}

const NewQuest: FC = () => {
  const [description, setDescription] = useState('');
  const [suggestions, setSuggestions] = useState<QuestSuggestion | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<number>(0);
  const [selectedAdventurer, setSelectedAdventurer] = useState<string>('');

  const handleGenerateSuggestions = async () => {
    try {
      const response = await fetch('/api/quests/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      
      if (!response.ok) throw new Error('Failed to generate suggestions');
      
      const data = await response.json();
      setSuggestions(data);
      setSelectedSkills(data.skills);
      setDifficulty(data.difficulty);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
  };

  const handleCreateQuest = async () => {
    try {
      const response = await fetch('/api/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          skills: selectedSkills,
          difficulty,
          assignedTo: selectedAdventurer,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create quest');
      
      // Redirect to quest view page
      window.location.href = '/dashboard/pm';
    } catch (error) {
      console.error('Error creating quest:', error);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Create New Quest</h1>
      
      <div className={styles.questForm}>
        <div className={styles.descriptionSection}>
          <label htmlFor="description">Quest Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the quest in detail..."
            rows={5}
          />
          <button onClick={handleGenerateSuggestions}>
            Generate Suggestions
          </button>
        </div>

        {suggestions && (
          <>
            <div className={styles.skillsSection}>
              <h2>Required Skills</h2>
              <div className={styles.skillsList}>
                {suggestions.skills.map((skill) => (
                  <label key={skill} className={styles.skillItem}>
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSkills([...selectedSkills, skill]);
                        } else {
                          setSelectedSkills(selectedSkills.filter(s => s !== skill));
                        }
                      }}
                    />
                    {skill}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.difficultySection}>
              <h2>Quest Difficulty</h2>
              <input
                type="range"
                min="1"
                max="10"
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
              />
              <span>Level {difficulty}</span>
            </div>

            <div className={styles.adventurersSection}>
              <h2>Suggested Adventurers</h2>
              <div className={styles.adventurersList}>
                {suggestions.suggestedAdventurers.map((adventurer) => (
                  <div
                    key={adventurer.id}
                    className={`${styles.adventurerCard} ${
                      selectedAdventurer === adventurer.id ? styles.selected : ''
                    }`}
                    onClick={() => setSelectedAdventurer(adventurer.id)}
                  >
                    <h3>{adventurer.name}</h3>
                    <div className={styles.skillLevels}>
                      {adventurer.skillLevels.map((skill) => (
                        <div key={skill.skill} className={styles.skillLevel}>
                          <span>{skill.skill}</span>
                          <span>Lvl {skill.level}</span>
                        </div>
                      ))}
                    </div>
                    <span className={styles.adventurerType}>
                      {adventurer.type === 'highest' && '🏆 Highest Level'}
                      {adventurer.type === 'second' && '🥈 Second Highest'}
                      {adventurer.type === 'underdog' && '⭐ Rising Star'}
                    </span>
                  </div>
                ))}
                <button
                  className={styles.otherAdventurer}
                  onClick={() => setSelectedAdventurer('')}
                >
                  Choose Another Adventurer
                </button>
              </div>
            </div>

            <button
              className={styles.createButton}
              onClick={handleCreateQuest}
              disabled={!description || selectedSkills.length === 0}
            >
              Create Quest
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default NewQuest; 