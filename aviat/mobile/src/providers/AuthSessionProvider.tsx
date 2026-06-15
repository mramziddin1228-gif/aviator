import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';

import { appStartTheme } from '../../theme/appStartTheme';
import { loadProfile, type Profile } from '../lib/auth';
import { supabase } from '../lib/supabase';

type AuthSessionContextValue = {
  isReady: boolean;
  profile: Profile | null;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
  session: Session | null;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

async function safeLoadProfile(userId: string) {
  try {
    return await loadProfile(userId);
  } catch {
    return null;
  }
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const loadSessionProfile = async (userId: string | null) => {
    if (!userId) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    const nextProfile = await safeLoadProfile(userId);
    setProfile(nextProfile);
    setProfileLoading(false);
  };

  useEffect(() => {
    let active = true;
    let readyTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const bootstrap = async () => {
      try {
        const {
          data: { session: nextSession },
        } = await supabase.auth.getSession();

        if (!active) {
          return;
        }

        setSession(nextSession ?? null);

        if (nextSession?.user?.id) {
          setProfileLoading(true);
          const nextProfile = await safeLoadProfile(nextSession.user.id);

          if (!active) {
            return;
          }

          setProfile(nextProfile);
          setProfileLoading(false);
        } else {
          setProfile(null);
          setProfileLoading(false);
        }
      } finally {
        if (active) {
          readyTimeoutId = setTimeout(() => {
            if (!active) {
              return;
            }

            setIsReady(true);
          }, appStartTheme.boot.extendAfterSystemReadyMs);
        }
      }
    };

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) {
        return;
      }

      setSession(nextSession);

      if (!nextSession?.user?.id) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      void safeLoadProfile(nextSession.user.id).then((nextProfile) => {
        if (!active) {
          return;
        }

        setProfile(nextProfile);
        setProfileLoading(false);
      });
    });

    return () => {
      active = false;

      if (readyTimeoutId) {
        clearTimeout(readyTimeoutId);
      }

      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    await loadSessionProfile(session?.user?.id ?? null);
  };

  return (
    <AuthSessionContext.Provider
      value={{
        isReady,
        profile,
        profileLoading,
        refreshProfile,
        session,
      }}
    >
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const value = useContext(AuthSessionContext);

  if (!value) {
    throw new Error('useAuthSession must be used inside AuthSessionProvider');
  }

  return value;
}
