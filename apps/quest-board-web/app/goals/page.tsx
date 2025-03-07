'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './goals.module.css';
import { ProjectManagerGoals, SkillsResponse } from '@quest-board/types';
import { createTeam, generateSkills } from '../lib/api';
import { Button } from '@repo/ui/button';

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGoalsSection, setShowGoalsSection] = useState(true);
  const [hasStartedSkillsSelection, setHasStartedSkillsSelection] =
    useState(false);

  const handleSkipGoals = () => {
    setSkills([]);
    setSelectedSkills([]);
    setShowGoalsSection(false);
    setHasStartedSkillsSelection(true);
    setLoading(false);
  };

  const handleSubmitGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await generateSkills(goals);

      if (data.error) {
        setError(data.error);
      } else {
        setSkills(data.skills);
        setHasStartedSkillsSelection(true);
        setShowGoalsSection(false);
      }
    } catch (err) {
      setError('Failed to generate skills. Please try again.');
    }

    setLoading(false);
  };

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !customSkills.includes(customSkill.trim())) {
      setCustomSkills(prev => [...prev, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleRemoveCustomSkill = (skill: string) => {
    setCustomSkills(prev => prev.filter(s => s !== skill));
  };

  const handleComplete = async () => {
    try {
      // Combine selected and custom skills
      const allSkills = [...selectedSkills, ...customSkills];
      const data = await createTeam(allSkills);

      // Redirect to the dashboard after successful team creation
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to create team. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Project Manager Setup</h1>

      {showGoalsSection && (
        <div className={styles.form}>
          <div className={styles.goalsSection}>
            <h2 className={styles.subtitle}>Project Goals</h2>
            <label className={styles.label} htmlFor='goals'>
              What are your project goals?
            </label>
            <textarea
              id='goals'
              className={styles.textarea}
              value={goals}
              onChange={e => setGoals(e.target.value)}
              placeholder='Describe your project goals...'
            />
            <p className={styles.description}>
              Your goals will help us suggest relevant skills for your project.
              This will make it easier to match with the right team members.
            </p>

            <div className={styles.buttonContainer}>
              <Button
                label="Skip and add skills manually"
                buttonStyle="default"
                onClick={handleSkipGoals}
              />

              <Button
                label={loading ? 'Generating Skills...' : 'Generate Skills'}
                buttonStyle="submit"
                onClick={handleSubmitGoals}
                disabled={loading || !goals.trim()}
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}
          </div>
        </div>
      )}

      {hasStartedSkillsSelection && (
        <div className={styles.skillsSection}>
          <h2 className={styles.subtitle}>Required Skills</h2>
          <p className={styles.description}>Select the skills you want to track</p>

          {skills.length > 0 && (
            <>
              <div className={styles.skillsList}>
                {skills.map(skill => (
                  <div
                    key={skill}
                    className={styles.skillLabel}
                    onClick={() => handleSkillToggle(skill)}
                    data-checked={selectedSkills.includes(skill)}
                  >
                    <input
                      type='checkbox'
                      checked={selectedSkills.includes(skill)}
                      onChange={() => {}}
                      hidden
                    />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
              <div className={styles.customSkills}>
                <h3 className={styles.subtitle}>Additional Custom Skills</h3>
                <div className={styles.customSkillInput}>
                  <input
                    type='text'
                    className={styles.input}
                    value={customSkill}
                    onChange={e => setCustomSkill(e.target.value)}
                    placeholder='Enter a custom skill...'
                  />
                  <Button
                    label="Add Skill"
                    buttonStyle="default"
                    onClick={handleAddCustomSkill}
                    disabled={!customSkill.trim()}
                  />
                </div>

                {customSkills.length > 0 && (
                  <div className={styles.customSkillsList}>
                    {customSkills.map(skill => (
                      <div key={skill} className={styles.customSkillItem}>
                        <span>{skill}</span>
                        <button
                          className={styles.removeButton}
                          onClick={() => handleRemoveCustomSkill(skill)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {skills.length === 0 && (
            <div
              className={styles.customSkills}
              style={{ borderTop: 'none', marginTop: 0, paddingTop: 0 }}
            >
              <div className={styles.customSkillInput}>
                <input
                  type='text'
                  className={styles.input}
                  value={customSkill}
                  onChange={e => setCustomSkill(e.target.value)}
                  placeholder='Enter a custom skill...'
                />
                <Button
                  label="Add Skill"
                  buttonStyle="default"
                  onClick={handleAddCustomSkill}
                  disabled={!customSkill.trim()}
                />
              </div>

              {customSkills.length > 0 && (
                <div className={styles.customSkillsList}>
                  {customSkills.map(skill => (
                    <div key={skill} className={styles.customSkillItem}>
                      <span>{skill}</span>
                      <button
                        className={styles.removeButton}
                        onClick={() => handleRemoveCustomSkill(skill)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <Button
            label="Complete Setup"
            buttonStyle="submit"
            onClick={handleComplete}
            disabled={selectedSkills.length === 0 && customSkills.length === 0}
          />
        </div>
      )}
    </div>
  );
}
