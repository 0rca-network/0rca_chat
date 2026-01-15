import { SupabaseClient } from "@supabase/supabase-js";
import { generateText, tool } from "ai";
import { z } from "zod";

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

        const { data: allAgents, error } = await this.supabase
            .from("agents")
            .select("*");

        if (error || !allAgents) {
            throw new Error(`Failed to fetch agents: ${error?.message}`);
        }

        let activeAgents: Agent[] = [];

        if (mode === "manual") {
            if (!selectedAgentIds || selectedAgentIds.length === 0) {
                return "Please select at least one agent for Manual Swarm mode.";
            }
            activeAgents = allAgents.filter((a) => selectedAgentIds.includes(a.id));
        } else {
            activeAgents = await this.selectAgentsAutomatically(prompt, allAgents);
        }

        if (activeAgents.length === 0) {
            return "No suitable agents found for this task.";
        }

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
            system: `You are a strict Swarm Manager. Your job is to delegate user tasks to the available agents and tools.
- ALWAYS use the tools provided to fulfill the request.
- If an agent is available, use call_[agent_name] to delegate.
- You also have access to general tools like getWeather and searchWeb.
- Combine outputs into a final helpful response for the user.`,
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
