'use client';

import { useEffect, useState } from 'react';
import AdventurerDashboard from '../components/AdventurerDashboard';
import GuildLeaderDashboard from '../components/GuildLeaderDashboard';

export default function Dashboard() {
  const [userRole, setUserRole] = useState<'adventurer' | 'guild_leader' | null>(null);

  useEffect(() => {
    // For now, we'll just use a placeholder role
    // Later, this will be fetched from the API or user context
    setUserRole('guild_leader');
  }, []);

  if (!userRole) {
    return null; // or a loading state
  }

  return userRole === 'adventurer' ? <AdventurerDashboard /> : <GuildLeaderDashboard />;
} 