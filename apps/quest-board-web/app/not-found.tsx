'use client';

import { useRouter } from 'next/navigation';
import styles from './not-found.module.css';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Lost in the Realm?</h1>
        <p className={styles.message}>
          Brave adventurer, it seems you've wandered into uncharted territory.
          The scroll you seek does not exist in our archives.
        </p>
        <button 
          className={styles.button}
          onClick={() => router.push('/dashboard')}
        >
          Return to the Quest Board
        </button>
      </div>
    </div>
  );
} 