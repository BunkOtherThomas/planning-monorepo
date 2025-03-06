'use client';

import { createContext, useContext, ReactNode } from 'react';

type DashboardView = 'adventurer' | 'guild_leader';

interface DashboardContextType {
  currentView: DashboardView;
  setCurrentView: (view: DashboardView) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ 
  children, 
  currentView, 
  setCurrentView 
}: { 
  children: ReactNode;
  currentView: DashboardView;
  setCurrentView: (view: DashboardView) => void;
}) {
  return (
    <DashboardContext.Provider value={{ currentView, setCurrentView }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
} 