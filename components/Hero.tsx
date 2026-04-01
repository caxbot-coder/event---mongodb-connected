import { ArrowRightIcon, PlayIcon, ZapIcon, CheckIcon } from 'lucide-react';
import { PrimaryButton, GhostButton } from './Buttons';
import { motion } from 'framer-motion';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import { useHotToast } from './HotToastContext';

export default function Hero() {
    const { openAuthModal, user } = useAuth();
    const router = useRouter();
    const { showHotToast } = useHotToast();

    const trustedUserImages = [
        'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=50',
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop'
    ];

    const mainImageUrl = 'https://media.giphy.com/media/xU203toNVrzqg/giphy.gif';

    const galleryStripImages = [
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=100',
        'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=100',
        'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=100',
    ];

    const trustedLogosText = [
        'Event Organizers',
        'Conference Planners',
        'Workshop Hosts',
        'Corporate Events',
        'Community Builders'
    ];

    const handleLearnMore = () => {
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleStartProject = () => {
        if (user) {
            router.push('/events');
        } else {
            openAuthModal();
        }
    };

    return (
        <>
            <section id="home" className="relative z-10">
                <div className="max-w-6xl mx-auto px-4 min-h-screen max-md:w-screen max-md:overflow-hidden pt-16 md:pt-26 flex items-center justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                        <div className="text-left">
                            
                            <motion.h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 max-w-xl"
                                initial={{ y: 60, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1, delay: 0.1 }}
                            >
                                Book & Manage <br />
                                <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-300 to-indigo-400">
                                    Amazing Events
                                </span>
                            </motion.h1>

                            <motion.p className="text-gray-300 max-w-lg mb-8"
                                initial={{ y: 60, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1, delay: 0.2 }}
                            >
                                Create, manage, and book tickets for unforgettable events. From conferences to workshops, 
                                streamline your entire event journey with our powerful booking platform.
                            </motion.p>

                            <motion.div className="flex flex-col sm:flex-row items-center gap-4 mb-8"
                                initial={{ y: 60, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1, delay: 0.3 }}
                            >
                                <PrimaryButton 
                                    onClick={handleStartProject}
                                    className="max-sm:w-full py-3 px-7"
                                >
                                    {user ? 'Browse Events' : 'Get Started'}
                                    <ArrowRightIcon className="size-4" />
                                </PrimaryButton>

                                <GhostButton className="max-sm:w-full max-sm:justify-center py-3 px-5" onClick={handleLearnMore}>
                                    <PlayIcon className="size-4" />
                                    Learn More
                                </GhostButton>
                            </motion.div>
                        </div>

                        {/* Right: modern mockup card */}
                        <motion.div className="mx-auto w-full max-w-lg"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1, delay: 0.5 }}
                        >
                            <motion.div className="rounded-3xl overflow-hidden border border-white/6 shadow-2xl bg-linear-to-b from-black/50 to-transparent">
                                <div className="relative aspect-16/10 bg-gray-900">
                                    <img
                                        src={mainImageUrl}
                                        alt="agency-work-preview"
                                        className="w-full h-full object-cover object-center"
                                    />

                                    <div className="absolute left-4 top-4 px-3 py-1 rounded-full bg-black/15 backdrop-blur-sm text-xs">
                                        Events • Booking • Management
                                    </div>

                                    <div className="absolute right-4 bottom-4">
                                        <button className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white/6 backdrop-blur-sm hover:bg-white/10 transition focus:outline-none">
                                            <PlayIcon className="size-4" />
                                            <span className="text-xs">View events</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* LOGO MARQUEE */}
            <motion.section className="border-y border-white/6 bg-white/1 max-md:mt-10"
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1, delay: 0.6 }}
            >
                <div className="max-w-6xl mx-auto px-6">
                    <div className="w-full overflow-hidden py-6">
                        <div className="flex gap-14 items-center justify-center animate-marquee whitespace-nowrap">
                            {trustedLogosText.concat(trustedLogosText).map((logo, i) => (
                                <span
                                    key={i}
                                    className="mx-6 text-sm md:text-base font-semibold text-gray-400 hover:text-gray-300 tracking-wide transition-colors"
                                >
                                    {logo}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.section>
        </>
    );
};