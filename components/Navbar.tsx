'use client';
import { MenuIcon, XIcon, UserIcon, ChevronDownIcon, Crown } from 'lucide-react';
import { PrimaryButton } from './Buttons';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import AuthModal from './AuthModal';
import { useAuth } from './AuthContext';
import { readResponseJson } from '@/lib/read-response-json';

type TicketInfo = {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    slotNumber: number | null;
    isWinner?: boolean;
    winnerSlot?: number | null;
};

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false);
    const [tickets, setTickets] = useState<TicketInfo[]>([]);
    const [ticketsLoading, setTicketsLoading] = useState(false);
    const [ticketsError, setTicketsError] = useState('');
    const [activeTicket, setActiveTicket] = useState<TicketInfo | null>(null);
    const [winningTickets, setWinningTickets] = useState<TicketInfo[]>([]);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const { isAuthModalOpen, openAuthModal, closeAuthModal, user, signOut } = useAuth();
    const isPremium = user?.user_metadata?.isPremium || user?.user_metadata?.is_premium || false;

    const navLinks = [
        { name: 'Home', href: '/#' },
        { name: 'Events', href: '/events' },
        { name: 'Features', href: '/#features' },
        { name: 'Pricing', href: '/#pricing' },
        { name: 'FAQ', href: '/#faq' },
    ];

    const getUserSlotFromEvent = (event: any, userId: string | undefined): number | null => {
        if (!userId || !event?.slots) return null;
        for (const [slotKey, value] of Object.entries(event.slots as Record<string, string>)) {
            if (value === userId) {
                const parsed = parseInt(slotKey, 10);
                return Number.isFinite(parsed) ? parsed : null;
            }
        }
        return null;
    };

    const openTicketsModal = async () => {
        if (!user) return;
        setIsTicketsModalOpen(true);
        setTicketsLoading(true);
        setTicketsError('');
        try {
            const stored = localStorage.getItem(`joinedEvents_${user.id}`);
            const joinedIds: string[] = stored ? JSON.parse(stored) : [];

            if (!joinedIds.length) {
                setTickets([]);
                setActiveTicket(null);
                return;
            }

            const response = await fetch('/api/events');
            if (!response.ok) {
                throw new Error('Failed to load events');
            }
            const data = await readResponseJson<{ events?: unknown[] }>(response);
            const events = data.events || [];

            const userTickets: TicketInfo[] = events
                .filter((e: any) => joinedIds.includes(e.id))
                .map((e: any) => ({
                    id: e.id,
                    title: e.title,
                    date: new Date(e.date).toLocaleDateString(),
                    time: e.time,
                    location: e.location,
                    slotNumber: getUserSlotFromEvent(e, user.id),
                    isWinner: e.winnerUserId === user.id,
                    winnerSlot:
                        e.winnerUserId === user.id
                            ? (typeof e.winnerSlot === 'number'
                                ? e.winnerSlot
                                : getUserSlotFromEvent(e, user.id))
                            : null,
                }));

            setTickets(userTickets);
            setActiveTicket(userTickets[0] || null);
            setWinningTickets(userTickets.filter((t) => t.isWinner));
        } catch (err) {
            console.error(err);
            setTicketsError('Failed to load your tickets. Please try again.');
        } finally {
            setTicketsLoading(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <motion.nav className='fixed top-5 left-0 right-0 z-50 px-4'
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1 }}
        >
            <div className='max-w-6xl mx-auto flex items-center justify-between bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-3'>
                <a href='/#' className="flex-shrink-0">
                    <img src='/logo.svg' alt="logo" className="h-8" />
                </a>

                <div className='hidden md:flex items-center justify-center flex-1 px-8'>
                    <div className='flex items-center gap-8 text-sm font-medium text-gray-300'>
                        {navLinks.map((link) => (
                            <a href={link.href} key={link.name} className="hover:text-white transition">
                                {link.name}
                            </a>
                        ))}
                    </div>
                </div>

                <div className='hidden md:flex items-center gap-3'>
                    {user ? (
                        <div className="relative" ref={profileMenuRef}>
                            <button 
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className='flex items-center px-2 py-1 rounded-lg hover:bg-white/10 transition-colors relative'
                            >
                                <img 
                                    src="https://cdn-icons-png.flaticon.com/128/5337/5337039.png" 
                                    alt="Profile" 
                                    className="w-6 h-6"
                                />
                                {isPremium && (
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400/20 border-2 border-yellow-400 rounded-full flex items-center justify-center"
                                    >
                                        <motion.div
                                            animate={{ 
                                                rotate: [0, 5, -5, 0],
                                                scale: [1, 1.1, 1.05, 1]
                                            }}
                                            transition={{ 
                                                duration: 3, 
                                                repeat: Infinity, 
                                                ease: "easeInOut",
                                                times: [0, 0.25, 0.75, 1]
                                            }}
                                        >
                                            <Crown className="w-3 h-3 text-yellow-400" fill="none" strokeWidth={2} />
                                        </motion.div>
                                    </motion.div>
                                )}
                            </button>
                            
                            {isProfileMenuOpen && (
                                <motion.div 
                                    className="absolute right-0 mt-2 w-48 bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl shadow-lg z-50"
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    transition={{ 
                                        duration: 0.2, 
                                        ease: [0.4, 0, 0.2, 1]
                                    }}
                                >
                                    <motion.div 
                                        className="p-3 border-b border-white/10"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.1, duration: 0.15 }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-white">
                                                {user.user_metadata?.full_name || user.email}
                                            </p>
                                            {isPremium && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                                                    className="flex items-center gap-1"
                                                >
                                                    <motion.div
                                                        animate={{ rotate: [0, 10, -10, 0] }}
                                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                        className="p-1"
                                                    >
                                                        <Crown className="w-4 h-4 text-yellow-400" fill="none" strokeWidth={2} />
                                                    </motion.div>
                                                </motion.div>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400">{user.email}</p>
                                    </motion.div>
                                    <motion.div 
                                        className="py-2"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.15, duration: 0.15 }}
                                    >
                                        <button
                                            onClick={() => {
                                                setIsProfileMenuOpen(false);
                                                openTicketsModal();
                                            }}
                                            className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors rounded-lg"
                                        >
                                            My Tickets
                                        </button>
                                        {isPremium && (
                                            <a 
                                                href="/events/create"
                                                className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors rounded-lg"
                                            >
                                                Create Event
                                            </a>
                                        )}
                                        <button 
                                            onClick={() => {
                                                setIsProfileMenuOpen(false);
                                                signOut();
                                            }}
                                            className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors rounded-lg"
                                        >
                                            Sign Out
                                        </button>
                                    </motion.div>
                                </motion.div>
                            )}
                        </div>
                    ) : (
                        <button 
                            onClick={openAuthModal}
                            className='text-sm font-medium text-gray-300 hover:text-white transition max-sm:hidden pr-4'
                        >
                            Sign in
                        </button>
                    )}
                </div>

                <button onClick={() => setIsOpen(!isOpen)} className='md:hidden'>
                    <MenuIcon className='size-6' />
                </button>
            </div>
            <div className={`fixed inset-y-0 right-0 w-64 bg-black/40 backdrop-blur-sm border border-white/10 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="flex flex-col h-full">
                    {/* Header with close button */}
                    <div className="flex items-center justify-end p-4 border-b border-white/10">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                    
                    {/* Navigation Links */}
                    <div className="flex-1 py-4">
                        {navLinks.map((link) => (
                            <a key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="block px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* User Section */}
                    {user ? (
                        <div className="border-t border-white/10 p-4 space-y-3">
                            <div className="flex items-center space-x-3 px-2">
                                <div className="relative">
                                    <img 
                                        src="https://cdn-icons-png.flaticon.com/128/5337/5337039.png" 
                                        alt="Profile" 
                                        className="w-8 h-8"
                                    />
                                    {isPremium && (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                            className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400/20 border-2 border-yellow-400 rounded-full flex items-center justify-center"
                                        >
                                            <motion.div
                                                animate={{ 
                                                    rotate: [0, 5, -5, 0],
                                                    scale: [1, 1.1, 1.05, 1]
                                                }}
                                                transition={{ 
                                                    duration: 3, 
                                                    repeat: Infinity, 
                                                    ease: "easeInOut",
                                                    times: [0, 0.25, 0.75, 1]
                                                }}
                                            >
                                                <Crown className="w-3 h-3 text-yellow-400" fill="none" strokeWidth={2} />
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-white">
                                            {user.user_metadata?.full_name || user.email}
                                        </p>
                                        {isPremium && (
                                            <motion.div
                                                animate={{ 
                                                    rotate: [0, 5, -5, 0],
                                                    scale: [1, 1.1, 1.05, 1]
                                                }}
                                                transition={{ 
                                                    duration: 3, 
                                                    repeat: Infinity, 
                                                    ease: "easeInOut",
                                                    times: [0, 0.25, 0.75, 1]
                                                }}
                                                className="p-1"
                                            >
                                                <Crown className="w-4 h-4 text-yellow-400" fill="none" strokeWidth={2} />
                                            </motion.div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400">{user.email}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        openTicketsModal();
                                    }}
                                    className='w-full flex items-center justify-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors'
                                >
                                    My Tickets
                                </button>
                                {isPremium && (
                                    <a 
                                        href="/events/create"
                                        onClick={() => setIsOpen(false)}
                                        className='w-full flex items-center justify-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors'
                                    >
                                        Create Event
                                    </a>
                                )}
                            </div>
                            <button 
                                onClick={() => {
                                    setIsOpen(false);
                                    signOut();
                                }} 
                                className='w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors'
                            >
                                <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="border-t border-white/10 p-4">
                            <button 
                                onClick={() => {
                                    setIsOpen(false);
                                    openAuthModal();
                                }} 
                                className='w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors'
                            >
                                Sign in
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {isTicketsModalOpen && user && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsTicketsModalOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 20 }}
                        transition={{ type: 'spring', duration: 0.5, damping: 25 }}
                        className="fixed inset-0 z-[61] flex items-center justify-center px-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-black/50 backdrop-blur-md border border-white/4 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden">
                        <div className="flex items-center justify-between mb-4 px-5 pt-4">
                            <div>
                                <p className="text-[11px] sm:text-xs uppercase tracking-[0.35em] text-indigo-100/70 mb-1">
                                    Profile
                                </p>
                                <h2 className="text-xl sm:text-2xl font-bold text-white">
                                    My Event Tickets
                                </h2>
                            </div>
                            <button
                                onClick={() => setIsTicketsModalOpen(false)}
                                className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-indigo-100 transition-colors"
                            >
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>

                        {ticketsLoading ? (
                            <div className="flex items-center justify-center py-10 px-6 pb-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                            </div>
                        ) : ticketsError ? (
                            <p className="text-sm text-red-200 py-4 px-6 pb-8">{ticketsError}</p>
                        ) : tickets.length === 0 ? (
                            <p className="text-sm text-indigo-100/80 py-4 px-6 pb-8">
                                You don&apos;t have any tickets yet. Join an event to see your tickets here.
                            </p>
                        ) : (
                            <div className="space-y-5 mt-2 px-5 pb-6">
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div className="md:col-span-2 space-y-2 max-h-72 overflow-y-auto pr-1">
                                    {tickets.map((ticket) => (
                                        <button
                                            key={ticket.id}
                                            type="button"
                                            onClick={() => setActiveTicket(ticket)}
                                            className={`w-full text-left px-3 py-2.5 rounded-xl border text-xs sm:text-sm transition-colors ${
                                                activeTicket?.id === ticket.id
                                                    ? 'border-indigo-400/80 bg-indigo-900/40 text-white'
                                                    : 'border-white/10 bg-black/20 text-indigo-100/80 hover:border-indigo-300/70 hover:bg-black/40'
                                            }`}
                                        >
                                            <p className="font-semibold truncate">{ticket.title}</p>
                                            <p className="text-[11px] sm:text-xs text-indigo-100/70 mt-0.5 truncate">
                                                {ticket.date} • {ticket.time}
                                            </p>
                                            <p className="text-[11px] sm:text-xs text-indigo-100/60 truncate">
                                                {ticket.location}
                                            </p>
                                        </button>
                                    ))}
                                </div>

                                {activeTicket && (
                                    <div className="md:col-span-3">
                                        <div className="relative bg-black/25 rounded-2xl p-4 sm:p-5 border border-white/15">
                                            <p className="text-[11px] sm:text-xs text-indigo-100/80 mb-1 tracking-wide">
                                                ENTRY PASS • PREMIUM EVENT
                                            </p>
                                            <p className="text-lg sm:text-xl font-semibold text-white mb-2 line-clamp-2">
                                                {activeTicket.title}
                                            </p>
                                            <div className="space-y-1 text-[11px] sm:text-xs text-indigo-100/90 mb-3">
                                                <p>
                                                    <span className="font-medium">Date:</span> {activeTicket.date}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Time:</span> {activeTicket.time}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Location:</span> {activeTicket.location}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Slot:</span> {activeTicket.slotNumber ?? '-'}
                                                </p>
                                                <p>
                                                    <span className="font-medium">User ID:</span>{' '}
                                                    <span className="font-mono break-all">{user.id}</span>
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between text-[11px] sm:text-xs text-indigo-100/80">
                                                <span>Show this pass at entry</span>
                                                <span className="font-mono opacity-80">
                                                    Slot #{activeTicket.slotNumber ?? '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                </div>

                                {winningTickets.length > 0 && (
                                    <div className="border-t border-white/10 pt-4">
                                        <h3 className="text-sm font-semibold text-white mb-3">
                                            My Winnings
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {winningTickets.map((ticket) => (
                                                <div
                                                    key={ticket.id}
                                                    className="relative bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/60 rounded-xl p-3 text-[11px] sm:text-xs text-yellow-50"
                                                >
                                                    <p className="uppercase tracking-[0.25em] text-yellow-200/90 mb-1">
                                                        Winner Certificate
                                                    </p>
                                                    <p className="text-sm font-semibold text-white mb-1 line-clamp-2">
                                                        {ticket.title}
                                                    </p>
                                                    <p className="text-yellow-100/90">
                                                        <span className="font-medium">Date:</span> {ticket.date}
                                                    </p>
                                                    <p className="text-yellow-100/90">
                                                        <span className="font-medium">Slot:</span>{' '}
                                                        {ticket.winnerSlot ?? ticket.slotNumber ?? '-'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        </div>
                    </motion.div>
                </motion.div>
            )}

            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={closeAuthModal} 
            />
        </motion.nav>
    );
};