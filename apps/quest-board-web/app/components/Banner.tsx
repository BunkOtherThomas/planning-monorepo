'use client';

import { useRouter } from 'next/navigation';
import styles from './Banner.module.css';
import { logout } from '../lib/api';

export default function Banner() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <h1 className={styles.title}>Quest Board</h1>
        <button 
          className={styles.logoutButton}
          onClick={handleLogout}
        >
          Leave the Realm
        </button>
      </div>
    </div>
  );
} 