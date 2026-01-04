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
    // Map other fields as needed
}

export async function getAgents(): Promise<Agent[]> {
    const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_KEY!
    );

    const { data, error } = await supabase.from("agents").select("*");

    if (error) {
        console.error("Error fetching agents:", error);
        return [];
    }

    return data as Agent[];
}

export async function executeOrchestration(
    prompt: string,
    mode: "auto" | "manual",
    selectedAgentIds: string[]
): Promise<string> {
    try {
        // Direct In-Process Execution for Vercel Compatibility
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
