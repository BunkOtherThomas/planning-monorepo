"use client";

import { FC } from 'react';
import styles from './page.module.css';

const Playground: FC = () => {
  return (
    <div className={styles.container}>
      <h1>Component Playground</h1>
      
      <section className={styles.section}>
        <h2>Quest Components</h2>
        <div className={styles.componentGrid}>
          {/* Quest components will go here */}
          <div className={styles.componentCard}>
            <h3>Quest Card</h3>
            <p>Coming soon...</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Adventurer Components</h2>
        <div className={styles.componentGrid}>
          {/* Adventurer components will go here */}
          <div className={styles.componentCard}>
            <h3>Adventurer Card</h3>
            <p>Coming soon...</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Skill Components</h2>
        <div className={styles.componentGrid}>
          {/* Skill components will go here */}
          <div className={styles.componentCard}>
            <h3>Skill Badge</h3>
            <p>Coming soon...</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Playground; 