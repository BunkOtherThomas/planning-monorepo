'use client';

import { useEffect, useState } from 'react';
import AdventurerDashboard from '../components/AdventurerDashboard';
import GuildLeaderDashboard from '../components/GuildLeaderDashboard';
import { getCurrentUser } from '../lib/api';
import { User } from '@quest-board/types';

export default function Dashboard() {
  const [userRole, setUserRole] = useState<'adventurer' | 'guild_leader' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        setUserRole(userData.isProjectManager ? 'guild_leader' : 'adventurer');
      } catch (error) {
        console.error('Failed to fetch user role:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!userRole || !user) {
    return <div>Error loading user data</div>;
  }

  return userRole === 'adventurer' ? <AdventurerDashboard user={user} /> : <GuildLeaderDashboard />;
} 