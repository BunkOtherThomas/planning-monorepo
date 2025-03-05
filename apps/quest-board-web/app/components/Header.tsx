'use client';

import { useRouter } from 'next/navigation';
import styles from './Header.module.css';
import { logout } from '../lib/api';
import { Avatar } from './Avatar';

interface HeaderProps {
  user?: {
    displayName: string;
    avatarId: number;
    isProjectManager: boolean;
    isTeamMember: boolean;
  };
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      // Force a page reload to clear all state and redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error('Failed to logout:', error);
      // Even if logout fails, redirect to login
      window.location.href = '/login';
    }
  };

  const handleLogoClick = () => {
    router.push('/dashboard');
  };

  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <div className={styles.logo} onClick={handleLogoClick} role="button" tabIndex={0}>
          <h1>Quest Board</h1>
        </div>
        {user && (
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <Avatar avatarId={user.avatarId} size={40} className={styles.avatar} />
              <span className={styles.userName}>{user.displayName}</span>
            </div>
            <button
              className={styles.signOut}
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
} 