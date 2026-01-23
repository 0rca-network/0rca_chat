import { SupabaseClient } from "@supabase/supabase-js";
import { generateText, tool } from "ai";
import { ethers } from "ethers";
import { z } from "zod";
import { createMistralClient } from "./clients/mistral";
import { createFundedTask, signPaymentChallenge, getUSDCBalance, settleFundedTask, settleFundedTaskWithGasStation } from "../evm/vaultClient";

// Bypass self-signed certificate errors for agent communication
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

interface OrchestrationInput {
    prompt: string;
    mode: "auto" | "manual";
    selectedAgentIds: string[];
    userAddress?: string;
    paymentSignature?: string;
    paymentTaskId?: string;
}

interface Agent {
    id: string;
    name: string;
    description: string | null;
    system_prompt: string;
    subdomain?: string;
    inference_url?: string;
    chain_agent_id?: number | string | null;
    data_input?: string;
}

export class Orchestrator {
    constructor(
        private supabase: SupabaseClient,
        private mistral: any // Using any for the provider to avoid type mismatches
    ) { }

    async execute(input: OrchestrationInput): Promise<string> {
        const { prompt, mode, selectedAgentIds, userAddress, paymentSignature, paymentTaskId } = input;

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
        } else {
            // Auto mode: let the LLM decide which agents to use (or none)
            if (allAgents.length > 0) {
                activeAgents = await this.selectAgentsAutomatically(prompt, allAgents);
            }
        }

