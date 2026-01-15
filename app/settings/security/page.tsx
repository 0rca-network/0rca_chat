"use client";

import { MainHeader } from "@/components/main-header";
import { usePrivyWallet } from "@/hooks/use-privy-wallet";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Key, Smartphone, Globe, Eye, AlertTriangle, LogOut } from "lucide-react";
import { useState } from "react";

export default function SecurityPage() {
    const { walletAddress } = usePrivyWallet();
    const { logout } = usePrivy();
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [sessionAlerts, setSessionAlerts] = useState(true);
    const [publicProfile, setPublicProfile] = useState(false);

    const activeSessions = [
        { id: 1, device: "Chrome on Windows", location: "New Delhi, India", current: true, lastActive: "Now" },
        { id: 2, device: "Mobile App on iPhone", location: "Mumbai, India", current: false, lastActive: "2 hours ago" },
    ];

    return (
        <div className="flex flex-col h-full w-full bg-[#030303] text-white">
            <MainHeader title="Security & Privacy" />

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto px-6 py-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">Security & Privacy</h1>
                        <p className="text-white/40 text-sm">Manage your security settings and active sessions.</p>
                    </div>

                    {/* Security Settings */}
                    <div className="mb-8">
                        <h2 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-violet-400" />
                            Security Settings
                        </h2>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                        <Key className="w-5 h-5 text-violet-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">Two-Factor Authentication</p>
                                        <p className="text-xs text-white/40">Add an extra layer of security</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={twoFactorEnabled}
                                    onCheckedChange={setTwoFactorEnabled}
                                />
                            </div>

                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">Session Alerts</p>
                                        <p className="text-xs text-white/40">Get notified of new login sessions</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={sessionAlerts}
                                    onCheckedChange={setSessionAlerts}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Privacy Settings */}
                    <div className="mb-8">
                        <h2 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Eye className="w-4 h-4 text-violet-400" />
                            Privacy Settings
                        </h2>
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-white/40" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Public Profile</p>
                                    <p className="text-xs text-white/40">Allow others to see your profile</p>
                                </div>
                            </div>
                            <Switch
                                checked={publicProfile}
                                onCheckedChange={setPublicProfile}
                            />
                        </div>
                    </div>

                    {/* Active Sessions */}
                    <div className="mb-8">
                        <h2 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-violet-400" />
                            Active Sessions
                        </h2>
                        <div className="space-y-2">
                            {activeSessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${session.current ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/40'
                                            }`}>
                                            <Smartphone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white flex items-center gap-2">
                                                {session.device}
                                                {session.current && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase">Current</span>
                                                )}
                                            </p>
                                            <p className="text-xs text-white/40">{session.location} · {session.lastActive}</p>
                                        </div>
                                    </div>
                                    {!session.current && (
                                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                                            Revoke
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div>
                        <h2 className="text-sm font-bold text-red-400/80 uppercase tracking-wider mb-4">Danger Zone</h2>
                        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-white">Sign Out Everywhere</p>
                                <p className="text-xs text-white/40">Sign out from all devices and sessions</p>
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => logout()}
                                className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out All
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
