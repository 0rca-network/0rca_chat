import { SupabaseClient } from "@supabase/supabase-js";
import { Mistral } from "@mistralai/mistralai";

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
    // Match Supabase schema
}

export class Orchestrator {
    constructor(
        private supabase: SupabaseClient,
        private mistral: Mistral
    ) { }

    async execute(input: OrchestrationInput): Promise<string> {
        const { prompt, mode, selectedAgentIds } = input;

        // 1. Fetch available agents
        // Assuming a table named 'agents'. You might need to adjust this based on actual schema.
        const { data: allAgents, error } = await this.supabase
            .from("agents")
            .select("*");

        if (error || !allAgents) {
            throw new Error(`Failed to fetch agents: ${error?.message}`);
        }

        let activeAgents: Agent[] = [];

        // 2. Determine Active Agents
        if (mode === "manual") {
            if (!selectedAgentIds || selectedAgentIds.length === 0) {
                return "Please select at least one agent for Manual Swarm mode.";
            }
            activeAgents = allAgents.filter((a) => selectedAgentIds.includes(a.id));
        } else {
            // Auto Orchestration: Select agents based on prompt using Mistral
            activeAgents = await this.selectAgentsAutomatically(prompt, allAgents);
        }

        if (activeAgents.length === 0) {
            return "No suitable agents found for this task.";
        }

        // 3. Execute Task with Active Agents
        // This is a simplified sequential or router implementation.
        // For a real "hiring" flow, we'd need a multi-turn loop.
        // Here we will use a "Supervisor" approach: one LLM call to plan and delegate.

        return await this.runSwarm(prompt, activeAgents);
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

        const chatResponse = await this.mistral.chat.complete({
            model: "mistral-small-latest",
            messages: [{ role: "user", content: selectionPrompt }],
            responseFormat: { type: "json_object" },
        });

        // Handle the case where content might be null or array
        const content = chatResponse.choices?.[0]?.message?.content;
        const contentStr = Array.isArray(content) ? content.join("") : (content || "");

        try {
            const result = JSON.parse(contentStr);
            // Expecting { "agentIds": [...] } or just [...]
            const ids: string[] = Array.isArray(result) ? result : result.agentIds || [];
            return agents.filter((a) => ids.includes(a.id));
        } catch (e) {
            console.error("Failed to parse agent selection", e);
            // Fallback: use all agents or fail gracefully. specific to requirements.
            // For now, return top 3 or all if few.
            return agents.slice(0, 3);
        }
    }

    private async runSwarm(prompt: string, agents: Agent[]): Promise<string> {
        // A simple supervisor loop:
        // The supervisor (Mistral) sees the agents as tools.
        // We construct a system prompt that gives it context on the agents.

        const agentTools = agents.map(agent => ({
            type: "function" as const,
            function: {
                name: `call_${agent.name.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase()}`, // Sanitize name
                description: agent.description || `Call the ${agent.name} agent`,
                parameters: {
                    type: "object",
                    properties: {
                        task: { type: "string", description: `Task input. Expected format: ${agent.data_input || "text description"}` }
                    },
                    required: ["task"]
                }
            }
        }));

        // Start the conversation
        const messages = [
            {
                role: "system", content: `You are a strict Swarm Manager. Your ONLY job is to delegate user tasks to the available agents. 
DO NOT answer the user's question directly.
DO NOT summarize the answer yourself unless it's a combination of agent outputs.
ALWAYS use the tools provided to call the agents.
User Task: "${prompt}"`
            },
            { role: "user", content: prompt }
        ];

        // Initial call to Manager
        const response = await this.mistral.chat.complete({
            model: "mistral-large-latest",
            messages: messages as any, // casting for simplicity in this snippet
            tools: agentTools,
            toolChoice: "auto"
        });

        const choice = response.choices?.[0];
        const message = choice?.message;

        // Check if tool calls (delegation) needed
        if (message?.toolCalls && message.toolCalls.length > 0) {
            // Execute "agent calls" (simulated by calling Mistral again with that agent's persona)
            const toolOutputs = [];

            for (const toolCall of message.toolCalls) {
                const agentNameFromTool = toolCall.function.name.replace("call_", "");
                const agent = agents.find(a => a.name.replace(/\s+/g, "_").toLowerCase() === agentNameFromTool);
                const args = JSON.parse(toolCall.function.arguments as string);

                if (agent) {
                    // Execute Agent
                    const agentResponse = await this.executeAgent(agent, args.task);
                    messages.push({ role: "assistant", content: null, toolCalls: [toolCall] } as any);
                    messages.push({
                        role: "tool",
                        name: toolCall.function.name,
                        content: agentResponse,
                        toolCallId: toolCall.id
                    } as any);
                }
            }

            // Final synthesis
            const finalResponse = await this.mistral.chat.complete({
                model: "mistral-large-latest",
                messages: messages as any,
            });

            const finalContent = finalResponse.choices?.[0]?.message?.content;
            return Array.isArray(finalContent) ? finalContent.join("") : (finalContent || "No response generated.");
        }

        const content = message?.content;
        return Array.isArray(content) ? content.join("") : (content || "No response generated.");
    }

    private async executeAgent(agent: Agent, task: string): Promise<string> {
        const agentName = agent.name.toLowerCase();

        // 1. Weather Agent Implementation
        if (agentName.includes("weather")) {
            try {
                // Extract city from task using simple regex or just use the task as query
                // A smarter way is to ask Mistral to extract the city, but let's try a direct approach first
                // or pass the task to Mistral to formulate the API call.

                // Let's use Mistral to extract location for better accuracy
                const locationResp = await this.mistral.chat.complete({
                    model: "mistral-small-latest",
                    messages: [
                        { role: "system", content: "Extract the city name from the user request. Return ONLY the city name." },
                        { role: "user", content: task }
                    ]
                });
                const content = locationResp.choices?.[0]?.message?.content;
                const city = (typeof content === 'string' ? content.trim() : task);

                // Call wttr.in
                const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=3`);
                if (!response.ok) return "Failed to fetch weather data.";
                const text = await response.text();
                return `Weather Report for ${city}: ${text}`;
            } catch (e) {
                console.error("Weather agent failed", e);
                return "Unable to fetch weather info at this time.";
            }
        }

        // 2. Pirate Agent Implementation
        if (agentName.includes("pirate")) {
            const response = await this.mistral.chat.complete({
                model: "mistral-small-latest",
                messages: [
                    { role: "system", content: "You are a salty pirate captain. Answer the user's request in thick pirate speak. Arrr!" },
                    { role: "user", content: task }
                ]
            });
            const content = response.choices?.[0]?.message?.content;
            return typeof content === 'string' ? content : "Arrr, I lost me tongue!";
        }

        // 3. Generic Fallback for other agents
        // If we don't have a specific implementation, we use Mistral to simulated it based on metadata
        const response = await this.mistral.chat.complete({
            model: "mistral-small-latest",
            messages: [
                { role: "system", content: `You are the '${agent.name}' agent. Description: ${agent.description || "Helpful assistant"}.` },
                { role: "user", content: task }
            ]
        });

        const content = response.choices?.[0]?.message?.content;
        return typeof content === 'string' ? content : (Array.isArray(content) ? content.join("") : "");
    }
}
