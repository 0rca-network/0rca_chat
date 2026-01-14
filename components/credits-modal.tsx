'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { PricingSection, Plan } from '@/components/ui/pricing';

interface CreditsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CREDIT_PLANS: Plan[] = [
    {
        id: 'basic-credits',
        name: 'Starter Bundle',
        info: 'Perfect for casual use',
        price: {
            monthly: 9.99,
            yearly: 89.99,
        },
        features: [
            { text: '1,000 AI Credits', tooltip: 'Enough for ~100 deep queries' },
            { text: 'Standard Processing Speed' },
            { text: 'Email Support' },
        ],
        btn: {
            text: 'Buy Credits',
            href: '#',
        },
    },
    {
        highlighted: true,
        id: 'pro-membership',
        name: 'Pro Membership',
        info: 'Best for power users',
        price: {
            monthly: 29.99,
            yearly: 299.99,
        },
        features: [
            { text: '5,000 Monthly Credits', tooltip: 'Refills every month' },
            { text: 'Priority Processing' },
            { text: 'Discord Community Access' },
            { text: 'Early access to new agents' },
        ],
        btn: {
            text: 'Subscribe Now',
            href: '#',
        },
    },
    {
        id: 'enterprise-credits',
        name: 'Elite Plan',
        info: 'For professional use',
        price: {
            monthly: 99.99,
            yearly: 899.99,
        },
        features: [
            { text: '25,000 Monthly Credits' },
            { text: 'Dedicated Account Manager' },
            { text: 'Custom Agent Training' },
            { text: 'API Access' },
        ],
        btn: {
            text: 'Go Elite',
            href: '#',
        },
    },
] as any;

export function CreditsModal({ isOpen, onClose }: CreditsModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-5xl bg-[#0A0A0B] border-white/10 text-white p-0 overflow-hidden rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="relative">
                    {/* Abstract Premium Background */}
                    <div className="absolute top-0 left-0 w-full h-48 overflow-hidden z-0 opacity-40">
                        <img
                            src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop"
                            className="w-full h-full object-cover filter blur-sm"
                            alt="Background"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A0A0B]" />
                    </div>

                    <div className="p-8 relative z-10">
                        <DialogHeader className="mb-8">
                            <DialogTitle className="text-4xl font-black tracking-tight text-white mb-2">
                                REFILL CREDITS
                            </DialogTitle>
                            <DialogDescription className="text-white/60 text-base max-w-lg">
                                Power up your 0RCA experience with premium bundles and memberships. Get priority access to specialized agents.
                            </DialogDescription>
                        </DialogHeader>

                        <PricingSection
                            plans={CREDIT_PLANS}
                            heading="" // Empty as we have DialogHeader
                            className="p-0 border-none shadow-none"
                        />
                    </div>
                </div>
            </DialogContent>

        </Dialog>
    );
}
