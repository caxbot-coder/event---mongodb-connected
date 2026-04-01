'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleAuthCallback = async () => {
            const access_token = searchParams.get('access_token');
            const refresh_token = searchParams.get('refresh_token');
            const error = searchParams.get('error');
            const redirectTo = searchParams.get('redirectTo') || '/';

            console.log('Auth callback tokens:', { access_token: !!access_token, refresh_token: !!refresh_token, error, redirectTo });

            if (error) {
                console.error('Auth error:', error);
                router.push('/');
                return;
            }

            if (access_token && refresh_token) {
                const { error } = await supabase.auth.setSession({
                    access_token,
                    refresh_token
                });

                if (error) {
                    console.error('Error setting session:', error);
                    router.push('/');
                    return;
                }

                console.log('Session set, redirecting to:', redirectTo);
                // Small delay to ensure session is set
                setTimeout(() => {
                    router.push(redirectTo);
                }, 100);
                return;
            }

            // If no tokens, check if we have a session and redirect accordingly
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push(redirectTo);
            } else {
                router.push('/');
            }
        };

        handleAuthCallback();
    }, [router, searchParams]);

    return (
        <div className="min-h-screen text-white flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                <p>Completing authentication...</p>
            </div>
        </div>
    );
}

export default function AuthCallback() {
    return (
        <Suspense fallback={
            <div className="min-h-screen text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
