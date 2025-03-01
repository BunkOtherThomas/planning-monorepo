'use client';

import { FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '../lib/api';
import styles from './Header.module.css';

interface User {
  id: string;
  displayName: string;
  avatarUrl?: string;
  isProjectManager: boolean;
  isTeamMember: boolean;
}

interface HeaderProps {
  user: User;
}

const Header: FC<HeaderProps> = ({ user }) => {
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
    <header className={styles.header}>
      <div className={styles.content}>
        <div className={styles.logo}>
          <Link href="/dashboard">
            <h1>Quest Board</h1>
          </Link>
        </div>
        
        <div className={styles.userActions}>
          <button className={styles.notifications} aria-label="Notifications">
            <span>🔔</span>
          </button>
          
          <Link href="/profile" className={styles.profileLink}>
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user.displayName} 
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {user.displayName[0].toUpperCase()}
              </div>
            )}
          </Link>
          
          <button 
            className={styles.signOut}
            onClick={handleLogout}
          >
            Leave the Realm
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 