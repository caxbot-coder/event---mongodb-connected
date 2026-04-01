import { Check } from 'lucide-react';
import { PrimaryButton, GhostButton } from './Buttons';
import Title from './Title';
import { plansData } from '@/data/dummy-data';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useHotToast } from '@/components/HotToastContext';
import { supabase } from '@/lib/supabase';

export default function Pricing() {
    const { user } = useAuth();
    const { showHotToast } = useHotToast();
    const [loading, setLoading] = useState(false);
    const currentPlan = user?.user_metadata?.plan || null;

    const updateUserPremiumStatus = async (planName: string, paymentResponse: any) => {
        try {
            if (!user) return;

            // Update user metadata with premium status
            const { error } = await supabase.auth.updateUser({
                data: {
                    is_premium: true,
                    plan: planName,
                    payment_id: paymentResponse.razorpay_payment_id,
                    upgraded_at: new Date().toISOString()
                }
            });

            if (error) {
                console.error('Error updating user premium status:', error);
                showHotToast('Error updating premium status. Please contact support.', 'error');
            } else {
                console.log('User premium status updated successfully');
                // Force a page refresh to update the UI
                window.location.reload();
            }
        } catch (error) {
            console.error('Error in updateUserPremiumStatus:', error);
            showHotToast('Error updating premium status', 'error');
        }
    };

    
    const handlePayment = async (planName: string, price: string) => {
        if (!user) {
            showHotToast('Please sign in to purchase a plan', 'info');
            return;
        }

        setLoading(true);
        showHotToast('Processing payment...', 'info');

        try {
            // Check if Razorpay is already loaded
            if (!(window as any).Razorpay) {
                // Load Razorpay script
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.async = true;
                
                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = reject;
                    document.body.appendChild(script);
                });
            }

            // Get the actual Razorpay key from environment
            const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
            
            if (!razorpayKey) {
                throw new Error('Razorpay key not configured');
            }

            const options = {
                key: razorpayKey,
                amount: parseInt(price.replace('₹', '')) * 100, // Amount in paise (INR)
                currency: 'INR', // Indian Rupee for international card support
                name: 'Event King',
                description: `${planName} Plan`,
                image: '/logo.svg',
                handler: function (response: any) {
                    // Handle successful payment
                    console.log('Payment successful:', response);
                    
                    // Update user metadata to premium status
                    updateUserPremiumStatus(planName, response);
                    
                    showHotToast('Payment successful!', 'success');
                    showHotToast(`Welcome to the ${planName} plan!`, 'success');
                },
                prefill: {
                    name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
                    email: user?.email,
                    contact: '', // Add phone number if available
                },
                theme: {
                    color: '#8b5cf6',
                },
                modal: {
                    ondismiss: function() {
                        console.log('Payment modal dismissed');
                        // Toast will auto-dismiss after 4 seconds
                    },
                    escape: true,
                    handleback: true,
                    confirm_close: true,
                    animation: 'slide-from-right'
                },
                notes: {
                    plan_name: planName,
                    user_email: user?.email,
                },
                callback_url: `${window.location.origin}/payment-success`,
                redirect: false, // Changed to false to handle response manually
            };

            const rzp = new (window as any).Razorpay(options);
            
            // Handle payment failures with better error capture
            rzp.on('payment.failed', function (response: any) {
                console.error('Payment failed event triggered');
                console.error('Response object:', response);
                console.error('Response keys:', Object.keys(response));
                console.error('Full response:', JSON.stringify(response, null, 2));
                
                let errorMessage = 'Payment failed. Please try again.';
                
                // Try multiple possible error structures
                if (response && typeof response === 'object') {
                    if (response.error && response.error.description) {
                        errorMessage = response.error.description;
                    } else if (response.error && response.error.reason) {
                        errorMessage = `Payment failed: ${response.error.reason}`;
                    } else if (response.description) {
                        errorMessage = response.description;
                    } else if (response.reason) {
                        errorMessage = `Payment failed: ${response.reason}`;
                    } else if (response.code) {
                        errorMessage = `Payment error: ${response.code}`;
                    } else if (response.message) {
                        errorMessage = response.message;
                    }
                }
                
                showHotToast(errorMessage, 'error');
                showHotToast('Payment failed. Please try again.', 'error');
            });
            
            // Handle modal close events
            rzp.on('modal.closed', function() {
                console.log('Payment modal closed');
                // Toast will auto-dismiss after 4 seconds
            });
            
            // Add global error handler for Razorpay
            window.addEventListener('error', function(event) {
                if (event.message && event.message.includes('razorpay')) {
                    console.error('Razorpay global error:', event);
                    showHotToast('Payment processing error. Please try again.', 'error');
                }
            });
            
            rzp.open();
        } catch (error) {
            console.error('Payment error:', error);
            showHotToast('Payment failed. Please try again.', 'error');
            if (error instanceof Error && error.message.includes('key not configured')) {
                showHotToast('Payment system not properly configured. Please contact support.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };
    return (
        <section id="pricing" className="py-20 bg-white/3 border-t border-white/6">
            <div className="max-w-6xl mx-auto px-4">

                <Title
                    title="Pricing"
                    heading="Simple pricing for every event size"
                    description="Choose the perfect plan for your event needs. From small workshops to large conferences."
                />

                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {plansData.map((plan, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ type: "spring", stiffness: 300, damping: 80, mass: 1, delay: 0.1 + i * 0.1 }}
                            className={`relative p-6 rounded-xl border backdrop-blur transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${
                            currentPlan === plan.name
                                ? 'border-green-400/50 bg-green-900/20 ring-2 ring-green-400/30'
                                : plan.popular
                                ? 'border-indigo-500/50 bg-indigo-900/30'
                                : 'border-white/8 bg-indigo-950/30'
                            }`}
                        >
                            {currentPlan === plan.name && (
                                <motion.p 
                                    initial={{ scale: 0, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.6 + i * 0.1 }}
                                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-green-400 to-green-600 rounded-md text-xs text-white font-medium flex items-center gap-1"
                                >
                                    <Check className="w-3 h-3" />
                                    Current Plan
                                </motion.p>
                            )}
                            {plan.popular && currentPlan !== plan.name && (
                                <p className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 rounded-md text-xs">
                                    Most popular
                                </p>
                            )}

                            <div className="mb-6">
                                <p>{plan.name}</p>
                                <div className="flex items-end gap-3">
                                    <span className="text-3xl font-extrabold">{plan.price}</span>
                                    <span className="text-sm text-gray-400">
                                        / {plan.credits}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-300 mt-2">
                                    {plan.desc}
                                </p>
                            </div>

                            <ul className="space-y-3 mb-6">
                                {plan.features.map((feat, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center gap-3 text-sm text-gray-300"
                                    >
                                        <Check className="w-4 h-4 text-indigo-400" />
                                        {feat}
                                    </li>
                                ))}
                            </ul>

                            <div>
                                {currentPlan === plan.name ? (
                                    <div className="w-full px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg font-medium text-center flex items-center justify-center gap-2">
                                        <Check className="w-4 h-4" />
                                        Your Current Plan
                                    </div>
                                ) : plan.popular ? (
                                    <PrimaryButton 
                                        className="w-full"
                                        onClick={() => handlePayment(plan.name, plan.price)}
                                        disabled={loading}
                                    >
                                        {loading ? 'Processing...' : 'Get started'}
                                    </PrimaryButton>
                                ) : (
                                    <GhostButton 
                                        className="w-full justify-center"
                                        onClick={() => handlePayment(plan.name, plan.price)}
                                        disabled={loading}
                                    >
                                        {loading ? 'Processing...' : 'Get started'}
                                    </GhostButton>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};