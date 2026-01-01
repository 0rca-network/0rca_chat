"use client"

import * as React from "react"
import Image from "next/image"
import {
    BookOpen,
    Bot,
    Command,
    Compass,
    Frame,
    History,
    LifeBuoy,
    Map,
    MessageSquare,
    MessageSquarePlus,
    MoreHorizontal,
    PieChart,
    Pin,
    Send,
    Settings2,
    SquareTerminal,
    Star,
    Trash2,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"

// Sample data to popuplate the sidebar
const data = {
    pinned: [
        {
            title: "Project Architecture",
            url: "#",
            icon: Frame,
        },
        {
            title: "Marketing Campaign",
            url: "#",
            icon: PieChart,
        },
        {
            title: "Personal Notes",
            url: "#",
            icon: BookOpen,
        },
    ],
    recent: [
        {
            title: "React Components",
            url: "#",
            date: "Just now",
        },
        {
            title: "Bug Fixes Q1",
            url: "#",
            date: "2h ago",
        },
        {
            title: "Team Meeting",
            url: "#",
            date: "5h ago",
        },
        {
            title: "Travel Plans",
            url: "#",
            date: "Yesterday",
        },
        {
            title: "New Feature Idea",
            url: "#",
            date: "2 days ago",
        },
    ],
}

export function AppSidebar() {
    return (
        <Sidebar variant="inset" collapsible="icon" className="bg-black border-r border-white/10 text-white">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-white/10 active:bg-white/15 text-white file:text-white">
                            <a href="#" className="flex items-center justify-start pl-2">
                                <Image
                                    src="/orca_text-Photoroom.svg"
                                    alt="0rca Logo"
                                    width={280}
                                    height={80}
                                    className="h-20 w-auto object-contain"
                                    priority
                                />
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="w-full justify-start gap-2 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-white/5 text-white/90 shadow-sm hover:from-violet-600/30 hover:to-indigo-600/30 hover:text-white transition-all" size="lg">
                            <MessageSquarePlus className="size-4" />
                            <span>New Chat</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Discover" className="text-white/70 hover:text-white hover:bg-white/10">
                                    <Compass />
                                    <span>Discover</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Library" className="text-white/70 hover:text-white hover:bg-white/10">
                                    <BookOpen />
                                    <span>Library</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="group-data-[collapsible=icon]:hidden">
                    <SidebarGroupLabel className="text-white/40">Pinned</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {data.pinned.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild className="text-white/70 hover:text-white hover:bg-white/10">
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                    <SidebarMenuAction showOnHover className="text-white/40 hover:text-white">
                                        <MoreHorizontal />
                                        <span className="sr-only">More</span>
                                    </SidebarMenuAction>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="group-data-[collapsible=icon]:hidden">
                    <SidebarGroupLabel className="text-white/40">Recent</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {data.recent.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild className="hover:bg-white/5">
                                        <a href={item.url} className="flex flex-col items-start !items-start gap-1 p-2 h-auto text-sidebar-foreground/80 hover:text-sidebar-foreground">
                                            <span className="font-medium text-xs text-white/80">{item.title}</span>
                                            <span className="text-[10px] text-white/40">{item.date}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="text-white/70 hover:text-white hover:bg-white/10">
                            <Settings2 />
                            <span>Settings</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
