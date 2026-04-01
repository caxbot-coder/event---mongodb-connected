'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { FileTextIcon, AlertCircleIcon, CheckIcon, XIcon, ScaleIcon, ClockIcon, MailIcon, ChevronDownIcon } from 'lucide-react';
import { useRef, useState } from 'react';

export default function TermsOfService() {
    const refs = useRef<(HTMLDetailsElement | null)[]>([]);
    const [openItem, setOpenItem] = useState<number | null>(null);

    const toggleItem = (index: number) => {
        setOpenItem(openItem === index ? null : index);
    };

    const termsSections = [
        {
            icon: <CheckIcon className="w-6 h-6 text-indigo-400" />,
            title: "Agreement to Terms",
            content: (
                <div className="space-y-4">
                    <p>
                        By accessing and using Event King's website and services, you accept and agree to be bound 
                        by the terms and provision of this agreement.
                    </p>
                    <p>
                        If you do not agree to abide by the above, please do not use this service or website.
                    </p>
                </div>
            )
        },
        {
            icon: <FileTextIcon className="w-6 h-6 text-indigo-400" />,
            title: "Description of Service",
            content: (
                <div className="space-y-4">
                    <p>
                        Event King provides event booking and management services including:
                    </p>
                    <div className="ml-4 space-y-2">
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span><strong>UI/UX Design:</strong> User interface and user experience design services</span>
                        </div>
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span><strong>Web Development:</strong> Custom website and application development</span>
                        </div>
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span><strong>Digital Strategy:</strong> Strategic planning and consulting services</span>
                        </div>
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span><strong>Brand Development:</strong> Brand identity and marketing solutions</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            icon: <AlertCircleIcon className="w-6 h-6 text-indigo-400" />,
            title: "User Responsibilities",
            content: (
                <div className="space-y-4">
                    <p>
                        As a user of our services, you agree to:
                    </p>
                    <div className="ml-4 space-y-2">
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span>Provide accurate and complete information</span>
                        </div>
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span>Maintain the security of your account credentials</span>
                        </div>
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span>Use our services for lawful purposes only</span>
                        </div>
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span>Not interfere with or disrupt our services</span>
                        </div>
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span>Respect intellectual property rights</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            icon: <ScaleIcon className="w-6 h-6 text-indigo-400" />,
            title: "Payment Terms",
            content: (
                <div className="space-y-4">
                    <p>
                        For paid services, the following terms apply:
                    </p>
                    <div className="ml-4 space-y-2">
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span>Payment is required before service commencement</span>
                        </div>
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span>All prices are listed in USD and are exclusive of taxes</span>
                        </div>
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span>Refunds are handled on a case-by-case basis</span>
                        </div>
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span>Payment methods include credit card and bank transfer</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            icon: <MailIcon className="w-6 h-6 text-indigo-400" />,
            title: "Contact Information",
            content: (
                <div className="space-y-4">
                    <p>
                        If you have any questions about these Terms of Service, please contact us:
                    </p>
                    <div className="ml-4 space-y-2">
                        <div className="flex items-start">
                            <span className="text-indigo-400 mr-2">•</span>
                            <span>Email: legal@eventking.com</span>
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
                        <FileTextIcon className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-indigo-400">
                        Terms of Service
                    </h1>
                </motion.div>

                {/* Accordion Sections */}
                <div className="space-y-3">
                    {termsSections.map((section, i) => (
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
                        These Terms of Service are effective as of {new Date().toLocaleDateString()} and will remain 
                        in effect except with respect to any changes in its provisions in the future, which will be 
                        in effect immediately after being posted on this page.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
