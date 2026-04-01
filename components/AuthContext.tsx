'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User, UserMetadata } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface ExtendedUser extends User {
    user_metadata: UserMetadata & {
        isPremium?: boolean;
        full_name?: string;
    };
}

export type { ExtendedUser };

interface AuthContextType {
    isAuthModalOpen: boolean;
    openAuthModal: () => void;
    closeAuthModal: () => void;
    user: ExtendedUser | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [user, setUser] = useState<ExtendedUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const openAuthModal = () => setIsAuthModalOpen(true);
    const closeAuthModal = () => setIsAuthModalOpen(false);

    const signInWithGoogle = async () => {
        // Get current URL to determine redirect
        const currentUrl = window.location.href;
        const baseUrl = window.location.origin;
        const currentPath = window.location.pathname + window.location.search;
        
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${baseUrl}/auth/callback?redirectTo=${encodeURIComponent(currentPath)}`,
                skipBrowserRedirect: false
            }
        });
        
        if (error) {
            console.error('Error signing in with Google:', error);
        }
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error);
        }
    };

    useEffect(() => {
        // Check if this is an OAuth redirect
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const access_token = urlParams.get('access_token');
        const refresh_token = urlParams.get('refresh_token');
        
        console.log('Auth redirect check:', { code: !!code, error: !!error, access_token: !!access_token });
        
        // Get initial session
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
            
            // If we have tokens from OAuth, set the session
            if (access_token && refresh_token) {
                console.log('Setting session from OAuth tokens...');
                const { data, error } = await supabase.auth.setSession({
                    access_token,
                    refresh_token
                });
                
                if (!error && data.session?.user) {
                    console.log('Session set successfully');
                    setUser(data.session.user);
                    // Clear URL parameters but stay on current page
                    const url = new URL(window.location.href);
                    url.searchParams.delete('code');
                    url.searchParams.delete('error');
                    url.searchParams.delete('access_token');
                    url.searchParams.delete('refresh_token');
                    window.history.replaceState({}, document.title, url.toString());
                }
            }
        };

        getInitialSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log('Auth state change:', event, !!session?.user);
                setUser(session?.user ?? null);
                setLoading(false);
                
                if (event === 'SIGNED_IN') {
                    console.log('User signed in successfully');
                    closeAuthModal();
                }
                
                if (event === 'SIGNED_OUT') {
                    console.log('User signed out, redirecting to home...');
                    router.push('/');
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [router]);

    return (
        <AuthContext.Provider value={{ 
            isAuthModalOpen, 
            openAuthModal, 
            closeAuthModal, 
            user, 
            loading, 
            signInWithGoogle, 
            signOut 
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
