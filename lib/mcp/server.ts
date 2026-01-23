import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { createSupabaseClient } from "./clients/supabase";
import { createMistralClient } from "./clients/mistral";
import { Orchestrator } from "./orchestrator";

// Create server instance
const server = new Server(
    {
        name: "0rca-chat-orchestrator",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Clients
const supabase = createSupabaseClient();
const mistral = createMistralClient();
const orchestrator = new Orchestrator(supabase, mistral);

// Tool Definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "execute_orchestration",
                description: "Executes a user prompt using available agents, either via auto-orchestration or manual swarm.",
                inputSchema: {
                    type: "object",
                    properties: {
                        prompt: {
                            type: "string",
                            description: "The user's prompt or task description.",
                        },
                        mode: {
                            type: "string",
                            enum: ["auto", "manual"],
                            description: "The orchestration mode: 'auto' (AI decides agents) or 'manual' (user selected agents).",
                        },
                        selectedAgentIds: {
                            type: "array",
                            items: { type: "string" },
                            description: "List of agent IDs to use (required for manual mode).",
                        },
                    },
                    required: ["prompt", "mode"],
                },
            },
            {
                name: "list_agents",
                description: "List all available agents from the database.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
        ],
    };
});

// Tool Execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === "execute_orchestration") {
        const Schema = z.object({
            prompt: z.string(),
            mode: z.enum(["auto", "manual"]),
            selectedAgentIds: z.array(z.string()).optional(),
        });

        const parsed = Schema.safeParse(args);
        if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
        }

        const { prompt, mode, selectedAgentIds } = parsed.data;

        try {
            const result = await orchestrator.execute({
                prompt,
                mode,
                selectedAgentIds: selectedAgentIds || [],
            });

            return {
                content: [
                    {
                        type: "text",
                        text: result,
                    },
                ],
            };
        } catch (error: any) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error executing orchestration: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    }

    if (name === "list_agents") {
        try {
            const { data: agents, error } = await supabase.from("agents").select("*");
            if (error) throw error;
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(agents, null, 2),
                    },
                ],
            };
        } catch (error: any) {
            return {
                content: [{ type: "text", text: `Error listing agents: ${error.message}` }],
                isError: true,
            };
        }
    }

    throw new Error(`Unknown tool: ${name}`);
});

// Export transport handler
const transport = new WebStandardStreamableHTTPServerTransport();

export async function handleMcpRequest(request: Request) {
    if (!transport.onmessage) {
        await server.connect(transport);
    }
    return transport.handleRequest(request);
}
