'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './goals.module.css';
import { ProjectManagerGoals, SkillsResponse } from '@quest-board/types';

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skipGoals, setSkipGoals] = useState(false);

  const handleSubmitGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      setError('API URL is not configured');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/skills/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goals, skipGoals } as ProjectManagerGoals),
      });

      const data: SkillsResponse = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setSkills(data.skills);
    } catch (err) {
      setError('Failed to generate skills. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
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

  const handleSubmitSkills = () => {
    // For now, just console log the selected skills
    console.log({
      selectedSkills,
      customSkills,
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome, Guild Leader!</h1>
      
      {!skills.length ? (
        <form onSubmit={handleSubmitGoals} className={styles.form}>
          <div className={styles.goalsSection}>
            <label htmlFor="goals" className={styles.label}>
              Outline Your Quest
            </label>
            <textarea
              id="goals"
              className={styles.textarea}
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="Describe the goals of your project or business..."
              disabled={skipGoals || loading}
              rows={6}
            />
            <p className={styles.description}>
              Be as specific as you'd like about your project's goals, tools, and processes.
              This will help us suggest relevant skills for your team members.
            </p>
            
            <div className={styles.skipOption}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={skipGoals}
                  onChange={(e) => setSkipGoals(e.target.checked)}
                  disabled={loading}
                />
                Skip this step and enter skills manually
              </label>
            </div>

            {error && <p className={styles.error}>{error}</p>}
            
            <button 
              type="submit" 
              className={styles.button}
              disabled={loading || ((!goals.trim()) && !skipGoals)}
            >
              {loading ? 'Consulting the Sages...' : 'Continue'}
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.skillsSection}>
          <h2 className={styles.subtitle}>Required Skills</h2>
          <p className={styles.description}>
            Select the skills that are relevant to your project:
          </p>
          
          <div className={styles.skillsList}>
            {skills.map((skill) => (
              <div
                key={skill}
                className={styles.skillLabel}
                onClick={() => handleSkillToggle(skill)}
                data-checked={selectedSkills.includes(skill)}
              >
                <input
                  type="checkbox"
                  checked={selectedSkills.includes(skill)}
                  onChange={() => {}}
                  hidden
                />
                <span>{skill}</span>
              </div>
            ))}
          </div>

          <div className={styles.customSkills}>
            <h3 className={styles.subtitle}>Add Custom Skills</h3>
            <div className={styles.customSkillInput}>
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="Enter a custom skill..."
                className={styles.input}
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                className={styles.addButton}
                disabled={!customSkill.trim()}
              >
                Add
              </button>
            </div>

            {customSkills.length > 0 && (
              <div className={styles.customSkillsList}>
                {customSkills.map((skill) => (
                  <div key={skill} className={styles.customSkillItem}>
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomSkill(skill)}
                      className={styles.removeButton}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmitSkills}
            className={styles.button}
            disabled={selectedSkills.length === 0 && customSkills.length === 0}
          >
            Complete Setup
          </button>
        </div>
      )}
    </div>
  );
} 