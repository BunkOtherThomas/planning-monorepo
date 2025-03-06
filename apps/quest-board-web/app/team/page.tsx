"use client";

import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { getSkills } from '../lib/api';
import { Skill } from '@quest-board/types';

interface TeamMember {
  id: string;
  displayName: string;
  avatarId: number;
  topSkills: {
    name: string;
    level: number;
    isTagged: boolean;
  }[];
  activeQuests: {
    id: string;
    title: string;
  }[];
}

const TeamPage: FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  useEffect(() => {
    // Fetch team members and available skills
    const fetchData = async () => {
      try {
        const [membersResponse, skills] = await Promise.all([
          fetch('/api/team'),
          getSkills()
        ]);

        if (!membersResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const members = await membersResponse.json();
        setTeamMembers(members);
        setAvailableSkills(skills.map((s: Skill) => s.name));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = !selectedSkill || member.topSkills.some(skill => skill.name === selectedSkill);
    return matchesSearch && matchesSkill;
  });

  return (
    <div className={styles.container}>
      <h1>Team Overview</h1>

      <div className={styles.filters}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.skillFilter}>
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
          >
            <option value="">Filter by skill...</option>
            {availableSkills.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.teamGrid}>
        {filteredMembers.map((member) => (
          <div key={member.id} className={styles.memberCard}>
            <div className={styles.memberHeader}>
              <h2>{member.displayName}</h2>
            </div>

            <div className={styles.skillsSection}>
              <h3>Top Skills</h3>
              <div className={styles.skillsList}>
                {member.topSkills.map((skill) => (
                  <div
                    key={skill.name}
                    className={`${styles.skillBadge} ${skill.isTagged ? styles.tagged : ''}`}
                  >
                    <span className={styles.skillName}>{skill.name}</span>
                    <span className={styles.skillLevel}>Lvl {skill.level}</span>
                    {skill.isTagged && <span className={styles.tagIcon}>★</span>}
                  </div>
                ))}
              </div>
            </div>

            {member.activeQuests.length > 0 && (
              <div className={styles.questsSection}>
                <h3>Active Quests</h3>
                <div className={styles.questsList}>
                  {member.activeQuests.map((quest) => (
                    <Link
                      key={quest.id}
                      href={`/quests/${quest.id}`}
                      className={styles.questLink}
                    >
                      {quest.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamPage; 