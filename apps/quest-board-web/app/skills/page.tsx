"use client";

import { FC, useState } from 'react';
import styles from './page.module.css';
import { SkillAssessmentModal } from '../components/SkillAssessmentModal';
import { getSkills, declareSkill } from '../lib/api';

interface Skill {
  id: string;
  name: string;
  description: string;
  isGlobal: boolean;
  xp: number;
}

interface SkillAssessmentValues {
  professionalExperience: number;
  formalEducation: number;
  informalEducation: number;
  confidence: number;
}

const SkillsPage: FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [experience, setExperience] = useState<number>(0);

  const handleSkillSubmit = async (values: SkillAssessmentValues) => {
    if (!selectedSkill) return;
    
    try {
      // Calculate XP based on the form values
      const xp = Math.round(
        (values.professionalExperience * 0.4 +
         values.formalEducation * 0.3 +
         values.informalEducation * 0.2 +
         values.confidence * 0.1) * 100
      );
      
      await declareSkill(selectedSkill, xp);
      // Refresh skills list
      const updatedSkills = await getSkills();
      setSkills(updatedSkills);
    } catch (error) {
      console.error('Failed to declare skill:', error);
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
            <button
              onClick={() => setIsModalOpen(true)}
              className={styles.declareButton}
            >
              Declare Skill
            </button>
          )}
        </section>

        <section className={styles.currentSkills}>
          <h2>Your Skills</h2>
          <div className={styles.skillsList}>
            {skills.map((skill) => (
              <div key={skill.id} className={styles.skillCard}>
                <h3>{skill.name}</h3>
                <p>{skill.description}</p>
                <div className={styles.xpBar}>
                  <div
                    className={styles.xpFill}
                    style={{ width: `${skill.xp}%` }}
                  />
                </div>
                <span className={styles.xpText}>{skill.xp} XP</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <SkillAssessmentModal
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSkillSubmit}
        skillName={selectedSkill}
      />
    </div>
  );
};

export default SkillsPage; 