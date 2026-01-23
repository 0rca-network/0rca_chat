"use server";

import { createClient } from "@supabase/supabase-js";
import { createSupabaseClient } from "@/lib/mcp/clients/supabase";
import { createMistralClient } from "@/lib/mcp/clients/mistral";
import { Orchestrator } from "@/lib/mcp/orchestrator";

// Types
export interface Agent {
    id: string;
    name: string;
    description: string;
    system_prompt?: string;
    subdomain?: string;
    inference_url?: string;
    chain_agent_id?: string | null;
}

export interface Chat {
    id: string;
    hash: string;
    wallet_address: string;
    title: string;
    created_at: string;
}

export interface Message {
    role: "user" | "assistant";
    content: string;
}

export async function getAgents(): Promise<Agent[]> {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.from("agents").select("*");

    if (error) {
        console.error("Error fetching agents:", error);
        return [];
    }

    return data as Agent[];
}

export async function getChatsByWallet(walletAddress: string): Promise<Chat[]> {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("chats")
        .select("*")
        .eq("wallet_address", walletAddress)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching chats:", error);
        return [];
    }

    return data as Chat[];
}

export async function getChatByHash(hash: string): Promise<Chat | null> {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("chats")
        .select("*")
        .eq("hash", hash)
        .maybeSingle();

    if (error) {
        console.error("Error fetching chat by hash:", error);
        return null;
    }

    return data as Chat;
}

export async function getChatMessages(chatId: string): Promise<Message[]> {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("messages")
        .select("role, content")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching messages:", error);
        return [];
    }

    return data as Message[];
}

export async function createChat(walletAddress: string, title: string = "New Chat"): Promise<string> {
    const supabase = createSupabaseClient();
    const hash = Math.random().toString(36).substring(2, 10);

    const { data, error } = await supabase
        .from("chats")
        .insert([{
            wallet_address: walletAddress,
            title: title,
            hash: hash
        }])
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create chat: ${error.message}`);
    }

    return data.hash;
}

export async function saveMessage(chatId: string, role: "user" | "assistant", content: string): Promise<void> {
    const supabase = createSupabaseClient();
    const { error } = await supabase
        .from("messages")
        .insert([{
            chat_id: chatId,
            role,
            content
        }]);

    if (error) {
        console.error("Error saving message:", error);
    }
}

export async function executeOrchestration(
    prompt: string,
    mode: "auto" | "manual",
    selectedAgentIds: string[],
    userAddress?: string,
    paymentSignature?: string,
    paymentTaskId?: string
): Promise<string> {
    try {
        const supabase = createSupabaseClient();
        const mistral = createMistralClient();
        const orchestrator = new Orchestrator(supabase, mistral);

        console.log(`[Action] Starting orchestration for prompt: "${prompt.substring(0, 50)}..."`);
        const result = await orchestrator.execute({
            prompt,
            mode,
            selectedAgentIds,
            userAddress,
            paymentSignature,
            paymentTaskId
        } as any);
        console.log(`[Action] Orchestration complete. Result length: ${result.length}`);

        return result;

    } catch (error: any) {
        console.error("Orchestration error:", error);
        return `Error: ${error.message}`;
    }
}

// Notification Types
export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'update';
    icon: string;
    link?: string;
    created_at: string;
    is_read?: boolean;
}

export async function getNotifications(walletAddress?: string): Promise<Notification[]> {
    const supabase = createSupabaseClient();

    // Fetch global notifications that haven't expired
    const { data: notifications, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("is_global", true)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order("created_at", { ascending: false })
        .limit(20);

    if (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }

    // If wallet address provided, check which ones are read
    if (walletAddress && notifications) {
        const { data: readNotifications } = await supabase
            .from("user_notification_reads")
            .select("notification_id")
            .eq("wallet_address", walletAddress);

        const readIds = new Set(readNotifications?.map(r => r.notification_id) || []);

        return notifications.map(n => ({
            ...n,
            is_read: readIds.has(n.id)
        }));
    }

    return notifications || [];
}

export async function markNotificationAsRead(notificationId: string, walletAddress: string): Promise<void> {
    const supabase = createSupabaseClient();

    const { error } = await supabase
        .from("user_notification_reads")
        .upsert({
            notification_id: notificationId,
            wallet_address: walletAddress,
            read_at: new Date().toISOString()
        }, {
            onConflict: 'notification_id,wallet_address'
        });

    if (error) {
        console.error("Error marking notification as read:", error);
    }
}

export async function markAllNotificationsAsRead(walletAddress: string): Promise<void> {
    const supabase = createSupabaseClient();

    // Get all unread global notifications
    const { data: notifications } = await supabase
        .from("notifications")
        .select("id")
        .eq("is_global", true);

    if (notifications && notifications.length > 0) {
        // Get already read notifications
        const { data: alreadyRead } = await supabase
            .from("user_notification_reads")
            .select("notification_id")
            .eq("wallet_address", walletAddress);

        const alreadyReadIds = new Set(alreadyRead?.map(r => r.notification_id) || []);

        // Insert read records for unread notifications
        const newReads = notifications
            .filter(n => !alreadyReadIds.has(n.id))
            .map(n => ({
                notification_id: n.id,
                wallet_address: walletAddress,
                read_at: new Date().toISOString()
            }));

        if (newReads.length > 0) {
            await supabase.from("user_notification_reads").insert(newReads);
        }
    }
}
