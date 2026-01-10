"use client"

import { FluidDropdown, DropdownOption } from "@/components/ui/fluid-dropdown";
import { Bot, Cpu, Sparkles, Zap, Brain } from "lucide-react";
import React from "react";

const DEMO_OPTIONS: DropdownOption[] = [
    { id: "auto", label: "Auto Orchestrator", icon: Bot, color: "#A06CD5" },
    { id: "manual", label: "Manual Swarm", icon: Cpu, color: "#45B7D1" },
    { id: "spark", label: "Spark Engine", icon: Sparkles, color: "#FF6B6B" },
    { id: "zap", label: "Zap Mode", icon: Zap, color: "#F9C74F" },
    { id: "brain", label: "Neural Flow", icon: Brain, color: "#4ECDC4" },
];

export default function FluidDropdownDemo() {
    const [value, setValue] = React.useState("auto");

    return (
        <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">Fluid Dropdown</h1>
                    <p className="text-neutral-500">A premium, animated dropdown component</p>
                </div>

                <FluidDropdown
                    value={value}
                    onChange={setValue}
                    options={DEMO_OPTIONS}
                />

                <div className="mt-12 p-4 rounded-xl border border-white/5 bg-white/[0.02] text-center">
                    <p className="text-xs text-neutral-500 uppercase tracking-widest mb-2">Selected Value</p>
                    <p className="text-xl font-mono text-white">{value}</p>
                </div>
            </div>
        </div>
    );
}
