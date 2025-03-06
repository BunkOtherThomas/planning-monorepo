'use client';

import { useRouter } from 'next/navigation';
import styles from './Header.module.css';
import { logout } from '../lib/api';
import { Avatar } from '../../components/Avatar';
import { User } from '@quest-board/types';

interface HeaderProps {
  user?: User;
  currentView?: 'guild_leader' | 'adventurer';
  onViewChange?: (view: 'guild_leader' | 'adventurer') => void;
}

export default function Header({ user, currentView, onViewChange }: HeaderProps) {
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

  const handleViewToggle = () => {
    if (!onViewChange) return;
    onViewChange(currentView === 'guild_leader' ? 'adventurer' : 'guild_leader');
  };

  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <div className={styles.logo} onClick={handleLogoClick} role="button" tabIndex={0}>
          <h1>Quest Board</h1>
        </div>
        {user && (
          <div className={styles.userSection}>
            {user.isProjectManager && (
              <button
                className={styles.toggleButton}
                onClick={handleViewToggle}
              >
                Switch to {currentView === 'guild_leader' ? 'Adventurer' : 'Guild Leader'} View
              </button>
            )}
            <div className={styles.userInfo}>
              <Avatar avatarId={user.avatarId ?? 0} size={40} className={styles.avatar} />
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