"use server";

import { createClient } from "@supabase/supabase-js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";

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
    const serverPath = path.join(process.cwd(), "server/mcp/dist/index.js");

    const transport = new StdioClientTransport({
        command: "node",
        args: [serverPath],
        env: {
            ...process.env,
            // Pass necessary env vars to the MCP server process
            SUPABASE_URL: process.env.SUPABASE_URL || "",
            SUPABASE_KEY: process.env.SUPABASE_KEY || "",
            MISTRAL_API_KEY: process.env.MISTRAL_API_KEY || ""
        }
    });

    const client = new Client(
        {
            name: "0rca_chat-client",
            version: "1.0.0",
        },
        {
            capabilities: {},
        }
    );

    try {
        await client.connect(transport);

        const result: any = await client.callTool({
            name: "execute_orchestration",
            arguments: {
                prompt,
                mode,
                selectedAgentIds,
            },
        });

        const content = result.content[0];
        if (content.type === "text") {
            return content.text;
        }

        return "No text response received from orchestration.";
    } catch (error: any) {
        console.error("Orchestration error:", error);
        return `Error: ${error.message}`;
    } finally {
        // Close connection if library supports it or just let process die
        // The SDK doesn't always have an explicit 'close' on Client, but transport can be closed.
        try {
            await transport.close();
        } catch (e) {
            // ignore
        }
    }
}
