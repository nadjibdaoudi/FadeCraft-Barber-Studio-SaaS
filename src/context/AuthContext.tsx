import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

// Put this file at: src/context/AuthContext.tsx

export type Role = 'owner' | 'staff';

interface Membership {
  userId: string;
  shopId: number;
  role: Role;
}

interface AuthContextType {
  loading: boolean; // still checking for a saved login
  session: Session | null;
  user: User | null;
  role: Role | null;
  isOwner: boolean;
  shopId: number | null;
  membershipLoading: boolean; // logged in, but still loading which salon/role
  isRecovery: boolean; // opened from a "reset password" email link

  // Each method returns an error message (or null on success)
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const friendlyAuthError = (message: string): string => {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Wrong email or password.';
  if (m.includes('email not confirmed')) return 'Please confirm your email first. Check your inbox.';
  if (m.includes('database error saving new user') || m.includes('not been invited')) {
    return 'This email has not been invited. Ask the salon owner to add it.';
  }
  if (m.includes('already registered')) return 'This email is already registered. Sign in instead.';
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Too many attempts. Please wait a few minutes and try again.';
  }
  if (m.includes('failed to fetch') || m.includes('network')) {
    return 'Network problem. Check your connection and try again.';
  }
  return message;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);

  // Which user the loaded membership belongs to (so a new login never shows the previous one)
  const [membershipState, setMembershipState] = useState<{ userId: string; membership: Membership | null } | null>(
    null
  );

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === 'PASSWORD_RECOVERY') setIsRecovery(true);
      if (event === 'SIGNED_OUT') setIsRecovery(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user?.id ?? null;

  // Load which salon and role this user has. Done in an effect (not inside the auth callback).
  useEffect(() => {
    if (!userId) {
      setMembershipState(null);
      return;
    }
    let active = true;

    supabase
      .from('shop_members')
      .select('shop_id, role')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data, error }: { data: any; error: any }) => {
        if (!active) return;
        if (error) console.error('Loading salon membership failed:', error);
        setMembershipState({
          userId,
          membership: data ? { userId, shopId: Number(data.shop_id), role: data.role as Role } : null
        });
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const membershipLoading = userId !== null && membershipState?.userId !== userId;
  const membership = membershipState && membershipState.userId === userId ? membershipState.membership : null;

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    return error ? friendlyAuthError(error.message) : null;
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { emailRedirectTo: window.location.origin }
    });
    if (error) return { error: friendlyAuthError(error.message), needsConfirmation: false };

    // Supabase returns an empty identities list when the email already has an account
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return { error: 'This email is already registered. Sign in instead.', needsConfirmation: false };
    }
    return { error: null, needsConfirmation: !data.session };
  };

  const signOut = async () => {
    setIsRecovery(false);
    await supabase.auth.signOut();
  };

  const sendPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: window.location.origin
    });
    return error ? friendlyAuthError(error.message) : null;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return friendlyAuthError(error.message);
    setIsRecovery(false);
    return null;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    return error ? friendlyAuthError(error.message) : null;
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        session,
        user: session?.user ?? null,
        role: membership?.role ?? null,
        isOwner: membership?.role === 'owner',
        shopId: membership?.shopId ?? null,
        membershipLoading,
        isRecovery,
        signIn,
        signUp,
        signOut,
        sendPasswordReset,
        updatePassword,
        signInWithGoogle
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
