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
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import {
    Crown,
    Check,
    Sparkles,
    Zap,
    Shield,
    Clock,
    Bot,
    Infinity,
    Star,
    Wallet,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Exchange rate: 1 USD = 83 INR
const USD_TO_INR = 83;

const PLANS = [
    {
        id: 'starter',
        name: 'Starter',
        description: 'Perfect for trying out 0RCA',
        priceUSD: 9.99,
        priceINR: Math.round(9.99 * USD_TO_INR),
        period: 'month',
        credits: 1000,
        features: [
            { text: '1,000 credits/month', icon: Zap },
            { text: 'Standard response speed', icon: Clock },
            { text: '5 custom agents', icon: Bot },
            { text: 'Email support', icon: Shield },
        ],
        popular: false,
        color: 'white',
    },
    {
        id: 'pro',
        name: 'Pro',
        description: 'Best for power users',
        priceUSD: 29.99,
        priceINR: Math.round(29.99 * USD_TO_INR),
        period: 'month',
        credits: 5000,
        features: [
            { text: '5,000 credits/month', icon: Zap },
            { text: 'Priority processing', icon: Clock },
            { text: 'Unlimited agents', icon: Bot },
            { text: 'Discord community', icon: Shield },
            { text: 'Early access features', icon: Sparkles },
        ],
        popular: true,
        color: 'violet',
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For teams and businesses',
        priceUSD: 99.99,
        priceINR: Math.round(99.99 * USD_TO_INR),
        period: 'month',
        credits: 25000,
        features: [
            { text: '25,000 credits/month', icon: Zap },
            { text: 'Fastest processing', icon: Clock },
            { text: 'Unlimited everything', icon: Infinity },
            { text: 'Dedicated support', icon: Shield },
            { text: 'Custom agent training', icon: Bot },
            { text: 'API access', icon: Sparkles },
        ],
        popular: false,
        color: 'amber',
    },
];

export function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
    const { walletAddress, connect } = usePrivyWallet();
    const [selectedPlan, setSelectedPlan] = useState<string | null>('pro');
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

    const getDiscountedPrice = (price: number) => {
        return billingPeriod === 'yearly' ? Math.round(price * 10) : price; // 2 months free on yearly
    };

    const handleSubscribe = async () => {
        if (!walletAddress) {
            connect();
            return;
        }
        // TODO: Implement Razorpay subscription
        alert('Subscription feature coming soon! For now, please buy credits directly.');
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-4xl bg-[#0A0A0B] border-white/10 text-white p-0 overflow-hidden rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                {/* Header */}
                <div className="relative p-8 pb-4">
                    <div className="absolute top-0 left-0 w-full h-40 overflow-hidden z-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-transparent to-amber-500/10" />
                    </div>
                    <div className="relative z-10">
                        <DialogHeader className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.4)]">
                                    <Crown className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <DialogTitle className="text-3xl font-black text-white">
                                Upgrade to Premium
                            </DialogTitle>
                            <DialogDescription className="text-white/50 mt-2 max-w-md mx-auto">
                                Unlock unlimited potential with our premium plans. More credits, faster responses, priority support.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Billing Toggle */}
                        <div className="flex items-center justify-center gap-3 mt-6">
                            <button
                                onClick={() => setBillingPeriod('monthly')}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                                    billingPeriod === 'monthly'
                                        ? "bg-white/10 text-white"
                                        : "text-white/40 hover:text-white/60"
                                )}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingPeriod('yearly')}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2",
                                    billingPeriod === 'yearly'
                                        ? "bg-white/10 text-white"
                                        : "text-white/40 hover:text-white/60"
                                )}
                            >
                                Yearly
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                                    2 months free
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="px-8 pb-8">
                    <div className="grid grid-cols-3 gap-4">
                        {PLANS.map((plan) => (
                            <motion.div
                                key={plan.id}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setSelectedPlan(plan.id)}
                                className={cn(
                                    "relative p-5 rounded-2xl border cursor-pointer transition-all",
                                    selectedPlan === plan.id
                                        ? "bg-violet-500/10 border-violet-500/50 shadow-[0_0_30px_rgba(139,92,246,0.15)]"
                                        : "bg-white/[0.02] border-white/[0.05] hover:border-white/10"
                                )}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="text-[10px] px-3 py-1 rounded-full bg-violet-500 text-white font-bold uppercase flex items-center gap-1">
                                            <Star className="w-3 h-3" /> Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                                    <p className="text-xs text-white/40">{plan.description}</p>
                                </div>

                                <div className="mb-4">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-white">
                                            ₹{getDiscountedPrice(plan.priceINR).toLocaleString()}
                                        </span>
                                        <span className="text-white/40 text-sm">
                                            /{billingPeriod === 'yearly' ? 'year' : 'month'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-white/30 mt-1">
                                        ${getDiscountedPrice(plan.priceUSD)} USD
                                    </p>
                                </div>

                                <div className="space-y-2 mb-4">
                                    {plan.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs text-white/70">
                                            <feature.icon className="w-3.5 h-3.5 text-violet-400" />
                                            <span>{feature.text}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className={cn(
                                    "w-full h-1 rounded-full",
                                    selectedPlan === plan.id ? "bg-violet-500" : "bg-white/5"
                                )} />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Action Footer */}
                <div className="p-6 bg-white/[0.01] border-t border-white/[0.05]">
                    {!walletAddress ? (
                        <Button
                            onClick={connect}
                            className="w-full bg-violet-600 hover:bg-violet-500 h-12 text-base font-semibold"
                        >
                            <Wallet className="w-5 h-5 mr-2" />
                            Connect Wallet to Subscribe
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubscribe}
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 h-12 text-base font-semibold"
                        >
                            <Crown className="w-5 h-5 mr-2" />
                            Subscribe to {PLANS.find(p => p.id === selectedPlan)?.name}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                    <p className="text-center text-white/30 text-[10px] mt-3">
                        Cancel anytime • Secure payment via Razorpay
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
