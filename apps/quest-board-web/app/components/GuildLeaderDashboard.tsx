'use client';

import { useEffect, useState } from 'react';
import { getCurrentTeam } from '../lib/api';
import { Avatar } from '../../components/Avatar';
import styles from './Dashboard.module.css';

interface TeamMember {
  id: string;
  displayName: string;
  avatarId: number;
}

interface Team {
  id: string;
  inviteCode: string;
  members: TeamMember[];
  skills: string[];
}

export default function GuildLeaderDashboard() {
  const [team, setTeam] = useState<Team | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const teamData = await getCurrentTeam();
        setTeam(teamData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch team');
      }
    };

    fetchTeam();
  }, []);

  const handleCopyInvite = async () => {
    if (!team) return;
    const inviteUrl = `${window.location.origin}/signup/?team=${team.inviteCode}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Your Posted Quests</h3>
          <div className={styles.questList}>
            <div className={styles.quest}>
              <h4 className={styles.questTitle}>The Lost Scroll</h4>
              <p className={styles.questDescription}>
                A mysterious scroll has gone missing from the library. Find it and return it safely.
              </p>
              <div className={styles.questMeta}>
                <span>Status: Open</span>
                <span className={styles.questReward}>
                  <span className={styles.statIcon}>👥</span>
                  2 Applicants
                </span>
              </div>
            </div>
            <div className={styles.quest}>
              <h4 className={styles.questTitle}>Dragon's Den Cleanup</h4>
              <p className={styles.questDescription}>
                Clear out the pesky creatures that have taken residence in the old dragon's den.
              </p>
              <div className={styles.questMeta}>
                <span>Status: In Progress</span>
                <span className={styles.questReward}>
                  <span className={styles.statIcon}>⚔️</span>
                  Assigned to: Lady Dragontamer
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Quest Applications</h3>
          <div className={styles.questList}>
            <div className={styles.application}>
              <div className={styles.applicationHeader}>
                <span className={styles.questTitle}>The Lost Scroll</span>
                <span className={styles.applicationStatus}>Pending Review</span>
              </div>
              <div className={styles.applicationContent}>
                <div className={styles.applicantInfo}>
                  <span className={styles.statIcon}>👤</span>
                  <span>Sir Questalot</span>
                  <span className={styles.applicantStats}>
                    <span className={styles.stat}>Rank: Master</span>
                    <span className={styles.stat}>Completed: 42 quests</span>
                  </span>
                </div>
                <div className={styles.applicationActions}>
                  <button className={styles.acceptButton}>Accept</button>
                  <button className={styles.rejectButton}>Reject</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Team Information</h3>
          {error ? (
            <div className={styles.error}>{error}</div>
          ) : team ? (
            <div className={styles.teamInfo}>
              <div className={styles.teamMembers}>
                <h4 className={styles.questTitle}>Team Members</h4>
                <div className={styles.questList}>
                  {team.members.map((member) => (
                    <div key={member.id} className={styles.quest}>
                      <div className={styles.applicantInfo}>
                        <Avatar avatarId={member.avatarId} size={32} />
                        <span className={styles.memberName}>{member.displayName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.teamCode}>
                <h4 className={styles.questTitle}>Invite team members</h4>
                <code 
                  className={`${styles.inviteCode} ${copied ? styles.copied : ''}`}
                  onClick={handleCopyInvite}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.inviteHeader}>Dangerous to go alone!</div>
                  <div className={styles.inviteUrl}>Use this url to invite your team members: {`${window.location.origin}/signup/?team=${team.inviteCode}`}</div>
                </code>
                {copied && (
                  <div className={styles.copyMessage}>
                    URL copied to clipboard!
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.loading}>Loading team information...</div>
          )}
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Team Skills</h3>
          <div className={styles.questList}>
            {team?.skills && team.skills.length > 0 ? (
              team.skills.map((skill, index) => (
                <div key={index} className={styles.quest}>
                  <div className={styles.applicantInfo}>
                    <span className={styles.statIcon}>⚔️</span>
                    <span>{skill}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>No skills defined yet</div>
            )}
          </div>
          <div className={styles.stickyAddButton}>
            <button className={styles.addButton}>
              <span className={styles.statIcon}>➕</span>
              Add Skill
            </button>
          </div>
        </section>
      </div>
    </div>
  );
} 