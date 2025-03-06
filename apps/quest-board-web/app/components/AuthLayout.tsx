'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from './Header';
import { checkTeamStatus } from '../lib/api';
import { User } from '@quest-board/types';
import { DashboardProvider } from '../contexts/DashboardContext';

const publicRoutes = ['/login', '/signup'];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'adventurer' | 'guild_leader'>('guild_leader');
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    const checkAuth = async () => {
      // Check if user is logged in by looking for the auth token in cookies
      const cookies = document.cookie.split(';');
      const authToken = cookies
        .find(cookie => cookie.trim().startsWith('auth-token='))
        ?.split('=')[1];

      if (!authToken && !isPublicRoute) {
        router.push(`/login?from=${encodeURIComponent(pathname)}`);
        return;
      }

      if (authToken && isPublicRoute) {
        router.push('/dashboard');
        return;
      }

      // If we have a token and we're not on a public route, fetch user data
      if (authToken && !isPublicRoute) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${authToken}`
            },
            credentials: 'include'
          });

          if (response.ok) {
            const userData = await response.json();
            setUser({
              ...userData,
              avatarId: userData.avatarId || 0 // Default to first avatar if none selected
            });
            // Set initial view based on user role
            setCurrentView(userData.isProjectManager ? 'guild_leader' : 'adventurer');
          } else {
            // If we can't get user data, clear the token and redirect to login
            document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            router.push('/login');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          router.push('/login');
        }
      }
    };

    checkAuth();
  }, [isPublicRoute, router, pathname]);

  useEffect(() => {
    const checkUserTeam = async () => {
      if (user?.isProjectManager) {
        try {
          const { hasTeamWithSkills } = await checkTeamStatus();

          // If the user doesn't have a team with skills, redirect to goals
          if (!hasTeamWithSkills && !pathname.startsWith('/goals')) {
            router.push('/goals');
          }
        } catch (error) {
          console.error('Error checking team status:', error);
        }
      }
    };

    checkUserTeam();
  }, [user, router, pathname]);

  // Show header on all routes except public routes
  const showHeader = !isPublicRoute && user;

  return (
    <>
      {showHeader && (
        <Header 
          user={user} 
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      )}
      <DashboardProvider currentView={currentView} setCurrentView={setCurrentView}>
        <main className="main-content">
          {children}
        </main>
      </DashboardProvider>
    </>
  );
} 