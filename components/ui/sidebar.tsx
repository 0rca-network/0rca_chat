"use client";

import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface Links {
    label: string;
    href: string;
    icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
};

export const SidebarProvider = ({
    children,
    open: openProp,
    setOpen: setOpenProp,
    animate = true,
}: {
    children: React.ReactNode;
    open?: boolean;
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    animate?: boolean;
}) => {
    const [openState, setOpenState] = useState(true);
    const open = openProp !== undefined ? openProp : openState;
    const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

    return (
        <SidebarContext.Provider value={{ open, setOpen, animate }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const Sidebar = ({
    children,
    open,
    setOpen,
    animate = true,
}: {
    children: React.ReactNode;
    open?: boolean;
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    animate?: boolean;
}) => {
    return (
        <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
            {children}
        </SidebarProvider>
    );
};

interface SidebarBodyProps {
    className?: string;
    children: React.ReactNode;
}

export const SidebarBody = ({ className, children }: SidebarBodyProps) => {
    return (
        <>
            <DesktopSidebar className={className}>{children}</DesktopSidebar>
            <MobileSidebar className={className}>{children}</MobileSidebar>
        </>
    );
};

export const DesktopSidebar = ({
    className,
    children,
    ...props
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    const { open, setOpen, animate } = useSidebar();

    return (
        <motion.div
            className={cn(
                "h-full hidden md:flex md:flex-col flex-shrink-0 relative group/sidebar",
                className
            )}
            animate={{
                width: animate ? (open ? "260px" : "72px") : "260px",
            }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            {...props}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setOpen(!open)}
                className={cn(
                    "absolute -right-3 top-8 z-50 w-6 h-6 rounded-full",
                    "bg-[#1a1a1b] border border-white/10",
                    "flex items-center justify-center",
                    "text-white/40 hover:text-white hover:border-white/20",
                    "transition-all duration-200",
                    "opacity-0 group-hover/sidebar:opacity-100",
                    "shadow-lg shadow-black/50"
                )}
            >
                {open ? (
                    <ChevronLeft className="w-3.5 h-3.5" />
                ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                )}
            </button>
            {children}
        </motion.div>
    );
};

export const MobileSidebar = ({
    className,
    children,
    ...props
}: React.ComponentProps<"div">) => {
    const { open, setOpen } = useSidebar();

    return (
        <div className="md:hidden">
            {/* Mobile Header */}
            <div
                className="h-14 px-4 flex items-center justify-between bg-[#0a0a0b] border-b border-white/5"
                {...props}
            >
                <Link href="/" className="flex items-center">
                    <Image
                        src="/0rca-Photoroom.svg"
                        alt="0RCA"
                        width={120}
                        height={40}
                        className="h-10 w-auto brightness-0 invert"
                    />
                </Link>
                <button
                    onClick={() => setOpen(!open)}
                    className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                            className={cn(
                                "fixed top-0 left-0 h-full w-72 bg-[#0a0a0b] z-50 flex flex-col",
                                className
                            )}
                        >
                            <div className="absolute right-4 top-4">
                                <button
                                    onClick={() => setOpen(false)}
                                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            {children}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export const SidebarLink = ({
    link,
    className,
    active,
    ...props
}: {
    link: Links;
    className?: string;
    active?: boolean;
    props?: LinkProps;
}) => {
    const { open, animate } = useSidebar();

    return (
        <Link
            href={link.href}
            className={cn(
                "flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-200",
                "text-white/60 hover:text-white",
                "hover:bg-white/[0.05]",
                active && "bg-white/[0.08] text-white",
                !open && "justify-center px-0",
                className
            )}
            {...props}
        >
            <div className={cn(
                "flex items-center justify-center flex-shrink-0",
                !open && "w-full"
            )}>
                {link.icon}
            </div>
            <AnimatePresence>
                {open && (
                    <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                        {link.label}
                    </motion.span>
                )}
            </AnimatePresence>
        </Link>
    );
};

export const SidebarSection = ({
    title,
    children,
    className,
}: {
    title?: string;
    children: React.ReactNode;
    className?: string;
}) => {
    const { open } = useSidebar();

    return (
        <div className={cn("space-y-1", className)}>
            {title && open && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-2"
                >
                    {title}
                </motion.p>
            )}
            {children}
        </div>
    );
};
