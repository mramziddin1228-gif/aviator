'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { readNativeBridgeContext } from '@/lib/nativeBridge';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/registration', '/admin'];

// Routes that authenticated users should be redirected away from
const authRoutes = ['/', '/login', '/registration'];

async function waitForNativeBridgeContext(timeoutMs = 1600, intervalMs = 50) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
        const context = readNativeBridgeContext();

        if (context?.session) {
            return context;
        }

        await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    return readNativeBridgeContext();
}

function notifyNativeBridge(type: string, payload?: Record<string, unknown>) {
    if (typeof window === 'undefined') {
        return;
    }

    window.AviatorNativeBridge?.notify?.(type, payload ?? null);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        let cancelled = false;
        const nativeRouteFlag =
            typeof window !== 'undefined'
                ? new URLSearchParams(window.location.search).get('native')
                : null;
        const isNativeBridgeRoute =
            nativeRouteFlag === '1' ||
            (typeof window !== 'undefined' && Boolean(window.ReactNativeWebView));

        // Get initial session
        const getSession = async () => {
            let currentSession = (await supabase.auth.getSession()).data.session;
            let nativeBridgeContext = readNativeBridgeContext();

            if (!currentSession && isNativeBridgeRoute && !nativeBridgeContext?.session) {
                nativeBridgeContext = await waitForNativeBridgeContext();
            }

            if (!currentSession && nativeBridgeContext?.session) {
                const { data, error } = await supabase.auth.setSession({
                    access_token: nativeBridgeContext.session.accessToken,
                    refresh_token: nativeBridgeContext.session.refreshToken,
                });

                if (!error) {
                    currentSession = data.session;
                    notifyNativeBridge('native-auth-bootstrap-success', {
                        userId: data.session?.user.id ?? null,
                    });
                } else {
                    console.error('Failed to hydrate native Aviator session', error);
                    notifyNativeBridge('native-auth-bootstrap-error', {
                        message: error.message,
                    });
                }
            } else if (!currentSession && isNativeBridgeRoute) {
                notifyNativeBridge('native-auth-bootstrap-error', {
                    message: 'Bridge context was not received by the web app',
                });
            }

            if (!currentSession && isNativeBridgeRoute && nativeBridgeContext?.session) {
                const fallbackSession = (await supabase.auth.getSession()).data.session;

                if (fallbackSession) {
                    currentSession = fallbackSession;
                }
            }

            if (cancelled) {
                return;
            }

            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            setLoading(false);

            // Handle redirects based on auth state
            if (currentSession?.user) {
                // User is authenticated
                if (authRoutes.includes(pathname)) {
                    router.replace('/games/aviator');
                }
            } else {
                // User is not authenticated
                if (!publicRoutes.includes(pathname) && !isNativeBridgeRoute) {
                    router.replace('/');
                }
            }
        };

        void getSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (cancelled) {
                    return;
                }

                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);

                if (event === 'SIGNED_IN') {
                    router.replace('/games/aviator');
                } else if (event === 'SIGNED_OUT' && !isNativeBridgeRoute) {
                    router.replace('/');
                }
            }
        );

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        };
    }, [pathname, router]);

    const signOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
