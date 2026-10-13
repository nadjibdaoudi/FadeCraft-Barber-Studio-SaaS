import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { FullScreenMessage, LoginScreen, NoAccessScreen } from './LoginScreen';

// Put this file at: src/components/AuthGate.tsx
// Shows the app only to a signed-in user who belongs to a salon.

export const AuthGate: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { loading, session, user, role, membershipLoading, isRecovery, signOut } = useAuth();

  if (loading) return <FullScreenMessage text="Loading..." />;

  // Not signed in, or opened from a password-reset link
  if (!session || isRecovery) return <LoginScreen />;

  if (membershipLoading) return <FullScreenMessage text="Loading your salon..." />;

  // Signed in, but the email is not linked to any salon
  if (!role) return <NoAccessScreen email={user?.email ?? ''} onSignOut={signOut} />;

  return <>{children}</>;
};
