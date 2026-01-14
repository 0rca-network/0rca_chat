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
        .single();

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
    selectedAgentIds: string[]
): Promise<string> {
    try {
        const supabase = createSupabaseClient();
        const mistral = createMistralClient();
        const orchestrator = new Orchestrator(supabase, mistral);

        const result = await orchestrator.execute({
            prompt,
            mode,
            selectedAgentIds
        });

        return result;

    } catch (error: any) {
        console.error("Orchestration error:", error);
        return `Error: ${error.message}`;
    }
}

