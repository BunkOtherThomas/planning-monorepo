"use client";

import { FC, useState } from 'react';
import styles from './page.module.css';

interface Skill {
  id: string;
  name: string;
  level: number;
  isTagged: boolean;
  experience: {
    professional: number;
    formalEducation: number;
    informalEducation: number;
    confidence: number;
  };
}

const SkillsPage: FC = () => {
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [declaredSkills, setDeclaredSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [experience, setExperience] = useState({
    professional: 5,
    formalEducation: 5,
    informalEducation: 5,
    confidence: 0.75,
  });

  const handleDeclareSkill = async () => {
    try {
      const response = await fetch('/api/skills/declare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillName: selectedSkill,
          experience,
        }),
      });

      if (!response.ok) throw new Error('Failed to declare skill');

      const newSkill = await response.json();
      setDeclaredSkills([...declaredSkills, newSkill]);
      setAvailableSkills(availableSkills.filter(s => s !== selectedSkill));
      setSelectedSkill('');
    } catch (error) {
      console.error('Error declaring skill:', error);
    }
  };

  const handleToggleTag = async (skillId: string) => {
    try {
      const response = await fetch(`/api/skills/${skillId}/tag`, {
        method: 'PUT',
      });

      if (!response.ok) throw new Error('Failed to toggle tag');

      setDeclaredSkills(declaredSkills.map(skill => 
        skill.id === skillId ? { ...skill, isTagged: !skill.isTagged } : skill
      ));
    } catch (error) {
      console.error('Error toggling tag:', error);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Manage Your Skills</h1>

      <div className={styles.skillsGrid}>
        <section className={styles.declareSkill}>
          <h2>Declare New Skill</h2>
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
          >
            <option value="">Select a skill...</option>
            {availableSkills.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>

          {selectedSkill && (
            <div className={styles.experienceForm}>
              <div className={styles.sliderGroup}>
                <label>
                  Professional Experience
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={experience.professional}
                    onChange={(e) => setExperience({
                      ...experience,
                      professional: Number(e.target.value),
                    })}
                  />
                  <span>{experience.professional}</span>
                </label>
              </div>

              <div className={styles.sliderGroup}>
                <label>
                  Formal Education
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={experience.formalEducation}
                    onChange={(e) => setExperience({
                      ...experience,
                      formalEducation: Number(e.target.value),
                    })}
                  />
                  <span>{experience.formalEducation}</span>
                </label>
              </div>

              <div className={styles.sliderGroup}>
                <label>
                  Informal Education
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={experience.informalEducation}
                    onChange={(e) => setExperience({
                      ...experience,
                      informalEducation: Number(e.target.value),
                    })}
                  />
                  <span>{experience.informalEducation}</span>
                </label>
              </div>

              <div className={styles.sliderGroup}>
                <label>
                  Confidence Level
                  <input
                    type="range"
                    min="25"
                    max="100"
                    value={experience.confidence * 100}
                    onChange={(e) => setExperience({
                      ...experience,
                      confidence: Number(e.target.value) / 100,
                    })}
                  />
                  <span>{Math.round(experience.confidence * 100)}%</span>
                </label>
              </div>

              <button
                className={styles.declareButton}
                onClick={handleDeclareSkill}
              >
                Declare Skill
              </button>
            </div>
          )}
        </section>

        <section className={styles.declaredSkills}>
          <h2>Your Skills</h2>
          <div className={styles.skillsList}>
            {declaredSkills.map((skill) => (
              <div
                key={skill.id}
                className={`${styles.skillCard} ${skill.isTagged ? styles.tagged : ''}`}
              >
                <div className={styles.skillHeader}>
                  <h3>{skill.name}</h3>
                  <span className={styles.level}>Level {skill.level}</span>
                </div>

                <div className={styles.skillStats}>
                  <div className={styles.statBar}>
                    <span>Professional</span>
                    <div className={styles.barWrapper}>
                      <div
                        className={styles.bar}
                        style={{ width: `${skill.experience.professional * 10}%` }}
                      />
                    </div>
                  </div>

                  <div className={styles.statBar}>
                    <span>Formal Education</span>
                    <div className={styles.barWrapper}>
                      <div
                        className={styles.bar}
                        style={{ width: `${skill.experience.formalEducation * 10}%` }}
                      />
                    </div>
                  </div>

                  <div className={styles.statBar}>
                    <span>Informal Education</span>
                    <div className={styles.barWrapper}>
                      <div
                        className={styles.bar}
                        style={{ width: `${skill.experience.informalEducation * 10}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  className={`${styles.tagButton} ${skill.isTagged ? styles.tagged : ''}`}
                  onClick={() => handleToggleTag(skill.id)}
                >
                  {skill.isTagged ? 'Tagged ★' : 'Tag Skill'}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SkillsPage; 