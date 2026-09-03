import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { liffService, type LineUserProfile } from '../services/liffService';
import type { Profile } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isConfigured: boolean;
  isLiffClient: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null; needsEmailConfirmation?: boolean }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithLine: (lineProfile: LineUserProfile) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (displayName: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiffClient, setIsLiffClient] = useState<boolean>(false);

  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
      } else if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // 2. Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error as Error | null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/login` : undefined;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) return { error: error as Error };

      // Check if session was created immediately or needs email confirmation
      const needsEmailConfirmation = !data.session && Boolean(data.user);
      return { error: null, needsEmailConfirmation };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      return { error: error as Error | null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured yet.') };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    return { error: error as Error | null };
  };

  const signInWithLine = async (lineProfile: LineUserProfile): Promise<{ error: Error | null }> => {
    if (!isSupabaseConfigured) {
      // Mock fallback when offline or Supabase not set
      const mockUser = {
        id: `line_${lineProfile.userId}`,
        email: `${lineProfile.userId}@line.local`,
      } as unknown as User;
      setUser(mockUser);
      setProfile({
        id: mockUser.id,
        display_name: lineProfile.displayName,
        avatar_url: lineProfile.pictureUrl || null,
        line_user_id: lineProfile.userId,
        line_display_name: lineProfile.displayName,
        line_picture_url: lineProfile.pictureUrl || null,
        role: 'user',
        is_suspended: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return { error: null };
    }

    try {
      const email = lineProfile.email || `line_${lineProfile.userId.toLowerCase()}@wordbuddy.line`;
      const deterministicPassword = `LINE_WB_${lineProfile.userId}_AUTH!`;

      // 1. Attempt login with deterministic credential
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password: deterministicPassword,
      });

      let authUserId = signInData?.user?.id;

      // 2. If user doesn't exist, sign them up
      if (signInErr || !authUserId) {
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email,
          password: deterministicPassword,
          options: {
            data: {
              display_name: lineProfile.displayName,
              avatar_url: lineProfile.pictureUrl || null,
            },
          },
        });

        if (!signUpErr && signUpData?.user) {
          authUserId = signUpData.user.id;
          // Set session if available
          if (signUpData.session) {
            setSession(signUpData.session);
            setUser(signUpData.user);
          }
        }
      }

      // 3. Upsert profile with LINE UID and display data
      if (authUserId) {
        await supabase.from('profiles').upsert({
          id: authUserId,
          display_name: lineProfile.displayName,
          avatar_url: lineProfile.pictureUrl || null,
          line_user_id: lineProfile.userId,
          line_display_name: lineProfile.displayName,
          line_picture_url: lineProfile.pictureUrl || null,
        });

        await fetchProfile(authUserId);
      }

      return { error: null };
    } catch (err) {
      console.error('Failed to sign in with LINE:', err);
      return { error: err as Error };
    }
  };

  // Auto-login if opened inside LINE LIFF
  useEffect(() => {
    const checkLiffAutoLogin = async () => {
      try {
        const hasLiff = await liffService.init();
        const inClient = liffService.isInClient();
        setIsLiffClient(inClient);

        if (hasLiff && inClient) {
          if (liffService.isLoggedIn()) {
            const lineProfile = await liffService.getProfile();
            if (lineProfile && !user) {
              await signInWithLine(lineProfile);
            }
          } else {
            liffService.login();
          }
        }
      } catch (err) {
        console.error('Error during LIFF auto-login check:', err);
      }
    };

    checkLiffAutoLogin();
  }, [user]);

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    liffService.logout();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (displayName: string) => {
    if (!user) return { error: new Error('Not authenticated') };
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user.id);

      if (error) return { error: error as Error };
      await fetchProfile(user.id);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isAdmin,
        isConfigured: isSupabaseConfigured,
        isLiffClient,
        signInWithPassword,
        signUp,
        resetPassword,
        signInWithGoogle,
        signInWithLine,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
