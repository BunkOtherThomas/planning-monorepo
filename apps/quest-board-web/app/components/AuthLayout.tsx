'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Banner from './Banner';

const publicRoutes = ['/login', '/signup'];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    // Check if user is logged in by looking for the auth token in cookies
    const token = document.cookie.includes('token=');
    
    // If not logged in and not on a public route, redirect to login
    if (!token && !isPublicRoute) {
      router.push('/login');
    }
  }, [isPublicRoute, router]);

  // Show banner on all routes except public routes
  const showBanner = !isPublicRoute;

  return (
    <>
      {showBanner && <Banner />}
      <main className="main-content">
        {children}
      </main>
    </>
  );
} 