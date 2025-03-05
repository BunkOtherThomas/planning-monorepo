'use client';

import { useEffect, useState } from 'react';
import AdventurerDashboard from '../components/AdventurerDashboard';
import GuildLeaderDashboard from '../components/GuildLeaderDashboard';
import { getCurrentUser } from '../lib/api';

export default function Dashboard() {
  const [userRole, setUserRole] = useState<'adventurer' | 'guild_leader' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const user = await getCurrentUser();
        setUserRole(user.isProjectManager ? 'guild_leader' : 'adventurer');
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

  if (!userRole) {
    return <div>Error loading user role</div>;
  }

  return userRole === 'adventurer' ? <AdventurerDashboard /> : <GuildLeaderDashboard />;
} 