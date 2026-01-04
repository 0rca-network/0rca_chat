#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const supabase_js_1 = require("./clients/supabase.js");
const mistral_js_1 = require("./clients/mistral.js");
const orchestrator_js_1 = require("./orchestrator.js");
dotenv_1.default.config();
const server = new index_js_1.Server({
    name: "0rca-chat-orchestrator",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Clients
const supabase = (0, supabase_js_1.createSupabaseClient)();
const mistral = (0, mistral_js_1.createMistralClient)();
const orchestrator = new orchestrator_js_1.Orchestrator(supabase, mistral);
// Tool Definitions
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
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
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (name === "execute_orchestration") {
        // Validate arguments using Zod
        const Schema = zod_1.z.object({
            prompt: zod_1.z.string(),
            mode: zod_1.z.enum(["auto", "manual"]),
            selectedAgentIds: zod_1.z.array(zod_1.z.string()).optional(),
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
        }
        catch (error) {
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
            if (error)
                throw error;
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(agents, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [{ type: "text", text: `Error listing agents: ${error.message}` }],
                isError: true,
            };
        }
    }
    throw new Error(`Unknown tool: ${name}`);
});
// Start Server
async function run() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("0rca Chat MCP Server running on stdio");
}
run().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});
