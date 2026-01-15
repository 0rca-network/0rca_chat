"use client";

import { MainHeader } from "@/components/main-header";
import { usePrivyWallet } from "@/hooks/use-privy-wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, Mail, Globe, Save, Upload } from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
    const { walletAddress } = usePrivyWallet();
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [website, setWebsite] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        // TODO: Save to Supabase
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#030303] text-white">
            <MainHeader title="Profile Settings" />

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto px-6 py-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">Profile Settings</h1>
                        <p className="text-white/40 text-sm">Manage your public profile information.</p>
                    </div>

                    {/* Avatar Section */}
                    <div className="mb-8 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-2xl bg-violet-500/20 border-2 border-violet-500/30 flex items-center justify-center">
                                <UserCircle className="w-10 h-10 text-violet-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-white mb-1">Profile Picture</h3>
                                <p className="text-xs text-white/40 mb-3">JPG, PNG or GIF. Max 2MB.</p>
                                <Button variant="outline" size="sm" className="border-white/10 bg-white/5 hover:bg-white/10">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Image
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-6">
                            <div>
                                <Label htmlFor="wallet" className="text-white/60 text-xs uppercase tracking-wider font-bold mb-2">Wallet Address</Label>
                                <Input
                                    id="wallet"
                                    value={walletAddress || "Not connected"}
                                    disabled
                                    className="bg-black/40 border-white/10 text-white/60 font-mono"
                                />
                            </div>

                            <div>
                                <Label htmlFor="displayName" className="text-white/60 text-xs uppercase tracking-wider font-bold mb-2">Display Name</Label>
                                <Input
                                    id="displayName"
                                    placeholder="Enter your display name"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="bg-black/40 border-white/10 focus:border-violet-500/50"
                                />
                            </div>

                            <div>
                                <Label htmlFor="email" className="text-white/60 text-xs uppercase tracking-wider font-bold mb-2">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-black/40 border-white/10 pl-10 focus:border-violet-500/50"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="website" className="text-white/60 text-xs uppercase tracking-wider font-bold mb-2">Website</Label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <Input
                                        id="website"
                                        placeholder="https://yourwebsite.com"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        className="bg-black/40 border-white/10 pl-10 focus:border-violet-500/50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-violet-600 hover:bg-violet-500 text-white px-6"
                            >
                                {isSaving ? (
                                    <>Saving...</>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
