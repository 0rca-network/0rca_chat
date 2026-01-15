'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import { useUserCredits } from '@/hooks/use-user-credits';
import {
    Coins,
    Sparkles,
    Check,
    Loader2,
    CreditCard,
    ArrowRight,
    Wallet,
    IndianRupee,
    DollarSign,
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface CreditsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Credit packages
const CREDIT_PACKAGES = [
    { credits: 100, popular: false },
    { credits: 500, popular: true },
    { credits: 1000, popular: false },
    { credits: 5000, popular: false },
];

// Exchange rate: 1 USD = 83 INR
const USD_TO_INR = 83;

// Load Razorpay script
function loadRazorpay(): Promise<boolean> {
    return new Promise((resolve) => {
        if (typeof window !== 'undefined' && (window as any).Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

export function CreditsModal({ isOpen, onClose }: CreditsModalProps) {
    const { walletAddress, connect } = usePrivyWallet();
    const { balance, refresh: refreshCredits } = useUserCredits();
    const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
    const [customCredits, setCustomCredits] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [creditsAdded, setCreditsAdded] = useState(0);

    const getCreditsAmount = () => {
        if (selectedPackage !== null) {
            return CREDIT_PACKAGES[selectedPackage].credits;
        }
        return parseInt(customCredits) || 0;
    };

    const getAmountINR = () => {
        const credits = getCreditsAmount();
        return credits * USD_TO_INR;
    };

    const handlePayment = async () => {
        const credits = getCreditsAmount();
        if (credits < 10) {
            alert('Minimum 10 credits required');
            return;
        }

        if (!walletAddress) {
            connect();
            return;
        }

        setIsProcessing(true);

        try {
            // Load Razorpay script
            const loaded = await loadRazorpay();
            if (!loaded) {
                throw new Error('Failed to load Razorpay');
            }

            // Create order
            const orderRes = await fetch('/api/razorpay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credits, walletAddress }),
            });

            const order = await orderRes.json();
            if (order.error) {
                throw new Error(order.error);
            }

            // Open Razorpay checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: '0RCA',
                description: `Purchase ${credits} Credits`,
                order_id: order.orderId,
                handler: async function (response: any) {
                    // Verify payment
                    const verifyRes = await fetch('/api/razorpay/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...response,
                            walletAddress,
                        }),
                    });

                    const result = await verifyRes.json();
                    if (result.success) {
                        setCreditsAdded(credits);
                        setPaymentSuccess(true);
                        refreshCredits();
                    } else {
                        alert('Payment verification failed');
                    }
                    setIsProcessing(false);
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                    },
                },
                prefill: {
                    name: walletAddress?.slice(0, 10) + '...',
                },
                theme: {
                    color: '#7C3AED',
                    backdrop_color: 'rgba(0,0,0,0.8)',
                },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function () {
                alert('Payment failed. Please try again.');
                setIsProcessing(false);
            });
            rzp.open();
        } catch (error: any) {
            console.error('Payment error:', error);
            alert(error.message || 'Payment failed');
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        setPaymentSuccess(false);
        setCreditsAdded(0);
        setSelectedPackage(null);
        setCustomCredits('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-xl bg-[#0A0A0B] border-white/10 text-white p-0 overflow-hidden rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <AnimatePresence mode="wait">
                    {paymentSuccess ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="p-8 text-center"
                        >
                            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-6">
                                <Check className="w-10 h-10 text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
                            <p className="text-white/60 mb-6">
                                <span className="text-emerald-400 font-bold">{creditsAdded}</span> credits have been added to your account.
                            </p>
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] mb-6">
                                <p className="text-white/40 text-sm mb-1">Your new balance</p>
                                <p className="text-3xl font-black text-white">{balance.toLocaleString()} <span className="text-violet-400 text-lg">Credits</span></p>
                            </div>
                            <Button onClick={handleClose} className="bg-violet-600 hover:bg-violet-500 px-8">
                                Done
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="purchase"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Header */}
                            <div className="relative p-6 pb-4">
                                <div className="absolute top-0 left-0 w-full h-32 overflow-hidden z-0 opacity-40">
                                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 via-transparent to-indigo-500/20" />
                                </div>
                                <div className="relative z-10">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                                                <Coins className="w-5 h-5 text-violet-400" />
                                            </div>
                                            Buy Credits
                                        </DialogTitle>
                                        <DialogDescription className="text-white/50 mt-2">
                                            Power up your AI experience. 1 Credit = $1 USD
                                        </DialogDescription>
                                    </DialogHeader>
                                </div>
                            </div>

                            {/* Current Balance */}
                            <div className="px-6 pb-4">
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                                    <div>
                                        <p className="text-white/40 text-xs uppercase tracking-wider font-bold">Current Balance</p>
                                        <p className="text-2xl font-bold text-white">{balance.toLocaleString()}</p>
                                    </div>
                                    <Wallet className="w-8 h-8 text-violet-400/50" />
                                </div>
                            </div>

                            {/* Credit Packages */}
                            <div className="px-6 pb-4">
                                <p className="text-white/60 text-sm font-semibold mb-3">Select a package</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {CREDIT_PACKAGES.map((pkg, index) => (
                                        <button
                                            key={pkg.credits}
                                            onClick={() => {
                                                setSelectedPackage(index);
                                                setCustomCredits('');
                                            }}
                                            className={cn(
                                                "relative p-4 rounded-xl border transition-all text-center group",
                                                selectedPackage === index
                                                    ? "bg-violet-500/20 border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                                                    : "bg-white/[0.02] border-white/[0.05] hover:border-white/10"
                                            )}
                                        >
                                            {pkg.popular && (
                                                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] px-2 py-0.5 rounded-full bg-violet-500 text-white font-bold uppercase">
                                                    Popular
                                                </span>
                                            )}
                                            <p className={cn(
                                                "text-xl font-bold transition-colors",
                                                selectedPackage === index ? "text-white" : "text-white/70"
                                            )}>
                                                {pkg.credits}
                                            </p>
                                            <p className="text-[10px] text-white/40">credits</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Amount */}
                            <div className="px-6 pb-4">
                                <p className="text-white/60 text-sm font-semibold mb-3">Or enter custom amount</p>
                                <div className="relative">
                                    <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <Input
                                        type="number"
                                        placeholder="Enter credits (min 10)"
                                        value={customCredits}
                                        onChange={(e) => {
                                            setCustomCredits(e.target.value);
                                            setSelectedPackage(null);
                                        }}
                                        className="bg-white/[0.03] border-white/10 pl-10 focus:border-violet-500/50"
                                        min={10}
                                    />
                                </div>
                            </div>

                            {/* Price Display */}
                            {getCreditsAmount() > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="px-6 pb-4"
                                >
                                    <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-white/60 text-sm">Credits</span>
                                            <span className="text-white font-bold">{getCreditsAmount().toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-white/60 text-sm flex items-center gap-1">
                                                <DollarSign className="w-3 h-3" /> USD
                                            </span>
                                            <span className="text-white/60">${getCreditsAmount().toLocaleString()}</span>
                                        </div>
                                        <div className="border-t border-white/10 pt-2 mt-2 flex items-center justify-between">
                                            <span className="text-white font-bold flex items-center gap-1">
                                                <IndianRupee className="w-4 h-4" /> Total
                                            </span>
                                            <span className="text-xl font-black text-white">₹{getAmountINR().toLocaleString()}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Action Button */}
                            <div className="p-6 pt-2 bg-white/[0.01] border-t border-white/[0.05]">
                                {!walletAddress ? (
                                    <Button
                                        onClick={connect}
                                        className="w-full bg-violet-600 hover:bg-violet-500 h-12 text-base font-semibold"
                                    >
                                        <Wallet className="w-5 h-5 mr-2" />
                                        Connect Wallet to Purchase
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handlePayment}
                                        disabled={isProcessing || getCreditsAmount() < 10}
                                        className="w-full bg-violet-600 hover:bg-violet-500 h-12 text-base font-semibold disabled:opacity-50"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-5 h-5 mr-2" />
                                                Pay ₹{getAmountINR().toLocaleString()}
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                )}
                                <p className="text-center text-white/30 text-[10px] mt-3 uppercase tracking-wider">
                                    Secured by Razorpay • UPI • Cards • NetBanking
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
