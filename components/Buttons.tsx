import React from 'react'
import { useAuthProtection } from '@/hooks/useAuthProtection'

export const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
    requireAuth?: boolean;
    requirePremium?: boolean;
    onAuthenticatedClick?: () => void;
}> = ({ children, className, requireAuth, requirePremium, onAuthenticatedClick, onClick, ...props }) => {
    const { requireAuth: checkAuth, requirePremium: checkPremium } = useAuthProtection();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (requireAuth && !checkAuth()) return;
        if (requirePremium && !checkPremium()) return;
        
        if (onAuthenticatedClick) {
            onAuthenticatedClick();
        } else if (onClick) {
            onClick(e);
        }
    };

    return (
        <button 
            className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium bg-linear-to-br from-indigo-500 to-indigo-600 hover:opacity-90 active:scale-95 transition-all ${className}`} 
            onClick={handleClick}
            {...props} 
        >
            {children}
        </button>
    );
};

export const GhostButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
    requireAuth?: boolean;
    requirePremium?: boolean;
    onAuthenticatedClick?: () => void;
}> = ({ children, className, requireAuth, requirePremium, onAuthenticatedClick, onClick, ...props }) => {
    const { requireAuth: checkAuth, requirePremium: checkPremium } = useAuthProtection();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (requireAuth && !checkAuth()) return;
        if (requirePremium && !checkPremium()) return;
        
        if (onAuthenticatedClick) {
            onAuthenticatedClick();
        } else if (onClick) {
            onClick(e);
        }
    };

    return (
        <button 
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border border-white/10 bg-white/3 hover:bg-white/6 backdrop-blur-sm active:scale-95 transition ${className}`} 
            onClick={handleClick}
            {...props} 
        >
            {children}
        </button>
    );
};