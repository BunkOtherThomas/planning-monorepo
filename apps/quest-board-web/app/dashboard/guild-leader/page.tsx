import { FC } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const PMDashboard: FC = () => {
  return (
    <div className={styles.dashboard}>
      <div className={styles.questBoards}>
        <section className={styles.questSection}>
          <h2>Unassigned Quests</h2>
          <div className={styles.questGrid}>
            {/* Quest cards will be mapped here */}
          </div>
        </section>

        <section className={styles.questSection}>
          <h2>Assigned Quests</h2>
          <div className={styles.questGrid}>
            {/* Quest cards will be mapped here */}
          </div>
        </section>

        <Link href="/quests/new" className={styles.createQuestButton}>
          Create New Quest
        </Link>
      </div>

      <section className={styles.teamOverview}>
        <h2>Team Overview</h2>
        <div className={styles.teamGrid}>
          {/* Team member cards will be mapped here */}
        </div>
        <Link href="/team" className={styles.viewTeamButton}>
          View Full Team
        </Link>
      </section>
    </div>
  );
};

export default PMDashboard; 