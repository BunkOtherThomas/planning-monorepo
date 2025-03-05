'use client';

import styles from './Dashboard.module.css';

export default function GuildLeaderDashboard() {
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
      </div>
    </div>
  );
} 