'use client';

import styles from './Dashboard.module.css';

export default function AdventurerDashboard() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {/* Placeholder for avatar */}
          </div>
          <div className={styles.userDetails}>
            <h2 className={styles.username}>Brave Adventurer</h2>
            <div className={styles.userStats}>
              <span className={styles.stat}>
                <span className={styles.statIcon}>⚔️</span>
                Rank: Novice
              </span>
              <span className={styles.stat}>
                <span className={styles.statIcon}>✨</span>
                XP: 0
              </span>
              <span className={styles.stat}>
                <span className={styles.statIcon}>💰</span>
                Gold: 100
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Available Quests</h3>
          <div className={styles.questList}>
            <div className={styles.quest}>
              <h4 className={styles.questTitle}>The Lost Scroll</h4>
              <p className={styles.questDescription}>
                A mysterious scroll has gone missing from the library. Find it and return it safely.
              </p>
              <div className={styles.questMeta}>
                <span>Difficulty: Easy</span>
                <span className={styles.questReward}>
                  <span className={styles.statIcon}>💰</span>
                  50 Gold
                </span>
              </div>
            </div>
            <div className={styles.quest}>
              <h4 className={styles.questTitle}>Dragon's Den Cleanup</h4>
              <p className={styles.questDescription}>
                Clear out the pesky creatures that have taken residence in the old dragon's den.
              </p>
              <div className={styles.questMeta}>
                <span>Difficulty: Medium</span>
                <span className={styles.questReward}>
                  <span className={styles.statIcon}>💰</span>
                  100 Gold
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Your Active Quests</h3>
          <div className={styles.questList}>
            <div className={styles.emptyState}>
              No active quests. Time to embark on a new adventure!
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Leaderboard</h3>
          <table className={styles.leaderboard}>
            <thead>
              <tr>
                <th>Adventurer</th>
                <th>Rank</th>
                <th>Quests</th>
                <th>Gold</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sir Questalot</td>
                <td>Master</td>
                <td>42</td>
                <td>1,500</td>
              </tr>
              <tr>
                <td>Lady Dragontamer</td>
                <td>Expert</td>
                <td>38</td>
                <td>1,200</td>
              </tr>
              <tr>
                <td>You</td>
                <td>Novice</td>
                <td>0</td>
                <td>100</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
} 