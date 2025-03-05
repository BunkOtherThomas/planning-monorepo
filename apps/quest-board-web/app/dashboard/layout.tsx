'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

  return (
    <div className={styles.dashboardLayout}>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
} 