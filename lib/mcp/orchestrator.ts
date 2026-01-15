import { SupabaseClient } from "@supabase/supabase-js";
import { generateText, tool } from "ai";
import { z } from "zod";
import { createMistralClient } from "./clients/mistral";

interface OrchestrationInput {
    prompt: string;
    mode: "auto" | "manual";
    selectedAgentIds: string[];
}

interface Agent {
    id: string;
    name: string;
    description: string | null;
    system_prompt: string;
    data_input?: string;
}

export class Orchestrator {
    constructor(
        private supabase: SupabaseClient,
        private mistral: any // Using any for the provider to avoid type mismatches
    ) { }

    async execute(input: OrchestrationInput): Promise<string> {
        const { prompt, mode, selectedAgentIds } = input;

        // Fetch all available agents from DB
        let allAgents: Agent[] = [];
        try {
            const { data, error } = await this.supabase
                .from("agents")
                .select("*");
            if (!error && data) {
                allAgents = data;
            }
        } catch (e) {
            console.error("Failed to fetch agents:", e);
        }

        let activeAgents: Agent[] = [];

        if (mode === "manual") {
            // Manual mode: use only selected agents
            if (selectedAgentIds && selectedAgentIds.length > 0) {
                activeAgents = allAgents.filter((a) => selectedAgentIds.includes(a.id));
            }
            // If no agents selected in manual mode, we still proceed but with no agent tools
        } else {
            // Auto mode: let the LLM decide which agents to use (or none)
            if (allAgents.length > 0) {
                activeAgents = await this.selectAgentsAutomatically(prompt, allAgents);
            }
        }

        // Always proceed to the LLM - agents are optional tools
        return await this.runSwarmWithVercelSDK(prompt, activeAgents);
    }

    private async selectAgentsAutomatically(prompt: string, agents: Agent[]): Promise<Agent[]> {
        const agentDescriptions = agents
            .map((a) => `- ${a.name} (ID: ${a.id}): ${a.description}`)
            .join("\n");

        const selectionPrompt = `
You are an expert orchestrator. Given the user task and a list of available agents, select the most relevant agents to handle the task.
Return ONLY a JSON array of agent IDs.

User Task: "${prompt}"

Available Agents:
${agentDescriptions}
`;

        const { text } = await generateText({
            model: this.mistral("mistral-small-latest"),
            prompt: selectionPrompt,
        });

        try {
            const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
            const result = JSON.parse(cleanedText);
            const ids: string[] = Array.isArray(result) ? result : result.agentIds || [];
            return agents.filter((a) => ids.includes(a.id));
        } catch (e) {
            console.error("Failed to parse agent selection", e);
            return agents.slice(0, 3);
        }
    }

    private async runSwarmWithVercelSDK(prompt: string, agents: Agent[]): Promise<string> {
        // Define mock tools
        const mockTools: any = {
            getWeather: tool({
                description: "Get the current weather for a specific location",
                parameters: z.object({
                    location: z.string().describe("The city and country, e.g., San Francisco, USA"),
                }),
                execute: async ({ location }: { location: string }) => {
                    console.log(`[Mock Tool] Fetching weather for ${location}...`);
                    return `The weather in ${location} is currently 72°F and sunny. (Mock Data)`;
                },
            }),
            searchWeb: tool({
                description: "Search the web for information",
                parameters: z.object({
                    query: z.string().describe("The search query"),
                }),
                execute: async ({ query }: { query: string }) => {
                    console.log(`[Mock Tool] Searching web for "${query}"...`);
                    return `Top result for "${query}": Mistral AI is integrated with Vercel AI SDK. (Mock Data)`;
                },
            }),
            getStockPrice: tool({
                description: "Get the current stock price for a symbol",
                parameters: z.object({
                    symbol: z.string().describe("The stock ticker symbol, e.g., AAPL"),
                }),
                execute: async ({ symbol }: { symbol: string }) => {
                    console.log(`[Mock Tool] Fetching stock price for ${symbol}...`);
                    return `The current price of ${symbol} is $150.00. (Mock Data)`;
                },
            }),
        };

        // Dynamically add "agent tools" that call the agents' personas
        const agentTools: Record<string, any> = {};
        for (const agent of agents) {
            const toolName = `call_${agent.name.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase()}`;
            agentTools[toolName] = tool({
                description: agent.description || `Call the ${agent.name} agent`,
                parameters: z.object({
                    task: z.string().describe(`Task for the ${agent.name} agent`),
                }),
                execute: async ({ task }: { task: string }) => {
                    console.log(`[Agent Tool] Calling agent ${agent.name} with task: ${task}`);
                    return await this.executeAgent(agent, task);
                },
            });
        }

        const { text } = await generateText({
            model: this.mistral("mistral-large-latest"),
            system: `You are 0rca, a helpful and intelligent AI assistant.
- Answer user questions directly when you can.
- You have access to specialized agents (via call_[agent_name] tools) that can help with specific tasks.
- You also have general tools like getWeather, searchWeb, and getStockPrice.
- Use agents and tools when they add value, but don't force their use if not needed.
- Be concise, professional, and friendly.`,
            prompt: prompt,
            tools: { ...mockTools, ...agentTools },
            maxSteps: 5,
        } as any);

        return text;
    }

    private async executeAgent(agent: Agent, task: string): Promise<string> {
        const { text } = await generateText({
            model: this.mistral("mistral-small-latest"),
            system: agent.system_prompt || `You are the ${agent.name} agent.`,
            prompt: task,
        });

        return text;
    }
}
