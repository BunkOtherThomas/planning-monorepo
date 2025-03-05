'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styles from './dashboard.module.css';

interface User {
  id: string;
  displayName: string;
  avatarId?: number;
  isProjectManager: boolean;
  isTeamMember: boolean;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'guild-leader' | 'adventurer'>('guild-leader');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // TODO: Fetch user data from API or context
    // For now, we'll use mock data
    setUser({
      id: '1',
      displayName: 'Test User',
      isProjectManager: true,
      isTeamMember: true,
    });
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  const showTabs = user.isProjectManager && user.isTeamMember;
  const isGuildLeaderRoute = pathname.includes('/guild-leader');
  const isAdventurerRoute = pathname.includes('/adventurer');

  const handleTabChange = (tab: 'guild-leader' | 'adventurer') => {
    setActiveTab(tab);
    router.push(`/dashboard/${tab}`);
  };

  return (
    <div className={styles.dashboardLayout}>
      {showTabs && (
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${isGuildLeaderRoute ? styles.active : ''}`}
            onClick={() => handleTabChange('guild-leader')}
          >
            Guild Leader
          </button>
          <button
            className={`${styles.tab} ${isAdventurerRoute ? styles.active : ''}`}
            onClick={() => handleTabChange('adventurer')}
          >
            Adventurer
          </button>
        </div>
      )}

      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
} 