        return await this.runSwarmWithVercelSDK(prompt, activeAgents, userAddress, paymentSignature, paymentTaskId);
    }

    private async selectAgentsAutomatically(prompt: string, agents: Agent[]): Promise<Agent[]> {
        const agentDescriptions = agents
            .map((a) => `- ${a.name} (ID: ${a.id}): ${a.description}`)
            .join("\n");

        const selectionPrompt = `
You are 0rca, the expert orchestrator. Your job is to select the BEST agents for the user's task.
IMPORTANT: 
- If the user asks for "security analysis", "deep dive", or "agent processing", you MUST select specialized agents (like MySovereignAgent).
- If the user asks for "price", "market", "bitcoin", "crypto", check if there is an agent named like "Crypto..." or "Market..." and SELECT IT.
- DO NOT try to handle complex logic yourself; DELEGATE to agents.
- Return ONLY a JSON array of agent IDs.

User Task: "${prompt}"

Available Agents:
${agentDescriptions}
`;

        const { text } = await generateText({
            model: this.mistral("mistral-large-latest"),
            prompt: selectionPrompt,
        });

        try {
            // 1. Isolate the array part
            const jsonStart = text.indexOf('[');
            const jsonEnd = text.lastIndexOf(']');

            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd >= jsonStart) {
                let jsonStr = text.substring(jsonStart, jsonEnd + 1);

                // 2. Aggressively strip comments and potential trailing content
                jsonStr = jsonStr
                    .replace(/\/\/.*$/gm, "") // Strip // comments
                    .replace(/\/\*[\s\S]*?\*\//g, "") // Strip /* */ comments
                    .replace(/,(\s*[\]}])/g, "$1"); // Strip trailing commas

                console.log(`[Orchestrator] Attempting to parse cleaned JSON: ${jsonStr}`);
                const ids = JSON.parse(jsonStr);

                if (Array.isArray(ids)) {
                    const filtered = agents.filter((a) => ids.includes(a.id));
                    if (filtered.length > 0) return filtered;
                }
            }

            // Fallback: If selection failed or returned empty but we have agents, return ALL agents to be safe
            // This allows the Swarm logic to decide which tool to call, rather than failing early.
            console.log("[Orchestrator] Agent selection returned empty or invalid. Falling back to ALL agents.");
            return agents;

        } catch (e) {
            console.error("Failed to parse agent selection. LLM said:", text, e);
            // Default to all agents if it fails, ensuring the user isn't blocked
            return agents;
        }
    }

    private async runSwarmWithVercelSDK(prompt: string, agents: Agent[], userAddress?: string, paymentSignature?: string, paymentTaskId?: string): Promise<string> {
        // Define mock tools
        const mockTools: any = {
            getBalances: tool({
                description: "Get the current USDC balances for the orchestrator and vault. Use this to provide context BEFORE calling agents.",
                parameters: z.object({}),
                execute: (async ({ }) => {
                    const orchAddress = new ethers.Wallet(process.env.ORCHESTRATOR_PRIVATE_KEY!).address;
                    const vaultAddress = "0xe7bad567ed213efE7Dd1c31DF554461271356F30";
                    try {
                        const orchBalance = await getUSDCBalance(orchAddress);
                        const vaultBalance = await getUSDCBalance(vaultAddress);
                        const res = `Orchestrator USDC: ${orchBalance}, Vault USDC: ${vaultBalance}`;
                        console.log(`[System Tool] getBalances result: ${res}`);
                        return res;
                    } catch (e: any) {
                        console.error(`[System Tool] getBalances error: ${e.message}`);
                        return "Failed to fetch real balances.";
                    }
                }) as any
            } as any)
        };

        const agentTools: Record<string, any> = {};
        for (const agent of agents) {
            const toolName = `call_${agent.name.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase()}`;
            let toolDesc = agent.description || `Specialized agent tool for ${agent.name}. Accesses ${agent.name} capabilities.`;

            // Heuristic to add more context if the description is generic
            if (agent.name.toLowerCase().includes('crypto') || agent.name.toLowerCase().includes('market')) {
                toolDesc += " Use this tool for real-time cryptocurrency prices, market data, and blockchain analysis.";
            }

            console.log(`[Orchestrator] 🔧 Defining tool: "${toolName}" with description: "${toolDesc}"`);

            agentTools[toolName] = tool({
                description: toolDesc,
                parameters: z.object({
                    task: z.string().describe(`A detailed description of the task for ${agent.name}. REQUIRED.`),
                }),
                execute: (async ({ task }: { task: string }) => {
                    const finalTask = task && task !== "undefined" ? task : prompt;
                    console.log(`[Agent Tool] 📞 Calling agent ${agent.name} with task: ${finalTask}`);
                    return await this.executeAgent(agent, finalTask, userAddress, paymentSignature, paymentTaskId);
                }) as any,
            } as any);
        }

        console.log(`[Orchestrator] 🐝 Swarm initialized with agents: ${agents.map(a => a.name).join(', ')}`);
        console.log(`[Orchestrator] 🛠️ Tools available: ${Object.keys({ ...mockTools, ...agentTools }).join(', ')}`);
        const { text, toolResults } = await generateText({
            model: this.mistral("mistral-large-latest"),
            system: `You are 0rca, the master orchestrator of the 0rca Network.
Your goal is to provide deep, analytical insights by coordinating specialized agents.

REQUIRED WORKFLOW:
1. For any complex task (security analysis, protocol deep dive, financial auditing, MARKET DATA, PRICES), you MUST delegate to the specialized agent tools.
2. If the user asks for "current price", "market data", or "analyze security", you MUST call the relevant agent tool (e.g., 'call_crypto_com_agent'). 
3. DO NOT attempt to answer technical, financial, or real-time questions yourself. You do not have internet access, but the agents DO.
4. If an agent tool returns a string containing "CHALLENGE_REQUIRED", stop immediately.
5. Provide a technical, professional, and VERY DETAILED summary in Markdown of all agent findings. 
6. DO NOT be concise. If an agent performs an audit or fetch data, INCLUDE their key findings and technical details in your response. 
7. If you have the report, PRESENT it clearly.`,
            prompt: prompt,
            tools: { ...mockTools, ...agentTools },
            maxSteps: 10,
            onStepFinish: ({ toolCalls, toolResults }: any) => {
                if (toolCalls && toolCalls.length > 0) {
                    console.log(`[Orchestrator Swarm] ⚡ Step finished with ${toolCalls.length} tool calls.`);
                    toolCalls.forEach((call: any) => {
                        console.log(`[Orchestrator Swarm] 🛠️ TOOL CALL: ${call.toolName}(${JSON.stringify(call.args)})`);
                    });
                    toolResults?.forEach((r: any) => {
                        const res = r.result || r.output || r.data;
                        const preview = typeof res === 'string' ? (res.length > 150 ? res.substring(0, 150) + "..." : res) : "Complex Data";
                        console.log(`[Orchestrator Swarm] ✅ Tool "${r.toolName}" result preview: ${preview}`);
                    });
                } else {
                    console.log(`[Orchestrator Swarm] ⚠️ Step finished with NO tool calls. LLM decided to respond directly.`);
                }
            },
            maxTokens: 8192,
        } as any);

        if (toolResults && toolResults.length > 0) {
            console.log(`[Orchestrator] Inspecting ${toolResults.length} tool results for signals...`);
            for (const result of (toolResults as any[])) {
                const resContent = result?.result || result?.output || result?.data;

                if (typeof resContent === 'string' && resContent.includes("CHALLENGE_REQUIRED")) {
                    console.log(`[Orchestrator] Detected signal in tool results, returning it to frontend.`);
                    return resContent.includes("__SIGNAL__:") ? resContent : `__SIGNAL__:${resContent}`;
                }
            }
        }

        let finalResponse = text;

        // Robust Fallback: If the LLM was too concise despite getting a large report, append the report.
        if (toolResults && toolResults.length > 0) {
            const agentResults = (toolResults as any[]).filter(r => r.toolName.startsWith('call_'));
            if (agentResults.length > 0) {
                const totalAgentResultLength = agentResults.reduce((acc, r) => acc + (r.result?.length || 0), 0);
                if (finalResponse && finalResponse.length < 500 && totalAgentResultLength > 1000) {
                    console.log(`[Orchestrator] LLM was too brief (${finalResponse.length} chars). Appending agent reports...`);
                    finalResponse += "\n\n----- \n### Detailed Agent Findings\n";
                    for (const r of agentResults) {
                        const agentName = r.toolName.replace('call_', '');
                        const res = r.result || r.output || r.data;
                        finalResponse += `\n#### Report from ${agentName}:\n${res}\n`;
                    }
                }
            }
        }

        if (!finalResponse || finalResponse.trim() === "") {
            console.log("[Orchestrator] Text generation returned empty. Checking for tool results...");
            if (toolResults && toolResults.length > 0) {
                const agentResults = (toolResults as any[]).filter(r => r.toolName.startsWith('call_'));
                if (agentResults.length > 0) {
                    console.log(`[Orchestrator] Using ${agentResults.length} raw agent results as fallback.`);
                    finalResponse = "### Orchestration Summary\nI've gathered the following reports from the agents:\n\n";
                    for (const r of agentResults) {
                        const agentName = r.toolName.replace('call_', '');
                        const res = r.result || r.output || r.data;
                        finalResponse += `#### ${agentName} Response\n${res}\n\n`;
                    }
                } else {
                    finalResponse = "### Orchestration Summary\nI encountered issues communicating with some agents:\n\n";
                    for (const r of (toolResults as any[])) {
                        const res = r.result || r.output || r.data;
                        if (typeof res === 'string' && res.startsWith("Error")) {
                            finalResponse += `- **${r.toolName}**: ${res}\n`;
                        }
                    }
                    finalResponse += "\n\nPlease ensure your agents are running or check the system logs.";
                }
            } else {
                finalResponse = "I encountered an issue generating the final report. Please try re-prompting for a summary.";
            }
        }

        console.log(`[Orchestrator] Final Response Text (length: ${finalResponse.length})`);
        return finalResponse;
    }

    private async executeAgent(agent: Agent, task: string, userAddress?: string, paymentSignature?: string, paymentTaskId?: string): Promise<string> {
        if (!task || task === "undefined") {
            task = "Please process the request.";
        }
        console.log(`[Orchestrator] 🚀 EXECUTING AGENT: ${agent.name} (${agent.id})`);
        console.log(`[Orchestrator] Debug Meta: subdomain="${agent.subdomain || 'N/A'}", inference_url="${agent.inference_url || 'N/A'}"`);

        let endpoint = "";
        let vaultAddress = "";

        if (agent.inference_url) {
            endpoint = agent.inference_url;
            if (!endpoint.endsWith('/agent')) {
                endpoint = endpoint.replace(/\/$/, '') + '/agent';
            }
            vaultAddress = "0x4d7fcfE642eDc67cEBe595d1D74E7349A55C3222";
            console.log(`[Orchestrator] Using inference_url for ${agent.name}: ${endpoint}`);
        } else if (agent.subdomain) {
            // Clean up subdomain in case it contains the full domain
            const sub = agent.subdomain.split('.')[0];
            endpoint = `https://${sub}.0rca.live/agent`;
            vaultAddress = "0x4d7fcfE642eDc67cEBe595d1D74E7349A55C3222";
            console.log(`[Orchestrator] Resolved subdomain for ${agent.name}: ${endpoint}`);
        } else {
            console.warn(`[Orchestrator] Agent ${agent.name} has NO endpoint (subdomain or inference_url). Falling back to internal LLM.`);
        }

        if (!endpoint) {
            const systemPrompt = agent.system_prompt || (agent as any).configuration?.role || `You are the ${agent.name} agent.`;
            const { text } = await generateText({
                model: this.mistral("mistral-small-latest"),
                system: systemPrompt,
                prompt: task,
            });
            return text;
        }

        try {
            // CRITICAL: Reuse the taskId if we are continuing a payment flow
            let taskId = paymentTaskId;

            if (!taskId) {
                // For a "User Pays" flow, we generate the ID but DON'T fund it on-chain yet.
                // The frontend will fund it after receiving the 402 challenge.
                taskId = ethers.hexlify(ethers.randomBytes(32));
                console.log(`[Orchestrator] Generated new Task ID for user funding: ${taskId}`);
            } else {
                console.log(`[Orchestrator] Reusing Task ID for payment retry: ${taskId}`);
            }

            console.log(`[Orchestrator] 🌐 DISPATCH: POST ${endpoint}`);
            console.log(`[Orchestrator] Headers: X-TASK-ID=${taskId}, X-USER-ADDRESS=${userAddress || 'none'}, X-PAYMENT=${paymentSignature ? 'signature-present' : 'none'}`);

            const start = Date.now();
            let response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-TASK-ID": taskId,
                    "X-USER-ADDRESS": userAddress || "",
                    // If we have a signature, send it immediately
                    ...(paymentSignature ? { "X-PAYMENT": paymentSignature } : {})
                },
                body: JSON.stringify({
                    prompt: task,
                    taskId: taskId
                })
            });
            const duration = Date.now() - start;

            console.log(`[Orchestrator] 📥 RESPONSE: Status ${response.status} from ${agent.name} (${duration}ms)`);

            if (response.status === 402) {
                console.log(`[Orchestrator] Received 402 Payment Required. Handshaking...`);
                const challenge = response.headers.get("PAYMENT-REQUIRED");

                if (!challenge) {
                    console.error("[Orchestrator] 402 response missing PAYMENT-REQUIRED header");
                    throw new Error("402 response missing PAYMENT-REQUIRED header");
                }
                console.log(`[Orchestrator] Challenge found: ${challenge.substring(0, 50)}...`);

                if (paymentSignature && paymentTaskId === taskId) {
                    console.log(`[Orchestrator] Using provided client signature for X-PAYMENT...`);
                    response = await fetch(endpoint, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-TASK-ID": taskId,
                            "X-PAYMENT": paymentSignature,
                            "X-USER-ADDRESS": userAddress || ""
                        },
                        body: JSON.stringify({
                            prompt: task,
                            taskId: taskId
                        })
                    });
                } else {
                    console.log(`[Orchestrator] No valid client signature, bubbling up challenge.`);
                    const challengeData = {
                        type: "CHALLENGE_REQUIRED",
                        challenge,
                        taskId,
                        endpoint,
                        agentName: agent.name
                    };
                    return `__SIGNAL__:${JSON.stringify(challengeData)}`;
                }
            }

            if (response.status !== 200) {
                const errText = await response.text();
                return `Error from Agent: ${response.status} ${errText}`;
            }

            const data = await response.json();
            const result = data.result || data.content || data.text || JSON.stringify(data);
            console.log(`[Orchestrator] Agent Result obtained (length: ${result.length})`);

            // NEW: Settle the task on-chain since the agent bot might not have gas
            if (taskId && vaultAddress) {
                try {
                    console.log(`[Orchestrator] 💰 Settling payment for Agent "${agent.name}" (On-chain ID: ${agent.chain_agent_id || 0})`);
                    console.log(`[Orchestrator] Task ID: ${taskId}, Vault: ${vaultAddress}`);

                    const txHash = await settleFundedTask(vaultAddress, taskId, "0.1", agent.chain_agent_id || 0);

                    console.log(`[Orchestrator] ✅ Settlement successful. Tx: ${txHash}`);

                    // Record transaction in Supabase
                    if (userAddress) {
                        try {
                            await this.supabase.from("transactions").insert({
                                wallet_address: userAddress,
                                agent_id: agent.id,
                                task_id: taskId,
                                amount: 0.1, // Hardcoded for now based on settlement call
                                token_symbol: "USDC",
                                type: "payment",
                                status: "completed",
                                tx_hash: txHash,
                                metadata: {
                                    agent_name: agent.name,
                                    prompt_snippet: task.substring(0, 50)
                                }
                            });
                            console.log(`[Orchestrator] 📝 Transaction recorded in DB.`);
                        } catch (dbErr) {
                            console.error(`[Orchestrator] Failed to record transaction DB:`, dbErr);
                        }
                    }
                } catch (settleErr: any) {
                    console.error(`[Orchestrator] ❌ Task settlement failed for agent "${agent.name}":`, settleErr.message);
                    console.warn(`[Orchestrator] (This may happen if the agent already claimed the task or budget is empty)`);
                }
            }

            return result;

        } catch (e: any) {
            console.error(`[Orchestrator] Execution Failed:`, e);
            return `Execution Failed: ${e.message}`;
        }
    }
}
