'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from './Header';

interface User {
  id: string;
  displayName: string;
  avatarUrl?: string;
  isProjectManager: boolean;
  isTeamMember: boolean;
  hasCompletedOnboarding?: boolean;
}

const publicRoutes = ['/login', '/signup'];
const onboardingRoutes = ['/goals'];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const isPublicRoute = publicRoutes.includes(pathname);
  const isOnboardingRoute = onboardingRoutes.includes(pathname);

  useEffect(() => {
    // Check if user is logged in by looking for the auth token in cookies
    const cookies = document.cookie.split(';');
    const hasAuthToken = cookies.some(cookie => 
      cookie.trim().startsWith('auth-token=')
    );
    
    // If not logged in and not on a public route, redirect to login
    if (!hasAuthToken && !isPublicRoute) {
      router.push(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    // Set mock user data for now
    if (hasAuthToken) {
      setUser({
        id: '1',
        displayName: 'Test User',
        isProjectManager: true,
        isTeamMember: true,
        hasCompletedOnboarding: false, // This will come from the API
      });
    }
  }, [isPublicRoute, router, pathname]);

  // Handle onboarding redirection
  useEffect(() => {
    if (user && !isPublicRoute && !isOnboardingRoute) {
      if (user.isProjectManager && !user.hasCompletedOnboarding) {
        router.push('/goals');
      }
    }
  }, [user, isPublicRoute, isOnboardingRoute, router]);

  useEffect(() => {
    const checkUserTeam = async () => {
      if (user?.isProjectManager) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) return;

        try {
          const response = await fetch(`${apiUrl}/api/teams/check`, {
            credentials: 'include'
          });
          const data = await response.json();

          // If the user doesn't have a team with skills, redirect to goals
          if (!data.hasTeamWithSkills && !pathname.startsWith('/goals')) {
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
      {showHeader && <Header user={user} />}
      <main className="main-content">
        {children}
      </main>
    </>
  );
} 