'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldIcon, EyeIcon, LockIcon, DatabaseIcon, UserIcon, GlobeIcon, ChevronDownIcon } from 'lucide-react';
import { useRef, useState } from 'react';

export default function PrivacyPolicy() {
    const refs = useRef<(HTMLDetailsElement | null)[]>([]);
    const [openItem, setOpenItem] = useState<number | null>(null);

    const toggleItem = (index: number) => {
        setOpenItem(openItem === index ? null : index);
    };

    const privacySections = [
        {
            icon: <DatabaseIcon className="w-6 h-6 text-indigo-400" />,
            title: "Information We Collect",
            content: (
                <div className="space-y-4">
                    <p>
                        We collect information you provide directly to us, such as when you create an account, 
                        use our services, or contact us for support.
                    </p>
                    <div className="ml-4 space-y-2">
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span><strong>Personal Information:</strong> Name, email address, and contact details</span>
                        </div>
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span><strong>Usage Data:</strong> How you interact with our services and features</span>
                        </div>
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span><strong>Technical Data:</strong> IP address, browser type, and device information</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            icon: <EyeIcon className="w-6 h-6 text-indigo-400" />,
            title: "How We Use Your Information",
            content: (
                <div className="space-y-4">
                    <p>
                        We use the information we collect to provide, maintain, and improve our services, 
                        and to communicate with you about your account and our offerings.
                    </p>
                    <div className="ml-4 space-y-2">
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span>Provide and maintain our digital agency services</span>
                        </div>
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span>Process transactions and send related information</span>
                        </div>
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span>Send technical notices and support messages</span>
                        </div>
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span>Improve our services and develop new features</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            icon: <LockIcon className="w-6 h-6 text-indigo-400" />,
            title: "Data Security",
            content: (
                <div className="space-y-4">
                    <p>
                        We implement appropriate technical and organizational measures to protect your 
                        personal information against unauthorized access, alteration, disclosure, or destruction.
                    </p>
                    <div className="ml-4 space-y-2">
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span>SSL encryption for all data transmissions</span>
                        </div>
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span>Regular security audits and updates</span>
                        </div>
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span>Restricted access to personal data</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            icon: <UserIcon className="w-6 h-6 text-indigo-400" />,
            title: "Your Rights",
            content: (
                <div className="space-y-4">
                    <p>
                        You have the right to access, update, or delete your personal information at any time. 
                        You may also opt out of certain communications from us.
                    </p>
                    <div className="ml-4 space-y-2">
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span>Access and review your personal data</span>
                        </div>
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span>Request corrections to inaccurate information</span>
                        </div>
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span>Request deletion of your personal data</span>
                        </div>
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span>Opt out of marketing communications</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            icon: <GlobeIcon className="w-6 h-6 text-indigo-400" />,
            title: "Contact Us",
            content: (
                <div className="space-y-4">
                    <p>
                        If you have any questions about this Privacy Policy or our data practices, 
                        please contact us:
                    </p>
                    <div className="ml-4 space-y-2">
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span>Email: privacy@eventking.com</span>
                        </div>
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span>Website: eventking.com/contact</span>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen text-white pt-10">
            <div className="max-w-4xl mx-auto px-6 py-20">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500/10 rounded-full mb-6">
                        <ShieldIcon className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-indigo-400">
                        Privacy Policy
                    </h1>
                </motion.div>

                {/* Accordion Sections */}
                <div className="space-y-3">
                    {privacySections.map((section, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: 100, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1, delay: 0.1 + i * 0.1 }}
                            className="glass-panel rounded-xl select-none overflow-hidden"
                        >
                            <motion.div
                                animate={{ 
                                    backgroundColor: openItem === i ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.06)',
                                    borderColor: openItem === i ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'
                                }}
                                transition={{ duration: 0.3 }}
                                className="border border-transparent rounded-xl"
                            >
                                <motion.button
                                    onClick={() => toggleItem(i)}
                                    className="flex items-center justify-between p-4 cursor-pointer w-full text-left"
                                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex items-center">
                                        {section.icon}
                                        <h4 className="font-medium text-white ml-3">{section.title}</h4>
                                    </div>
                                    <motion.div
                                        animate={{ rotate: openItem === i ? 180 : 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <ChevronDownIcon className="w-5 h-5 text-gray-300" />
                                    </motion.div>
                                </motion.button>
                                
                                <AnimatePresence>
                                    {openItem === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ 
                                                height: { duration: 0.3, ease: "easeInOut" },
                                                opacity: { duration: 0.2, delay: 0.1 }
                                            }}
                                            className="overflow-hidden"
                                        >
                                            <motion.div 
                                                initial={{ y: -10, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -10, opacity: 0 }}
                                                transition={{ duration: 0.3, delay: 0.1 }}
                                                className="p-4 pt-0 text-sm text-gray-300 leading-relaxed"
                                            >
                                                {section.content}
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Note */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="mt-16 text-center"
                >
                    <p className="text-gray-500 text-sm">
                        This Privacy Policy is effective as of {new Date().toLocaleDateString()} and will remain in effect 
                        except with respect to any changes in its provisions in the future, which will be in effect 
                        immediately after being posted on this page.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
